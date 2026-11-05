// Roadside scenery for the road trip (S-032), all drawn for this site in the same sticker style as the cart:
// thick near-black outlines, cream, maroon and gold, with soft green for leaves only. The parts that move are
// separate layers, so they animate on transform alone. Nothing here is a real place or a real person.

const INK = '#150903';
const CARD = '#FBF4E9';
const CREAM = '#F6E9D6';
const MAROON = '#8C2421';
const GOLD = '#D7B151';
const LEAF = '#7FA63C';

const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="7" fill="${INK}" opacity=".14"/>`;

const flag = (x, y, fill) => `<path d="M${x - 10} ${y}H${x + 10}L${x} ${y + 20}Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;

const miniBurger = (x, y) => `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
  <path d="M${x - 12} ${y}C${x - 12} ${y - 15} ${x + 12} ${y - 15} ${x + 12} ${y}Z" fill="${GOLD}"/>
  <rect x="${x - 12}" y="${y}" width="24" height="5" rx="2.5" fill="${MAROON}"/>
</g>`;

const party = `<svg viewBox="0 0 200 150" focusable="false">
  ${shadow(100, 142, 92)}
  <path d="M16 140V22M166 140V14" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M16 22Q92 58 166 14" fill="none" stroke="${INK}" stroke-width="3"/>
  ${flag(34, 29, MAROON)}${flag(61, 36, GOLD)}${flag(92, 38, CARD)}${flag(121, 33, MAROON)}${flag(148, 23, GOLD)}
  <path d="M184 52Q178 88 152 94" fill="none" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="184" cy="36" rx="12" ry="15" fill="${MAROON}" stroke="${INK}" stroke-width="4"/>
  <path d="M179 30Q181 26 185 26" fill="none" stroke="${CREAM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M52 124V140M136 124V140" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 98V116A9 9 0 0 0 58 116A9 9 0 0 0 76 116A9 9 0 0 0 94 116A9 9 0 0 0 112 116A9 9 0 0 0 130 116A9 9 0 0 0 148 116V98Z" fill="${MAROON}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="34" y="90" width="120" height="10" rx="4" fill="${CARD}" stroke="${INK}" stroke-width="4"/>
  ${miniBurger(62, 83)}${miniBurger(94, 83)}${miniBurger(126, 83)}
</svg>`;

// Plain people in a line: a round head and a body, with no faces.
const person = (x, top, body, head) => `<g stroke="${INK}" stroke-linejoin="round">
  <path d="M${x - 7} ${top + 74}V112M${x + 7} ${top + 74}V112" fill="none" stroke-width="6" stroke-linecap="round"/>
  <rect x="${x - 16}" y="${top + 26}" width="32" height="${88 - top - 26}" rx="14" fill="${body}" stroke-width="4"/>
  <circle cx="${x}" cy="${top + 13}" r="13" fill="${head}" stroke-width="4"/>
</g>`;

const queue = `<svg viewBox="0 0 220 124" focusable="false">
  ${shadow(110, 116, 100)}
  ${person(44, 12, MAROON, CARD)}
  ${person(110, 2, GOLD, CARD)}
  ${person(176, 16, INK, CARD)}
  <path d="M164 24C164 14 188 14 188 24Z" fill="${MAROON}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const palm = `<div class="scene__stack">
  <svg viewBox="0 0 200 180" focusable="false">
    ${shadow(100, 172, 92)}
    <path d="M160 172V50" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M160 52C160 34 140 34 136 44" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="134" cy="54" r="10" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
    <path d="M148 172H172" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M58 172C64 130 70 96 88 60L100 64C86 100 80 134 80 172Z" fill="${GOLD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M65 142L81 144M69 118L86 122M76 94L92 99" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="88" cy="70" r="6" fill="${MAROON}" stroke="${INK}" stroke-width="3"/>
    <circle cx="102" cy="70" r="6" fill="${MAROON}" stroke="${INK}" stroke-width="3"/>
  </svg>
  <svg class="scene__leaves" viewBox="0 0 200 180" focusable="false">
    <g fill="${LEAF}" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M94 60C70 30 40 30 18 48C40 46 70 50 94 60Z"/>
      <path d="M94 60C80 70 50 80 34 104C56 92 80 80 94 60Z"/>
      <path d="M94 60C120 28 150 28 170 44C148 44 120 48 94 60Z"/>
      <path d="M94 60C114 72 136 84 146 106C130 92 108 80 94 60Z"/>
      <path d="M94 60C92 34 100 14 118 6C110 26 104 44 94 60Z"/>
    </g>
  </svg>
</div>`;

const cloud = `<svg viewBox="0 0 160 84" focusable="false">
  <path d="M36 74C16 74 6 58 14 44C8 30 24 14 42 24C48 6 78 4 88 22C100 12 124 16 128 34C146 32 158 52 148 64C144 72 136 74 128 74Z" fill="${CARD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

// A row of waves slides by half its width, which is a whole number of waves, so the loop has no seam.
const waveRow = (fill, offset) => `<svg class="scene__wave scene__wave--${offset ? 'front' : 'back'}" viewBox="0 0 1200 40" focusable="false">
  <path d="M${offset - 40} 18${'a20 13 0 0 1 40 0'.repeat(32)}V60H${offset - 40}Z" fill="${fill}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
</svg>`;

const sea = `<svg class="scene__island" viewBox="0 0 120 60" focusable="false">
    <path d="M6 58C20 38 34 30 50 32C70 18 96 32 114 58Z" fill="${INK}"/>
    <path d="M62 30C62 22 64 16 68 10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M68 10C60 4 52 6 48 12M68 10C76 4 84 6 88 12M68 10C62 12 58 18 58 24M68 10C74 12 78 18 78 24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  </svg>
  ${waveRow(GOLD, 0)}${waveRow(CARD, 20)}`;

export const scenery = { party, queue, palm, cloud, sea };
