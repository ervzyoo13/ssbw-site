// Wave dividers. Each wave is its own shape, drawn as one long path at real pixel size, so it never
// stretches on an ultrawide and has no tile seams. Every shape repeats exactly, so drifting never shows an end.

const TAU = Math.PI * 2;

// f(t) returns -1 to 1 across one period. The harmonics are whole numbers, which keeps each shape seamless.
const SHAPES = {
  ribbon: { h: [64, 112], period: 0.7, f: (t) => 0.78 * Math.sin(t) + 0.22 * Math.sin(2 * t + 1) },
  swell: { h: [64, 144], period: 1.1, f: (t) => Math.sin(t) },
  chop: { h: [48, 96], period: 0.55, f: (t) => 0.62 * Math.sin(2 * t) + 0.38 * Math.sin(3 * t + 0.8) },
  bun: { h: [48, 96], period: 0.34, f: (t) => 1 - 2 * Math.abs(Math.sin(t / 2)) },
};

const mix = (a, b, v) => a + (b - a) * Math.min(1, Math.max(0, v));
const n1 = (v) => Number(v.toFixed(1));

function build(el) {
  const shape = SHAPES[el.dataset.wave];
  const vw = document.documentElement.clientWidth;
  const size = Math.min(1, Math.max(0, (vw - 390) / (1920 - 390)));
  const height = Math.round(mix(shape.h[0], shape.h[1], size));
  const period = Math.max(320, Math.round(Math.max(vw, 640) * shape.period));
  const width = vw + period * 2;
  const step = 8;
  const ribbon = el.dataset.wave === 'ribbon';
  const band = ribbon ? Math.round(height * 0.5) : 0;
  const amp = (height - band) / 2 - 1;
  const mid = amp + 1;
  const y = (x) => mid + amp * shape.f((x / period) * TAU);

  const top = [];
  for (let x = 0; x <= width + step; x += step) top.push(`${x} ${n1(y(x))}`);
  let d = `M${top.join('L')}`;
  if (ribbon) {
    const bottom = [];
    for (let x = width + step; x >= 0; x -= step) bottom.push(`${x} ${n1(y(x) + band)}`);
    d += `L${bottom.join('L')}Z`;
  } else {
    d += `V${height + 2}H0Z`;
  }

  const fill = ribbon ? 'url(#wave-check)' : 'currentColor';
  const defs = ribbon
    ? '<defs><pattern id="wave-check" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="32" height="32" fill="#FFFFFF"/><rect width="16" height="16" fill="#C8262C"/><rect x="16" y="16" width="16" height="16" fill="#C8262C"/></pattern></defs>'
    : '';

  el.style.setProperty('--wave-h', `${height}px`);
  el.dataset.drift = String(Math.round(period * 0.25));
  // Where a wave's cream is the shape itself, the shape carries the paper grain too, so the cream below it stays one sheet.
  const paper = el.classList.contains('wave--to-cream')
    ? `<defs><pattern id="wave-paper" width="384" height="384" patternUnits="userSpaceOnUse"><image href="assets/paper-grain.webp" width="384" height="384"/></pattern></defs><path class="wave__paper" d="${d}" fill="url(#wave-paper)"/>`
    : '';
  el.innerHTML = `<svg class="wave__svg" width="${width}" height="${height + 2}" viewBox="0 0 ${width} ${height + 2}" style="left:${-period}px" aria-hidden="true" focusable="false">${defs}<path d="${d}" fill="${fill}"/>${paper}</svg>`;
}

export function initWaves() {
  const waves = [...document.querySelectorAll('[data-wave]')];
  waves.forEach(build);
  let lastWidth = document.documentElement.clientWidth;
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const w = document.documentElement.clientWidth;
      if (w === lastWidth) return;
      lastWidth = w;
      waves.forEach(build);
      window.dispatchEvent(new CustomEvent('waves:rebuilt'));
    }, 160);
  });
}
