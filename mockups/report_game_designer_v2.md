# 기획팀장 현황 분석 보고서 v2
작성: 기획팀장 (GameDesigner) | 날짜: 2026-02-20

---

## 1. 현재 게임 구조 요약

### 리소스 흐름 (생산 체인)

```
[돈(money)] ──→ 건물 구매 비용 (housing, mine, research_lab 초기 진입)
                     │
      ┌──────────────┼──────────────────────┐
      ▼              ▼                       ▼
 [금속(metal)]  [연구(RP)]              [전자(electronics)]
      │              │                       │
      ▼              ▼                       ▼
 연료(fuel) ←──── UPGRADES 해금 ──────→ 연료, 전자 시설 해금
      │
      ▼
  부품 제작 (engine/fueltank/control/hull/payload)
      │
      ▼
  조립 → 발사 → 문스톤(moonstone) 획득
      │
      ▼
  프레스티지(confirmLaunch) → 생산 +5%/문스톤 영구 배율
```

### 건물 목록과 역할

| 건물 ID | 이름 | 생산 | 기본 생산율 | 초기 비용 |
|---|---|---|---|---|
| housing | 주거 시설 | 인원 상한 +1 | - | 돈 150 |
| ops_center | 운영 센터 | 돈 | 30/s | 금속 50 |
| supply_depot | 보급 창고 | 돈 | 60/s | 금속 200, 전자 50 |
| mine | 철광석 채굴기 | 금속 | 2.0/s | 돈 100 |
| extractor | 보크사이트 추출기 | 금속 | 3.5/s | 돈 500, 금속 200 |
| refinery | 연료 정제소 | 연료 | 0.8/s | 돈 300, 금속 100 |
| cryo_plant | 극저온 플랜트 | 연료 | 2.0/s | 돈 1000, 금속 400, 전자 100 |
| elec_lab | 전자공학 연구소 | 전자 | 0.5/s | 돈 400, 금속 150 |
| fab_plant | 반도체 공장 | 전자 | 1.8/s | 돈 2000, 금속 800, 전자 200 |
| research_lab | 연구소 | RP | 0.8/s | 돈 300 |
| r_and_d | R&D 센터 | RP | 1.2/s | 돈 3000, 전자 500 |
| solar_array | 태양광 어레이 | 전체 +10%/개 | - | 돈 800, 전자 200 |
| launch_pad | 발사대 | 조립 슬롯 +1 | - | 돈 5000, 금속 2000, 전자 500 |

**핵심 생산 경로**: 초기에는 mine(금속) → ops_center(돈 교환용 금속 소비) 루프. research_lab(RP)은 돈만으로 구매 가능하여 초기 연구 진입점. 전자부품은 elec_lab 해금 전까지 조달 불가능.

### 연구 트리 구조 (TIER별 흐름)

```
TIER 0 (초기 진입):
  hire_worker_1 (RP 20)
  basic_prod (RP 10) → [bld_mine 해금]

TIER 1 (기초 생산 확장):
  drill (RP 50) → [bld_extractor 해금, 금속 +25%]
  fuel_chem (RP 60, 금속 50) → [bld_refinery 해금]
  electronics_basics (RP 80) → [bld_elec_lab, bld_supply_depot 해금]

TIER 2 (고급 시설):
  catalyst (RP 80, 연료 100) → [연료 +30%, bld_cryo_plant 해금]
  microchip (RP 100, 전자 80) → [전자 +35%, bld_fab_plant, bld_r_and_d 해금]
  alloy (RP 150, 금속 300) → [부품 비용 -20%, bld_r_and_d 해금]

TIER 3 (로켓 공학):
  automation (RP 200, 전자 200) → [전체 생산 ×1.5, bld_solar_array 해금]
  rocket_eng (RP 200, 금속 300) → [tab_assembly, bld_launch_pad 해금]
  reliability (RP 300) → [신뢰도 +15%]
  multipad (RP 400, 금속 1000) → [조립 슬롯 +1]
  lightweight (RP 250, 금속 800) → [건조질량 -10%, 재활용 +8%]

TIER 4 (최종):
  launch_ctrl (RP 300, 전자 200) → [tab_launch 해금]
  fusion (RP 500, 전자 400) → [Isp +22, 추력 +120kN, 문스톤 +1]
  mission_sys (RP 400) → [tab_mission 해금]
```

### 품질 등급 특성

| 등급 | 비용배율 | 조립 시간 | Isp 보너스 | 건조질량 배율 | 신뢰도 보너스 | 보상배율 |
|---|---|---|---|---|---|---|
| PROTO-MK1 | ×1.0 | 20초 | +0 | ×1.00 | +0% | ×1.0 |
| STD-MK2 | ×2.0 | 40초 | +15 | ×0.95 | +8% | ×2.0 |
| ADV-MK3 | ×4.0 | 80초 | +35 | ×0.88 | +18% | ×3.0 |
| ELITE-MK4 | ×8.0 | 240초 | +65 | ×0.78 | +32% | ×4.5 |

### 조립 → 발사 → 문스톤 → 프레스티지 루프

1. 5종 부품(engine/fueltank/control/hull/payload) 각 1회 제작
2. 선택한 품질로 조립 시작 (timeSec 동안 대기)
3. 조립 완료 후 `launchFromSlot()` 호출 → 성공/실패 판정 (`reliability%` 확률)
4. 성공 시 문스톤 획득: `max(1, floor((altitude/20) × rewardMult)) + fusionBonus + floor(launches/4)`
5. 문스톤은 `getMoonstoneMult()` = `1 + moonstone × 0.05`로 전체 생산 배율 영구 상승
6. `confirmLaunch()` 호출 시 프레스티지: 건물/업그레이드/부품 리셋, 문스톤/msUpgrades/기록 보존

---

## 2. 수치 기반 현황 진단

### 2-1. 초반 경제 흐름 분석

**초기 상태**: 돈 0, 건물 housing×1, 인원 1명

**최초 플레이 시나리오**:
- `basic_prod` 연구에 RP 10 필요 → research_lab 먼저 구매 필요 (비용: 돈 300)
- 초기 돈 0에서 돈 300 마련: ops_center가 먼저 없으므로 수입원 자체가 없음
- `ops_center`는 금속 50이 필요 → mine 없이는 금속 0 → **교착 상태 발생**

**실제 해결 경로**:
- `game-state.js` 기본값 확인: `gs.res = { money:0, ... }` — 초기 돈 0이며 ops_center는 금속 50 필요
- mine 기본 비용: 돈 100 → 역시 초기 돈이 없으면 구매 불가
- **결론**: 초기에 아무 자원도 없고 어떤 건물도 구매할 수 없는 경우가 발생할 수 있음

단, `confirmLaunch()` 프레스티지 리셋 코드를 보면:
```js
gs.res = { money:500, metal:0, fuel:0, electronics:0, research:0 };
```
프레스티지 후에는 돈 500으로 시작하나, **최초 신규 플레이어는 돈 0에서 시작**하는 것이 문제.

**첫 건물 구매 시점 추정**:
- mine 구매 비용 = 돈 100 → 초기 생산 수단 없으면 획득 불가
- 게임 초반 경제 진입구가 불명확 (코드 어디에도 초기 돈 지급 로직 없음, 프레스티지 경로 외)

### 2-2. QUALITY 효율 비교표

조립 비용은 `getAssemblyCost()` 참조:
```js
// 각 파트 비용 × partCostMult × q.costMult × 0.32
```

기본 파트 합산 비용 (partCostMult=1 가정):
- 5종 파트 기본 비용 합계: metal (80+60+30+100+20=290), fuel (40+60=100), electronics (20+80+60=160)
- `× 0.32` 적용 후 조립 추가 비용: metal×0.32=92.8, fuel×0.32=32, electronics×0.32=51.2

| 등급 | 조립 추가 비용 배율 | 조립 시간 | 예상 고도(기본) | 문스톤 보상 | 문스톤/시간 효율 |
|---|---|---|---|---|---|
| PROTO-MK1 | ×1.0 | 20초 | ~83km | ~4개 | 0.20/초 |
| STD-MK2 | ×2.0 | 40초 | ~120km | ~12개 | 0.30/초 |
| ADV-MK3 | ×4.0 | 80초 | ~155km | ~23개 | 0.29/초 |
| ELITE-MK4 | ×8.0 | 240초 | ~198km | ~44개 | 0.18/초 |

*고도 계산: `deltaV × 22`, deltaV = ISP × 9.81 × ln(m0/dryMass) / 1000*
*PROTO 기준: ISP=315, dryMass=28, propMass=76, m0=104*
*deltaV = 315 × 9.81 × ln(104/28) / 1000 ≈ 315 × 9.81 × 1.313 / 1000 ≈ 4.056 km/s*
*고도 = 4.056 × 22 ≈ 89.2 km (건물 보너스 0 기준)*

**효율 분석**: STD-MK2가 문스톤/시간 효율 최고. ELITE-MK4는 절대량은 크지만 시간당 효율 최저.

### 2-3. 마일스톤 조건과 보상 목록

| 마일스톤 | 달성 조건 | 보상 |
|---|---|---|
| 첫 금속 생산 | mine 1개 보유 | RP +5 즉시 |
| 로켓 설계도 완성 | 5종 부품 전부 제작 | 조립 시간 -10% 영구 (`getMilestoneAssemblyMult()` = 0.9) |
| 궤도 돌입 | 발사 고도 115km 이상 1회 | 문스톤 +5 즉시 |
| 달 탐사 시작 | 누적 발사 10회 | 전체 생산 +10% (`getMilestoneProdBonus()` = 1.1) |
| 산업 단지 완성 | 모든 건물 종류 1개씩 | 인원 상한 +2 |
| ELITE 클래스 발사 | ELITE-MK4로 첫 발사 | 문스톤 획득량 +20% (`getMilestoneMsBonus()` = 1.2) |

**산업 단지 완성 조건 문제**: `launch_pad` 포함 13종 건물 모두 1개씩 요구. `launch_pad` 비용 = 돈 5000, 금속 2000, 전자 500으로 최고 비용 건물이며, 이 조건은 사실상 후반부 달성.

### 2-4. 자동화 업그레이드 비용 진입 곡선

| 자동화 이름 | 문스톤 비용 | 선행 요건 | TIER |
|---|---|---|---|
| 긴급 인력 지원 | ◆1 | 없음 | 0 |
| 초기 생산 자금 | ◆2 | 없음 | 0 |
| 인원 확충 (MS 업) | ◆2 | 없음 | - |
| 건물 자동 건설 | ◆5 | 없음 | 0 |
| 주거 자동 업그레이드 | ◆5 | 없음 | 0 |
| 엔진/탱크/제어/선체/탑재체 파트 자동 제작 (각) | ◆6 | 없음 | 0 |
| 인원 자동 배치 | ◆8 | auto_build | 0 |
| 조립 자동 재시작 | ◆15 | auto_parts_hull | 1 |
| 애드온 자동 설치 | ◆10 | auto_worker | 1 |
| 애드온 업그레이드 자동화 | ◆12 | auto_addon | 1 |
| 발사 자동 실행 | ◆20 | auto_assemble | 2 |

**진입 최소 비용 분석**:
- 완전 자동화(auto_launch까지) 달성 최소 문스톤:
  1+2+5+5+6(×5)+8+15+10+12+20 = 1+2+5+5+30+8+15+10+12+20 = **108◆**
- 첫 발사에서 PROTO 기준 획득량: `floor((89/20) × 1.0) + 0 + 0 = 4◆` (건물 0개 기준)
- **완전 자동화까지 약 27회 이상 발사 필요** (초기에 발사당 평균 4◆ 가정)

### 2-5. 프레스티지 후 문스톤 배율 효과

```js
// game-state.js:141
function getMoonstoneMult() { return 1 + gs.moonstone * 0.05; }
```

| 문스톤 보유량 | 전체 생산 배율 | 효과 |
|---|---|---|
| 0개 | ×1.00 | 기본 |
| 5개 | ×1.25 | +25% |
| 10개 | ×1.50 | +50% |
| 20개 | ×2.00 | +100% |
| 40개 | ×3.00 | +200% |
| 100개 | ×6.00 | +500% |

**배율 공식이 선형**이므로 초기에는 매 문스톤 획득이 체감이 크나, 후반부로 갈수록 상대적 증가율 감소.

---

## 3. 발견된 게임플레이 문제점

### 문제 1: 초기 자원 교착(Bootstrap Problem) — 영향도: HIGH

**증거 코드 (game-state.js, line 4-6)**:
```js
let gs = {
  res: { money:0, metal:0, fuel:0, electronics:0, research:0 },
  buildings: { housing:1, ops_center:0, ... }
```

**증거 코드 (game-data.js, line 13-16)**:
```js
{ id:'ops_center', baseCost:{metal:50} },  // 금속 50 필요
{ id:'mine',       baseCost:{money:100} }, // 돈 100 필요
```

신규 플레이어는 돈=0, 금속=0으로 시작. mine 구매에 돈 100이 필요하고 ops_center 구매에 금속 50이 필요한데 초기 돈과 금속 모두 0이므로 어느 건물도 구매할 수 없는 교착 상태가 발생한다. 프레스티지 리셋 시에는 돈 500을 지급하지만(`confirmLaunch()` line 100), 최초 게임 시작 시에는 이 로직이 실행되지 않는다.

**예상 플레이어 반응**: "아무것도 못 하겠는데? 버그인가?" — 이탈률 급등 요인.

### 문제 2: ops_center 수익이 배치 인원에만 의존 — 영향도: HIGH

**증거 코드 (game-state.js, line 260-273)**:
```js
function getProduction() {
  BUILDINGS.forEach(b => {
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    if (assigned === 0) return;
    ...
  });
```

ops_center 기본 생산율(baseRate=30)이 `assigned=0`이면 완전히 생산을 하지 않는다. 인원을 배치하기 전까지 ops_center는 아무 수익도 없다. 그러나 초기에는 인원이 1명뿐이고 housing에 배치된 상태이므로 ops_center에 배치할 인원이 없다. 즉 첫 ops_center 구매 후 인원을 재배치하지 않으면 영원히 수익 0이 된다.

**예상 플레이어 반응**: "건물 샀는데 왜 생산이 0이지?" — 인원 배치 UI가 직관적이지 않다면 혼란 유발.

### 문제 3: ELITE-MK4 조립 시간 과도 — 영향도: MED

**증거 코드 (game-data.js, line 40)**:
```js
{ id:'elite', name:'ELITE-MK4', costMult:8.0, timeSec:240, ...rewardMult:4.5 }
```

ELITE 조립 시간 240초 = 4분. STD의 40초 대비 6배. 그러나 문스톤 보상 배율은 ×4.5로 시간 증가에 비해 보상이 낮다. 시간당 효율 계산 시 PROTO(0.20/초) → STD(0.30/초) → ADV(0.29/초) → ELITE(0.18/초) 순으로 ELITE가 가장 비효율적이다. 최고 등급이 시간 효율 최하라는 역설적 상황이 발생한다.

**예상 플레이어 반응**: "ELITE 쓸 이유가 없는데?" — 등급 다양성 훼손, 최고 등급에 대한 매력 상실.

### 문제 4: 연구 트리 진입 비용 vs. 초기 RP 생산 불균형 — 영향도: HIGH

**증거 코드 (game-data.js, line 44-46)**:
```js
{ id:'basic_prod', cost:{research:10}, req:null },        // 첫 연구
{ id:'hire_worker_1', cost:{research:20}, req:null },     // 기초 인원
```

`basic_prod` 비용 RP 10이 첫 관문. 그러나 research_lab 비용은 돈 300이고 초기 돈은 0. research_lab 없이는 RP 생산이 없다. 돈을 마련하려면 ops_center가 필요한데 ops_center는 금속 50, mine은 돈 100... 순환 교착이 심층적으로 얽혀 있다.

**예상 플레이어 반응**: 초반 수분~수십분을 아무런 진전 없이 보내거나 조기 이탈.

### 문제 5: 산업 단지 완성 마일스톤의 비현실적 조건 — 영향도: MED

**증거 코드 (game-data.js, line 258-263)**:
```js
{
  id: 'all_buildings',
  desc: '모든 건물 종류 1개씩 보유',
  check: gs => BUILDINGS.every(b => (gs.buildings && gs.buildings[b.id] || 0) >= 1),
}
```

launch_pad 포함 13종 모두를 1개씩 보유해야 달성. launch_pad 단일 구매 비용이 돈 5000, 금속 2000, 전자 500으로 게임 내 최고 비용이다. 이 마일스톤 보상(인원 +2)은 오히려 중반~초반에 필요한 것임에도 달성 시점이 너무 늦어 보상의 유용성이 감소한다.

### 문제 6: 발사 성공/실패 시 파트 소비 불명확 — 영향도: MED

**증거 코드 (assembly.js, line 34-54)**:
```js
function startAssembly(slotIdx) {
  ...spend(cost);   // 조립 시작 시 비용 소비
  gs.assembly.jobs[slotIdx] = { qualityId, startAt, endAt, ready:false };
}
```

조립 시작 시점에 비용을 소비하고, 발사 결과는 신뢰도 확률로 결정된다. 실패해도 조립 비용과 파트는 이미 소비된 상태. 이 구조는 맞으나, 발사 실패 시 플레이어가 "뭘 잃었는가"에 대한 명시적 피드백이 없다. `automation.js` line 287:
```js
notify(`[AUTO] ${q.icon} 자동 발사 ${icon}...`, rollSuccess ? 'amber' : 'red');
```
실패 알림만 있고 손실 자원 표시 없음.

### 문제 7: 자동화 탭 해금 조건의 불명확성 — 영향도: LOW

**증거 코드 (game-state.js, line 32)**:
```js
tab_automation: false, // 첫 발사 완료 후 자동 해금
```

자동화 탭이 첫 발사 후에야 해금되는데, 자동화 업그레이드를 구매하려면 문스톤이 필요하고 문스톤은 발사 후에만 획득 가능하므로 순서상 맞다. 그러나 자동화 탭 해금 조건을 코드에서 `checkAutoUnlocks()` 함수에 위임하고 있으며 해당 함수 구현체가 이 분석 대상 파일들에 없어 실제 동작이 불명확.

---

## 4. 개선안 (우선순위 순)

### [P1] 초기 자원 부트스트랩 해결

- **무엇을**: 신규 게임 시작 시 초기 돈 200~500 지급, 또는 초기 mine 1개 자동 제공
- **왜**: 현재 신규 플레이어는 아무런 자원 없이 시작해 첫 구매조차 불가능한 교착이 발생
- **어떻게**: `game-state.js`의 `gs` 초기값을 `res: { money:200, ... }`로 변경, 또는 `gs.buildings.mine:1`로 mine 초기 지급
  ```js
  // 수정 방향 (game-state.js)
  res: { money:200, metal:0, fuel:0, electronics:0, research:0 },
  ```
- **예상 효과**: 첫 1분 내 mine 구매 → RP 생산 진입 가능. 신규 이탈률 대폭 감소.

### [P2] ELITE 등급 시간 효율 재조정

- **무엇을**: ELITE-MK4 `timeSec` 240초 → 160초로 단축, 또는 `rewardMult` 4.5 → 6.0으로 상향
- **왜**: 현재 ELITE는 STD 대비 시간 효율이 낮아 선택 유인이 없음. 최고 등급은 최고 효율을 내야 함
- **어떻게**: `game-data.js` QUALITIES 배열 ELITE 항목 수정
  ```js
  { id:'elite', name:'ELITE-MK4', timeSec:160, rewardMult:6.0 }
  ```
- **예상 효과**: ELITE 시간당 효율 0.18 → 0.375/초로 명실상부 최고 등급 지위 확보

### [P3] 발사 실패 피드백 강화

- **무엇을**: 발사 실패 시 손실 자원/조립 비용 표시
- **왜**: 플레이어가 실패의 대가를 체감하지 못하면 긴장감이 없음
- **어떻게**: `automation.js`의 auto_launch 실패 분기에 손실 로그 추가
  ```js
  // 실패 시: 소비된 조립 비용을 히스토리에 기록하고 알림에 포함
  notify(`[AUTO] 발사 실패 — 조립 비용 손실: ${getCostStr(cost)}`, 'red');
  ```
- **예상 효과**: 신뢰도 시스템에 긴장감 부여, 고품질 등급 선택의 의미 강화

### [P4] 마일스톤 보상 시기 최적화

- **무엇을**: '산업 단지 완성' 마일스톤을 분할 — 기초 건물 6종 달성 / 전체 13종 달성 2단계로 분리
- **왜**: 현재 단일 조건이 너무 후반부라 중반 모멘텀이 없음
- **어떻게**: MILESTONES 배열에 중간 조건 추가
  ```js
  {
    id: 'basic_industry',
    desc: 'mine/refinery/elec_lab/research_lab/ops_center/housing 각 1개',
    reward: '인원 상한 +1 영구',
    check: gs => ['mine','refinery','elec_lab','research_lab','ops_center','housing']
                   .every(id => (gs.buildings[id]||0) >= 1),
  }
  ```
- **예상 효과**: 중반 플레이어에게 달성감 제공, 인원 +1 보상으로 경제 순환 가속

### [P5] 초기 RP 생산 진입 완화

- **무엇을**: `basic_prod` 연구 비용을 RP 10 → RP 5로 인하, 또는 game 시작 시 RP 10 초기 지급
- **왜**: 첫 연구까지 research_lab 구매 필요 → 돈 300 필요 → 초기 교착과 연계된 이중 장벽
- **어떻게**: `game-data.js` UPGRADES 배열에서 basic_prod 비용 수정
  ```js
  { id:'basic_prod', cost:{research:5}, ... }
  ```
  또는 게임 시작 시 research 초기값 설정: `res: { research:10 }`
- **예상 효과**: 첫 연구 트리 진입 시간 단축, 초반 리텐션 향상

---

## 5. 밸런스 수치 조정 제안표

| 항목 | 현재값 | 제안값 | 이유 |
|---|---|---|---|
| 초기 돈(gs.res.money) | 0 | 200 | Bootstrap 교착 해소 |
| ELITE timeSec | 240초 | 160초 | 시간당 효율 역전 현상 해소 |
| ELITE rewardMult | 4.5 | 6.0 | 최고 등급 선택 유인 강화 |
| basic_prod 비용 | RP 10 | RP 5 | 첫 연구 진입 장벽 완화 |
| orbit_200 마일스톤 고도 조건 | 115km | 100km | PROTO+mine 몇 개로 달성 가능하도록 현실화 |
| STD rewardMult | 2.0 | 2.5 | STD↔ADV 선택 폭 확대 |
| ADV timeSec | 80초 | 90초 | ADV→ELITE 전환 명확화를 위한 미세 조정 |
| ms_global_1 비용 | ◆6/회 | ◆5/회 | 초기 문스톤 투자 선택지 확대 |
| auto_launch 비용 | ◆20 | ◆15 | 완전 자동화 진입 가속, 중기 목표로 재설정 |
| research_lab 초기 비용(돈) | 300 | 200 | 첫 RP 생산 진입 가속 |
| mine 초기 비용(돈) | 100 | 80 | 초기 교착 완화 시너지 |

---

## 6. 다음 스프린트 추천 작업 (우선순위 Top 5)

### 1순위: 초기 게임 교착(Bootstrap) 수정 [긴급]
- `game-state.js`의 `gs.res.money` 초기값을 0 → 200으로 변경
- 최초 게임 로드 로직에서 신규 플레이어 판별 후 초기 자원 지급 보장
- 관련 파일: `game-state.js` (gs 초기값), `loadGame()` 함수 분기 추가
- **이유**: 신규 플레이어 첫 경험이 막히면 즉각 이탈. 다른 모든 개선이 의미 없어짐.

### 2순위: 품질 등급 시간 효율 역전 수정 [밸런스]
- ELITE-MK4 `timeSec` 240 → 160, `rewardMult` 4.5 → 6.0
- ADV-MK3 `rewardMult` 3.0 → 3.5 (STD↔ADV 격차 확보)
- 관련 파일: `game-data.js` QUALITIES 배열
- **이유**: 최고 등급의 시간 효율이 최저인 역전 현상은 게임 깊이를 훼손하는 핵심 밸런스 결함.

### 3순위: 마일스톤 중간 달성 구간 추가 [콘텐츠]
- '기초 산업 확립' 마일스톤 추가: mine/refinery/elec_lab/research_lab/ops_center/housing 각 1개
- 보상: 인원 +1 영구
- 관련 파일: `game-data.js` MILESTONES 배열, `milestones.js` `_applyMilestoneReward()` 케이스 추가
- **이유**: 현재 마일스톤 5번(산업 단지 완성)이 너무 후반 조건이라 중반 모멘텀 공백이 존재.

### 4순위: 발사 실패 피드백 및 성공/실패 이력 개선 [UX]
- 발사 실패 시 소비된 조립 비용을 화면에 명시적 표시
- 미션 탭 히스토리 테이블에 성공/실패 컬럼 추가 (현재 `h.success` 필드는 있으나 테이블에 미표시)
- 관련 파일: `tabs/mission.js` `renderMissionTab()` 히스토리 테이블
- **이유**: 신뢰도 시스템의 긴장감이 피드백 없이는 플레이어에게 전달되지 않음.

### 5순위: 자동화 탭 해금 로직 명시화 및 사전 안내 [UX]
- `checkAutoUnlocks()` 구현 현황 확인 및 tab_automation 해금 조건을 UI에 표시
- 첫 발사 전부터 "첫 발사 후 자동화 탭 해금" 안내 문구 생산 탭 또는 알림으로 표시
- 관련 파일: 메인 `index.html` 또는 `game-state.js`의 `checkAutoUnlocks` 함수
- **이유**: 플레이어가 목표를 알아야 진행 동기가 생김. 자동화 시스템은 게임 핵심 재미인데 존재 자체를 모를 수 있음.

---

*이 보고서는 기획팀장이 `game-data.js`, `game-state.js`, `tabs/mission.js`, `tabs/assembly.js`, `tabs/automation.js`, `milestones.js` 6개 소스 파일을 직접 분석하여 실제 코드 수치 기반으로 작성하였습니다.*
