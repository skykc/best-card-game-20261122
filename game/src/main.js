// main.js — bootstrap for Ember Duel.
//
// Reads ?shot= for the screenshot staging (shots.js), renders the first
// frame, wires mouse + keyboard controls, and signals the screenshot
// harness with window.__shotReady. The game itself needs no network: every
// file it loads lives under game/.

import { createGame } from './state.js';
import { renderAll } from './render.js';
import { attachControls } from './input.js';
import { gameForShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const game = shot ? gameForShot(shot) : createGame(null);

renderAll(game);
attachControls(game, renderAll);

// The screenshot harness waits for this flag before it shoots. In shot
// mode the arena cards must already sit in their final state: the flip
// entrance starts at rotateY(90deg) — a narrow strip — and the slam
// starts offset and semi-transparent, so a shot on the first frame
// catches both mid-animation. Kill both animations and give the frame
// 600ms to settle before signalling readiness.
if (shot) {
  const noAnim = document.createElement('style');
  noAnim.textContent = '.card.flipping, .card.played { animation: none !important; }';
  document.head.appendChild(noAnim);
  setTimeout(() => { window.__shotReady = true; }, 600);
} else {
  window.__shotReady = true;
}
window.__emberDuel = game;
