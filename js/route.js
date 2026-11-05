// The SimSim Road Trip (S-030, S-032). Draws the road from where the boards and the tent really are, then keeps a
// lookup table so the cart can follow it on scroll using transform only. Until motion takes over (and whenever
// it never does: reduced motion, or GSAP failing to load) the cart simply stays parked in front of the tent.
// The cart is a separate drawing, assets/route-cart.svg, so it can be swapped without touching this code.

import { letterBoxes } from './pieces.js';

const CART_FILE = 'assets/route-cart.svg';
const FOOT = 0.946;        // where the wheels touch the road, as a share of the cart's height
const MAX_TILT = 9;        // degrees, leaning into a bend
const SIDEWAYS = 0.3;      // road running sideways uses this much scroll per pixel, so the cart slows through bends
const VIEW_START = 0.62;   // the cart sets off this far down the window...
const VIEW_END = 0.82;     // ...and parks here, low enough that the tent is on screen above it
const POP_AT = 0.62;       // a board stands up when the cart is this far down it
const TENT_GAP = 28;       // the parked cart stays this far from the tent's post

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

// Puts the free-standing scenery in its spot, then keeps a promise for the whole section: a piece that would touch
// a board, the tent, the road, the headline or another piece is not shown. That holds at any screen size and for
// any number of stops, including ones nobody has tested.
function placeScenery({ W, road, rel, stops, tent, street }) {
  const pieces = (name) => stage.querySelector(`.scene--${name}`);
  const boxOf = (el) => {
    const r = rel(el);
    return { l: r.l, r: r.r, t: r.t, b: r.b };
  };
  const hit = (a, b, pad = 0) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
  const margin = road / 2 + 6;
  const roadHits = (b) => samples.some((s) => s.x > b.l - margin && s.x < b.r + margin && s.y > b.t - margin && s.y < b.b + margin);

  // What nothing may touch. Everything here is measured without its transforms, so a folded board, a sticker
  // waiting to pop and a headline partway through its reveal all count from where they end up.
  const origin = stage.getBoundingClientRect();
  const letters = letterBoxes(document.getElementById('route-title')).map((b) => ({ l: b.left - origin.left, r: b.right - origin.left, t: b.top - origin.top, b: b.bottom - origin.top }));
  const stickers = [...stage.querySelectorAll('.stop__sticker')].map((el) => {
    const board = el.offsetParent;
    const item = board.closest('.stop');
    const top = rel(item);
    const l = top.l + board.offsetLeft + board.clientLeft + el.offsetLeft;
    const t = top.t + board.offsetTop + board.clientTop + el.offsetTop;
    return { l: l - 8, r: l + el.offsetWidth + 8, t: t - 8, b: t + el.offsetHeight + 8 };
  });
  const solid = [
    tent,
    ...stops.map((s) => ({ l: s.l, r: s.r, t: s.t, b: s.boardBottom })),
    ...stickers,
    ...letters,
  ];
  const taken = [];
  const clear = (b) => b.l >= -1 && b.r <= W + 1 && !solid.some((o) => hit(b, o, 4)) && !taken.some((o) => hit(b, o, 4)) && !roadHits(b);

  // Scenes that belong to a stop already sit under their board, by the stylesheet
  stage.querySelectorAll('.stop .scene').forEach((el) => {
    el.classList.remove('is-out');
    const b = boxOf(el);
    if (!el.offsetWidth) return;
    const inTheWay = roadHits(b) || solid.some((o) => hit(b, o));
    el.classList.toggle('is-out', inTheWay);
    if (!inTheWay) taken.push(b);
  });

  // The rest try their spots in order and take the first that is clear
  const put = (el, spots) => {
    if (!el) return;
    el.classList.remove('is-out');
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w) return;
    const found = spots.find(([x, y]) => clear({ l: x, r: x + w, t: y, b: y + h }));
    if (!found) { el.classList.add('is-out'); return; }
    el.style.left = `${f(found[0])}px`;
    el.style.top = `${f(found[1])}px`;
    taken.push({ l: found[0], r: found[0] + w, t: found[1], b: found[1] + h });
  };
  const size = (el) => (el ? [el.offsetWidth, el.offsetHeight] : [0, 0]);
  const [seaW, seaH] = size(pieces('sea'));
  const [signW, signH] = size(pieces('sign'));
  const [cloudW, cloudH] = size(pieces('cloud-a'));
  const [cloud2W] = size(pieces('cloud-b'));
  const second = stops[1];
  const last = stops[stops.length - 1];

  const seaSpots = street && second
    ? [[second.r - seaW, second.t - seaH - 56], [W - seaW, second.t - seaH - 56]]
    : [[tent.r - seaW, tent.t - seaH - 4], [tent.l, tent.t - seaH - 4]];
  put(pieces('sea'), seaSpots);

  put(pieces('cloud-a'), [
    [W - cloudW - W * 0.04, -cloudH - 24],
    [W - cloudW, -cloudH + 8],
    [W - cloudW, 8],
    [W - cloudW, 96],
  ]);
  put(pieces('cloud-b'), second ? [[second.l + (second.r - second.l) * 0.12, Math.max(8, second.t - seaH - cloudH - 80)], [W - cloud2W, 8]] : [[W - cloud2W, 8]]);

  // The road sign stands right at the roadside: under the first board, beyond its post, on the road's side.
  const signSpots = [];
  const first = stops[0];
  if (street && last) signSpots.push([last.r - signW, tent.b - signH], [last.l, tent.b - signH]);
  if (first) {
    const centre = (first.l + first.r) / 2;
    const beyondPost = first.left ? centre + 16 : centre - 16 - signW;
    const nearEdge = first.left ? first.r - signW - 8 : first.l + 8;
    signSpots.push([first.left ? Math.max(beyondPost, nearEdge) : Math.min(beyondPost, nearEdge), first.boardBottom + 4], [beyondPost, first.boardBottom + 4]);
  }
  if (last) signSpots.push([W - signW, last.t - signH - 4], [0, last.t - signH - 4]);
  put(pieces('sign'), signSpots);
}

function draw() {
  const W = stage.clientWidth;
  if (!W) return;
  const css = getComputedStyle(stage);
  const road = parseFloat(css.getPropertyValue('--road'));
  const dash = parseFloat(css.getPropertyValue('--dash'));
  const post = parseFloat(css.getPropertyValue('--post'));
  cartW = cart.offsetWidth;
  cartH = cart.offsetHeight;
  wheelR = cartW * 0.1125;

  // The list items and the tent are never transformed, so these are their true places even while a board is folded.
  const box = stage.getBoundingClientRect();
  const rel = (el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
  };
  const stops = [...stage.querySelectorAll('.stop')].map((el) => {
    const r = rel(el);
    return { ...r, left: el.classList.contains('stop--left'), boardBottom: r.b - post + 8 };
  });
  const tentEl = document.getElementById('tent');
  const tent = rel(tentEl);
  const tentRight = tentEl.classList.contains('tent--right');
  const dir = tentRight ? 1 : -1;

  // The road ends in front of the tent's opening, short of its post, so the parked cart stands clear of it.
  const xEnd = tentRight ? tent.l - TENT_GAP - cartW / 2 : tent.r + TENT_GAP + cartW / 2;
  const yFinal = tent.b - 4;

  // Wide screens have a street: boards down both sides and a channel between them the cart fits through.
  const edgeL = Math.max(-Infinity, ...stops.filter((s) => s.left).map((s) => s.r), tentRight ? -Infinity : tent.r);
  const edgeR = Math.min(Infinity, ...stops.filter((s) => !s.left).map((s) => s.l), tentRight ? tent.l : Infinity);
  const channel = edgeR - edgeL;
  const street = stops.length > 1 && channel >= cartW + 48;
  const middle = (edgeL + edgeR) / 2;
  const sway = street ? channel / 2 - cartW / 2 - 16 : 0;

  // Elsewhere each board has a lane beside it, on its open side, always inside the screen.
  const pad = Math.max(road / 2 + 2, cartW / 2 - 8);
  const reach = Math.max(road * 1.2 + cartW / 2, W * 0.17);
  const laneBeside = (b, left) => {
    const x = street
      ? (left ? middle + sway : middle - sway)
      : (left ? b.r + Math.min((W - b.r) / 2, reach) : b.l - Math.min(b.l / 2, reach));
    return Math.min(W - pad, Math.max(pad, x));
  };
  const wiggle = (x, left) => (left ? Math.min(W * 0.025, W - pad - x) : -Math.min(W * 0.025, x - pad));

  // The tent's lane leaves room for the road to bend round into its front.
  const bend = Math.max(road * 1.2, W * 0.13);
  const tentLane = street
    ? laneBeside(tent, !tentRight)
    : Math.min(W - pad, Math.max(pad + 4, xEnd - dir * bend));

  const lanes = stops.map((s) => laneBeside(s, s.left));
  let x = stops.length ? lanes[0] : tentLane;
  let y = cartH * FOOT + 16;   // the parked cart's roof stays clear of the headline above it
  y0 = y;
  let d = `M${f(x)} ${f(y)}`;
  // Every bend leaves and arrives pointing straight down the page, so the road never runs back uphill.
  // A sharp crossing gets longer handles, which keeps its inner edge a smooth curve instead of a pinched corner.
  const go = (nx, ny) => {
    const drop = ny - y;
    if (drop <= 0) return;
    const h = drop * (Math.abs(nx - x) > drop * 0.8 ? 0.72 : 0.5);
    d += `C${f(x)} ${f(y + h)} ${f(nx)} ${f(ny - h)} ${f(nx)} ${f(ny)}`;
    x = nx;
    y = ny;
  };

  const CLEAR = 8;
  stops.forEach((s, i) => {
    const mid = Math.max(s.t + (s.b - s.t) / 2, y + 24);
    if (street) {
      // Between two rows of boards the road sways across the channel, one long curve per board.
      if (i) go(lanes[i], mid);
      return;
    }
    // Tight screens: hold the lane beside the board and cross only in the gap, so nothing touches a board.
    if (s.t - CLEAR > y) go(lanes[i], s.t - CLEAR);
    go(lanes[i] + wiggle(lanes[i], s.left), mid);
    go(lanes[i], s.b + CLEAR);
  });

  // In towards the tent, then round the bend, ending in front of its opening. It never passes under the tent.
  const corner = Math.min(Math.max(road * 1.25, 56), Math.max(24, (yFinal - y) * 0.5));
  if (street) {
    go(tentLane, Math.max(y + 24, tent.t + (yFinal - corner - tent.t) * 0.4));
  } else {
    go(tentLane, Math.max(y + 24, tent.t - CLEAR));
  }
  go(tentLane, yFinal - corner);
  d += `C${f(tentLane)} ${f(y + corner * 0.55)} ${f(xEnd - (xEnd - tentLane) * 0.55)} ${f(yFinal)} ${f(xEnd)} ${f(yFinal)}`;
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
    // Lean on the bends only. The last stretch levels out, because the cart stops side-on to the tent.
    const tilt = ((b.x - a.x) / ds) * MAX_TILT * Math.min(1, (Math.abs(b.y - a.y) / ds) * 3);
    return { ...s, tilt };
  });
  // Parked means level, however the road happens to arrive
  const settle = Math.min(12, samples.length - 1);
  for (let i = 0; i <= settle; i++) samples[samples.length - 1 - i].tilt *= i / settle;

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

  placeScenery({ W, road, rel, stops, tent, street });
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  // The clouds, leaves and waves only move while the section is near the screen.
  const section = document.getElementById('route');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => section.classList.toggle('is-near', e.isIntersecting), { rootMargin: '200px' }).observe(section);
  } else {
    section.classList.add('is-near');
  }
}
