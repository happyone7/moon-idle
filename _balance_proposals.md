# MoonIdle Balance Proposals
_Generated from analysis of js/game-data.js + js/game-state.js — do NOT modify game-data.js directly_

---

## 1. Building Base Rate Adjustments

### research_lab: 0.4 → 0.6 RP/s (+50%)
**Why**: The first upgrade (basic_prod) costs 10 RP. At 0.4/s that's 25s — fine. But the next meaningful
milestone (drill at 50 RP) takes another 100s with no intermediate feedback. At 0.6/s, drill unlocks in
~67s total from start, giving a tighter loop. The entire early research tree (10→50→60→80) completes
roughly 40% faster, pulling the "three resources active" moment from ~8min to ~5min.
- `{ id:'research_lab', ..., baseRate: 0.6 }` (change from 0.4)

### mine: 1.2 → 1.5 metal/s (+25%)
**Why**: Metal is the universal unlock currency in early-mid game (buildings, upgrade requirements).
The extractor (3.5/s) requires 200 metal to buy — at 1.2/s that's 167s of saving *after* you already
bought your first mine. At 1.5/s it's 133s, tightening Phase 2 without breaking prestige loop.
- `{ id:'mine', ..., baseRate: 1.5 }` (change from 1.2)

### ops_center: 20 → 30 money/s (+50%)
**Why**: Money is spent on most buildings but ops_center only produces 20/s. After basic_prod,
the player unlocks ops_center but has 500+ money sitting idle. The player cannot do anything
useful with money until they unlock fuel (need 300 money for refinery) or electronics (400 money).
Raising ops_center rate means money production feels meaningful before those unlocks.
- `{ id:'ops_center', ..., baseRate: 30 }` (change from 20)

### elec_lab: 0.5 → 0.7 electronics/s (+40%)
**Why**: Electronics is required for the most important mid-game upgrades (microchip: 80 elec,
automation: 200 elec) and for the R&D center (500 elec). The bottleneck at 0.5/s is extreme.
With 1 elec_lab, automation takes 400s (6.7 min) of electronics alone. 0.7/s reduces to 286s.
This is still a meaningful wait; it just doesn't feel punishing.
- `{ id:'elec_lab', ..., baseRate: 0.7 }` (change from 0.5)

---

## 2. Unlock Condition Adjustment

### ops_center: unlock at game start (remove dependency on basic_prod)
**Why**: ops_center is gated by basic_prod, but it only costs 50 metal. The player starts with 500 money
and 0 metal, so they can't buy it immediately — but there is no reason to also lock it behind research.
Changing `bld_ops_center: false` (locked by basic_prod unlock) to `bld_ops_center: true` (available
from start, just needs metal to afford) removes a confusing invisible gate with no design benefit.
- In `gs.unlocks`: set `bld_ops_center: true` as default starting unlock
- Remove 'bld_ops_center' from `basic_prod.unlocks` array in UPGRADES

---

## 3. Upgrade Cost Adjustments

### basic_prod: research:10 → research:8
**Why**: Marginal change. At 0.4/s the 25s wait is fine. But if research_lab is raised to 0.6/s (proposal #1),
8 RP takes 13s. Still long enough to feel like a gate but short enough to not feel like loading-screen time.
Only apply this change IF research_lab rate is raised; otherwise leave at 10.

### fuel_chem: research:60 → research:45, metal:50 → remove metal requirement
**Why**: fuel_chem currently requires both 60 RP and 50 metal. Metal is precious in early game.
Requiring metal for a research-tree upgrade creates an awkward cross-resource dependency that
adds friction without telegraphing to the player why fuel research needs metal. Drop to 45 RP only.
- `{ id:'fuel_chem', ..., cost:{research:45} }`

### alloy: research:150 → research:120, metal:500 → metal:350
**Why**: alloy unlocks R&D center (the key RP production building) and is a prerequisite for rocket_eng.
At 500 metal, the player needs ~333s of pure saving after unlocking extractor (which they may not have yet).
Reducing to 350 metal aligns with expected game state at that point (extractor producing 3.5/s →100s of saving).
- `{ id:'alloy', ..., cost:{research:120, metal:350} }`

### r_and_d center: money:3000 → money:2000, electronics:500 → electronics:350
**Why**: This is the primary solution to the RP dead zone. The R&D center (1.2 RP/s = 3x research_lab)
is locked behind an economics gate that most players won't reach until they've already cleared rocket_eng.
The intended design seems to be: "buy R&D to speed up the final research tier." Making it more accessible
means players get the triple-RP production boost when they actually need it — mid-game, not at end-game.
- `{ id:'r_and_d', ..., baseCost:{money:2000, electronics:350} }`

---

## 4. Prestige Mechanics Improvements

### getMoonstoneMult(): additive → exponential
**Current**: `1 + gs.moonstone * 0.05` (each MS = flat +5%)
**Proposed**: `Math.pow(1.07, gs.moonstone)` (each MS = compounding +7%)

Comparison at key MS counts:
| MS | Current mult | Proposed mult |
|----|-------------|--------------|
| 5  | 1.25x       | 1.40x        |
| 10 | 1.50x       | 1.97x        |
| 20 | 2.00x       | 3.87x        |
| 30 | 2.50x       | 7.61x        |

The exponential curve makes mid/late prestige runs feel increasingly powerful. The gap between
"1 MS prestige" and "10 MS prestige" becomes exciting rather than linear.
- In `game-state.js`: `function getMoonstoneMult() { return Math.pow(1.07, gs.moonstone); }`

### getMoonstoneReward(): boost floor(launches/4) component
**Current**: `floor(launches/4)` adds 1 MS per 4 launches — barely noticeable.
**Proposed**: `floor(launches/2)` — 1 MS per 2 launches. Still slow, but each return trip matters.
This rewards players who do multiple launch-collect loops before full prestige.
- In `game-state.js`: change `gs.launches / 4` to `gs.launches / 2`

---

## 5. New Mechanic Proposals (No Code Changes to Existing Data — New Additions Only)

### A. Mid-tier research building: "연구 지원팀" (Research Support Team)
Fills the RP dead zone between research_lab (0.4/s) and R&D center (1.2/s).
- produces: research
- baseRate: 0.8 RP/s
- baseCost: {money:1200, metal:200}
- unlock: requires 'electronics_basics' research
- wbClass: 'wb-research'

This gives players a visible RP acceleration option around minute 5–6, bridging the long gap
to R&D center without requiring the full electronics tree to be complete.

### B. "Time to purchase" display in building buttons
Not a data change — a UI label showing "~Xs" until next affordable purchase.
Makes the idle period feel active: player can see progress toward the next buy.

### C. Prestige "start boost" — retain research_lab level on first prestige
On first moonstone prestige: research_lab starts at count=2 instead of 1.
Each subsequent prestige: +0 (just the first is special).
This makes the first prestige feel immediately different on re-run. No code needed in game-data.js —
implement in the prestige reset function by checking `gs.launches >= 1`.

---

## 6. Cost Scaling Exponent Per Building

Propose a per-building override map instead of the flat 1.15 for all:

```js
const BUILDING_EXPONENTS = {
  research_lab: 1.13,   // Core bottleneck — keep affordable
  r_and_d:      1.15,   // Standard
  mine:         1.15,   // Standard
  extractor:    1.15,   // Standard
  ops_center:   1.18,   // Money producer; fine with friction
  supply_depot: 1.18,   // High money output; should be expensive
  refinery:     1.15,   // Standard
  cryo_plant:   1.15,   // Standard
  elec_lab:     1.13,   // Electronics is a bottleneck
  fab_plant:    1.15,   // Standard
  solar_array:  1.20,   // Bonus building; high friction is correct
  launch_pad:   1.25,   // Each slot is very powerful
};
```

To implement: modify `getBuildingCost()` in game-state.js to look up per-building exponent
from this map before falling back to the default 1.15.

---

## 7. Priority Order for Changes

1. **High priority / low risk**: research_lab 0.4→0.6, ops_center unlock from start
2. **Medium priority**: getMoonstoneMult exponential, mine 1.2→1.5
3. **Medium priority**: fuel_chem cost drop, alloy cost drop
4. **Consider carefully**: R&D center cost drop (verify it doesn't trivialize late RP gate)
5. **Additive / safe**: mid-tier research building addition
6. **Long-term**: per-building exponent map, prestige start boost

---

_Analysis based on: js/game-data.js + js/game-state.js, fresh-start simulation from gs initial state._
_Reference patterns: Antimatter Dimensions (exponential prestige), Cookie Clicker (cost scaling 1.15),_
_NGU Idle (dead zone identification), Revolution Idle (time-to-next display)._
