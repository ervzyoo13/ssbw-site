// First-visit preloader (S-027). A plain script of its own, so it needs nothing else on the page to work.
// The preloader only exists once this file adds .has-preloader, so without JavaScript, or if this file
// fails to load, there is no preloader at all. The MAX timer below ends it even if everything else fails.
(function () {
  var MIN = 800;
  var MAX = 2000;
  var KEY = 'ssbw.intro.seen';
  var root = document.documentElement;
  var api = { active: false, done: Promise.resolve() };
  window.ssbwLoader = api;

  // Storage blocked means a visit can't be remembered, so skip the preloader rather than repeat it.
  try {
    if (window.sessionStorage.getItem(KEY)) return;
    window.sessionStorage.setItem(KEY, '1');
  } catch (e) {
    return;
  }

  var start = window.performance.now();
  var loader = null;
  var left = false;
  var resolveDone;
  api.active = true;
  api.done = new Promise(function (resolve) { resolveDone = resolve; });
  root.classList.add('has-preloader');

  function finish() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    root.classList.remove('has-preloader');
    api.active = false;
    resolveDone();
  }

  function leave() {
    if (left) return;
    left = true;
    loader = loader || document.getElementById('preloader');
    if (!loader) { finish(); return; }
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var done = false;
    var once = function () { if (!done) { done = true; finish(); } };
    loader.addEventListener('transitionend', function (e) { if (e.target === loader) once(); });
    setTimeout(once, reduced ? 500 : 1200);
    loader.classList.add(reduced ? 'is-fading' : 'is-leaving');
  }

  // The hard maximum. Nothing below can delay this.
  setTimeout(leave, MAX);

  // The curtain's wave edge, drawn at real pixel size so it never stretches on an ultrawide.
  function drawEdge(host) {
    var w = Math.max(root.clientWidth, window.innerWidth);
    var h = w < 768 ? 72 : 112;
    var band = w < 768 ? 24 : 32;
    var amp = (h - band) / 2 - 1;
    var period = Math.max(480, w * 0.6);
    var y = function (x) {
      var t = (x / period) * Math.PI * 2;
      return amp + 1 + amp * (0.78 * Math.sin(t) + 0.22 * Math.sin(2 * t + 1));
    };
    var top = [];
    var low = [];
    var x;
    for (x = 0; x <= w + 8; x += 8) top.push(x + ' ' + y(x).toFixed(1));
    for (x = w + 8; x >= 0; x -= 8) low.push(x + ' ' + (y(x) + band).toFixed(1));
    var creamBack = [];
    for (x = w + 8; x >= 0; x -= 8) creamBack.push(x + ' ' + (y(x) + 1).toFixed(1));
    host.innerHTML = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" focusable="false">' +
      '<defs><pattern id="edge-check" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">' +
      '<rect width="32" height="32" fill="#FFFFFF"/><rect width="16" height="16" fill="#C8262C"/><rect x="16" y="16" width="16" height="16" fill="#C8262C"/></pattern></defs>' +
      '<path fill="url(#edge-check)" d="M' + top.join('L') + 'L' + low.join('L') + 'Z"/>' +
      '<path fill="#F6E9D6" d="M0 0L' + (w + 8) + ' 0L' + creamBack.join('L') + 'Z"/></svg>';
    host.parentNode.style.setProperty('--edge-h', h + 'px');
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('900 100px "Smooch Sans"'),
      document.fonts.load('700 100px "Smooch Sans"'),
      document.fonts.load('400 16px "DM Sans"'),
    ]);
  }

  function imageReady(img) {
    if (!img || (img.complete && img.naturalWidth > 0)) return Promise.resolve();
    return new Promise(function (resolve) {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  function begin() {
    try {
      loader = document.getElementById('preloader');
      if (!loader) { leave(); return; }
      drawEdge(loader.querySelector('.preloader__edge'));
      var showText = function () { loader.classList.add('fonts-in'); };
      setTimeout(showText, 400);
      var fonts = fontsReady().then(showText, showText);
      var image = imageReady(document.querySelector('[data-hero-burger]'));
      Promise.all([fonts, image]).then(function () {
        setTimeout(leave, Math.max(0, MIN - (window.performance.now() - start)));
      }, leave);
    } catch (e) {
      leave();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin);
  else begin();
}());
