// shots.js — deterministic staging for the maker's screenshots.
//
// Open game/index.html?shot=play (or win / loss) and the table is set up
// exactly as the screenshot needs it, from a fixed seed, so the same
// render comes back on every load. ?shot=title (or no parameter) shows
// the title screen. The harness waits for window.__shotReady, set by
// main.js once the first frame is rendered.

import { createGame, startGame, playCard } from './state.js';

export function gameForShot(shot) {
  if (shot === 'play') {
    // A mid-duel clash in round 3: both hands dealt, a real card played,
    // combo ×2 live, life totals 24 vs 19, score 42.
    const g = createGame(7);
    startGame(g);
    g.round = 3;
    g.score = 42;
    g.combo = 2;
    g.bestCombo = 2;
    g.player.life = 24;
    g.ai.life = 19;
    const idx = g.player.hand.findIndex((c) => c.cost <= g.player.energy);
    if (idx >= 0) playCard(g, idx);
    g.reveal = true;
    // playCard resolves the clash at once: the Ash Wyrm's win resets the
    // streak to 0, the rival's MEND heals it +2, and the clash text lands
    // in the log too. The staged shot is the Warden riding a ×2 streak
    // into round 3 at 24 vs 19 life, so set the display numbers after the
    // clash and give the log its own next-step line, not the banner's text.
    g.combo = 2;
    g.bestCombo = 2;
    g.player.life = 24;
    g.ai.life = 19;
    g.log = ['Round 4 next — embers refill. Pick your next card, Warden.'];
    return g;
  }
  if (shot === 'win') {
    const g = createGame(7);
    startGame(g);
    g.ai.life = 0;
    g.phase = 'win';
    g.round = 6;
    g.score = 148;
    g.bestCombo = 3;
    g.stats = { damageDealt: 31, damageTaken: 12, cardsPlayed: 9, clashesWon: 5 };
    g.lastClash = {
      winner: 'player', damage: 6, pPower: 9, aPower: 3,
      text: 'YOU WIN THE CLASH! Inferno Wyrm 9 vs 3 — Ash Wyrm −6 ♥',
    };
    g.log = ['The Ash Wyrm falls! The Ember Duel is yours.'];
    return g;
  }
  if (shot === 'loss') {
    const g = createGame(11);
    startGame(g);
    g.player.life = 0;
    g.phase = 'loss';
    g.round = 5;
    g.score = 63;
    g.bestCombo = 2;
    g.stats = { damageDealt: 18, damageTaken: 30, cardsPlayed: 7, clashesWon: 3 };
    g.lastClash = {
      winner: 'ai', damage: 5, pPower: 4, aPower: 9,
      text: 'ASH WYRM WINS! Blizzard Titan 9 vs 4 — you −5 ♥',
    };
    g.log = ['The Ember Warden falls. The Ash Wyrm keeps the table.'];
    return g;
  }
  return createGame(null);
}
