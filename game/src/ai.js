// ai.js — the Ash Wyrm's card choice.
//
// The rival reads the card you just played and counters it. It wins cheap
// when it can (smallest card that still wins the clash), saves its big
// cards when it cannot win, and sometimes — one pick in six — plays wild
// so its hand stays unreadable. That is the counterplay: bait out its
// strong cards with a cheap one, then punish it with your best.

import { elementAdvantage } from './cards.js';

export function clashPower(card, foeCard) {
  return card.power + elementAdvantage(card.element, foeCard.element);
}

export function chooseAiCard(g, playerCard) {
  const hand = g.ai.hand;
  const affordable = hand.filter((c) => c.cost <= g.ai.energy);
  const pool = affordable.length > 0 ? affordable : hand.slice();

  // One pick in six: play wild, so the rival is never fully predictable.
  if (g.rng() < 1 / 6) {
    return pool[Math.floor(g.rng() * pool.length)];
  }

  const scored = pool.map((card) => ({
    card,
    power: clashPower(card, playerCard),
    // What the player's card scores against this one.
    foePower: playerCard.power + elementAdvantage(playerCard.element, card.element),
  }));

  // Smallest card that wins the clash.
  const winners = scored
    .filter((s) => s.power > s.foePower)
    .sort((a, b) => a.power - b.power || a.card.cost - b.card.cost);
  if (winners.length > 0) return winners[0].card;

  // Cannot win: spend the weakest card and keep the big ones for later.
  const weakest = scored.slice().sort((a, b) => a.power - b.power || a.card.cost - b.card.cost);
  return weakest[0].card;
}
