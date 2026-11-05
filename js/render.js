// Renders the page from data/site.json. null in the data becomes a marked placeholder (S-002).

export const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ph = (label) => `<span class="ph">[${label}?]</span>`;
export const val = (v, label) => (v === null || v === undefined || v === '' ? ph(label) : esc(v));
export const money = (n, symbol) => `${esc(symbol)}${Number(n).toLocaleString('en-PH')}`;

const $ = (id) => document.getElementById(id);
// Keeps each word whole, so a name like Pica-Pica never breaks at its hyphen.
const words = (text) => String(text).trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(' ');

export function photoTag(photo, cls = '', sizes = '') {
  const srcset = photo.srcset ? ` srcset="${esc(photo.srcset)}" sizes="${esc(sizes)}"` : '';
  return `<img class="${cls}" src="${esc(photo.src)}"${srcset} width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" loading="lazy" decoding="async">`;
}

function renderHero(d) {
  const { date, place } = d.settings.nextPopUp;
  $('next-popup').innerHTML = `Next pop-up: ${val(date, 'DATE')} at ${val(place, 'PLACE')}`;
  $('hero-stickers').innerHTML = d.hero.stickers
    .map((text, i) => `<p class="sticker hero__sticker hero__sticker--${i + 1}" data-pop>${text ? esc(text) : '<span class="ph">[STICKER?]</span>'}</p>`)
    .join('');
  document.querySelector('[data-hero-burger]').alt = d.hero.burgerAlt;
  document.querySelectorAll('[data-hero-line]').forEach((el, i) => { if (d.hero.lines[i]) el.textContent = d.hero.lines[i]; });
}

function menuCard(item, symbol) {
  const photo = item.photo
    ? photoTag(item.photo, `card__photo${item.photo.cutout ? ' card__photo--cutout' : ''}`, '(min-width: 900px) 25vw, 50vw')
    : `<div class="card__nophoto">${ph('PHOTO')}</div>`;
  const badge = item.bestSeller
    ? `<p class="sticker card__badge" data-pop>${item.bestSellerConfirmed ? 'Best seller' : '[Best seller?]'}</p>`
    : '';
  const label = item.name ? `Add ${esc(item.name)} to cart` : 'Add this item to cart';
  return `<li class="card">
    <div class="card__media"><span class="card__strip" aria-hidden="true"></span>${photo}${badge}</div>
    <h3 class="card__name">${val(item.name, 'NAME')}</h3>
    <p class="card__price">${item.price === null ? ph('PRICE') : money(item.price, symbol)}</p>
    <button class="btn btn--primary btn--block" type="button" data-add="${esc(item.id)}" aria-label="${label}">Add to cart</button>
  </li>`;
}

function renderServices(d) {
  $('more-title').textContent = d.services.title;
  const url = d.shop.messenger.url;
  $('services').innerHTML = d.services.items.map((s) => `
    <article class="service" id="${esc(s.id)}" tabindex="-1" aria-labelledby="${esc(s.id)}-name">
      ${photoTag(s.photo, 'service__photo')}
      <h3 class="service__name" id="${esc(s.id)}-name">${words(s.name)}</h3>
      <p class="service__text">${esc(s.text)}</p>
      ${s.seen ? `<p class="service__seen">${esc(s.seen)}</p>` : ''}
      <ul class="packages">${s.packages.map((p) => `<li><span>${val(p.name, 'PACKAGE')}</span><span>${val(p.rate, 'RATE')}</span></li>`).join('')}</ul>
      <a class="btn btn--primary" href="${url ? esc(url) : '#contact'}" data-messenger${url ? ' rel="noopener" target="_blank"' : ''}>${esc(s.button)}</a>
      <p class="service__note" data-messenger-note hidden>The Messenger link is coming soon. ${ph('MESSENGER LINK')}</p>
    </article>`).join('');
}

function renderReviews(d) {
  $('fam-title').textContent = d.reviews.title;
  $('reviews').innerHTML = d.reviews.items.map((r) => `
    <li class="note">
      <div class="note__tags">
        ${d.reviews.label ? `<span class="tag tag--sample">${esc(d.reviews.label)}</span>` : ''}
        <span class="tag">${esc(r.service)}</span>
      </div>
      <p class="note__text">${r.text ? esc(r.text) : `${ph('REVIEW')} A real SimSim Fam review goes here.`}</p>
      <p class="note__name">${val(r.name, 'NAME')}</p>
    </li>`).join('');
}

// The road trip: signboards take turns left and right, and the tent stays on the side of the last board.
function renderRoute(d) {
  const { title, stops, finish } = d.route;
  const { date, place } = d.settings.nextPopUp;
  $('route-title').textContent = title;
  $('route-stops').innerHTML = stops.map((s, i) => `
    <li class="stop stop--${i % 2 ? 'right' : 'left'}${s.title && s.date ? '' : ' stop--todo'}">
      <div class="stop__pop">
        <div class="stop__board">
          <div class="stop__frame">${s.photo ? photoTag(s.photo, 'stop__photo') : `<div class="stop__nophoto">${ph('PHOTO')}</div>`}</div>
          <div class="stop__words">
            <h3 class="stop__title">${s.title ? words(s.title) : ph('EVENT')}</h3>
            <p class="stop__date">${val(s.date, 'DATE')}</p>
          </div>
        </div>
        <span class="stop__post" aria-hidden="true"></span>
      </div>
    </li>`).join('');
  $('tent').classList.add(`tent--${stops.length % 2 ? 'left' : 'right'}`);
  $('tent-title').textContent = finish.sign;
  $('tent-next').innerHTML = `${val(date, 'DATE')} at ${val(place, 'PLACE')}`;
  $('tent-btn').textContent = finish.button;
}

function renderAbout(d) {
  const { shop, settings, about } = d;
  $('about-title').textContent = about.title;
  $('about-lead').textContent = about.lead;
  $('about-story').innerHTML = about.story ? esc(about.story) : `${ph('STORY')} The SimSim story goes here.`;
  $('about-photo').innerHTML = photoTag(about.photo);
  const fee = settings.deliveryFee === null ? ph('FEE') : money(settings.deliveryFee, settings.currencySymbol);
  const messenger = shop.messenger.url
    ? `<a href="${esc(shop.messenger.url)}" rel="noopener" target="_blank">${esc(shop.messenger.label)}</a>`
    : `${esc(shop.messenger.label)} ${ph('MESSENGER LINK')}`;
  const rows = [
    ['Location', esc(shop.location)],
    ['Pick-up place', val(settings.pickupPlace, 'PLACE')],
    ['Delivery area', val(settings.deliveryArea, 'AREA')],
    ['Delivery fee', fee],
    ['Hours', val(shop.hours, 'HOURS')],
    ['Payment', settings.paymentMethods.map(esc).join(' or ')],
    ['Messenger', messenger],
    ['Instagram', `<a href="${esc(shop.instagram.url)}" rel="noopener" target="_blank">${esc(shop.instagram.handle)}</a>`],
  ];
  $('facts').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}

function renderFooter(d) {
  const { shop, settings } = d;
  const messenger = shop.messenger.url
    ? `<a href="${esc(shop.messenger.url)}" rel="noopener" target="_blank">Messenger</a>`
    : `<a href="#find-us">Messenger ${ph('LINK')}</a>`;
  $('footer-social').innerHTML = `<li>${messenger}</li><li><a href="${esc(shop.instagram.url)}" rel="noopener" target="_blank">Instagram</a></li>`;
  $('footer-note').textContent = `${shop.logoLine}, ${shop.location}. ${settings.orderNote}`;
}

export function renderAll(d) {
  renderHero(d);
  $('menu-title').textContent = d.menuIntro.title;
  $('menu-text').textContent = d.menuIntro.text;
  $('menu-grid').innerHTML = d.menu.map((item) => menuCard(item, d.settings.currencySymbol)).join('');
  renderServices(d);
  renderReviews(d);
  renderRoute(d);
  renderAbout(d);
  renderFooter(d);
  // Keep each word whole, so "pop-up" never breaks at its hyphen, and give the line reveal words to measure.
  document.querySelectorAll('[data-lines]').forEach((h) => {
    h.innerHTML = words(h.textContent);
  });
}
