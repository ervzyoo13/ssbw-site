// Everything the visitor does with the cart: add buttons, floating cart, bottom bar, drawer and checkout.
// "Place order" sends nothing in Phase 1. It only shows a summary and clears the cart.

import { esc, ph, val, money } from './render.js';
import { scroller } from './scroller.js';

const $ = (id) => document.getElementById(id);
const CLOSE_MS = 560;

export function initShop(data, cart) {
  const { settings } = data;
  const symbol = settings.currencySymbol;
  const drawer = $('cart-dialog');
  const nav = $('nav-dialog');
  const form = $('checkout-form');
  const title = $('drawer-title');
  const foot = $('cart-foot');
  const backBtn = drawer.querySelector('[data-action="back-to-cart"]');
  let triedSubmit = false;

  const priced = (n, label) => (n === null ? ph(label) : money(n, symbol));
  const itemsLabel = (n) => `${n} ${n === 1 ? 'item' : 'items'}`;
  const announce = (text) => { $('live').textContent = text; };

  /* Dialog open and close, with the slide kept to transform and opacity */
  function openDialog(d) {
    if (d.open) return;
    d.showModal();
    scroller.lock();
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
  }
  function closeDialog(d, then) {
    if (!d.open) { if (then) then(); return; }
    d.classList.remove('is-open');
    const finish = () => { d.close(); scroller.unlock(); if (then) then(); };
    setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_MS);
  }
  [drawer, nav].forEach((d) => {
    d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
    d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
  });

  /* Drawer views */
  function showView(name) {
    drawer.querySelectorAll('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== name; });
    foot.hidden = name !== 'cart' || cart.count() === 0;
    backBtn.hidden = name !== 'checkout';
    title.textContent = { cart: 'Your cart', checkout: 'Checkout', done: 'Order summary' }[name];
    drawer.querySelector('.drawer__body').scrollTop = 0;
    title.focus({ preventScroll: true });
  }

  /* Totals */
  function summaryHTML() {
    const delivery = cart.fulfilment === 'delivery';
    return `
      <div class="summary__row"><span>Subtotal</span><span>${priced(cart.subtotal(), 'SUBTOTAL')}</span></div>
      ${delivery ? `<div class="summary__row"><span>Delivery fee</span><span>${priced(settings.deliveryFee, 'FEE')}</span></div>` : ''}
      <div class="summary__row summary__row--total"><span>Total</span><span>${priced(cart.total(), 'TOTAL')}</span></div>`;
  }

  /* Cart lines */
  function lineHTML({ id, qty, item }) {
    const thumb = item.photo
      ? `<img class="line__thumb" src="${esc(item.photo.src)}" width="72" height="72" alt="" loading="lazy">`
      : `<div class="line__thumb line__thumb--none" aria-hidden="true">?</div>`;
    const name = item.name || 'this item';
    return `<li class="line">
      ${thumb}
      <div>
        <p class="line__name">${val(item.name, 'NAME')}</p>
        <p class="line__price">${item.price === null ? ph('PRICE') : money(item.price * qty, symbol)}</p>
      </div>
      <div class="line__controls">
        <div class="qty">
          <button type="button" data-qty="-1" data-id="${esc(id)}" aria-label="One less of ${esc(name)}"><svg aria-hidden="true"><use href="#ic-minus"/></svg></button>
          <span aria-label="Quantity">${qty}</span>
          <button type="button" data-qty="1" data-id="${esc(id)}" aria-label="One more of ${esc(name)}"><svg aria-hidden="true"><use href="#ic-plus"/></svg></button>
        </div>
        <button class="line__remove" type="button" data-remove="${esc(id)}" aria-label="Remove ${esc(name)}"><svg aria-hidden="true"><use href="#ic-trash"/></svg>Remove</button>
      </div>
    </li>`;
  }

  function refresh(change = {}) {
    const n = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach((b) => {
      b.textContent = n;
      b.hidden = n === 0;
      if (change.type === 'add') {
        b.classList.remove('bump');
        void b.offsetWidth;
        b.classList.add('bump');
      }
    });
    document.querySelectorAll('[data-cart-label]').forEach((b) => b.setAttribute('aria-label', n ? `Open cart, ${itemsLabel(n)}` : 'Open cart'));
    document.body.classList.toggle('has-items', n > 0);
    document.querySelector('[data-bar-count]').textContent = itemsLabel(n);
    document.querySelector('[data-bar-subtotal]').innerHTML = `Subtotal ${priced(cart.subtotal(), 'SUBTOTAL')}`;

    $('cart-lines').innerHTML = cart.lines().map(lineHTML).join('');
    $('cart-empty').hidden = n > 0;
    $('cart-summary').innerHTML = summaryHTML();
    $('checkout-summary').innerHTML = summaryHTML();
    if (!drawer.querySelector('[data-view="cart"]').hidden) foot.hidden = n === 0;
  }

  /* Add to cart */
  $('menu-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    cart.add(btn.dataset.add);
    const item = data.menu.find((m) => m.id === btn.dataset.add);
    announce(`${item.name || 'Item'} added to cart. ${itemsLabel(cart.count())}.`);
    btn.textContent = 'Added';
    btn.dataset.added = '';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = 'Add to cart'; delete btn.dataset.added; }, 1400);
  });

  /* Quantity and remove inside the drawer */
  $('cart-lines').addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    const r = e.target.closest('[data-remove]');
    if (q) {
      const line = cart.lines().find((l) => l.id === q.dataset.id);
      const next = line.qty + Number(q.dataset.qty);
      cart.setQty(q.dataset.id, next);
      announce(next < 1 ? 'Item removed from cart.' : `Quantity ${next}.`);
      const again = $('cart-lines').querySelector(`[data-qty="${q.dataset.qty}"][data-id="${CSS.escape(q.dataset.id)}"]`);
      (again || title).focus({ preventScroll: true });
    }
    if (r) {
      cart.remove(r.dataset.remove);
      announce('Item removed from cart.');
      title.focus({ preventScroll: true });
    }
  });

  /* Buttons across the page */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) {
      const action = el.dataset.action;
      if (action === 'open-cart') { showView('cart'); openDialog(drawer); }
      if (action === 'open-nav') openDialog(nav);
      if (action === 'close-dialog') closeDialog(el.closest('dialog'));
      if (action === 'back-to-cart') showView('cart');
      if (action === 'checkout' && cart.count() > 0) { prepareCheckout(); showView('checkout'); }
      return;
    }

    const messenger = e.target.closest('[data-messenger]');
    if (messenger && !data.shop.messenger.url) {
      e.preventDefault();
      const note = messenger.parentElement.querySelector('[data-messenger-note]');
      if (note) note.hidden = false;
      return;
    }

    const link = e.target.closest('a[href^="#"]');
    if (link) {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const parent = link.closest('dialog');
      if (parent) closeDialog(parent, () => scroller.to(target));
      else scroller.to(target);
    }
  });

  /* Checkout */
  const payOpts = $('f-payment-opts');
  payOpts.innerHTML = settings.paymentMethods.map((m, i) => `
    <input class="vh-input" type="radio" name="payment" id="f-pay-${i}" value="${esc(m)}">
    <label for="f-pay-${i}">${esc(m)}</label>`).join('');
  $('f-pickup-place').innerHTML = val(settings.pickupPlace, 'PLACE');
  $('f-gcash-text').innerHTML = `${val(settings.gcash.number, 'GCASH')} ${esc(settings.gcash.note)}`;

  const todayLocal = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  function applyFulfilment() {
    const f = cart.fulfilment;
    form.elements.fulfilment.value = f;
    form.querySelectorAll('[data-only]').forEach((el) => { el.hidden = el.dataset.only !== f; });
    $('f-time-label').textContent = f === 'delivery' ? 'Delivery time' : 'Pick-up time';
  }
  function prepareCheckout() {
    form.elements.date.min = todayLocal();
    applyFulfilment();
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'fulfilment') {
      cart.setFulfilment(e.target.value);
      applyFulfilment();
    }
    if (e.target.name === 'payment') {
      $('f-gcash').hidden = e.target.value !== 'GCash';
    }
    if (triedSubmit) validate(false);
  });
  form.addEventListener('input', () => { if (triedSubmit) validate(false); });

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Enter your name.'),
    phone: (v) => {
      const digits = v.replace(/\D/g, '');
      if (!digits) return 'Enter a contact number.';
      return /^[+\d][\d\s()-]*$/.test(v.trim()) && digits.length >= 10 && digits.length <= 13 ? '' : 'Enter a contact number with 10 to 13 digits.';
    },
    facebook: (v) => (!v.trim() || /^(https?:\/\/)?([\w-]+\.)?(facebook\.com|fb\.com|fb\.me|m\.me)\/\S+$/i.test(v.trim()) ? '' : 'Enter a full Facebook link, or leave this blank.'),
    date: (v) => {
      if (!v) return 'Choose a date.';
      return v < todayLocal() ? 'Choose today or a later date.' : '';
    },
    time: (v) => (v ? '' : 'Choose a time.'),
    address: (v) => (cart.fulfilment !== 'delivery' || v.trim().length >= 5 ? '' : 'Enter your delivery address.'),
    payment: (v) => (v ? '' : 'Choose GCash or Cash.'),
  };

  function setError(name, message) {
    const err = $(`f-${name}-err`);
    err.textContent = message;
    err.hidden = !message;
    const control = name === 'payment' ? null : form.elements[name];
    if (control) {
      if (message) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
  }

  function validate(moveFocus) {
    let first = null;
    for (const [name, rule] of Object.entries(rules)) {
      const message = rule(form.elements[name].value || '');
      setError(name, message);
      if (message && !first) first = name;
    }
    if (first && moveFocus) {
      const target = first === 'payment' ? form.querySelector('[name="payment"]') : form.elements[first];
      target.focus();
      announce(`${$(`f-${first}-err`).textContent}`);
    }
    return !first;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    triedSubmit = true;
    if (!validate(true)) return;
    showDone();
  });

  function showDone() {
    const f = form.elements;
    const delivery = cart.fulfilment === 'delivery';
    const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
    const items = cart.lines().map((l) => `<div class="summary__row"><span>${l.qty} x ${val(l.item.name, 'NAME')}</span><span>${l.item.price === null ? ph('PRICE') : money(l.item.price * l.qty, symbol)}</span></div>`).join('');
    const dateText = new Date(`${f.date.value}T00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    $('done-view').innerHTML = `
      <p class="done__note">${esc(settings.orderNote)}</p>
      <h3>Your order</h3>
      <div class="summary">${items}${summaryHTML()}</div>
      <h3>Your details</h3>
      <dl class="done__list">
        ${row('Name', esc(f.name.value.trim()))}
        ${row('Contact', esc(f.phone.value.trim()))}
        ${f.facebook.value.trim() ? row('Facebook', esc(f.facebook.value.trim())) : ''}
        ${row('Date', esc(dateText))}
        ${row('Time', esc(f.time.value))}
        ${row(delivery ? 'Delivery to' : 'Pick up at', delivery ? esc(f.address.value.trim()) : val(settings.pickupPlace, 'PLACE'))}
        ${row('Payment', esc(f.payment.value))}
      </dl>
      <p>Nothing was sent. This screen is the only copy of these details, and they are gone when you close it.</p>
      <a class="btn btn--outline" href="#menu">Back to the menu</a>`;
    cart.clear();
    form.reset();
    triedSubmit = false;
    Object.keys(rules).forEach((name) => setError(name, ''));
    $('f-gcash').hidden = true;
    showView('done');
    announce(settings.orderNote);
  }

  /* Floating cart appears once the hero buttons have scrolled away */
  const fab = document.querySelector('[data-fab]');
  const cta = document.querySelector('[data-hero-cta]');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { fab.classList.toggle('is-shown', !entry.isIntersecting); }).observe(cta);
  } else {
    fab.classList.add('is-shown');
  }

  cart.onChange(refresh);
  refresh();
}
