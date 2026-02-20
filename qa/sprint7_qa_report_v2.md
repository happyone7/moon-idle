# Sprint 7 QA 리포트 v2

**날짜**: 2026-02-21
**QA 담당**: QAEngineer
**대상**: Sprint 7 추가 커밋 — P7-5 폰트 통일 (6eae7f9) + P6-3 K/M/B 경제 밸런싱 (92124cf)
**브랜치**: sprint/7

---

## 1. 검증 항목 1 — P7-5: world-bld 폰트 통일 (commit 6eae7f9)

### 목적
Share Tech Mono가 박스 드로잉 문자(U+2500~257F)를 커버하지 않아 폴백 발생 → `font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;`로 변경

### 검증 결과

**1-1. font-family 값 확인**

`index.html` 라인 477 (`.world-bld` CSS 블록):

```css
.world-bld {
  position: absolute;
  bottom: 0;
  font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
  font-size: 11px;
  line-height: 1.25;
  ...
}
```

지정 값과 정확히 일치. `'Courier New', Consolas, 'DejaVu Sans Mono', monospace`

**1-2. var(--font) 참조 잔존 여부**

git diff (commit 6eae7f9) 확인:

```diff
-  font-family: var(--font);
+  font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
```

변경 대상 1개소 외 `.world-bld` 블록 내 `var(--font)` 참조 없음. 코드베이스 전역 검색에서도 해당 블록에 남은 참조 없음.

**1-3. 변경 범위 적정성**

- 변경 파일: `index.html` 1건, 변경 라인: 1개 (-1/+1)
- author: `UIDeveloper <ui-developer@moonidle.dev>` (UI팀장 소관)
- 영향 범위: `.world-bld` CSS 단일 속성, 게임 로직 무영향

### 판정: **PASS**

---

## 2. 검증 항목 2 — P6-3: K/M/B 경제 밸런싱 (commit 92124cf)

### 목적
RES_MAX 상향, BUILDING_EXPONENTS 도입, baseRate/baseCost 전면 재조정으로 K/M/B 단위 숫자가 자연스럽게 표시되는 경제 규모 구축

### 검증 결과

**2-1. js/game-data.js — baseRate / baseCost 변경**

변경 전후 주요 수치 대조:

| 건물 | baseRate 전 | baseRate 후 | 비고 |
|------|------------|------------|------|
| ops_center | 30 | 35 | +17% 상향 |
| supply_depot | 15 | 25 | +67% 상향 |
| mine | 20 | 25 | +25% 상향 |
| extractor | 25 | 40 | +60% 상향 |
| refinery | 15 | 20 | +33% 상향 |
| cryo_plant | 20 | 35 | +75% 상향 |
| elec_lab | 15 | 18 | +20% 상향 |
| fab_plant | 20 | 35 | +75% 상향 |
| research_lab | 12 | 15 | +25% 상향 |
| r_and_d | 15 | 25 | +67% 상향 |

baseCost도 전면 재조정. 현재 코드 내 모든 수치 정상 확인.

**2-2. js/game-state.js — BUILDING_EXPONENTS 존재 확인**

라인 247~261에 `BUILDING_EXPONENTS` 상수가 정의되어 있음:

```javascript
const BUILDING_EXPONENTS = {
  housing:       1.12,
  ops_center:    1.18,
  supply_depot:  1.18,
  mine:          1.13,
  extractor:     1.15,
  refinery:      1.15,
  cryo_plant:    1.15,
  elec_lab:      1.12,
  fab_plant:     1.15,
  research_lab:  1.12,
  r_and_d:       1.15,
  solar_array:   1.22,
  launch_pad:    1.30,
};
```

모든 건물 ID 누락 없음. 기존 `getBuildingCost()` 함수의 하드코딩된 1.15 지수가 건물별 `BUILDING_EXPONENTS[bld.id]`로 교체되어 올바르게 동작.

**2-3. js/game-state.js — RES_MAX 상향 확인**

tick() 함수 (라인 743):
```javascript
// 변경 전
const RES_MAX = { money:999999, metal:50000, fuel:20000, electronics:10000, research:5000 };
// 변경 후
const RES_MAX = { money:1e12, metal:5e7, fuel:2e7, electronics:1e7, research:50000 };
```

- money: 999,999 → 1,000,000,000,000 (1조, K/M/B 스케일 충분)
- metal: 50,000 → 50,000,000
- fuel: 20,000 → 20,000,000
- electronics: 10,000 → 10,000,000
- research: 5,000 → 50,000 (+10배)

**2-4. js/main.js — renderResources() RES_MAX 동기화 확인**

라인 61 (renderResources 내부):
```javascript
const RES_MAX = { money:1e12, metal:5e7, fuel:2e7, electronics:1e7, research:50000 };
```

tick()의 RES_MAX와 동일한 값으로 동기화됨. UI 진행 바와 경고 기준이 일치.

**2-5. 추가 변경 — getMoonstoneMult() 공식 개선**

```javascript
// 변경 전
function getMoonstoneMult() { return 1 + gs.moonstone * 0.05; }
// 변경 후
function getMoonstoneMult() { return Math.pow(1.07, gs.moonstone || 0); }
```

선형에서 복리 방식으로 변경. `gs.moonstone || 0` 방어 코드도 추가됨.

**2-6. getSolarBonus() 기본값 조정**

```javascript
// 변경 전
let perPanel = 0.10;
// 변경 후
let perPanel = 0.15;
```

태양광 패널 기본 보너스 +5%p 상향.

**2-7. game-data.js UPGRADES 비용 소폭 조정**

- `fuel_chem`: `{research:60,metal:50}` → `{research:45}` (금속 비용 제거, RP 비용 감소 — 연료 연구 진입 장벽 완화)
- `alloy`: `{research:150,metal:300}` → `{research:130,metal:250}` (비용 소폭 인하)

이상 없음. 트리 연결 구조(req 관계) 변경 없음.

**2-8. P7-2 애드온 가격과의 충돌 여부 확인**

P7-2 커밋(31c22a0)에서 애드온 가격을 5~10배 인상했고, P6-3 커밋(92124cf)은 game-data.js의 BUILDINGS baseRate/baseCost와 UPGRADES 비용만 수정했음. BUILDING_ADDONS 섹션은 P6-3에서 변경되지 않았으며, 현재 코드베이스의 BUILDING_ADDONS 가격이 P7-2 인상 값을 그대로 유지하고 있음:

| 애드온 | P7-2 인상 후 가격 | 현재 코드 가격 |
|--------|-----------------|--------------|
| addon_inv_bank | money:5,000 | money:5,000 |
| addon_tech_hub | money:8,000 | money:8,000 |
| addon_launch_ctrl | money:15,000, electronics:1,500 | money:15,000, electronics:1,500 |
| addon_vif | money:15,000, metal:2,000 | money:15,000, metal:2,000 |
| inv_derivatives | money:50,000 | money:50,000 |
| inv_hedge | money:150,000, electronics:2,000 | money:150,000, electronics:2,000 |
| ctrl_autonomous | electronics:10,000, research:5,000 | electronics:10,000, research:5,000 |
| vif_auto | metal:12,000, electronics:6,000 | metal:12,000, electronics:6,000 |

**충돌 없음.** P7-2의 높은 애드온 가격이 완전히 보존되어 있음.

**2-9. main.js 초기화 로직 충돌 여부 확인**

main.js의 `startNewGame()`, `enterGame()`, `init()` 등 초기화 함수는 P6-3에서 RES_MAX 한 줄만 수정되었고, 나머지 초기화 로직(gs.res 초기값, buildings 초기값 등)은 변경 없음. 충돌 없음.

### 판정: **PASS**

---

## 3. 검증 항목 3 — 구문 오류 검사

### 검증 방법
Node.js `--check` 플래그 및 inline 구문 파싱으로 각 파일 검사

### 결과

| 파일 | 검사 방법 | 결과 |
|------|---------|------|
| `js/game-data.js` | `node --check` | 오류 없음 |
| `js/game-state.js` | `node --check` | 오류 없음 |
| `js/main.js` | `node --check` | 오류 없음 |
| `index.html` (인라인 JS) | `new Function()` 파싱 (1블록) | 오류 없음 |

### 판정: **PASS**

---

## 최종 판정

| 항목 | 판정 |
|------|------|
| P7-5: world-bld 폰트 통일 | **PASS** |
| P6-3: K/M/B 경제 밸런싱 | **PASS** |
| 구문 오류 검사 (4파일) | **PASS** |
| P7-2 애드온 가격 보존 여부 | **PASS** |

### 종합 판정: **PASS**

Sprint 7 추가 커밋 2건(P7-5, P6-3)은 모든 검증 항목을 통과함.
P7-2와 P6-3의 수정 범위가 명확히 분리되어 충돌 없음.
빌드 진행 및 sprint/7 → master 머지 승인 가능.
