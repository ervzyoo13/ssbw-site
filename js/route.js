// The dashed pop-up route. It leaves each card from the side facing the next stop, swings through the
// open space, then runs behind the next card, so it visibly winds down the section at every width.
// A lookup table lets the little burger follow it on scroll using transform only.

let table = [];
export const routeTable = () => table;

export function initRoute() {
  const map = document.getElementById('route-map');
  const svg = map.querySelector('.route__path');
  const path = svg.querySelector('path');

  function draw() {
    const box = map.getBoundingClientRect();
    if (!box.width) return;
    const cards = [...map.querySelectorAll('.stop')].map((el) => {
      const r = el.getBoundingClientRect();
      const left = r.left - box.left;
      const right = r.right - box.left;
      const top = r.top - box.top;
      const bottom = r.bottom - box.top;
      return { left, right, top, bottom, cx: (left + right) / 2, cy: (top + bottom) / 2 };
    });
    if (!cards.length) return;

    const n = (v) => v.toFixed(1);
    const first = cards[0];
    const last = cards[cards.length - 1];
    const startX = Math.min(first.right + (box.width - first.right) / 2, box.width - 8);
    let d = `M${n(startX)} 0C${n(startX)} ${n(first.top * 0.6)} ${n(first.cx)} ${n(first.top - 24)} ${n(first.cx)} ${n(first.top + 8)}`;

    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i];
      const b = cards[i + 1];
      const dir = b.cx > a.cx ? 1 : -1;
      const exitX = dir > 0 ? a.right - 8 : a.left + 8;
      const room = dir > 0 ? box.width - a.right : a.left;
      const c1x = exitX + dir * (room + 32);
      const lift = Math.max(32, (b.top - a.cy) * 0.5);
      d += `L${n(exitX)} ${n(a.cy)}`;
      d += `C${n(c1x)} ${n(a.cy + lift * 0.4)} ${n(b.cx + dir * 24)} ${n(b.top - lift)} ${n(b.cx)} ${n(b.top + 8)}`;
    }

    const dirEnd = last.cx > box.width / 2 ? -1 : 1;
    const exitEnd = dirEnd > 0 ? last.right - 8 : last.left + 8;
    const roomEnd = dirEnd > 0 ? box.width - last.right : last.left;
    d += `L${n(exitEnd)} ${n(last.cy)}C${n(exitEnd + dirEnd * (roomEnd + 16))} ${n(last.cy + 24)} ${n(box.width / 2)} ${n(box.height - 32)} ${n(box.width / 2)} ${n(box.height)}`;

    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    path.setAttribute('d', d);

    const len = path.getTotalLength();
    const steps = 320;
    table = [];
    for (let i = 0; i <= steps; i++) {
      const p = path.getPointAtLength((len * i) / steps);
      table.push([p.x, p.y]);
    }
    window.dispatchEvent(new CustomEvent('route:drawn'));
  }

  draw();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(map);
}
