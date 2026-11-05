// Starts the page: load the data, render, wire up the shop, then start motion once the fonts are in.

import { renderAll } from './render.js';
import { createCart } from './cart.js';
import { initShop } from './shop.js';
import { initWaves } from './waves.js';
import { initRoute } from './route.js';
import { initMotion } from './motion.js';
import { scroller } from './scroller.js';
import { guardPieces } from './pieces.js';

// A deliberate #link in the address goes to its section once the intro has played, unless the visitor has
// already started scrolling themselves. index.html took the hash out of the address before the page loaded.
function followHash() {
  const target = window.ssbwHash && document.getElementById(window.ssbwHash.slice(1));
  if (target && window.scrollY < 40) scroller.to(target);
}

async function boot() {
  let data;
  try {
    const res = await fetch('data/site.json');
    if (!res.ok) throw new Error(`data/site.json returned ${res.status}`);
    data = await res.json();
  } catch (err) {
    document.documentElement.classList.remove('js-wait');
    document.getElementById('menu-grid').innerHTML = '<li>The menu could not load. Refresh the page to try again.</li>';
    console.error(err);
    return;
  }

  renderAll(data);
  const cart = createCart(data);
  initShop(data, cart);
  initWaves();
  initRoute();

  // Wait for the display font so lines split where they really wrap, but never hold the page up for long.
  await Promise.race([
    Promise.all([document.fonts.load('900 100px "Smooch Sans"'), document.fonts.load('700 100px "Smooch Sans"')]),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
  guardPieces();
  initMotion().then(followHash);
}

boot();
