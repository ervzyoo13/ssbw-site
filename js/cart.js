// The cart. Only item ids, quantities and the Delivery or Pick up choice are kept, in the visitor's
// own browser. Nothing typed into checkout is ever stored here (docs/DATA.md).

const KEY = 'ssbw.cart.v1';
const MAX_QTY = 99;

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage is blocked or full. The cart still works until the page closes.
  }
}

function clean(saved, ids) {
  const lines = {};
  if (saved && saved.lines && typeof saved.lines === 'object') {
    for (const [id, qty] of Object.entries(saved.lines)) {
      const n = Math.floor(Number(qty));
      if (ids.has(id) && n >= 1) lines[id] = Math.min(n, MAX_QTY);
    }
  }
  return { lines, fulfilment: saved && saved.fulfilment === 'delivery' ? 'delivery' : 'pickup' };
}

export function createCart(data) {
  const items = new Map(data.menu.map((m) => [m.id, m]));
  const ids = new Set(items.keys());
  let state = clean(read(), ids);
  const listeners = new Set();

  const emit = (change) => { write(state); listeners.forEach((fn) => fn(change)); };

  const api = {
    onChange(fn) { listeners.add(fn); },
    add(id) {
      if (!ids.has(id)) return;
      state.lines[id] = Math.min((state.lines[id] || 0) + 1, MAX_QTY);
      emit({ type: 'add', id });
    },
    setQty(id, qty) {
      if (!ids.has(id)) return;
      if (qty < 1) delete state.lines[id];
      else state.lines[id] = Math.min(qty, MAX_QTY);
      emit({ type: 'qty', id });
    },
    remove(id) { delete state.lines[id]; emit({ type: 'remove', id }); },
    clear() { state.lines = {}; emit({ type: 'clear' }); },
    get fulfilment() { return state.fulfilment; },
    setFulfilment(value) { state.fulfilment = value === 'delivery' ? 'delivery' : 'pickup'; emit({ type: 'fulfilment' }); },
    lines() { return Object.entries(state.lines).map(([id, qty]) => ({ id, qty, item: items.get(id) })); },
    count() { return Object.values(state.lines).reduce((sum, q) => sum + q, 0); },
    // Prices are null until confirmed. One unknown price makes the sum unknown, never a wrong number.
    subtotal() {
      let sum = 0;
      for (const { qty, item } of api.lines()) {
        if (item.price === null) return null;
        sum += item.price * qty;
      }
      return sum;
    },
    fee() { return state.fulfilment === 'delivery' ? data.settings.deliveryFee : 0; },
    total() {
      const sub = api.subtotal();
      const fee = api.fee();
      return sub === null || fee === null ? null : sub + fee;
    },
  };

  // Keep other open tabs in step
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { state = clean(read(), ids); listeners.forEach((fn) => fn({ type: 'sync' })); }
  });

  return api;
}
