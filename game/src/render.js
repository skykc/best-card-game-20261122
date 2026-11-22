// render.js — turns the duel state into the table you see.
//
// Every dynamic bit of the page is rebuilt here: the life totals, the ember
// pips, the rival's face-down hand, the arena cards, the clash banner, the
// player's hand, the buttons and the title / end overlays.

import { ELEMENTS, EFFECTS, elementAdvantage } from './cards.js';

export function cardElement(card, extraClass) {
  const el = document.createElement('div');
  el.className = `card el-${card.element}${extraClass ? ' ' + extraClass : ''}`;
  const eff = EFFECTS[card.effect];
  const cost = '◆'.repeat(card.cost);
  el.innerHTML =
    `<div class="card-cost">${cost} ${card.cost}</div>` +
    `<div class="card-glyph">${ELEMENTS[card.element].glyph}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-power">${card.power}</div>` +
    `<div class="card-effect"><b>${eff.label}</b>${eff.text}</div>`;
  return el;
}

function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card card-back';
  el.textContent = '🔥';
  return el;
}

function miniBackElement() {
  const el = document.createElement('div');
  el.className = 'mini-card';
  el.textContent = '🔥';
  return el;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderEnergy(g) {
  const box = document.getElementById('energy-pips');
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < g.player.maxEnergy; i++) {
    const pip = document.createElement('span');
    pip.textContent = i < g.player.energy ? '●' : '○';
    if (i >= g.player.energy) pip.className = 'spent';
    box.appendChild(pip);
  }
}

function renderHand(g) {
  const hand = document.getElementById('hand');
  hand.innerHTML = '';
  g.player.hand.forEach((card, i) => {
    const el = cardElement(card);
    el.dataset.index = String(i);
    if (i === g.selected) el.classList.add('selected');
    if (card.cost > g.player.energy) el.classList.add('unaffordable');
    hand.appendChild(el);
  });
}

function renderArena(g) {
  const playerSlot = document.getElementById('arena-player');
  const aiSlot = document.getElementById('arena-ai');
  playerSlot.innerHTML = '';
  aiSlot.innerHTML = '';
  if (g.arena.player) {
    playerSlot.appendChild(cardElement(g.arena.player, 'played'));
  } else {
    playerSlot.innerHTML = '<div class="slot-hint">YOUR CARD</div>';
  }
  if (g.arena.ai) {
    if (g.reveal === false) {
      aiSlot.appendChild(cardBackElement());
    } else {
      aiSlot.appendChild(cardElement(g.arena.ai, 'flipping'));
    }
  } else {
    aiSlot.innerHTML = '<div class="slot-hint">RIVAL CARD</div>';
  }
}

function renderBanner(g) {
  const banner = document.getElementById('clash-banner');
  const show = g.lastClash && g.reveal !== false &&
    (g.phase === 'roundEnd' || g.phase === 'win' || g.phase === 'loss');
  if (!show) {
    banner.className = 'hidden';
    banner.textContent = '';
    return;
  }
  banner.className = g.lastClash.winner === 'player'
    ? 'win'
    : g.lastClash.winner === 'ai' ? 'lose' : 'tie';
  banner.textContent = g.lastClash.text;
}

function renderOverlays(g) {
  const title = document.getElementById('title-screen');
  const end = document.getElementById('end-screen');
  title.classList.toggle('hidden', g.phase !== 'title');
  const over = g.phase === 'win' || g.phase === 'loss';
  end.classList.toggle('hidden', !over);
  if (over) {
    const won = g.phase === 'win';
    const h = document.getElementById('end-title');
    h.textContent = won ? '🏆 VICTORY!' : '💀 DEFEAT';
    h.classList.toggle('lost', !won);
    setText('end-sub', won
      ? 'The Ash Wyrm falls. The table is yours, Ember Warden.'
      : 'The Ash Wyrm keeps the table. Shuffle up and try again.');
    const s = g.stats;
    document.getElementById('end-stats').innerHTML =
      `<div><b>${g.round}</b>ROUNDS</div>` +
      `<div><b>${s.damageDealt}</b>DAMAGE DEALT</div>` +
      `<div><b>${s.clashesWon}</b>CLASHES WON</div>` +
      `<div><b>${g.bestCombo}×</b>BEST COMBO</div>` +
      `<div><b>${g.score}</b>SCORE</div>`;
  }
}

// Clash preview: with a card picked, show its effective power against
// every element, so the counterplay is readable before committing.
function renderPreview(g) {
  const line = document.getElementById('preview-line');
  if (!line) return;
  const card = g.phase === 'select' && g.selected >= 0 ? g.player.hand[g.selected] : null;
  if (!card) {
    line.textContent = '';
    return;
  }
  const parts = Object.keys(ELEMENTS).map((el) => {
    const power = card.power + elementAdvantage(card.element, el);
    return `${ELEMENTS[el].glyph} ${power}`;
  });
  line.textContent = `${card.name} strikes for ${parts.join(' · ')} — play it against the element it beats.`;
}

export function renderAll(g) {
  setText('round-label', `ROUND ${Math.max(g.round, 1)}`);
  setText('score-label', `SCORE ${g.score}`);
  const combo = document.getElementById('combo-label');
  combo.textContent = `COMBO ×${g.combo}`;
  combo.classList.toggle('hot', g.combo >= 2);
  setText('ai-life', String(g.ai.life));
  setText('player-life', String(g.player.life));
  renderEnergy(g);

  const aiHand = document.getElementById('ai-hand');
  aiHand.innerHTML = '';
  for (let i = 0; i < g.ai.hand.length; i++) aiHand.appendChild(miniBackElement());

  renderArena(g);
  renderBanner(g);
  setText('log-line', g.log[0] || '');
  renderPreview(g);
  renderHand(g);

  const playBtn = document.getElementById('play-btn');
  const canPlay = g.phase === 'select' && g.selected >= 0 &&
    g.player.hand[g.selected] && g.player.hand[g.selected].cost <= g.player.energy;
  playBtn.disabled = !canPlay;
  const contBtn = document.getElementById('continue-btn');
  contBtn.classList.toggle('hidden', !(g.phase === 'roundEnd' && g.reveal !== false));

  renderOverlays(g);
}
