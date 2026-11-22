// cards.js — the Ember Duel card pool.
//
// Four elements in a cycle: Flame beats Gale, Gale beats Stone, Stone beats
// Frost, Frost beats Flame. A card that holds the advantage gains +2 power
// in the clash. Every card also carries one keyword:
//   BURN   +2 damage when its owner wins the clash
//   GUARD  its owner takes 2 less damage when losing the clash
//   SURGE  +1 ember next round
//   MEND   heal 2 life when the card is played
//   SPARK  draw an extra card next round
//   PIERCE the clash damage ignores the enemy's GUARD

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '🔥', beats: 'gale' },
  frost: { name: 'Frost', glyph: '❄️', beats: 'flame' },
  gale: { name: 'Gale', glyph: '🌪️', beats: 'stone' },
  stone: { name: 'Stone', glyph: '🪨', beats: 'frost' },
};

export const EFFECTS = {
  burn: { label: 'BURN', text: '+2 damage when you win the clash' },
  guard: { label: 'GUARD', text: 'Take 2 less damage when you lose' },
  surge: { label: 'SURGE', text: '+1 ember next round' },
  mend: { label: 'MEND', text: 'Heal 2 life when played' },
  spark: { label: 'SPARK', text: 'Draw an extra card next round' },
  pierce: { label: 'PIERCE', text: 'Ignores the enemy Guard' },
};

// 24 original ember creatures. Cost is roughly power / 3, so every round
// (3–6 embers) is a real choice between one big card or a cheaper play.
export const CARD_POOL = [
  // Flame
  { name: 'Cinder Imp', element: 'flame', power: 3, cost: 1, effect: 'burn' },
  { name: 'Spark Sprite', element: 'flame', power: 2, cost: 1, effect: 'surge' },
  { name: 'Ember Fox', element: 'flame', power: 4, cost: 1, effect: 'spark' },
  { name: 'Flame Drake', element: 'flame', power: 6, cost: 2, effect: 'burn' },
  { name: 'Pyre Knight', element: 'flame', power: 7, cost: 2, effect: 'pierce' },
  { name: 'Inferno Wyrm', element: 'flame', power: 9, cost: 3, effect: 'burn' },
  // Frost
  { name: 'Shiver Mouse', element: 'frost', power: 2, cost: 1, effect: 'mend' },
  { name: 'Snow Owl', element: 'frost', power: 3, cost: 1, effect: 'spark' },
  { name: 'Frost Wolf', element: 'frost', power: 5, cost: 2, effect: 'guard' },
  { name: 'Glacier Serpent', element: 'frost', power: 6, cost: 2, effect: 'pierce' },
  { name: 'Ice Duchess', element: 'frost', power: 7, cost: 2, effect: 'mend' },
  { name: 'Blizzard Titan', element: 'frost', power: 9, cost: 3, effect: 'guard' },
  // Gale
  { name: 'Breeze Pup', element: 'gale', power: 2, cost: 1, effect: 'spark' },
  { name: 'Zephyr Kite', element: 'gale', power: 3, cost: 1, effect: 'surge' },
  { name: 'Gale Hawk', element: 'gale', power: 5, cost: 2, effect: 'pierce' },
  { name: 'Storm Fox', element: 'gale', power: 6, cost: 2, effect: 'burn' },
  { name: 'Whirlwind Djinn', element: 'gale', power: 7, cost: 2, effect: 'spark' },
  { name: 'Tempest Roc', element: 'gale', power: 8, cost: 3, effect: 'surge' },
  // Stone
  { name: 'Dust Mole', element: 'stone', power: 3, cost: 1, effect: 'surge' },
  { name: 'Pebble Sprite', element: 'stone', power: 2, cost: 1, effect: 'guard' },
  { name: 'Stone Golem', element: 'stone', power: 5, cost: 2, effect: 'guard' },
  { name: 'Mountain Bear', element: 'stone', power: 6, cost: 2, effect: 'mend' },
  { name: 'Granite Ox', element: 'stone', power: 7, cost: 2, effect: 'pierce' },
  { name: 'Avalanche King', element: 'stone', power: 9, cost: 3, effect: 'guard' },
];

// +2 power when the attacker's element beats the defender's.
export function elementAdvantage(attackerElement, defenderElement) {
  return ELEMENTS[attackerElement].beats === defenderElement ? 2 : 0;
}

// A fresh shuffled deck: one copy of every card in the pool.
export function buildDeck(rng) {
  const deck = CARD_POOL.map((c) => ({ ...c, uid: Math.floor(rng() * 1e9) }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
