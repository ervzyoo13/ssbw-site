// Roadside scenery for the road trip (S-032, S-037), all drawn for this site in the same sticker style as the cart:
// thick near-black outlines, cream, maroon and gold, soft green for leaves only, and one turquoise, --sea, for water
// only. The parts that move are separate layers, so they animate on transform alone. Nothing here is a real place or
// a real person.

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

/* Siargao, as a vibe (S-037): nothing here is a real place. */

const SAND = '#F0DCA0';

const surfboard = `<svg viewBox="0 0 120 170" focusable="false">
  <g transform="rotate(6 60 90)">
    <path d="M60 6C80 30 84 90 76 150H44C36 90 40 30 60 6Z" fill="${CARD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 18V146" stroke="${MAROON}" stroke-width="10"/>
    <path d="M43 62C54 68 66 68 77 62" fill="none" stroke="${GOLD}" stroke-width="7"/>
  </g>
  <path d="M6 160C18 140 46 132 62 132C84 132 106 142 114 160C90 169 32 169 6 160Z" fill="${SAND}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
</svg>`;

const wheel = (x) => `<circle cx="${x}" cy="118" r="25" fill="${INK}"/><circle cx="${x}" cy="118" r="10" fill="${GOLD}"/>`;

// A habal-habal: a motorbike with a long seat, with a surfboard held along its side on a rack, as they are on the island.
const habal = `<svg viewBox="0 0 240 150" focusable="false">
  ${shadow(120, 142, 112)}
  ${wheel(54)}${wheel(190)}
  <path d="M190 118L170 48" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M152 40L182 34" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="186" cy="56" r="9" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
  <path d="M96 62C108 44 146 42 172 52L164 84H100Z" fill="${MAROON}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M26 50H112C120 50 120 64 110 64H36C22 64 18 54 26 50Z" fill="${INK}"/>
  <path d="M60 64V80M136 62V80" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M6 94C40 74 136 68 216 76C160 98 52 108 6 94Z" fill="${CARD}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M30 92C80 84 140 80 192 79" fill="none" stroke="${MAROON}" stroke-width="5" stroke-linecap="round"/>
</svg>`;

// A coconut palm in two layers, so only its crown moves.
const coco = `<div class="coco">
  <svg viewBox="0 0 120 200" focusable="false">
    <ellipse cx="62" cy="194" rx="34" ry="5" fill="${INK}" opacity=".14"/>
    <path d="M50 194C52 140 58 90 72 44L84 48C72 92 68 140 70 194Z" fill="${GOLD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M54 160L70 162M58 124L75 128M64 90L80 95" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="72" cy="54" r="6" fill="${MAROON}" stroke="${INK}" stroke-width="3"/>
    <circle cx="86" cy="54" r="6" fill="${MAROON}" stroke="${INK}" stroke-width="3"/>
  </svg>
  <svg class="scene__leaves" viewBox="0 0 120 200" focusable="false">
    <g fill="${LEAF}" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M78 44C60 16 30 14 6 32C30 28 58 34 78 44Z"/>
      <path d="M78 44C62 52 34 60 22 86C42 72 66 62 78 44Z"/>
      <path d="M78 44C90 16 106 12 118 26C104 26 92 32 78 44Z"/>
      <path d="M78 44C94 54 110 66 114 88C102 72 90 60 78 44Z"/>
      <path d="M78 44C76 22 84 8 98 2C90 18 86 30 78 44Z"/>
    </g>
  </svg>
</div>`;

const palms = `<div class="palms">${coco}${coco}${coco}</div>`;

// A small nipa hut on stilts, the kind found all over the islands
const kubo = `<svg viewBox="0 0 200 172" focusable="false">
  ${shadow(100, 166, 84)}
  <path d="M50 164V108M100 164V108M150 164V108" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <rect x="44" y="66" width="112" height="44" fill="${CARD}" stroke="${INK}" stroke-width="4"/>
  <path d="M66 68V108M134 68V108" fill="none" stroke="${INK}" stroke-width="3"/>
  <rect x="86" y="76" width="28" height="34" fill="${MAROON}" stroke="${INK}" stroke-width="4"/>
  <path d="M34 110H166" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M18 72L100 8L182 72C150 80 50 80 18 72Z" fill="${GOLD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M62 40L46 72M100 22V76M138 40L154 72" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
</svg>`;

/* The horizon: one band across the whole section, built from small parts so it never stretches. Sea and waves repeat
   at their real size, and each row slides by exactly one repeat, so the loop has no seam at any width. */

const islandPalm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-8 52C-8 32 -2 14 8 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <path d="M-8 52C-8 32 -2 14 8 0" fill="none" stroke="${GOLD}" stroke-width="4.5" stroke-linecap="round"/>
  <g fill="${LEAF}" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
    <path d="M8 0C-8 -18 -30 -18 -46 -4C-28 -6 -8 -4 8 0Z"/>
    <path d="M8 0C24 -20 48 -18 62 -2C44 -6 24 -4 8 0Z"/>
    <path d="M8 0C-4 4 -20 16 -28 34C-14 22 0 12 8 0Z"/>
    <path d="M8 0C20 6 36 18 42 36C30 24 16 12 8 0Z"/>
  </g>
</g>`;

const island = (name, viewW, sand, trees) => `<svg class="hz__island hz__island--${name}" viewBox="0 0 ${viewW} 110" focusable="false">
  ${trees}
  <path d="${sand}" fill="${CARD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
</svg>`;

const gull = (name) => `<svg class="hz__gull hz__gull--${name}" viewBox="0 0 40 16" focusable="false"><path d="M2 12Q11 1 20 10Q29 1 38 12" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`;

// Waves as repeating patterns. Their colours come from the stylesheet, so --sea stays in one place.
const horizon = `
  <svg class="hz__sun" viewBox="0 0 120 120" focusable="false">
    <path d="M60 4V16M60 104V116M4 60H16M104 60H116M20 20L29 29M91 91L100 100M100 20L91 29M29 91L20 100" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="32" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>
  </svg>
  <div class="hz__cloud hz__cloud--a">${cloud}</div>
  <div class="hz__cloud hz__cloud--b">${cloud}</div>
  ${gull('a')}${gull('b')}${gull('c')}
  ${island('a', 200, 'M4 112C30 86 60 76 100 76C140 76 172 88 196 112Z', islandPalm(82, 34, 0.8) + islandPalm(128, 44, 0.62))}
  ${island('b', 140, 'M4 112C24 92 50 84 70 84C94 84 118 94 136 112Z', islandPalm(66, 46, 0.66))}
  ${island('c', 180, 'M4 112C30 90 58 80 88 80C122 80 152 90 176 112Z', islandPalm(64, 42, 0.7) + islandPalm(112, 50, 0.54))}
  <div class="hz__sea"></div>
  <svg class="hz__crests hz__crests--a" focusable="false"><defs><pattern id="hz-crest-a" width="96" height="12" patternUnits="userSpaceOnUse"><path d="M10 8Q20 1 30 8T50 8" class="hz__crest"/></pattern></defs><rect width="100%" height="100%" fill="url(#hz-crest-a)"/></svg>
  <svg class="hz__crests hz__crests--b" focusable="false"><defs><pattern id="hz-crest-b" width="132" height="12" patternUnits="userSpaceOnUse"><path d="M60 8Q70 1 80 8T100 8" class="hz__crest"/></pattern></defs><rect width="100%" height="100%" fill="url(#hz-crest-b)"/></svg>
  <svg class="hz__boat" viewBox="0 0 160 72" focusable="false">
    <path d="M56 40C52 50 50 56 46 62M104 40C108 50 110 56 114 62" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M12 62H148" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M14 62H146" stroke="${CARD}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M58 30V12M104 30V12" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M48 12H114L106 4H56Z" fill="${GOLD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M20 30H130L152 18C148 38 120 52 76 52C44 52 26 44 20 30Z" fill="${MAROON}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M32 38H124" stroke="${CREAM}" stroke-width="3.5" stroke-linecap="round"/>
  </svg>
  <svg class="hz__shore" focusable="false"><defs><pattern id="hz-shore" width="240" height="18" patternUnits="userSpaceOnUse">
    <path class="hz__shore-fill" d="M0 8C24 2 44 2 66 8S96 15 120 9S170 3 196 8S226 13 240 8V0H0Z"/>
    <path class="hz__shore-line" d="M0 8C24 2 44 2 66 8S96 15 120 9S170 3 196 8S226 13 240 8"/>
  </pattern></defs><rect width="100%" height="100%" fill="url(#hz-shore)"/></svg>`;

export const scenery = { party, queue, palm, cloud, surfboard, habal, palms, kubo, horizon };
