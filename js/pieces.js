// The floating ingredient pieces (S-034). Their parallax moves them up and down and turns them as you scroll, so a
// spot that looks clear at rest can still pass over a headline. This works out the whole range each piece can reach
// and takes it off the page at any window size where that range would touch a headline or other important text.

const TURN = 12 * (Math.PI / 180);   // the most a piece ever turns, in js/motion.js
const IMPORTANT = '.h2, .hero__word, .hero__next, .hero__sticker, .lead, .card__name, .card__price, .btn, .menu-cta__line, .menu-cta__note, .service__name, .stop__title, .stop__date, .stop__text, .tent__title, .tent__next';

export const pieceReach = () => (window.innerWidth < 768 ? 28 : 72);
export const pieceDepth = (piece) => Number((window.innerWidth < 768 && piece.dataset.depthPhone) || piece.dataset.depth) || 1;

// Where a headline's letters are, even partway through its reveal, when each line is still shifted down inside its
// mask. A line box is taller than its letters, and Smooch Sans has no real descenders, so only the letters count.
export function letterBoxes(headline) {
  const size = parseFloat(getComputedStyle(headline).fontSize);
  return [...headline.querySelectorAll('.w')].map((word) => {
    const r = word.getBoundingClientRect();
    const line = word.closest('.li');
    const mask = line && line.parentElement;
    const shift = line ? line.getBoundingClientRect().top - mask.getBoundingClientRect().top - parseFloat(getComputedStyle(mask).paddingTop) : 0;
    return { left: r.left, right: r.right, top: r.top - shift + size * 0.26, bottom: r.top - shift + size * 0.94 };
  });
}

function textBoxes(el) {
  if (el.querySelector('.w')) return letterBoxes(el);
  if (el.matches('.btn')) return [el.getBoundingClientRect()];
  const range = document.createRange();
  range.selectNodeContents(el);
  return [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
}

function check() {
  const near = 8;
  document.querySelectorAll('.piece').forEach((piece) => {
    piece.classList.remove('is-out');
    const cs = getComputedStyle(piece);
    if (cs.display === 'none') return;
    const w = parseFloat(cs.width);
    const h = parseFloat(cs.height);
    const wide = w * Math.cos(TURN) + h * Math.sin(TURN);
    const tall = h * Math.cos(TURN) + w * Math.sin(TURN);
    const rest = piece.getBoundingClientRect();
    const moved = window.gsap ? window.gsap.getProperty(piece, 'y') : 0;
    const cx = rest.left + rest.width / 2;
    const cy = rest.top + rest.height / 2 - moved;
    const reach = pieceReach() * pieceDepth(piece);
    const section = piece.parentElement.getBoundingClientRect();
    const zone = {
      left: cx - wide / 2 - near,
      right: cx + wide / 2 + near,
      top: Math.max(cy - tall / 2 - reach - near, section.top),
      bottom: Math.min(cy + tall / 2 + reach + near, section.bottom),
    };
    const touches = [...piece.parentElement.querySelectorAll(IMPORTANT)]
      .filter((el) => el.offsetParent !== null || el.closest('.hero'))
      .flatMap(textBoxes)
      .some((b) => zone.left < b.right && zone.right > b.left && zone.top < b.bottom && zone.bottom > b.top);
    piece.classList.toggle('is-out', touches);
  });
}

// Checks now, then again whenever a section changes size: a resize, a late font wrapping its text differently,
// or a note appearing under a button. Hiding a piece can't set this off again, because pieces take up no room.
export function guardPieces() {
  check();
  let queued = false;
  const again = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; check(); });
  };
  window.addEventListener('resize', again);
  window.addEventListener('load', again);
  if ('ResizeObserver' in window) {
    const watcher = new ResizeObserver(again);
    new Set([...document.querySelectorAll('.piece')].map((p) => p.parentElement)).forEach((section) => watcher.observe(section));
  }
}
