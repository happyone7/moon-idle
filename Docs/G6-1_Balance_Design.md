# G6-1 — K/M/B 경제 밸런싱 수치 설계서

**담당**: 기획팀장 (GameDesigner)
**작성일**: 2026-02-21
**Sprint**: 6
**의존 태스크**: P6-3 구현자가 이 문서를 기준으로 `js/game-data.js`, `js/game-state.js` 수정

---

## 설계 목표 요약

| 게임 페이즈 | 건물 수 기준 | 비용/수익 목표 범위 |
|------------|------------|-------------------|
| 초기 게임   | 1~3개       | ₩수백 ~ ₩수K (K 미만 ~ 수K) |
| 중기 게임   | 4~10개      | ₩수K ~ ₩수십K (처음으로 K 접미사 표시) |
| 후기 게임   | 10+ 반복 구매 | ₩수십K ~ ₩수백K → M 진입 |
| 프레스티지 후 | 문스톤 5+   | M ~ B 진입 |

---

## 항목 1 — RES_MAX 상향

### 현재 값

```js
// js/game-state.js, tick() 함수 내 (line 787)
const RES_MAX = { money:999999, metal:50000, fuel:20000, electronics:10000, research:5000 };
```

### 제안 값

```js
const RES_MAX = {
  money:       1e12,   // 1T (1조)  — B 범위 자원 축적 가능
  metal:       5e7,    // 50M       — 후기~프레스티지 금속 대량 축적 허용
  fuel:        2e7,    // 20M       — 연료도 M 범위 진입 허용
  electronics: 1e7,    // 10M       — 전자부품 M 범위 허용
  research:    50000,  // 50K       — RP는 소모형이므로 현재 5K에서 10배만 상향
};
```

### 변경 이유
- 현재 `money:999999` 상한이 플레이어가 K→M→B 구간으로 진행하는 것을 물리적으로 차단하고 있음.
- 방치 중 자원이 cap에 닿으면 overflow loss가 발생해 플레이어가 불필요한 손실을 느낌 — cap을 게임플레이 목표 범위 이상으로 충분히 높여 "cap을 채우는" 경험보다 "쌓이는 자원을 쓰는" 경험에 집중하게 함.
- `research`는 획득 즉시 연구에 소모되는 구조이므로 10배 상향(5K → 50K)으로도 충분. 너무 높이면 연구 완료 전 RP가 무의미하게 쌓이는 시각적 혼란을 줄 수 있음.

---

## 항목 2 — 건물 baseCost 조정

### 설계 원칙
- **첫 구매 비용**: 해당 시점 플레이어의 예상 수입 × 1.5~3분 분량
- 건물 해금 순서 (연구 트리 기준): housing → ops_center → mine → extractor → refinery/cryo_plant → elec_lab/fab_plant → research_lab → r_and_d → solar_array → launch_pad

### 현재 값 → 제안 값 비교표

| 건물 ID | 현재 baseCost | 제안 baseCost | 변경 이유 |
|---------|-------------|-------------|---------|
| `housing` | `{money:150}` | `{money:200}` | 시작 자금(₩1500)의 ~13% → ~7%로 약간 상향. 초반 첫 인원 확장에 약간의 무게감 부여. |
| `ops_center` | `{metal:200}` | `{metal:150}` | mine 하나에서 metal 150 모으는 시간 ≈ 100초(rate 1.5/s 기준) — 적절한 첫 구매 대기 시간. 현재 200은 133초로 조금 빡빡함. |
| `supply_depot` | `{metal:1500, electronics:200}` | `{money:3000, metal:500, electronics:150}` | 현재 metal:1500은 extractor 구매 직후에도 한참 저축해야 하는 양. money 비중을 높이고 metal 요구량을 낮춰 mid-game에서 자연스럽게 구매 가능하도록 조정. |
| `mine` | `{money:1000}` | `{money:800}` | 시작 자금(₩1500) 대비 부담을 약간 낮춤. ops_center에서 ~30/s 수익 발생 후 약 20초 분량 — 초기 루프 속도 개선. |
| `extractor` | `{money:5000, metal:2000}` | `{money:6000, metal:1500}` | metal 요구량 완화(2000→1500). mine 1개 rate 1.5/s 기준 1000초 → 1000초로 유지하되 money 비중 상향으로 자원 혼합 의사결정 강화. |
| `refinery` | `{money:8000, metal:3000}` | `{money:10000, metal:2500}` | mid-game 전환점이므로 money 비중 유지, metal 요구량 소폭 완화. ₩10K는 처음으로 K 접미사가 표시되는 인상적인 비용. |
| `cryo_plant` | `{money:12000, metal:5000, electronics:1000}` | `{money:15000, metal:4000, electronics:800}` | refinery 다음 연료 시설. 모든 자원 소폭 상향(money)하면서 metal/electronics 요구량은 완화. |
| `elec_lab` | `{money:15000, metal:5000}` | `{money:18000, metal:4000}` | 전자부품 생산 첫 건물. money 상향으로 mid-game에서 충분한 저축 기간 필요. metal 요구량 완화. |
| `fab_plant` | `{money:20000, metal:8000, electronics:2000}` | `{money:25000, metal:6000, electronics:1500}` | 고급 전자부품. money 상향으로 후기 mid-game 진입 느낌 강화. |
| `research_lab` | `{money:18000}` | `{money:20000}` | RP 생산 첫 건물. 약간 상향하여 초반에 너무 쉽게 구매되는 것 방지. |
| `r_and_d` | `{money:50000, electronics:5000}` | `{money:40000, electronics:3000}` | `_balance_proposals.md` 섹션 3 권고 반영 — R&D 센터가 너무 늦게 접근 가능한 문제 개선. 기존 50K→40K, electronics 5000→3000으로 낮춰 mid-game 타이밍에 자연스럽게 구매 가능. |
| `solar_array` | `{money:30000, electronics:5000}` | `{money:35000, electronics:4000}` | 전체 생산 보너스 건물은 비싸야 함. money 소폭 상향. |
| `launch_pad` | `{money:100000, metal:30000, electronics:8000}` | `{money:120000, metal:25000, electronics:10000}` | 발사대는 가장 강력한 건물(슬롯 +1)이므로 가장 비싸야 함. money ₩120K(K 접미사 범위의 최고점), electronics 상향으로 후기 게임 전자부품 소비 증가. |

---

## 항목 3 — 건물 baseRate 조정

### 설계 원칙
- 비용 대비 회수 시간: 10 ~ 30분 기준 (idle 게임 특성상 방치 시간 고려)
- 건물 N개째 구매 비용 / (baseRate × N) ≈ 600~1800초 (10~30분)
- 수익형 건물(money)은 money 지출 회수 고려, 자원형 건물은 해당 자원의 mid/late game 필요량 고려

### 현재 값 → 제안 값 비교표

| 건물 ID | 생산 자원 | 현재 baseRate | 제안 baseRate | 변경 이유 |
|---------|---------|-------------|-------------|---------|
| `ops_center` | money | 30/s | **35/s** | `_balance_proposals.md` 섹션 1 권고(20→30) 이미 일부 반영된 값 기준. 35로 추가 상향으로 중기 money 수익 가속. |
| `supply_depot` | money | 15/s | **25/s** | baseCost가 money 포함으로 재설계되었으므로 수익률도 상향 필요. ops_center보다 낮되 의미있는 수익. |
| `mine` | metal | 20/s | **25/s** | `_balance_proposals.md` 섹션 1 권고(1.2→1.5)에서 추가 상향. 중후기 metal 수요가 크게 늘므로 생산량 증가 필요. |
| `extractor` | metal | 25/s | **40/s** | mine 대비 2배 이상 생산해야 "업그레이드" 느낌. 현재 25는 mine(20) 대비 너무 적음. |
| `refinery` | fuel | 15/s | **20/s** | 연료는 로켓 부품 소비가 크므로 생산량 증가 필요. |
| `cryo_plant` | fuel | 20/s | **35/s** | extractor가 mine 대비 큰 점프인 것처럼, cryo_plant도 refinery 대비 큰 점프를 제공해야 함. |
| `elec_lab` | electronics | 15/s | **18/s** | `_balance_proposals.md` 섹션 1 권고(0.5→0.7 → 14/s 기준) 참고하여 소폭 상향. |
| `fab_plant` | electronics | 20/s | **35/s** | elec_lab → fab_plant 점프가 크야야 함. 현재 20은 elec_lab(15)과 차이 너무 작음. |
| `research_lab` | research | 12/s | **15/s** | `_balance_proposals.md` 섹션 1 권고(0.4→0.6) 반영하여 12→15로 조정. |
| `r_and_d` | research | 15/s | **25/s** | R&D가 research_lab 대비 의미있는 RP 가속을 제공해야 함. 현재 15는 차이 미미. |
| `solar_array` | bonus(+10%/개) | 0.1(+10%/개) | **0.15(+15%/개)** | `_balance_proposals.md`의 sol_hieff 업그레이드가 +5%를 추가하는 구조인데, 기본값이 너무 낮으면 solar 첫 설치 효과가 미미. 기본 15%/개로 상향. |
| `housing` | bonus(인원+1) | 0 (보너스형) | 변경 없음 | 보너스 건물이므로 rate 변경 무의미. |
| `launch_pad` | bonus(슬롯+1) | 0 (보너스형) | 변경 없음 | 보너스 건물이므로 rate 변경 무의미. |

> **주의**: `solar_array`의 baseRate 0.1은 getSolarBonus()에서 `b.baseRate * gs.buildings.solar_array`가 아닌 `0.10` 하드코딩으로 사용됨. P6-3 구현 시 `game-state.js`의 `getSolarBonus()` 함수를 함께 수정해야 함:
> ```js
> // 현재
> let perPanel = 0.10;
> // 변경 후
> let perPanel = 0.15;
> ```

---

## 항목 4 — 건물별 배율 맵 (BUILDING_EXPONENTS)

### 설계 원칙
- **낮은 배율(1.12~1.13)**: 핵심 병목 건물 — 여러 개 구매해야 수익이 나는 건물
- **기본 배율(1.15)**: 일반 생산 건물
- **높은 배율(1.18~1.25)**: 보너스/고효율 건물 — 중복 구매 억제가 설계 의도인 건물

### 제안 BUILDING_EXPONENTS 맵

`js/game-state.js`의 `getBuildingCost()` 함수 안에서 `Math.pow(1.15, ...)` 대신 아래 맵을 참조:

```js
// js/game-state.js — getBuildingCost() 내에 추가 (또는 파일 상단에 상수 정의)
const BUILDING_EXPONENTS = {
  housing:       1.12,  // 인원 확장은 자주 구매해야 — 낮은 배율
  ops_center:    1.18,  // money 생산량이 크므로 중복 구매 마찰 부여
  supply_depot:  1.18,  // 고수익 money 건물; 높은 배율 유지
  mine:          1.13,  // metal 핵심 생산 — 다량 구매 유도, 낮은 배율
  extractor:     1.15,  // 표준
  refinery:      1.15,  // 표준
  cryo_plant:    1.15,  // 표준
  elec_lab:      1.12,  // electronics 병목 — 낮은 배율로 다량 구매 유도
  fab_plant:     1.15,  // 표준
  research_lab:  1.12,  // RP 핵심 생산 — 낮은 배율 (연구는 항상 부족)
  r_and_d:       1.15,  // 표준
  solar_array:   1.22,  // 전체 보너스 건물 — 높은 마찰이 올바른 설계
  launch_pad:    1.30,  // 슬롯은 매우 강력 — 높은 마찰 필수. 2번째 발사대 = 1.3배 비용
};
// 위 맵에 없는 건물은 기본값 1.15 사용
```

### getBuildingCost() 수정 방법

```js
// 현재 코드 (game-state.js:251)
cost[r] = Math.floor(v * Math.pow(1.15, gs.buildings[bld.id] || 0));

// 변경 후
const BUILDING_EXPONENTS = { /* 위 맵 */ };
const exp = BUILDING_EXPONENTS[bld.id] || 1.15;
cost[r] = Math.floor(v * Math.pow(exp, gs.buildings[bld.id] || 0));
```

### 비용 시뮬레이션 (제안 수치 기준)

| 건물 | 1번째 | 5번째 | 10번째 | 20번째 |
|------|------|------|-------|-------|
| mine (exp 1.13) | ₩800 | ₩1.5K | ₩2.7K | ₩8.7K |
| ops_center (exp 1.18) | Fe:150 | Fe:330 | Fe:830 | Fe:5.3K |
| research_lab (exp 1.12) | ₩20K | ₩35K | ₩55K | ₩152K |
| r_and_d (exp 1.15) | ₩40K / PCB:3K | ₩80K / PCB:6K | ₩162K / PCB:12K | ₩654K / PCB:48K |
| solar_array (exp 1.22) | ₩35K | ₩93K | ₩262K | ₩2.1M |
| launch_pad (exp 1.30) | ₩120K | ₩409K | ₩1.8M | ₩35M |

> launch_pad 20번째 ≈ ₩35M — 프레스티지 후 B 범위 직전의 목표치로 적합.
> solar_array 20번째 ≈ ₩2.1M — M 범위 자연스러운 진입.

---

## 항목 5 — _balance_proposals.md 미반영 항목 검토

### 5-1. getMoonstoneMult() additive→exponential (섹션 4)

**결정: 채택 (변경)**

- **현재**: `1 + gs.moonstone * 0.05` → MS=10일 때 ×1.5배, MS=30일 때 ×2.5배
- **제안**: `Math.pow(1.07, gs.moonstone)` → MS=10일 때 ×1.97배, MS=30일 때 ×7.61배

**채택 근거**: K/M/B 범위 확장의 핵심 동력은 프레스티지 루프에서 축적된 문스톤. Additive 방식은 MS가 많아져도 배율이 선형으로 늘어나 "프레스티지할수록 압도적으로 강해지는" 방치형 게임 특유의 쾌감이 없음. Exponential 방식으로 변경하면 MS 10개 기준 생산량이 약 2배가 되어 M 범위 진입이 실질적으로 가능해짐.

```js
// js/game-state.js, line 146
// 현재
function getMoonstoneMult() { return 1 + gs.moonstone * 0.05; }
// 변경 후
function getMoonstoneMult() { return Math.pow(1.07, gs.moonstone || 0); }
```

**주의**: MS=0일 때 `Math.pow(1.07, 0) = 1.0` 으로 정상 동작 확인됨.

---

### 5-2. ops_center 언락 조건 변경 (섹션 2)

**결정: 채택 (부분 변경)**

- **제안 원문**: `bld_ops_center: true` (처음부터 해금)로 변경, `basic_prod.unlocks`에서 제거
- **채택 이유**: ops_center가 `basic_prod` 연구에 의해 잠겨있지만, 실제로는 metal:150(또는 200)을 모아야 구매 가능함. "연구 → 해금 → 자원 모으기" 순서가 아닌 "자원 모으기 → 구매" 순서로 단순화하는 것이 초보자 경험 개선에 유효.

```js
// js/game-state.js, gs 초기 unlocks (line 38)
// 현재
bld_ops_center: true,  // 처음부터 표시
// → 이미 true로 되어 있음 — 초기값은 이미 올바름.

// js/game-data.js, UPGRADES basic_prod (line 46)
// 현재
unlocks:['bld_mine']
// 변경 후 (bld_ops_center 제거 — 이미 초기 해금이므로 중복 제거)
unlocks:['bld_mine']
// → 코드 확인 결과 bld_ops_center는 이미 basic_prod.unlocks에 없음.
//   game-state.js의 defaultUnlocks에서 bld_ops_center: true가 이미 설정됨.
//   별도 변경 불필요.
```

---

### 5-3. 업그레이드 비용 조정 (섹션 3)

**결정: 부분 채택**

| 업그레이드 | 현재 | 제안(원문) | 채택 여부 | 채택 수치 |
|-----------|------|----------|----------|---------|
| `basic_prod` | research:10 | research:8 | **보류** | 변경 없음. 초반 RP는 충분히 빠르게 쌓임. |
| `fuel_chem` | research:60, metal:50 | research:45, metal 제거 | **채택** | `{research:45}` — metal 요구 제거로 초반 cross-resource 마찰 해소. |
| `alloy` | research:150, metal:300 | research:120, metal:350 | **부분 채택** | `{research:130, metal:250}` — RP는 130으로 조정, metal 요구를 원문 제안보다 낮게(250) 설정. |
| `r_and_d baseCost` | money:50000, electronics:5000 | money:40000, electronics:3000 | **채택** | `{money:40000, electronics:3000}` — 항목 2에서 이미 반영. |

#### 최종 UPGRADES 변경 대상 (game-data.js)

```js
// fuel_chem (line 51)
// 현재
{ id:'fuel_chem', cost:{research:60,metal:50}, ... }
// 변경 후
{ id:'fuel_chem', cost:{research:45}, ... }

// alloy (line 48)
// 현재
{ id:'alloy', cost:{research:150,metal:300}, ... }
// 변경 후
{ id:'alloy', cost:{research:130,metal:250}, ... }
```

---

## 종합 변경 체크리스트 (P6-3 구현자용)

### js/game-state.js 수정 사항

- [ ] **RES_MAX** (line 787): `{ money:1e12, metal:5e7, fuel:2e7, electronics:1e7, research:50000 }`
- [ ] **getMoonstoneMult()** (line 146): `return Math.pow(1.07, gs.moonstone || 0);`
- [ ] **getSolarBonus()** (line 149): `let perPanel = 0.15;` (0.10 → 0.15)
- [ ] **getBuildingCost()** (line 248~254): `BUILDING_EXPONENTS` 맵 추가 후 per-building exponent 사용

### js/game-data.js 수정 사항

#### BUILDINGS 배열 변경

| 건물 | 변경 항목 | 현재값 | 변경값 |
|------|---------|-------|-------|
| `housing` | baseCost | `{money:150}` | `{money:200}` |
| `ops_center` | baseRate | 30 | 35 |
| `ops_center` | baseCost | `{metal:200}` | `{metal:150}` |
| `supply_depot` | baseRate | 15 | 25 |
| `supply_depot` | baseCost | `{metal:1500,electronics:200}` | `{money:3000,metal:500,electronics:150}` |
| `mine` | baseRate | 20 | 25 |
| `mine` | baseCost | `{money:1000}` | `{money:800}` |
| `extractor` | baseRate | 25 | 40 |
| `extractor` | baseCost | `{money:5000,metal:2000}` | `{money:6000,metal:1500}` |
| `refinery` | baseRate | 15 | 20 |
| `refinery` | baseCost | `{money:8000,metal:3000}` | `{money:10000,metal:2500}` |
| `cryo_plant` | baseRate | 20 | 35 |
| `cryo_plant` | baseCost | `{money:12000,metal:5000,electronics:1000}` | `{money:15000,metal:4000,electronics:800}` |
| `elec_lab` | baseRate | 15 | 18 |
| `elec_lab` | baseCost | `{money:15000,metal:5000}` | `{money:18000,metal:4000}` |
| `fab_plant` | baseRate | 20 | 35 |
| `fab_plant` | baseCost | `{money:20000,metal:8000,electronics:2000}` | `{money:25000,metal:6000,electronics:1500}` |
| `research_lab` | baseRate | 12 | 15 |
| `research_lab` | baseCost | `{money:18000}` | `{money:20000}` |
| `r_and_d` | baseRate | 15 | 25 |
| `r_and_d` | baseCost | `{money:50000,electronics:5000}` | `{money:40000,electronics:3000}` |
| `solar_array` | baseRate | 0.1 | 0.15 (getSolarBonus에서 처리) |
| `solar_array` | baseCost | `{money:30000,electronics:5000}` | `{money:35000,electronics:4000}` |
| `launch_pad` | baseCost | `{money:100000,metal:30000,electronics:8000}` | `{money:120000,metal:25000,electronics:10000}` |

#### UPGRADES 배열 변경

| 업그레이드 | 현재 cost | 변경 cost |
|-----------|---------|---------|
| `fuel_chem` | `{research:60,metal:50}` | `{research:45}` |
| `alloy` | `{research:150,metal:300}` | `{research:130,metal:250}` |

---

## 설계 검증 — 주요 구간 시뮬레이션

### 초기 게임 (0~5분)
- 시작자금 ₩1500 → housing(₩200) 즉시 구매 가능
- mine(₩800) 구매 후 ops_center(Fe:150) 저축 ~100초
- ops_center 35/s 발생 → mine 10번째 ≈ ₩2.2K, 60초 저축이면 구매 가능
- **K 범위**: mine 반복 구매 5번째 ≈ ₩1.7K → "1.7K" 표시 시작

### 중기 게임 (5~30분)
- extractor(₩6K), refinery(₩10K), elec_lab(₩18K) 순차 구매
- solar_array 첫 구매(₩35K) → "35K" 표시
- r_and_d(₩40K/PCB:3K) → "40K" 표시
- **K→M 전환**: solar_array 5번째 ≈ ₩93K → "93K" 표시. 10번째 ≈ ₩262K → "262K" (K 범위 최대)
- launch_pad 2번째 ≈ ₩156K, 3번째 ≈ ₩202K → M 직전

### 후기 게임 (30분+)
- launch_pad 5번째 ≈ ₩409K → "409K"
- solar_array 15번째 ≈ ₩837K → "837K"
- solar_array 17번째 ≈ ₩1.2M → **"1.2M" 첫 M 표시!**
- launch_pad 8번째 ≈ ₩1.5M → **"1.5M"**

### 프레스티지 후 (MS 10+ 기준, getMoonstoneMult = ×1.97)
- 생산량 ≈ 2배 → 자원 축적 속도 2배
- solar_array 20번째 ≈ ₩2.1M → 20분 분량
- launch_pad 15번째 ≈ ₩16M → 중장기 목표
- **B 범위**: launch_pad 25번째 ≈ ₩600M → "600M"; launch_pad 30번째 ≈ ₩4.5B → **"4.5B" 첫 B 표시**

---

## 기타 유의사항 (P6-3 구현 시 참고)

1. **saveVersion 갱신**: RES_MAX, baseRate, baseCost 변경은 기존 세이브 데이터와 충돌 없음 (저장값이 아닌 런타임 상수이므로). 단, `getMoonstoneMult()` 변경은 저장된 `moonstone` 수치에 곱해지므로 기존 플레이어 수치가 달라짐 — 이는 의도된 재조정.

2. **BUILDING_EXPONENTS 선언 위치**: `game-state.js`의 `getBuildingCost()` 함수 바로 위(또는 파일 상단 상수 선언부)에 `const BUILDING_EXPONENTS = {...}` 추가. `game-data.js`가 아닌 `game-state.js`에 위치시키는 이유: 비용 계산 로직과 함께 있어야 유지보수 편의.

3. **supply_depot baseCost 자원 유형 변경**: `metal:1500,electronics:200` → `money:3000,metal:500,electronics:150`. 구매 가능 여부 체크는 `canAfford(cost)` 함수가 동적으로 처리하므로 별도 코드 변경 불필요.

4. **solar_array baseRate 0.10 → 0.15**: `game-data.js`의 `BUILDINGS` 배열에서 `baseRate:0.1` 값은 실제로 `getProduction()`에서 사용되지 않음 (produces:'bonus'이므로 스킵됨). `getSolarBonus()` 함수의 `let perPanel = 0.10;` 하드코딩 값만 변경하면 됨.

---

_작성: GameDesigner <game-designer@moonidle.dev>_
_참조: `_balance_proposals.md`, `js/game-data.js`, `js/game-state.js`_
