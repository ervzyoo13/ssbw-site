// The SimSim Road Trip (S-030). Draws the road from where the boards and the tent really are, then keeps a
// lookup table so the cart can follow it on scroll using transform only. Until motion takes over (and whenever
// it never does: reduced motion, or GSAP failing to load) the cart simply stays parked at the tent.
// The cart is a separate drawing, assets/route-cart.svg, so it can be swapped without touching this code.

const CART_FILE = 'assets/route-cart.svg';
const FOOT = 0.946;        // where the wheels touch the road, as a share of the cart's height
const MAX_TILT = 9;        // degrees, leaning into a bend
const SIDEWAYS = 0.3;      // road running sideways uses this much scroll per pixel, so the cart slows through bends
const VIEW_START = 0.62;   // the cart sets off this far down the window...
const VIEW_END = 0.82;     // ...and parks here, low enough that the tent is on screen above it
const POP_AT = 0.62;       // a board stands up when the cart is this far down it

let stage;
let cart;
let wheels = [];
let samples = [];
let cartW = 0;
let cartH = 0;
let wheelR = 8;
let y0 = 0;
let yEnd = 0;

const f = (v) => v.toFixed(1);
const sampleAt = (u) => {
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].u <= u) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const k = b.u > a.u ? Math.min(1, Math.max(0, (u - a.u) / (b.u - a.u))) : 0;
  const mix = (p, q) => p + (q - p) * k;
  return { x: mix(a.x, b.x), y: mix(a.y, b.y), len: mix(a.len, b.len), tilt: mix(a.tilt, b.tilt) };
};

export const trip = {
  total: 0,        // length of the trip in scroll pixels
  pops: [],        // for each board, how far along the trip it stands up
  p: 1,            // progress, 0 at the start of the road and 1 parked at the tent
  driving: false,  // true once motion is steering the cart
  place(u) {
    if (!samples.length) return;
    const s = sampleAt(u);
    // A very small bounce from the road, gone once parked
    const bump = u < trip.total - 1 ? Math.sin(s.len * 0.08) * 1.2 : 0;
    cart.style.transform = `translate3d(${f(s.x - cartW / 2)}px, ${f(s.y - cartH * FOOT + bump)}px, 0) rotate(${s.tilt.toFixed(2)}deg)`;
    const turn = `rotate(${f((s.len / wheelR) * 57.2958)}deg)`;
    wheels.forEach((w) => { w.style.transform = turn; });
  },
  // Which scroll positions the trip runs between
  range() {
    const top = stage.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    const height = yEnd - y0;
    const start = top + y0 - VIEW_START * vh;
    return { start, end: start + Math.max(height * 0.5, height - (VIEW_END - VIEW_START) * vh) };
  },
};

function draw() {
  const W = stage.clientWidth;
  if (!W) return;
  const css = getComputedStyle(stage);
  const road = parseFloat(css.getPropertyValue('--road'));
  const dash = parseFloat(css.getPropertyValue('--dash'));
  cartW = cart.offsetWidth;
  cartH = cart.offsetHeight;
  wheelR = cartW * 0.1125;

  // The list items and the tent are never transformed, so these are their true places even while a board is folded.
  const box = stage.getBoundingClientRect();
  const rel = (el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
  };
  const stops = [...stage.querySelectorAll('.stop')].map((el) => ({ ...rel(el), left: el.classList.contains('stop--left') }));
  const tent = rel(document.getElementById('tent'));
  const tentLeft = stops.length ? stops[stops.length - 1].left : false;

  // The lane is the strip of road beside a board, on the open side, always inside the screen.
  const pad = Math.max(road / 2 + 2, cartW / 2 - 8);
  const reach = Math.max(road * 1.2 + cartW / 2, W * 0.17);
  const laneBeside = (b, left) => {
    const x = left ? b.r + Math.min((W - b.r) / 2, reach) : b.l - Math.min(b.l / 2, reach);
    return Math.min(W - pad, Math.max(pad, x));
  };
  const wiggle = (x, left) => (left ? Math.min(W * 0.025, W - pad - x) : -Math.min(W * 0.025, x - pad));

  let x = laneBeside(stops[0] || tent, stops[0] ? stops[0].left : tentLeft);
  let y = cartH * FOOT + 16;   // the parked cart's roof stays clear of the headline above it
  y0 = y;
  let d = '';
  // Every bend leaves and arrives pointing straight down the page, so the road never runs back uphill.
  // A sharp crossing gets longer handles, which keeps its inner edge a smooth curve instead of a pinched corner.
  const go = (nx, ny) => {
    const drop = ny - y;
    const h = drop * (Math.abs(nx - x) > drop * 0.8 ? 0.72 : 0.5);
    d += `C${f(x)} ${f(y + h)} ${f(nx)} ${f(ny - h)} ${f(nx)} ${f(ny)}`;
    x = nx;
    y = ny;
  };
  const CLEAR = 8;
  const lanes = stops.map((s) => laneBeside(s, s.left));
  // With room to spare the road takes one long sweep from board to board. A long sweep starts to drift sideways
  // while still beside a board (about a quarter of its width by the board's end), so it needs that much slack.
  const roomy = stops.every((s, i) => {
    const near = s.left ? lanes[i] - s.r : s.l - lanes[i];
    const span = i + 1 < stops.length ? Math.abs(lanes[i + 1] - lanes[i]) : 0;
    return near - span * 0.25 - cartW / 2 >= 12;
  });
  // A long sweep starts out already at its widest, with no tight little curve to get there.
  if (roomy && stops.length) x = lanes[0] + wiggle(lanes[0], stops[0].left);
  d = `M${f(x)} ${f(y)}`;
  stops.forEach((s, i) => {
    const mid = Math.max(s.t + (s.b - s.t) / 2, y + 24);
    if (roomy) {
      if (i) go(lanes[i] + wiggle(lanes[i], s.left), mid);
      return;
    }
    // Tight screens: hold the lane beside the board and cross only in the gap, so nothing touches a board.
    if (s.t - CLEAR > y) go(lanes[i], s.t - CLEAR);
    go(lanes[i] + wiggle(lanes[i], s.left), mid);
    go(lanes[i], s.b + CLEAR);
  });

  // In beside the tent, round the corner, and end under it. The tent's poles stand on the far edge of the road.
  const lane = laneBeside(tent, tentLeft);
  const middle = (tent.l + tent.r) / 2;
  const dir = middle > lane ? 1 : -1;
  const yFinal = tent.b + road / 2 - 6;
  const corner = Math.max(road * 1.25, 56);
  go(lane, tent.t - CLEAR);
  go(lane + wiggle(lane, tentLeft), tent.t + (yFinal - corner - tent.t) / 2);
  go(lane, yFinal - corner);
  d += `C${f(lane)} ${f(yFinal - corner * 0.45)} ${f(lane + dir * corner * 0.45)} ${f(yFinal)} ${f(lane + dir * corner)} ${f(yFinal)}`;
  d += `L${f(middle + dir * cartW * 0.12)} ${f(yFinal)}`;
  yEnd = yFinal;

  const svg = stage.querySelector('.trip__road');
  svg.setAttribute('width', W);
  svg.setAttribute('height', stage.offsetHeight);
  svg.setAttribute('viewBox', `0 0 ${W} ${stage.offsetHeight}`);
  const edge = svg.querySelector('.trip__edge');
  const tar = svg.querySelector('.trip__tar');
  const line = svg.querySelector('.trip__dash');
  [edge, tar, line].forEach((p) => p.setAttribute('d', d));
  edge.setAttribute('stroke-width', road + 8);
  tar.setAttribute('stroke-width', road);
  line.setAttribute('stroke-width', dash);
  line.setAttribute('stroke-dasharray', `${dash * 3} ${dash * 5}`);

  // Walk the road once and remember every few pixels, so moving the cart costs nothing while scrolling.
  const length = tar.getTotalLength();
  const count = Math.ceil(length / 5);
  const raw = [];
  for (let i = 0; i <= count; i++) {
    const p = tar.getPointAtLength((length * i) / count);
    raw.push({ x: p.x, y: p.y, len: (length * i) / count });
  }
  samples = raw.map((s, i) => {
    const a = raw[Math.max(0, i - 6)];
    const b = raw[Math.min(raw.length - 1, i + 6)];
    const ds = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // Lean on the bends only. The last flat stretch stays level, because the cart is side-on to it.
    const tilt = ((b.x - a.x) / ds) * MAX_TILT * Math.min(1, (Math.abs(b.y - a.y) / ds) * 3);
    return { ...s, tilt };
  });
  let u = 0;
  samples.forEach((s, i) => {
    if (i) u += Math.hypot(s.y - samples[i - 1].y, (s.x - samples[i - 1].x) * SIDEWAYS);
    s.u = u;
  });
  trip.total = u;
  // The cart starts beside the first board, so that one stands up as soon as the cart sets off.
  trip.pops = stops.map((s, i) => {
    const at = s.t + (s.b - s.t) * POP_AT;
    return i ? (samples.find((p) => p.y >= at) || samples[samples.length - 1]).u : 1;
  });

  trip.place(trip.p * trip.total);
  window.dispatchEvent(new CustomEvent('route:drawn'));
}

// Inlined rather than used as an image, so its wheels can turn. A drawing with no class="wheel" still drives.
async function loadCart() {
  try {
    const res = await fetch(CART_FILE);
    if (!res.ok) throw new Error(`${CART_FILE} returned ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const svg = doc.documentElement;
    if (svg.nodeName !== 'svg') throw new Error(`${CART_FILE} is not an SVG`);
    svg.querySelectorAll('script').forEach((n) => n.remove());
    ['width', 'height'].forEach((a) => svg.removeAttribute(a));
    svg.setAttribute('focusable', 'false');
    const view = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (view.length === 4 && view[2] && view[3]) cart.style.aspectRatio = `${view[2]} / ${view[3]}`;
    cart.replaceChildren(document.importNode(svg, true));
    wheels = [...cart.querySelectorAll('.wheel')];
  } catch (err) {
    cart.hidden = true;
    console.warn('The road trip cart could not load.', err);
  }
}

export function initRoute() {
  stage = document.getElementById('trip');
  cart = document.getElementById('trip-cart');
  let queued = false;
  const redraw = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; draw(); });
  };
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(stage);
  loadCart().then(redraw);
}
