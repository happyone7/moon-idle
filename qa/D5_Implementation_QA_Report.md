# D5 구현 QA 보고서

| 항목 | 내용 |
|------|------|
| **보고서 ID** | D5_Implementation_QA_Report |
| **작성자** | QA팀장 (QA Engineer) |
| **작성일** | 2026-02-25 |
| **검증 대상** | D5_Launch_Stage_Failure_Mechanics.md, D5_Rocket_ASCII_Art_Design.md |
| **검증 코드** | balance-data.js, game-state.js, game-data.js, tabs/launch.js, tabs/automation.js, tabs/assembly.js, rocket-ascii.js, index.html |

---

## A. 밸런스 데이터 검증

### A-1. BALANCE.LAUNCH_STAGES: sigmoid 파라미터 (k=0.08, mid=50, floor=60, ceiling=99.5)

**PASS**

- `balance-data.js` L162~178:
  - `sigmoid_k: 0.08` -- D5 표 7.2 일치
  - `sigmoid_mid: 50` -- D5 표 7.2 일치
  - `baseFloor: 60` -- D5 표 7.2 일치
  - `baseCeiling: 99.5` -- D5 표 7.2 일치

### A-2. BALANCE.LAUNCH_STAGES.stageWeights: 8단계별 4스펙 가중치

**PASS**

코드(L168~177)와 D5 표 3.3 대조:

| 단계 | D5 설계문서 | 코드 | 일치 |
|------|------------|------|------|
| 4 (LIFTOFF) | [0.15, 0.50, 0.20, 0.15] | [0.15, 0.50, 0.20, 0.15] | OK |
| 5 (MAX-Q) | [0.55, 0.10, 0.15, 0.20] | [0.55, 0.10, 0.15, 0.20] | OK |
| 6 (MECO) | [0.10, 0.40, 0.20, 0.30] | [0.10, 0.40, 0.20, 0.30] | OK |
| 7 (STG SEP) | [0.30, 0.15, 0.40, 0.15] | [0.30, 0.15, 0.40, 0.15] | OK |
| 8 (ORBIT) | [0.10, 0.20, 0.35, 0.35] | [0.10, 0.20, 0.35, 0.35] | OK |
| 9 (TLI) | [0.10, 0.45, 0.25, 0.20] | [0.10, 0.45, 0.25, 0.20] | OK |
| 10 (LOI) | [0.10, 0.20, 0.40, 0.30] | [0.10, 0.20, 0.40, 0.30] | OK |
| 11 (LANDING) | [0.15, 0.15, 0.45, 0.25] | [0.15, 0.15, 0.45, 0.25] | OK |

### A-3. BALANCE.SPEC_QUALITY_BONUS: proto/standard/advanced/elite

**PASS**

코드(L181~187)와 D5 표 8.2 대조:

| 품질 | D5 {s,p,a,t} | 코드 | 일치 |
|------|-------------|------|------|
| proto | {0,0,0,0} | {s:0, p:0, a:0, t:0} | OK |
| standard | {3,4,5,3} | {s:3, p:4, a:5, t:3} | OK |
| advanced | {6,8,10,6} | {s:6, p:8, a:10, t:6} | OK |
| elite | {10,12,15,10} | {s:10, p:12, a:15, t:10} | OK |

### A-4. BALANCE.SPEC_CLASS_BONUS: vega~artemis

**PASS**

코드(L190~198)와 D5 표 8.3 대조:

| 클래스 | D5 {s,p,a,t} | 코드 | 일치 |
|--------|-------------|------|------|
| vega | {0,0,0,0} | {s:0, p:0, a:0, t:0} | OK |
| argo | {3,5,2,2} | {s:3, p:5, a:2, t:2} | OK |
| hermes | {5,8,6,4} | {s:5, p:8, a:6, t:4} | OK |
| atlas | {4,10,8,7} | {s:4, p:10, a:8, t:7} | OK |
| selene | {2,12,10,10} | {s:2, p:12, a:10, t:10} | OK |
| artemis | {0,15,12,12} | {s:0, p:15, a:12, t:12} | OK |

### A-5. BALANCE.SPEC_RESEARCH_BONUS: 모든 연구 ID와 보정값

**PASS**

코드(L201~225)와 D5 표 8.4 대조:

| 연구 ID | D5 {s,p,a,t} | 코드 | 일치 |
|---------|-------------|------|------|
| alloy | {8,0,0,0} | {s:8, p:0, a:0, t:0} | OK |
| precision_mfg | {6,0,0,0} | {s:6, p:0, a:0, t:0} | OK |
| fuel_chem | {0,5,0,0} | {s:0, p:5, a:0, t:0} | OK |
| catalyst | {0,8,0,0} | {s:0, p:8, a:0, t:0} | OK |
| lightweight | {0,6,0,0} | {s:0, p:6, a:0, t:0} | OK |
| fusion | {0,10,0,0} | {s:0, p:10, a:0, t:0} | OK |
| cryo_storage | {0,3,0,0} | {s:0, p:3, a:0, t:0} | OK |
| electronics_basics | {0,0,5,0} | {s:0, p:0, a:5, t:0} | OK |
| microchip | {0,0,8,0} | {s:0, p:0, a:8, t:0} | OK |
| reliability | {0,0,10,0} | {s:0, p:0, a:10, t:0} | OK |
| telemetry | {0,0,6,0} | {s:0, p:0, a:6, t:0} | OK |
| automation | {0,0,5,0} | {s:0, p:0, a:5, t:0} | OK |
| hire_worker_1 | {0,0,0,5} | {s:0, p:0, a:0, t:5} | OK |
| launch_ctrl | {0,0,0,8} | {s:0, p:0, a:0, t:8} | OK |
| mission_sys | {0,0,0,8} | {s:0, p:0, a:0, t:8} | OK |
| multipad | {0,0,0,6} | {s:0, p:0, a:0, t:6} | OK |
| heat_recov | {0,0,0,8} | {s:0, p:0, a:0, t:8} | OK |
| rocket_eng | {2,2,0,0} | {s:2, p:2, a:0, t:0} | OK |

### A-6. BALANCE.ROLL_VARIANCE: sigma/max 값

**PASS**

코드(L228~233)와 D5 표 8.5 대조:

| 품질 | D5 {sigma, max} | 코드 | 일치 |
|------|-----------------|------|------|
| proto | {4.0, 8} | {sigma:4.0, max:8} | OK |
| standard | {2.5, 5} | {sigma:2.5, max:5} | OK |
| advanced | {1.5, 3} | {sigma:1.5, max:3} | OK |
| elite | {1.0, 2} | {sigma:1.0, max:2} | OK |

---

## B. 로직 함수 검증

### B-1. gaussianRandom(): Box-Muller 변환, log(0) 방지

**PASS**

`game-state.js` L435~440:
- Box-Muller 변환 정확히 구현: `Math.sqrt(-2 * Math.log(...)) * Math.cos(2 * Math.PI * u2)`
- log(0) 방지: `u1 || 1e-10` -- u1이 0일 경우 1e-10으로 대체 (D5 6.3 요구사항)

### B-2. generateRollVariance(): BALANCE.ROLL_VARIANCE 참조, 4스펙 독립 생성, clamp 적용

**PASS**

`game-state.js` L443~451:
- `BALANCE.ROLL_VARIANCE[qualityId]` 참조 확인
- 4스펙 독립 생성: structural, propulsion, avionics, thermal 각각 별도 `gaussianRandom()` 호출
- clamp 적용: `clamp(Math.round(gaussianRandom(0, rv.sigma)), -rv.max, rv.max)` -- D5 6.3과 일치

### B-3. computeSpecs(): 기본값 50 + 품질보너스 + 클래스보너스 + 연구보너스 + 편차, clamp(0,100)

**PASS**

`game-state.js` L454~475:
- 기본값 50 적용: `clamp(50 + qb.s + cb.s + rs + rv.structural, 0, 100)` 등 4스펙 모두 확인
- SPEC_QUALITY_BONUS 참조
- SPEC_CLASS_BONUS 참조
- SPEC_RESEARCH_BONUS 순회: `Object.keys(gs.upgrades)` 순회하면서 합산 -- D5 3.2 공식과 일치
- clamp(0, 100) 적용

### B-4. getStageSuccessRate(): 가중합 -> sigmoid -> floor~ceiling 매핑

**PASS**

`game-state.js` L484~491:
- 가중합: `specs.structural * w[0] + specs.propulsion * w[1] + specs.avionics * w[2] + specs.thermal * w[3]` -- D5 7.1 공식 일치
- sigmoid: `_sigmoid(score)` 호출 (L478~481) -- `1 / (1 + Math.exp(-k * (score - mid)))` 구현 확인
- floor~ceiling 매핑: `baseFloor + (baseCeiling - baseFloor) * _sigmoid(score)` -- D5 7.1 일치

### B-5. getRocketScience(): 기존 반환값 + 신규(specs, rollVariance, stageRates, overallRate)

**PASS**

`game-state.js` L493~522:
- 기존 반환: `deltaV, twr, reliability, altitude` -- 유지 확인
- 신규 추가:
  - `specs`: `computeSpecs()` 결과
  - `rollVariance`: rv 값 전달
  - `stageRates`: 단계 4~11에 대해 `getStageSuccessRate()` 계산한 객체
  - `overallRate`: `stageRates` 곱 * 100 (%) -- D5 7.4 일치
- 반환 구조: `{ deltaV, twr, reliability, altitude, specs, rollVariance: rv, stageRates, overallRate }` -- D5 9.1 일치

---

## C. 발사 판정 검증

### C-1. executeLaunch(): 단계별 개별 stageRates[i] 사용 (균등 분배 아님)

**PASS**

`launch.js` L324~335:
```javascript
for (let i = 4; i <= 11; i++) {
  const rate = isFirstLaunch ? 100 : sci.stageRates[i];
  const success = Math.random() * 100 < rate;
  stageRolls.push({ stage: i, success, rate });
  if (!success && firstFailStage === -1) firstFailStage = i;
}
```
- 각 단계별 `sci.stageRates[i]` 개별 적용 확인 -- D5 9.3 일치
- 균등 분배가 아닌 개별 단계 적용

### C-2. 첫 발사 자동 성공 규칙 유지 (gs.launches === 0)

**PASS**

`launch.js` L326: `const isFirstLaunch = gs.launches === 0;`
`launch.js` L330: `const rate = isFirstLaunch ? 100 : sci.stageRates[i];`
- 첫 발사 시 모든 단계 rate=100 적용 -- D5 8.7 일치

### C-3. gs.history에 specs, rollVariance, stageRates, overallRate 저장

**PASS**

`launch.js` L351~368:
```javascript
gs.history.push({
  ...
  overallRate: sci.overallRate.toFixed(1),
  specs: sci.specs,
  rollVariance: sci.rollVariance,
  stageRates: sci.stageRates,
  ...
});
```
- D5 9.4 요구사항(specs, rollVariance, stageRates, overallRate) 모두 저장 확인

---

## D. 조립 연동 검증

### D-1. 조립 완료 시 rollVariance 생성 및 gs.assembly.rollVariance에 저장

**PASS**

`game-state.js` L669~676 (`ensureRollVariance()` 함수):
- `getRocketCompletion() < 100`이면 return (100% 이상일 때만 실행)
- `gs.assembly.rollVariance`가 이미 있으면 무시
- `generateRollVariance(qid)` 호출 후 `gs.assembly.rollVariance`에 저장

호출 시점:
- `updateMfgJobs()` L736: 부품 공정 완료 시 `ensureRollVariance()` 호출
- `tickFuelInjection()` L796: 연료 100% 도달 시 `ensureRollVariance()` 호출

### D-2. 발사 시 저장된 rollVariance 사용 (새로 생성 아님)

**PASS**

`launch.js` L319~322:
```javascript
if (!gs.assembly.rollVariance) gs.assembly.rollVariance = generateRollVariance(q.id);
const rv = gs.assembly.rollVariance;
const sci = getRocketScience(q.id, classId, rv);
```
- 저장된 `gs.assembly.rollVariance` 우선 사용, 없으면 안전 생성 (폴백)

### D-3. 발사 후 rollVariance 초기화

**PASS**

`launch.js` L344: `if (gs.assembly) gs.assembly.rollVariance = null;`
- 발사 후 `rollVariance` null로 초기화 확인 -- 다음 로켓에서 새로 생성됨

---

## E. 애니메이션 검증

### E-1. 각 단계 타이밍 >= 5000ms (5초 최소)

**PASS**

`launch.js` L43~52 `STAGE_TIMING`:

| 단계 | duration(ms) | >= 5000? |
|------|-------------|----------|
| 4 (LIFTOFF) | 5000 | OK |
| 5 (MAX-Q) | 5000 | OK |
| 6 (MECO) | 5000 | OK |
| 7 (STG SEP) | 5000 | OK |
| 8 (ORBIT) | 5500 | OK |
| 9 (TLI) | 5500 | OK |
| 10 (LOI) | 5500 | OK |
| 11 (LANDING) | 6000 | OK |

> 참고: D5 ASCII 아트 설계서(표 3.1)에는 LIFTOFF 800ms, MAX-Q 1000ms 등 짧은 값이 제안되었으나, "총괄PD 지시: 단계별 최소 5초"가 반영되어 5000ms 이상으로 조정됨. 이는 정상적인 PD 오버라이드.

### E-2. LAUNCH_SUCCESS_FRAMES: 8단계 모두 프레임 존재

**PASS**

`rocket-ascii.js` L376~668 `LAUNCH_SUCCESS_FRAMES`:

| 단계 | 프레임 수 | 존재 |
|------|----------|------|
| 4 (LIFTOFF) | 4 | OK |
| 5 (MAX-Q) | 4 | OK |
| 6 (MECO) | 4 | OK |
| 7 (STG SEP) | 4 | OK |
| 8 (ORBIT) | 4 | OK |
| 9 (TLI) | 4 | OK |
| 10 (LOI) | 4 | OK |
| 11 (LANDING) | 4 | OK |

### E-3. STAGE_FAIL_FRAMES: 4존(ground/high_atm/space/lunar) 모두 프레임 존재

**PASS**

`rocket-ascii.js` L673~807 `STAGE_FAIL_FRAMES`:

| 존 | 프레임 수 | 존재 |
|----|----------|------|
| ground | 4 | OK |
| high_atm | 4 | OK |
| space | 4 | OK |
| lunar | 4 | OK |

### E-4. 실패 시 올바른 존의 프레임 사용

**PASS**

`launch.js` L132~137 `_getFailZone()`:
- stage <= 5: `ground` -- LIFTOFF(4), MAX-Q(5) -- D5 2.1 일치
- stage <= 7: `high_atm` -- MECO(6), STG SEP(7) -- D5 2.1 일치
- stage <= 9: `space` -- ORBIT(8), TLI(9) -- D5 2.1 일치
- else: `lunar` -- LOI(10), LANDING(11) -- D5 2.1 일치

`launch.js` L696~794: 실패 단계에서 `_getFailZone(stageIdx)` 호출 후 `STAGE_FAIL_FRAMES[zone]` 프레임 사용 확인

---

## F. UI 검증

### F-1. 스펙 바 그래프 (4대 스펙 + 바 + 수치 + 편차 표시)

**PASS**

`launch.js` L931~1016 `_renderSpecPanel()`:
- 4대 스펙 순회: `['structural', 'propulsion', 'avionics', 'thermal']`
- 바 그래프: `.lc-spec-bar-wrap > .lc-spec-bar-fill` (width: val%)
- 수치 표시: `.lc-spec-val` (정수 값)
- 편차 표시: `.lc-spec-var` (양수 `+N▲`, 음수 `N▼`, 0 `(0)`) -- D5 6.4 일치

CSS (`index.html` L1755~1783): 스펙 바, 편차 색상(pos=green, neg=red, zero=green-dim) 모두 정의

### F-2. 전체 예상 성공률 색상 분기 (95%+ green, 90~95% amber, <90% red)

**PASS**

`launch.js` L987: `const oc = overall >= 95 ? 'green' : overall >= 90 ? 'amber' : 'red';`
- 95% 이상: green
- 90~95%: amber
- 90% 미만: red

CSS: `.lc-spec-overall-val.green`, `.lc-spec-overall-val.amber`, `.lc-spec-overall-val.red` 모두 정의 (L1773~1775)

### F-3. 단계별 성공률 표시 (8단계, 약어 사용)

**PASS**

`launch.js` L938~941 `STAGE_ABBR`:
- 4:'LFT', 5:'MXQ', 6:'MECO', 7:'SEP', 8:'ORB', 9:'TLI', 10:'LOI', 11:'LAND'

`launch.js` L994~1013: 3줄로 렌더링 [4,5,6], [7,8,9], [10,11]
- 각 단계별 약어 + 소수점 1자리 성공률 + 색상(green/amber/red) -- D5 10.4 일치

### F-4. 조립 미완료 시 스펙 패널 숨김

**PASS**

`launch.js` L1162~1167:
```javascript
if (canLaunch && sci) {
  _renderSpecPanel(sci);
} else {
  const specEl = document.getElementById('lc-spec-panel');
  if (specEl) specEl.style.display = 'none';
}
```
- `canLaunch`가 false일 때 스펙 패널 `display:none` 처리

### F-5. 발사 중 스펙 패널 숨김

**PASS**

`launch.js` L245~248 `_runPreLaunchIgnition()`:
```javascript
['lc-checklist', 'lc-status-panel', 'lc-spec-panel', 'lc-readiness', 'lc-commit-box'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
});
```
- 발사 점화 시퀀스 시작 시 `lc-spec-panel` 숨김 처리 확인

---

## G. 호환성 검증

### G-1. 기존 save/load 호환 (gs 구조 변경이 기존 세이브 깨뜨리지 않는지)

**PASS**

- D5에서 추가된 필드: `gs.assembly.rollVariance` (발사 후 null 초기화)
- 기존 세이브에 `rollVariance`가 없으면 `ensureRollVariance()` / `executeLaunch()`에서 자동 생성
- `getRocketScience()` L511: `const rv = rollVariance || { structural:0, propulsion:0, avionics:0, thermal:0 };` -- 폴백 처리
- `computeSpecs()` L457: `const rv = rollVariance || { structural:0, propulsion:0, avionics:0, thermal:0 };` -- 폴백 처리
- `loadGame()`: 기존 세이브의 `assembly` 객체에 `rollVariance`가 없어도 문제 없음

### G-2. startNewGame()에서 새 필드 초기화

**WARN**

`main.js` L223: `gs.assembly = { selectedQuality:'proto', jobs:[] };`
- `selectedClass` 필드 누락! `gs`의 초기 정의(game-state.js L18)에는 `selectedClass:'vega'`가 있으나 `startNewGame()`에서는 포함하지 않음
- `rollVariance` 필드도 명시적으로 없으나, null이 기본이므로 큰 문제 아님
- 실질적 영향: `ensureAssemblyState()` (game-state.js L137~143)에서 `selectedClass`가 없으면 'vega'로 폴백하므로 런타임 오류는 발생하지 않음
- 다만 코드 정합성 관점에서 `selectedClass:'vega'`를 `startNewGame()`에 명시하는 것을 권장

### G-3. 자동화(automation.js) 연동 정상

**PASS**

`automation.js` L502~532 `_execAutoLaunch()`:
- D5 rollVariance 사용: L515~518에서 `gs.assembly.rollVariance` 확인, 없으면 `generateRollVariance()` 호출
- `getRocketScience()` 호출 시 rv 전달: L519
- `overallRate` 기반 성공률 체크: L523
- 단계별 성공률(`minStageRate`) 체크: L525~529
- EP 기대치 체크: L531~532

---

## 종합 판정

### 검증 결과 요약

| 카테고리 | 항목 수 | PASS | FAIL | WARN |
|----------|---------|------|------|------|
| A. 밸런스 데이터 | 6 | 6 | 0 | 0 |
| B. 로직 함수 | 5 | 5 | 0 | 0 |
| C. 발사 판정 | 3 | 3 | 0 | 0 |
| D. 조립 연동 | 3 | 3 | 0 | 0 |
| E. 애니메이션 | 4 | 4 | 0 | 0 |
| F. UI | 5 | 5 | 0 | 0 |
| G. 호환성 | 3 | 2 | 0 | 1 |
| **합계** | **29** | **28** | **0** | **1** |

### WARN 항목 상세

| # | 항목 | 위치 | 내용 | 영향도 |
|---|------|------|------|--------|
| W-1 | G-2 | `main.js` L223 | `startNewGame()`에서 `gs.assembly`에 `selectedClass:'vega'` 미포함 | 낮음 — `ensureAssemblyState()`에서 폴백 처리됨. 코드 정합성 개선 권장 |

### 최종 결론

## **GO** (출시 가능)

D5 설계 문서 2건(발사 단계별 실패 메카닉 + 로켓 ASCII 아트 디자인)의 모든 핵심 사양이 코드에 정확하게 구현되어 있음을 확인하였다.

- **밸런스 데이터**: sigmoid 파라미터, 8단계 가중치, 품질/클래스/연구 보정, 편차 범위 모두 D5 표와 1:1 일치
- **로직 함수**: Box-Muller 변환, 스펙 계산, 성공률 변환, getRocketScience 확장 모두 D5 공식과 일치
- **발사 판정**: 단계별 개별 성공률 적용, 첫 발사 자동 성공, 기록 저장 확인
- **조립 연동**: rollVariance 생성/저장/사용/초기화 사이클 정상
- **애니메이션**: 8단계 성공 프레임(각 4프레임), 4존 실패 프레임(각 4프레임), 단계당 5초 이상 타이밍, FAIL_SCALE 클래스별 스케일링 모두 구현
- **UI**: 스펙 바 그래프, 성공률 색상 분기, 단계별 약어, 패널 숨김 조건 모두 정상
- **호환성**: 기존 세이브 폴백 처리 정상, 자동화 연동 정상

WARN 1건(W-1)은 런타임 영향 없으므로 출시 차단 사유 아님. 다음 스프린트에서 코드 정합성 개선으로 처리 권장.
