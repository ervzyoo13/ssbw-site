// All motion. Premium means slow and smooth: only transform and opacity ever animate.
// prefers-reduced-motion gets no parallax, no drift, no smooth scroll, and simple fades only.

import { scroller } from './scroller.js';
import { trip } from './route.js';
import { pieceReach, pieceDepth } from './pieces.js';

const ready = () => document.documentElement.classList.remove('js-wait');
// Resolves when the first-visit preloader has cleared, or at once if it isn't showing or its script failed.
const introGate = () => (window.ssbwLoader && window.ssbwLoader.done) || Promise.resolve();

/* Split a headline into lines by where it actually wraps, then restore it after the reveal. */
function splitLines(el) {
  const original = el.innerHTML;
  const lines = [];
  let lastTop = null;
  el.querySelectorAll('.w').forEach((w) => {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
    lines[lines.length - 1].push(w.outerHTML);
  });
  el.classList.add('is-split');
  el.innerHTML = lines.map((l) => `<span class="lm"><span class="li">${l.join(' ')}</span></span>`).join('');
  return { inners: [...el.querySelectorAll('.li')], revert: () => { el.classList.remove('is-split'); el.innerHTML = original; } };
}

function fullMotion(gsap, ScrollTrigger) {
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero__stage');
  const lines = gsap.utils.toArray('[data-hero-line]');
  const masks = gsap.utils.toArray('.hero__mask');
  const burger = document.querySelector('[data-hero-burger]');
  const burgerWrap = document.querySelector('[data-hero-burger-wrap]');
  const heroStickers = gsap.utils.toArray('.hero__sticker');
  const cta = document.querySelector('[data-hero-cta]');
  const rotOf = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--rot')) || 0;

  /* Smooth scrolling on desktop only. Phones keep their native feel. */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches;
  let lenis = null;
  if (fine && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    scroller.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (window.ssbwLoader && window.ssbwLoader.active) {
      lenis.stop();
      introGate().then(() => lenis.start());
    }
  }

  /* Hero on load: lines slide up from a mask, burger drops with a soft bounce, stickers pop */
  gsap.set(lines, { yPercent: 118 });
  gsap.set(burger, { y: () => -stage.offsetHeight * 0.42, opacity: 0, transformOrigin: '50% 90%' });
  heroStickers.forEach((s) => gsap.set(s, { scale: 0.4, rotation: rotOf(s) - 24, opacity: 0 }));
  gsap.set(cta, { opacity: 0, y: 16 });
  ready();

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
  tl.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.14 }, 0.1)
    .set(masks, { overflow: 'visible' }, '>')
    .to(burger, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.in' }, 0.45)
    .to(burger, { scaleY: 0.96, scaleX: 1.02, duration: 0.14, ease: 'power1.out' }, 1.25)
    .to(burger, { y: -18, scaleY: 1.01, scaleX: 0.995, duration: 0.3, ease: 'power2.out' }, 1.39)
    .to(burger, { y: 0, scaleY: 1, scaleX: 1, duration: 0.36, ease: 'power2.in' }, 1.69);
  heroStickers.forEach((s, i) => {
    tl.to(s, { scale: 1, rotation: rotOf(s), opacity: 1, duration: 0.8, ease: 'back.out(1.8)' }, 1.5 + i * 0.16);
  });
  tl.to(cta, { opacity: 1, y: 0, duration: 1 }, 1.0);
  const introPlayed = new Promise((resolve) => tl.eventCallback('onComplete', resolve));
  introGate().then(() => tl.play());

  /* Hero on scroll: the burger trails the text and turns a few degrees */
  gsap.to(burgerWrap, {
    y: () => stage.offsetHeight * 0.14,
    rotation: 5,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true },
  });

  /* Waves drift sideways */
  gsap.utils.toArray('[data-wave]').forEach((wave, i) => {
    const dir = i % 2 ? 1 : -1;
    const drift = { p: 0 };
    const paint = () => {
      const svg = wave.firstElementChild;
      const d = Number(wave.dataset.drift) || 0;
      if (svg) svg.style.transform = `translate3d(${((drift.p * 2 - 1) * d * dir).toFixed(1)}px, 0, 0)`;
    };
    paint();
    gsap.to(drift, {
      p: 1,
      ease: 'none',
      onUpdate: paint,
      scrollTrigger: { trigger: wave, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
  });

  /* Ingredient pieces: slow parallax, phones move less */
  const reach = pieceReach();
  gsap.utils.toArray('.piece').forEach((piece, i) => {
    const depth = pieceDepth(piece);
    gsap.fromTo(piece, { y: -reach * depth, rotation: i % 2 ? -10 : 8 }, {
      y: reach * depth,
      rotation: i % 2 ? 12 : -10,
      ease: 'none',
      scrollTrigger: { trigger: piece.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
    });
  });

  /* Section headlines reveal line by line */
  gsap.utils.toArray('[data-lines]').forEach((h) => {
    const split = splitLines(h);
    gsap.set(split.inners, { yPercent: 112 });
    gsap.to(split.inners, {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      onComplete: split.revert,
    });
  });

  /* Menu cards stagger in, best-seller stickers pop */
  const cards = gsap.utils.toArray('.card');
  gsap.set(cards, { y: 48, opacity: 0 });
  ScrollTrigger.batch(cards, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity' }),
  });
  gsap.utils.toArray('.card__badge').forEach((s) => {
    const rot = rotOf(s);
    gsap.fromTo(s, { scale: 0.4, rotation: rot - 24, opacity: 0 }, {
      scale: 1, rotation: rot, opacity: 1, duration: 0.8, ease: 'back.out(1.8)', delay: 0.5,
      scrollTrigger: { trigger: s, start: 'top 90%', once: true },
    });
  });

  /* The road trip: the cart drives on scroll, and each board stands up as the cart reaches it, then stays up */
  const boards = gsap.utils.toArray('.stop__pop');
  const sign = document.getElementById('tent-sign');
  const standing = new Set();
  gsap.set(boards, { rotationX: 86, transformPerspective: 900, transformOrigin: '50% 100%' });
  boards.forEach((b) => b.classList.add('is-folded'));
  // A board's sticker and its little roadside scene wait to pop up with it
  const extras = (board) => [...board.closest('.stop').querySelectorAll('.stop__sticker, .scene__in')];
  boards.forEach((b) => gsap.set(extras(b), { scale: 0 }));
  const popUp = (board) => {
    standing.add(board);
    gsap.timeline({ onComplete: () => { board.classList.remove('is-folded'); gsap.set(board, { clearProps: 'transform' }); } })
      .to(board, { rotationX: -12, duration: 0.38, ease: 'power2.out' })
      .to(board, { rotationX: 5, duration: 0.16, ease: 'sine.inOut' })
      .to(board, { rotationX: 0, duration: 0.16, ease: 'sine.inOut' })
      .to(extras(board), { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.08, clearProps: 'transform' }, 0.22);
  };
  let arrived = false;
  const drive = (p) => {
    trip.p = p;
    const u = p * trip.total;
    trip.place(u);
    boards.forEach((b, i) => { if (!standing.has(b) && u >= trip.pops[i]) popUp(b); });
    if (!arrived && p >= 0.995) {
      arrived = true;
      gsap.fromTo(sign, { rotation: -3 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)', transformOrigin: '50% 0%', clearProps: 'transform' });
    }
  };
  const state = { p: 0 };
  trip.driving = true;
  drive(0);
  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => drive(state.p),
    scrollTrigger: { start: () => trip.range().start, end: () => trip.range().end, scrub: 0.8 },
  });
  window.addEventListener('route:drawn', () => ScrollTrigger.refresh());
  window.addEventListener('waves:rebuilt', () => ScrollTrigger.refresh());

  window.addEventListener('load', () => ScrollTrigger.refresh());
  return introPlayed;
}

function reducedMotion(gsap) {
  gsap.set('.hero__stage, [data-hero-cta]', { opacity: 0 });
  ready();
  const introPlayed = new Promise((resolve) => {
    introGate().then(() => gsap.to('.hero__stage, [data-hero-cta]', { opacity: 1, duration: 0.8, ease: 'none', onComplete: resolve }));
  });
  // The road trip gets no motion at all: route.js leaves the boards standing and the cart parked at the tent.
  gsap.utils.toArray('.card, .sec-head, .service, .note').forEach((el) => {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  return introPlayed;
}

// Returns a promise that resolves once the hero intro has played.
export function initMotion() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { ready(); return introGate(); }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return reducedMotion(gsap);
  return fullMotion(gsap, ScrollTrigger);
}
