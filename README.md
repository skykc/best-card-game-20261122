# 🔥 EMBER DUEL — a card duel of fire, frost, gale & stone

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/skykc/best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/skykc/best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**EMBER DUEL** — you are the Ember Warden, duelling the Ash Wyrm across the table.
Each round you play one card from your hand. Power beats power, element
advantage adds +2, win streaks build a combo, and the loser of each clash
loses life equal to the gap. First to 0 life falls.

Play it free: open `game/index.html` in a desktop browser — no network, no install.

- **Cards:** 24 original ember creatures in 4 elements — Flame 🔥, Frost ❄️, Gale 🌪️, Stone 🪨 — each with a cost in embers, a power value, and one keyword: BURN, GUARD, SURGE, MEND, SPARK or PIERCE.
- **Decisions every round:** which card to spend your embers on, when to save a big card, when to counter the rival's element.
- **Rival AI:** the Ash Wyrm reads your card and counters — it saves its big cards, plays its weakest when it cannot win, and punishes a predictable hand.
- **Controls:** mouse (click to pick, double-click to play) and keyboard (1–5 pick, Enter/Space play & continue, R restart, Esc title).

Built for [make.fun](https://make.fun/c/best-card-game-20261122-1826) — `best-card-game-20261122-1826`.
Play code referral: `6en97dxm` — https://make.fun/r/6en97dxm

## How to run

```sh
# open game/index.html in a desktop browser
```

Hand-in (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

1. `1-title.png` — title screen with the rules
2. `2-midplay.jpg` — mid-duel: both hands, a clash in the arena, life totals and combo
3. `3-win.png` — victory over the Ash Wyrm
4. `4-loss.png` — defeat, with the duel's stats

## License

MIT — see [LICENSE](LICENSE).
