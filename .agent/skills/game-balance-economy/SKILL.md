---
name: game-balance-economy
description: Balance and economy workflow for idle/web games. Use for production curves, cost scaling, progression pacing, prestige tuning, and KPI-based rebalance loops. Includes MoonIdle-specific analysis.
---

# Game Balance Economy

## Core Formula Reference

### Building Cost Scaling
`cost(n) = baseCost * exponent^n`

| Exponent | 10th building | 20th building | Character |
|----------|--------------|--------------|-----------|
| 1.13     | 3.4x         | 11.5x        | Fast early, long mid-game |
| 1.15     | 4.0x         | 16.4x        | Cookie Clicker standard |
| 1.18     | 5.2x         | 27.4x        | High friction, prestige emphasis |

MoonIdle uses 1.15 (moderate). Consider per-tier exponents: cheap buildings 1.13, premium buildings 1.18.

### Production Per Second Model
`net = baseRate * count * prodMult * globalMult * moonstoneMult * solarBonus`

Compounding order matters: additive multipliers inside the same tier, multiplicative across tiers.
MoonIdle correctly chains: prodMult (per-resource) → globalMult → moonstoneMult → solarBonus.

### Prestige Multiplier
MoonIdle: `1 + moonstone * 0.05` → each MS = +5% global production.
This is additive-across-stack: 10 MS = +50%, 20 MS = +100%. Curve flattens fast.
Preferred pattern (Antimatter Dimensions style): `1.05^moonstone` (exponential scaling).
At 20 MS: additive = 2.0x, exponential = 2.65x. Exponential gives prestige lasting power.

---

## MoonIdle Progression Timeline (Current State)

### Start Conditions
- Money: 500, Research: 0, research_lab: 1 (0.4 RP/s), all other buildings locked

### Phase 1: Research Gate (0–90s target, actual ~25s+)
- Time to 10 RP (basic_prod): 10 / 0.4 = **25 seconds** — GOOD (Antimatter Dimensions target: first action 20–40s)
- basic_prod unlocks mine + ops_center. Mine costs 100 money; player has 500. Immediate purchase.

### Phase 2: Metal Ramp (90s–5min target)
- Mine base rate: 1.2 metal/s. Engine needs 80 metal → 80/1.2 = **67 seconds** — GOOD
- But engine also needs 40 fuel, 20 electronics — both locked behind fuel_chem (60 RP) and electronics_basics (80 RP)
- Time to 60 RP from 0.4 RP/s: 150 seconds. Refinery then needs 300 money + 100 metal.
- **DEAD ZONE**: Between basic_prod (25s) and fuel/electronics unlock (~4–5min), only metal accumulates.
  Player has nothing productive to spend money on. ops_center costs only 50 metal to buy (affordable instantly),
  but then money piles up with nowhere to go until mines/research upgrades cascade.

### Phase 3: Multi-resource Gate (5–15min)
- Engine (80 metal, 40 fuel, 20 electronics): can't build until all three branches unlocked
- Earliest engine build: ~8–10 minutes into a fresh run — reasonable for a 20-min prestige target
- Hull (100 metal only) can be built much earlier: ~2min. Gives player progress signal.

### Phase 4: First Rocket (15–25min target)
- rocket_eng costs: 200 RP + 300 metal. With 1 research_lab: 200/0.4 = 500s (~8min) for RP alone.
- This is the hardest gate. R&D center (1.2 RP/s) requires 3000 money + 500 electronics.
- **BOTTLENECK**: RP production severely under-resourced until R&D center is affordable.

### Phase 5: Prestige Loop
- getMoonstoneReward: `floor((altitude/20) * rewardMult) + fusionBonus + floor(launches/4)`
- Proto quality: altitude = deltaV*22, deltaV ≈ 315 * 9.81 * ln((28+76)/28) / 1000 ≈ 4.1 km/s → altitude ≈ 90 km
- First prestige reward: floor(90/20 * 1.0) + 0 + 0 = **4 moonstones**
- 4 moonstones = +20% production. Not very exciting for first prestige after 20 min.

---

## Dead Zone Detection & Fixes

### Dead Zone 1: research_lab bottleneck (0.4 RP/s is too slow)
- Symptom: Player finishes basic_prod in 25s, then waits 100+ seconds for next upgrade (50 RP drill)
- Fix: Raise research_lab baseRate from 0.4 to 0.6 RP/s, OR drop drill cost to 30 RP
- Result: drill at 30s post-unlock, tighter feedback loop

### Dead Zone 2: RP starvation in mid-game
- Symptom: rocket_eng needs 200 RP. With 1 lab at 0.4/s, that's 500 seconds (8+ min) of waiting.
- Fix: Make R&D center more accessible (drop cost to 1500 money + 300 electronics),
  OR add a mid-tier research building (e.g., "연구 지원팀", 0.8 RP/s, costs 1500 money + 100 metal)

### Dead Zone 3: No money sink in early phase
- Symptom: After buying ops_center (50 metal needed first), money accumulates with no buyers
- Fix: Allow ops_center purchase at game start (only costs metal, not unlocked by basic_prod).
  OR give starting player a weak money sink (e.g., one-time "장비 구매" for +0.1 RP/s at cost 300 money)

### Dead Zone 4: First prestige reward feels small
- Symptom: 4 moonstones = +20% global production after 20min of work. Feels flat.
- Fix 1: Switch to exponential multiplier `1.05^ms` (see Prestige section)
- Fix 2: Add a prestige-retained unlock (e.g., research_lab starts at level 2 after first prestige)

---

## Number Feel

### What makes numbers satisfying (lessons from reference games)
- **Cookie Clicker**: Large numbers with suffix (K/M/B) feel like progress. Displaying per-second rate
  alongside total gives instant feedback on decision quality.
- **Antimatter Dimensions**: Exponent-based numbers (e.g., "1.23e47") signal exponential growth.
  Player knows the curve is steep. Uses "OOM per second" as meta-metric.
- **NGU Idle**: Color-coded progress bars per resource. Seeing bar fill up creates anticipation.
- **Revolution Idle**: Highlights "time to next purchase" for each building — actionable micro-goal.

### MoonIdle number feel assessment
- fmt() clips at B (billion). This is fine for a first prestige game.
- Rate display `(+X.X/s)` is good. Consider adding "time to next purchase" below each building button.
- Research points should feel precious; current RP numbers (10, 50, 60, 80…) are in right range.
- Metal/fuel/electronics in hundreds is fine pre-prestige. Post-prestige should reach K range quickly.

---

## Progression Pacing Targets (Industry Standard)

| Milestone | Target time | MoonIdle actual | Status |
|-----------|-------------|----------------|--------|
| First meaningful action (basic_prod) | 20–40s | ~25s | GOOD |
| First new resource unlocked | 3–5 min | ~2.5min (metal) | GOOD |
| First multi-resource interaction | 5–10 min | ~8min | SLOW |
| First rocket built | 15–20 min | ~18–25 min | BORDERLINE |
| First prestige (moonstone) | 20–30 min | ~25+ min | OK |
| Second prestige speed | 50% of first | ~15 min | NOT VERIFIED |

---

## Prestige Loop Design (Antimatter Dimensions Patterns)

1. **Soft reset, not hard reset**: Retain meaningful permanent progress (moonstones, prestige unlocks).
   MoonIdle retains moonstones correctly. Consider also retaining one starting building upgrade.

2. **Prestige speed curve**: Each loop should be noticeably faster. If loop 1 = 25 min,
   loop 2 should = 12 min, loop 3 = 7 min. Exponential reward scaling drives this.
   `floor(launches/4)` bonus is too weak — only +1 MS per 4 launches.

3. **Visible progress hook before reset**: Show "Expected moonstones: X" on launch screen.
   Player needs to see the reward before committing to prestige.

4. **Mid-prestige goals**: Add 2–3 optional milestone rewards between first and tenth prestige
   (e.g., at 10 MS: unlock a new building permanently; at 25 MS: unlock quality tier).

---

## Cost Scaling Recommendations

### Per-building exponent tuning
| Building | Current exponent | Recommended | Reason |
|----------|-----------------|-------------|--------|
| research_lab | 1.15 | 1.13 | RP is the key bottleneck; make it scaleable |
| mine | 1.15 | 1.15 | Core resource, keep standard |
| ops_center | 1.15 | 1.18 | Money is not a bottleneck; add friction |
| solar_array | 1.15 | 1.20 | Bonus buildings should have high friction |
| launch_pad | flat | 1.25 per pad | Each launch slot is very powerful |

### Upgrade cost ladder check
Current ladder: 10 → 50 → 60 → 80 → 80 → 100 → 150 → 200 → 200 → 250 → 300 → 300 → 400
This is correct: roughly 1.3–1.5x per step. Do not compress further.

---

## KPI-Based Rebalance Loop

1. **Target KPIs**: first action <40s, first prestige <30min, second prestige <15min.
2. **Instrument**: Add `console.time` markers at key unlock events in development builds.
3. **Tune one variable at a time**: Change research_lab baseRate, observe Phase 1 KPI.
4. **Validate prestige feel**: After each rebalance, do a complete fresh-start run.
5. **Dead zone test**: If production rate is flat for >90 seconds with nothing to buy, there is a dead zone.

## Guardrails

- Avoid multiplicative stacking without hard caps (reliability already capped at 99.5%).
- Each new upgrade must be visibly meaningful; minimum +20% on something.
- Do not require hidden mechanics for progression.
- Solar array bonus (+10%/building) stacks additively — verify this does not overpower late game.
  At 10 solar arrays: getSolarBonus() = 2.0 (doubles production). This is intentional, monitor closely.
