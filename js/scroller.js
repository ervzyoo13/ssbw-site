// One place for page scrolling, so links and dialogs behave the same with or without smooth scrolling.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOPBAR = 72;

export const scroller = {
  lenis: null,
  to(target) {
    const isTop = target.id === 'top';
    if (this.lenis) {
      this.lenis.scrollTo(isTop ? 0 : target, { offset: isTop ? 0 : -TOPBAR, duration: 1.4 });
    } else {
      const y = isTop ? 0 : target.getBoundingClientRect().top + window.scrollY - TOPBAR;
      window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' });
    }
    if (!isTop) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  },
  lock() {
    const root = document.documentElement;
    root.style.setProperty('--sbw', `${window.innerWidth - root.clientWidth}px`);
    root.classList.add('is-locked');
    if (this.lenis) this.lenis.stop();
  },
  unlock() {
    document.documentElement.classList.remove('is-locked');
    if (this.lenis) this.lenis.start();
  },
};
