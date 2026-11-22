// input.js — mouse and keyboard controls.
//
// Click a card (or press 1–5) to pick it, Enter / Space / double-click to
// play it, Space / click to continue after a clash, R to restart, Esc to
// go back to the title screen. After a card is played the rival's card
// stays face-down for a beat, then flips and the clash lands.

import { playCard, continueRound, startGame, backToTitle } from './state.js';
import { sfx } from './audio.js';

function selectCard(g, index, render) {
  if (g.phase !== 'select') return;
  if (index < 0 || index >= g.player.hand.length) return;
  g.selected = g.selected === index ? -1 : index;
  sfx('click');
  render(g);
}

function playSelected(g, render) {
  if (g.phase !== 'select' || g.selected < 0) return;
  const ok = playCard(g, g.selected);
  if (!ok) {
    sfx('deny');
    render(g);
    return;
  }
  sfx('play');
  render(g);
  window.setTimeout(() => {
    g.reveal = true;
    const w = g.lastClash ? g.lastClash.winner : 'tie';
    sfx(w === 'player' ? 'clashWin' : w === 'ai' ? 'clashLose' : 'clashTie');
    if (g.phase === 'win') sfx('win');
    if (g.phase === 'loss') sfx('lose');
    render(g);
  }, 750);
}

function doContinue(g, render) {
  if (g.phase !== 'roundEnd' || g.reveal === false) return;
  if (continueRound(g)) {
    sfx('deal');
    render(g);
  }
}

function restart(g, render) {
  sfx('start');
  startGame(g);
  render(g);
}

export function attachControls(g, render) {
  const handEl = document.getElementById('hand');
  handEl.addEventListener('click', (e) => {
    const cardEl = e.target.closest('.card');
    if (!cardEl || cardEl.dataset.index == null) return;
    selectCard(g, Number(cardEl.dataset.index), render);
  });
  handEl.addEventListener('dblclick', (e) => {
    const cardEl = e.target.closest('.card');
    if (!cardEl || cardEl.dataset.index == null) return;
    g.selected = Number(cardEl.dataset.index);
    playSelected(g, render);
  });

  document.getElementById('play-btn').addEventListener('click', () => playSelected(g, render));
  document.getElementById('continue-btn').addEventListener('click', () => doContinue(g, render));
  document.getElementById('start-btn').addEventListener('click', () => restart(g, render));
  document.getElementById('again-btn').addEventListener('click', () => restart(g, render));

  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      selectCard(g, Number(e.key) - 1, render);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (g.phase === 'title') restart(g, render);
      else if (g.phase === 'select') playSelected(g, render);
      else if (g.phase === 'roundEnd') doContinue(g, render);
      else if (g.phase === 'win' || g.phase === 'loss') restart(g, render);
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (g.phase !== 'title') restart(g, render);
      return;
    }
    if (e.key === 'Escape' && g.phase !== 'title') {
      backToTitle(g);
      sfx('click');
      render(g);
    }
  });
}
