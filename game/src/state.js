// state.js — the Ember Duel state machine and turn rules.
//
// Phases: title → select → clash → roundEnd → select … → win | loss
// Each round both sides refill embers (3, growing to 6) and draw up to 5
// cards. The player plays one card; the Ash Wyrm answers with one of its
// own. The stronger card wins the clash and the loser loses life equal to
// the power gap, plus combo and BURN bonuses, minus GUARD.

import { buildDeck, elementAdvantage } from './cards.js';
import { mulberry32, shuffle } from './random.js';
import { chooseAiCard } from './ai.js';

export const MAX_LIFE = 30;
export const HAND_SIZE = 5;

export function maxEnergyForRound(round) {
  return Math.min(6, 3 + Math.floor((round - 1) / 2));
}

function freshSide(rng) {
  return {
    life: MAX_LIFE,
    energy: 0,
    maxEnergy: 3,
    hand: [],
    deck: buildDeck(rng),
    discard: [],
    bonusEnergy: 0,
    bonusDraw: 0,
  };
}

export function createGame(seed) {
  const rng = seed == null ? Math.random : mulberry32(seed);
  return {
    phase: 'title',
    round: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    selected: -1,
    player: freshSide(rng),
    ai: freshSide(rng),
    arena: { player: null, ai: null },
    lastClash: null,
    reveal: true,
    log: ['Welcome to the Ember Duel. Play a card to begin.'],
    rng,
    seed: seed ?? null,
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, clashesWon: 0 },
  };
}

function drawUpTo(side, count, rng) {
  while (side.hand.length < count) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) break;
      side.deck = shuffle(side.discard, rng);
      side.discard = [];
    }
    side.hand.push(side.deck.pop());
  }
}

export function startGame(g) {
  g.player = freshSide(g.rng);
  g.ai = freshSide(g.rng);
  g.round = 1;
  g.score = 0;
  g.combo = 0;
  g.bestCombo = 0;
  g.selected = -1;
  g.arena = { player: null, ai: null };
  g.lastClash = null;
  g.reveal = true;
  g.stats = { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, clashesWon: 0 };
  beginRound(g);
  g.log = [`Round 1 — the duel begins. ${g.player.maxEnergy} embers each.`];
}

export function beginRound(g) {
  g.phase = 'select';
  g.selected = -1;
  g.arena = { player: null, ai: null };
  for (const side of [g.player, g.ai]) {
    side.maxEnergy = maxEnergyForRound(g.round) + side.bonusEnergy;
    side.bonusEnergy = 0;
    side.energy = side.maxEnergy;
    const draw = HAND_SIZE + side.bonusDraw;
    side.bonusDraw = 0;
    drawUpTo(side, draw, g.rng);
  }
}

// The player commits a card from the hand. Returns false when the card
// cannot be played (wrong phase, or not enough embers).
export function playCard(g, index) {
  if (g.phase !== 'select') return false;
  const card = g.player.hand[index];
  if (!card || card.cost > g.player.energy) return false;
  g.player.energy -= card.cost;
  g.player.hand.splice(index, 1);
  g.selected = -1;
  g.stats.cardsPlayed += 1;

  // MEND heals the moment the card is played.
  if (card.effect === 'mend') {
    g.player.life = Math.min(MAX_LIFE, g.player.life + 2);
  }
  if (card.effect === 'surge') g.player.bonusEnergy += 1;
  if (card.effect === 'spark') g.player.bonusDraw += 1;

  const aiCard = chooseAiCard(g, card);
  const aiIndex = g.ai.hand.indexOf(aiCard);
  if (aiIndex >= 0) {
    // The rival may answer with a card it cannot fully pay for; its
    // embers never drop below zero.
    g.ai.energy = Math.max(0, g.ai.energy - aiCard.cost);
    g.ai.hand.splice(aiIndex, 1);
  }
  if (aiCard.effect === 'mend') {
    g.ai.life = Math.min(MAX_LIFE, g.ai.life + 2);
  }
  if (aiCard.effect === 'surge') g.ai.bonusEnergy += 1;
  if (aiCard.effect === 'spark') g.ai.bonusDraw += 1;

  g.arena = { player: card, ai: aiCard };
  g.reveal = false;
  g.phase = 'clash';
  resolveClash(g);
  return true;
}

function resolveClash(g) {
  const pc = g.arena.player;
  const ac = g.arena.ai;
  const pPower = pc.power + elementAdvantage(pc.element, ac.element);
  const aPower = ac.power + elementAdvantage(ac.element, pc.element);
  const pAdv = elementAdvantage(pc.element, ac.element) > 0;
  const aAdv = elementAdvantage(ac.element, pc.element) > 0;

  let result;
  if (pPower > aPower) {
    let dmg = pPower - aPower;
    if (pc.effect === 'burn') dmg += 2;
    g.combo += 1;
    g.bestCombo = Math.max(g.bestCombo, g.combo);
    if (g.combo > 1) dmg += Math.min(g.combo - 1, 3);
    if (ac.effect === 'guard' && pc.effect !== 'pierce') dmg = Math.max(1, dmg - 2);
    g.ai.life = Math.max(0, g.ai.life - dmg);
    g.stats.damageDealt += dmg;
    g.stats.clashesWon += 1;
    g.score += dmg + 10;
    result = {
      winner: 'player', damage: dmg, pPower, aPower, pAdv, aAdv,
      text: `YOU WIN THE CLASH! ${pc.name} ${pPower} vs ${aPower} — Ash Wyrm −${dmg} ♥`,
    };
  } else if (aPower > pPower) {
    let dmg = aPower - pPower;
    if (ac.effect === 'burn') dmg += 2;
    g.combo = 0;
    if (pc.effect === 'guard' && ac.effect !== 'pierce') dmg = Math.max(1, dmg - 2);
    g.player.life = Math.max(0, g.player.life - dmg);
    g.stats.damageTaken += dmg;
    result = {
      winner: 'ai', damage: dmg, pPower, aPower, pAdv, aAdv,
      text: `ASH WYRM WINS! ${ac.name} ${aPower} vs ${pPower} — you −${dmg} ♥`,
    };
  } else {
    g.combo = 0;
    result = {
      winner: 'tie', damage: 0, pPower, aPower, pAdv, aAdv,
      text: `DEAD HEAT — ${pPower} vs ${pPower}. No damage either way.`,
    };
  }
  g.lastClash = result;
  g.log = [result.text];
  g.phase = 'roundEnd';

  if (g.ai.life <= 0) {
    g.phase = 'win';
    g.score += 50 + g.round * 5;
    g.log = [`The Ash Wyrm falls! ${result.text}`];
  } else if (g.player.life <= 0) {
    g.phase = 'loss';
    g.log = [`The Ember Warden falls. ${result.text}`];
  }
}

// Sweep the arena cards to the discard piles and open the next round.
export function continueRound(g) {
  if (g.phase !== 'roundEnd' || g.reveal === false) return false;
  if (g.arena.player) g.player.discard.push(g.arena.player);
  if (g.arena.ai) g.ai.discard.push(g.arena.ai);
  g.round += 1;
  beginRound(g);
  g.log = [`Round ${g.round} — ${g.player.maxEnergy} embers. Your move, Warden.`];
  return true;
}

export function backToTitle(g) {
  g.phase = 'title';
  g.selected = -1;
  g.arena = { player: null, ai: null };
  g.lastClash = null;
}
