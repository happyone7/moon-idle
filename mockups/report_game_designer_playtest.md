# 기획팀장 플레이테스트 보고서 v2
날짜: 2026-02-20
분석 대상: MoonIdle sprint/1 HEAD (commit 87c690c)
분석자: GameDesigner (game-designer@soulspire.dev)

---

## 플레이 시뮬레이션 요약

### 0~10분 구간
게임 시작 시 타이틀 화면을 통해 새 게임을 선택한다. `startNewGame`에서 `gs.workers=2`, `gs.buildings.housing=1`로 초기화되며 자원은 전부 0이다. 발사(launch) 탭이 기본으로 열려 있고, 플레이어는 생산 탭을 클릭하는 것을 유도받는다. 생산 탭 첫 방문 시(`_prodHubVisited` 플래그) 운영센터와 연구소가 **무상으로 자동 건설**되며 workers가 2→4로 증가하고 연구 탭이 해금된다. 이 시점에서 money는 30/s, RP는 0.8/s로 생산이 시작된다. `basic_prod` 기술(research:10)을 약 12.5초 후 구매 가능하고, 광산(`bld_mine`) 해금 후 money:100으로 광산을 즉시 건설할 수 있다.

### 10~30분 구간
광산 건설 후 metal 생산이 시작(2.0/s × 1명)되고 연료 정제소, 전자공학 연구소 순으로 기술 트리를 따라 해금해 나간다. 첫 발사탭 해금에 필요한 최소 RP 합계는 basic_prod(10) + drill(50) + alloy(150) + rocket_eng(200) + launch_ctrl(300) = **710 RP**이며 RP 0.8/s 기준으로 순수 생산 시간만 약 14.8분이 소요된다(연구소 배치 인원과 업그레이드에 따라 가변). 이 구간에서 플레이어는 건물 구매, 인원 배치 조정, 기술 연구를 반복하며 자원 병목과 씨름한다. 특히 발사대 구매(`money:5000, metal:2000, electronics:500`)가 큰 허들이다.

### 30분~60분 구간
발사대 구매 후 5종 부품 제작을 완료하고 첫 PROTO-MK1 조립(20초)을 마치면 첫 발사가 가능하다. 초기 신뢰도는 56%로 매우 낮아 약 44%의 확률로 실패한다. 성공 시 문스톤 약 4개를 획득한다. 첫 발사 후 자동화 탭이 해금된다. 10발사 마일스톤을 달성하려면 PROTO 조립 자원(metal:76, fuel:32, electronics:44, research:25)을 반복 준비해야 한다. 프레스티지 이후에는 money:500으로 재시작하며 이전 unlocks와 workers, moonstone이 유지되어 2회차부터 진행 속도가 체감상 빨라진다.

---

## 발견된 문제 목록

### DESIGN-001: orbit_200 마일스톤 사실상 달성 불가 — CRITICAL 버그
- **심각도**: CRITICAL
- **구간**: 후반 (30분~)
- **현상**: `orbit_200` 마일스톤의 달성 조건은 발사 고도 200km 이상이다. 그러나 게임의 고도 계산 공식상 ELITE-MK4 품질로 가능한 최대 고도는 약 123km(elec_lab, fusion, lightweight 미적용 시)이며, ELITE + fusion + lightweight + elec_lab 100개 + 최대 연료 시설 조합으로도 고도는 약 200km 경계선(100개에서 199.7km, 101개에서 200.1km)이다. elec_lab 101번째 구매 비용은 money **469,725,380** 으로 사실상 달성 불가능한 수치다.
- **원인**: `js/game-state.js:304` — `const altitude = clamp(deltaV * 22, 0, 400)`; 이 선형 공식에서 200km 달성에 필요한 deltaV는 9.09 km/s이며, ELITE+fusion 최대 ISP(402 기준) 조합의 deltaV는 약 6.24 km/s에 그쳐 200km 도달이 거의 불가능하다. `js/game-data.js:239-241` — orbit_200 체크 조건: `gs.history.some(h => (h.altitude || 0) >= 200)`.
- **개선안**: 목표 고도 200km 달성 조건을 100~150km로 하향 조정하거나, 게임 내 deltaV 공식의 계수를 조정(예: `deltaV * 35` → ELITE로 약 196km 달성 가능)하거나, 마일스톤 보상 조건을 '궤도 고도 200km'가 아닌 '100km 이상 3회 달성' 등 달성 가능한 조건으로 교체한다.

---

### DESIGN-002: 연구 기술 TIER-6 두 항목이 아무 효과 없음 — CRITICAL 버그
- **심각도**: CRITICAL
- **구간**: 중반~후반 (연구 탭 사용 구간)
- **현상**: 연구 탭 TIER-6에 배치된 `auto_worker_assign`(research:150, electronics:100)과 `auto_assemble_restart`(research:200, electronics:150) 기술은 연구 포인트와 전자부품을 소비하지만 실제로 아무런 게임플레이 효과도 없다. 플레이어가 비용을 지불하고 연구해도 변화가 없어 혼란과 불만을 유발한다.
- **원인**: `js/game-data.js:61-62` — 두 기술 모두 `effect: () => {}`, `unlocks: []`로 정의되어 있다. 실제 자동화 기능은 `js/tabs/automation.js`의 `AUTOMATION_UPGRADES`의 `auto_worker`(문스톤 8개)와 `auto_assemble`(문스톤 15개)이 담당하는 별개 시스템이다. 두 시스템이 의미상 중복되면서 연구탭 버전은 빈 껍데기로 방치되었다.
- **개선안 A**: 연구 탭의 두 기술을 삭제하고 TIER_GROUPS에서 TIER-6를 제거한다. **개선안 B**: 두 기술에 고유 효과를 부여한다 — `auto_worker_assign`은 `auto_worker` 자동화 기능을 조건 없이 활성화(문스톤 비용 면제), `auto_assemble_restart`는 `auto_assemble` 기능을 조건 없이 활성화하는 '선행 해금' 역할로 설계한다.

---

### DESIGN-003: PHASE 2 이상 달성에 필요한 고도 기준 과도하게 높음 — HIGH
- **심각도**: HIGH
- **구간**: 중반~후반
- **현상**: 미션 탭의 PHASE 시스템은 PHASE 2(준궤도, 100km)부터 STD-MK2로 간신히 달성 가능하다(96km로 4km 부족). ADV-MK3로는 106km로 통과. PHASE 3(궤도, 200km)은 DESIGN-001과 연동되어 사실상 달성 불가능이다. PHASE 4(300km), PHASE 5(400km)는 현재 게임 시스템에서 수천 개의 건물 없이는 절대 도달 불가능하다.
- **원인**: `js/tabs/mission.js:148-153` — PHASES 배열에서 targetAlt 값이 지나치게 높게 설정되어 있다. 계산값: STD=96km, ADV=106km, ELITE=123km(최소 빌드 기준). `js/game-state.js:298-305` — deltaV 계산 공식의 구조적 한계.
- **개선안**: PHASE 목표 고도를 실제 달성 가능 범위로 재조정. 예: PHASE 1=50km(현재 OK), PHASE 2=80km, PHASE 3=100km, PHASE 4=115km, PHASE 5=120km. 또는 `deltaV * 22` 계수를 품질별로 다르게 적용하는 방식으로 고도 계산 공식 개선.

---

### DESIGN-004: housing 건물 구매가 유휴 인원만 생성하는 게임플레이 혼선 — HIGH
- **심각도**: HIGH
- **구간**: 초반~중반
- **현상**: 주거 시설(housing)을 구매하면 `gs.workers`가 +1 증가하지만 housing은 `produces: 'bonus'`이므로 인원 배치 슬롯을 제공하지 않는다. 결과적으로 housing 구매로 생긴 인원은 다른 생산 건물의 슬롯이 여유 있을 때만 활용되며, 그렇지 않을 때는 유휴 인원으로 쌓인다. housing 5개 연속 구매 시 workers=9이지만 ops_center+lab 슬롯만 있으면 유휴 인원=7명이 된다.
- **원인**: `js/tabs/production.js:39-40` — `buyBuilding` 함수에서 모든 건물 구매 시 일률적으로 `gs.workers = (gs.workers || 1) + 1`을 실행한다. housing은 인원 상한 역할인데 건물 구매 시 workers+1 로직이 중복 적용된다. `js/game-data.js:13` — housing의 baseRate:0이므로 생산 기여 없음.
- **개선안**: housing 구매 시 workers +1 로직을 별도로 처리하지 말고, housing 건물 수 자체가 workers 상한을 결정하도록 한다. 또는 housing 구매 화면에 "배치 가능한 인원 상한 증가"임을 명확히 안내하고, 현재 유휴 인원 수를 강조 표시하여 플레이어가 먼저 생산 건물을 구매하도록 유도한다.

---

### DESIGN-005: 첫 발사 신뢰도 56%로 실패 가능성이 너무 높음 — HIGH
- **심각도**: HIGH
- **구간**: 초반 (첫 발사)
- **현상**: 첫 발사 시 신뢰도가 56%에 불과하다. 연구소 1개가 있어도 57.9%에 그친다. 즉, 처음으로 20초 조립 후 발사했을 때 약 43%의 확률로 실패하고 문스톤 0개를 받는다. 첫 실패는 초보 플레이어에게 심각한 좌절감을 준다. 성공해도 문스톤 4개에 그쳐 프레스티지 동기가 약하다.
- **원인**: `js/game-state.js:300-303` — `reliability = clamp(56 + research_lab*1.9 + elec_lab*0.8 + reliabilityBonus + q.relBonus + addonRelBonus, 0, 99.5)`. 기본값 56이 과도하게 낮다. PROTO의 relBonus=0이므로 추가 보너스 없음. `js/game-data.js:37` — PROTO costMult:1.0, relBonus:0.
- **개선안**: 기본 신뢰도를 56에서 70으로 상향하거나, PROTO 품질의 relBonus를 +10으로 설정한다. 또는 첫 N회 발사(예: 3회)는 신뢰도 100%를 보장하는 '시범 발사' 개념을 도입한다. 목표: 첫 발사 성공률 80% 이상 확보.

---

### DESIGN-006: ELITE 조립 비용이 파트 비용 대비 비직관적인 0.32 계수 — MEDIUM
- **심각도**: MEDIUM
- **구간**: 중후반 (조립 탭)
- **현상**: 조립 비용 계산에서 `0.32`라는 매직 넘버가 사용된다. PROTO 조립 시 파트 합계 비용의 32%, ELITE 조립 시 파트 합계의 256%이 조립 비용으로 추가 부과된다. 이 수치의 의미가 UI에 전혀 설명되지 않으며, ELITE 조립 시 metal:614가 추가로 필요한데(파트 비용 metal:240의 2.56배) 이 비용이 얼마인지 사전에 파악하기 어렵다.
- **원인**: `js/game-state.js:328-332` — `getAssemblyCost`: `total[r] = (total[r] || 0) + Math.floor(v * q.costMult * 0.32)`. `0.32` 상수에 대한 주석 없음.
- **개선안**: 조립 비용 계수를 더 직관적인 값(예: 0.5 = 파트 비용의 50%)으로 변경하거나, 조립 탭 UI에서 "총 자원 소모 = 부품 제작 비용 + 조립 비용"을 명확히 표시한다. ELITE 조립 전에 총 소요 자원을 요약 표시하는 UI 개선도 필요하다.

---

### DESIGN-007: 프레스티지 후 연구탭이 해금 상태이나 RP 수입이 0인 혼란 상태 — MEDIUM
- **심각도**: MEDIUM
- **구간**: 프레스티지 직후
- **현상**: 프레스티지(confirmLaunch) 실행 후 `gs.unlocks`가 보존되어 연구 탭이 해금된 채로 유지되지만, `buildings.research_lab=0`이고 `_prodHubVisited=false`로 초기화된다. 플레이어가 연구 탭을 클릭하면 모든 기술이 잠금 상태이고 RP가 0/s로 생산되지 않는 상태가 된다. 연구 탭을 먼저 클릭하고 생산 탭을 늦게 방문하면 '왜 연구가 안 되지?'라는 혼란이 발생한다.
- **원인**: `js/tabs/mission.js:93-109` — `confirmLaunch`에서 `gs.unlocks = savedUnlocks`로 복원하지만 `gs._prodHubVisited = false`로 초기화. `js/main.js:15-39` — `_prodHubVisited` 플래그 기반 무상 건설 로직이 생산 탭 첫 방문 시에만 실행됨.
- **개선안**: 프레스티지 후 `_prodHubVisited`를 초기화할 때 연구 탭의 상태도 일관성 있게 처리한다. 방법 1: 프레스티지 후 연구 탭 unlocks도 리셋하고 연구소 재건 시 재해금. 방법 2: 프레스티지 직후 생산 탭으로 강제 전환하는 UX를 추가한다.

---

### DESIGN-008: PROTO 이후 품질 선택의 의사결정 가이드 부재 — MEDIUM
- **심각도**: MEDIUM
- **구간**: 중반 (첫 발사 이후)
- **현상**: 품질 선택기(proto/standard/advanced/elite)가 조립 탭과 발사 탭에 있지만, 어떤 품질을 선택해야 하는지에 대한 가이드가 없다. STD의 조립 비용은 PROTO의 2배이고 시간은 3배(60초)인데, 고도 개선은 89km→96km(+7%)에 그친다. 실질적으로 반복 발사를 통한 문스톤 파밍에서는 PROTO가 항상 최적 선택이 되는 문제가 있다.
- **원인**: `js/game-data.js:37-41` — QUALITIES 정의: PROTO(timeSec:20, rewardMult:1.0), STD(timeSec:60, rewardMult:1.5). 문스톤 보상 비율 대비 시간 비율 = STD는 60/20=3배 시간으로 1.5배 보상 → 시간당 효율이 PROTO의 50%에 그침. `js/game-state.js:310-313` — `getMoonstoneReward`: `base = Math.max(1, Math.floor((altitude/20) * rewardMult))`.
- **개선안**: STD 이상 품질의 시간당 문스톤 효율을 PROTO 대비 개선한다. 현재 STD는 PROTO 대비 시간당 효율이 50%(비효율). rewardMult를 조정하거나 timeSec을 낮추어 STD 이상 선택이 상황에 따라 합리적 결정이 되도록 한다. 예: STD timeSec을 40초로, rewardMult를 2.0으로 조정.

---

### DESIGN-009: 자원 'research'가 파트 제작과 기술 연구에 동시 소비되어 병목 발생 — MEDIUM
- **심각도**: MEDIUM
- **구간**: 중반 (조립 탭 해금 전후)
- **현상**: `control` 파트 제작 시 research:30, `payload` 파트 제작 시 research:50이 소비된다. `launch_ctrl` 기술 연구에도 research:300이 필요하다. 조립 직전 단계에서 파트 제작에 RP를 소비하면 `launch_ctrl` 연구를 위한 RP가 부족해지는 상황이 자주 발생한다. 또한 PROTO 조립 비용에도 research:25가 포함되어 반복 발사 시 RP 소비가 지속된다.
- **원인**: `js/game-data.js:31-33` — `control: {electronics:80, research:30}`, `payload: {electronics:40, research:50}`. `js/game-state.js:323-332` — `getAssemblyCost`에서 research도 조립 비용에 포함됨.
- **개선안**: `control`과 `payload` 파트의 research 비용을 제거하거나 다른 자원(전자부품 추가)으로 대체한다. 조립 비용에서 research를 제외하는 것도 검토한다. research는 기술 연구 전용 자원으로 역할을 명확히 분리하는 것이 UX상 명확하다.

---

### DESIGN-010: ten_launches 마일스톤 달성 가능성은 있으나 보상 의미 약함 — LOW
- **심각도**: LOW
- **구간**: 중후반
- **현상**: `ten_launches` 마일스톤 보상은 '전체 생산 +10% 영구'이다. PROTO 조립이 20초이고 부품은 영구 재사용되므로 10회 발사는 조립 자원(metal:760, fuel:320, electronics:440, research:250)만 확보하면 빠르게 달성 가능하다. 하지만 보상인 +10% 생산 보너스는 이 시점에 이미 다른 수단(moonstone 보너스, automation, 건물 업그레이드)으로 얻은 보너스 대비 체감이 미약하다.
- **원인**: `js/milestones.js:9` — `getMilestoneProdBonus`: ten_launches 달성 시 `return 1.1`. `js/game-data.js:249-250` — ten_launches check: `gs.launches >= 10`.
- **개선안**: ten_launches 보상을 +10% 생산 → 문스톤 즉시 +3개 + 영구 신뢰도 +5% 등 더 가시적인 즉각 보상으로 교체한다. 또는 마일스톤 요구 발사 수를 5회로 낮추고 보상을 강화하여 성취감을 높인다.

---

### DESIGN-011: 연료 정제소 건물의 propMass 기여가 사실상 무의미 — LOW
- **심각도**: LOW
- **구간**: 중반~후반
- **현상**: 연료 정제소(refinery)는 propMass를 +0.1/개, 극저온 플랜트(cryo_plant)는 +0.2/개 기여한다. 그러나 기본 propMass가 76으로 크기 때문에 refinery 10개를 건설해도 propMass는 76→77로 1.3% 증가에 그친다. 이로 인한 deltaV 및 고도 변화는 0~1km 수준이다.
- **원인**: `js/game-state.js:295` — `const propMass = 76 + gs.buildings.refinery * 0.1 + gs.buildings.cryo_plant * 0.2`. 계수 0.1/0.2가 기본값 76 대비 극히 작다. 계산 검증: refinery 10개 → propMass 77, deltaV 4.08(vs 4.05), alt 90km(vs 89km). 실질적 차이 없음.
- **개선안**: refinery의 propMass 기여를 +0.5/개, cryo_plant를 +1.0/개로 상향하거나, 연료 생산 건물이 deltaV에 직접 기여하는 별도 승수(예: 연료 건물 1개당 deltaV +0.5%) 방식으로 변경한다.

---

## 밸런스 수치 분석

### 초기 생산량 (코드 기반 실측)
| 항목 | 수치 | 코드 출처 |
|------|------|-----------|
| 초기 money 생산 | 30/s (ops_center 1개, 1명) | game-data.js:14, getProduction() |
| 초기 RP 생산 | 0.8/s (research_lab 1개, 1명) | game-data.js:22 |
| basic_prod 연구 가능 시점 | 12.5초 후 | research:10 / 0.8 = 12.5s |
| hire_worker_1 연구 가능 시점 | 25초 후 | research:20 / 0.8 = 25s |

### 파트 제작 총 비용 (partCostMult=1 기준)
| 자원 | 합계 |
|------|------|
| metal | 240 |
| fuel | 100 |
| electronics | 140 |
| research | 80 |

### 조립 비용 (quality별, getAssemblyCost 계산값)
| 품질 | 조립 시간 | metal | fuel | electronics | research |
|------|----------|-------|------|-------------|----------|
| PROTO | 20초 | 76 | 32 | 44 | 25 |
| STD | 60초 | 153 | 64 | 89 | 51 |
| ADV | 120초 | 307 | 128 | 179 | 102 |
| ELITE | 240초 | 614 | 256 | 358 | 204 |

### 발사 성능 수치 (빌드별, getRocketScience 계산값)
| 빌드 | deltaV(km/s) | 고도(km) | 초기 신뢰도(%) |
|------|-------------|---------|----------------|
| PROTO 기본 | 4.05 | 89 | 56.0 |
| PROTO + lab 1개 | 4.05 | 89 | 57.9 |
| STD 기본 | 4.37 | 96 | 64.0 |
| ADV 기본 | 4.83 | 106 | 72.0 |
| ELITE 기본 | 5.59 | 123 | 88.0 |
| ELITE + fusion + lightweight | 6.24 | 137 | 88.0 |

### 첫 발사 문스톤 보상
- PROTO: `Math.max(1, Math.floor((89/20) * 1.0)) + 0 = 4개` (성공 시)
- 발사 실패 시: 0개

### orbit_200 마일스톤 달성 임계값
- 필요 deltaV: 200/22 = **9.09 km/s**
- ELITE + fusion + lightweight + elec_lab **101개** 이상 필요
- elec_lab 101번째 구매 비용: money **469,725,380** → 사실상 불가능

### 건물 레벨업 비용 곡선
| 레벨 | money | metal |
|------|-------|-------|
| Lv0→1 | 300 | 80 |
| Lv1→2 | 600 | 128 |
| Lv2→3 | 1,200 | 204 |
| Lv3→4 | 2,400 | 327 |

### 예상 첫 발사까지 타임라인
| 구간 | 예상 소요 시간 | 주요 행동 |
|------|--------------|-----------|
| 게임 시작 → 기초 기술 | 0~5분 | 생산 탭 방문, basic_prod 연구, 광산 건설 |
| 자원 생산 확장 | 5~15분 | refinery, elec_lab, 추가 광산 건설 |
| 로켓 기술 연구 | 15~25분 | alloy, rocket_eng, launch_ctrl 연구 (RP 710 필요) |
| 발사대 + 부품 + 조립 | 25~40분 | 발사대 구매, 5종 파트 제작, PROTO 조립 |
| **첫 발사** | **약 35~45분** | 성공률 56% |

---

## 긍정적 요소

1. **온보딩 구조가 자연스럽다**: 생산 탭 첫 방문 시 운영센터와 연구소를 무상으로 지급하는 방식은 초보자가 게임 진입 장벽을 넘도록 잘 설계되어 있다. `_prodHubVisited` 플래그를 활용한 원샷 이벤트가 깔끔하다 (main.js:15-39).

2. **발사 애니메이션과 텔레메트리 연출이 완성도 높다**: T+0~T+20 단계별 텔레메트리, 로켓 ASCII 아트, 발사 오버레이의 조합이 게임의 핵심 보상 감각(발사 성공)을 잘 전달한다 (launch.js:81-126).

3. **오프라인 진행 보고서 시스템이 충실하다**: 8시간 상한의 오프라인 자원 계산, 자동 발사 결과 집계, 가독성 있는 복귀 보고서가 방치형 게임의 핵심 재미를 잘 구현했다 (game-state.js:548-686).

4. **문스톤 영구 보너스 시스템이 재미 있다**: `getMoonstoneMult() = 1 + moonstone * 0.05`로 문스톤 1개당 5% 생산 보너스가 누적되어 프레스티지 반복의 명확한 동기를 제공한다 (game-state.js:141).

5. **기술 트리 시각화가 직관적이다**: TIER별 수평 카드 레이아웃과 우측 상세 패널의 조합이 연구 탭에서 현재 상태를 빠르게 파악하게 한다. 잠금/가능/완료 상태가 색상으로 명확히 구분된다 (research.js:130-234).

6. **조립 탭의 ASCII 로켓 시각화가 독창적이다**: 부품 완성 여부에 따라 로켓 각 섹션의 색상이 변하는 방식이 진행도를 직관적으로 보여준다 (assembly.js:73-113).

---

## 우선순위 개선 제안 TOP 5

### 1순위: orbit_200 마일스톤 조건 수정 (DESIGN-001)
**영향**: 게임의 6개 마일스톤 중 1개(및 연동된 PHASE 3~5)가 현재 시스템에서 달성 불가능한 상태이다. 플레이어가 마일스톤 패널을 보고 목표를 설정했다가 수백 시간 후에도 달성이 안 되는 좌절을 경험한다. `js/game-data.js:239`의 check 조건 또는 `js/game-state.js:304`의 고도 계수를 수정한다.

### 2순위: 연구 탭 TIER-6 두 기술 효과 추가 또는 삭제 (DESIGN-002)
**영향**: 플레이어가 RP와 전자부품을 소비하고도 아무 변화 없는 기술을 연구하는 것은 직접적인 자원 낭비이자 게임 신뢰도 손상이다. `js/game-data.js:61-62`에서 즉시 수정 가능하며 영향 범위가 제한적이다.

### 3순위: 첫 발사 신뢰도 하한값 상향 (DESIGN-005)
**영향**: 첫 20초 조립 후 44% 확률로 실패하는 것은 초보 플레이어 이탈의 직접적 원인이 된다. `js/game-state.js:300`의 `56`을 `70`으로 수정하는 1줄 변경으로 첫 인상을 크게 개선할 수 있다.

### 4순위: 품질별 시간당 문스톤 효율 균형 조정 (DESIGN-008)
**영향**: 현재 STD는 PROTO 대비 시간당 효율이 50% 수준이라 선택의 의미가 없다. 반복 발사 구간(중반~후반)에서 STD 이상 품질을 선택할 실질적 이유가 없어 게임의 선택지가 단조로워진다. QUALITIES 배열의 timeSec 또는 rewardMult 수치를 조정한다.

### 5순위: 파트 제작에서 research 비용 제거 (DESIGN-009)
**영향**: control(research:30)과 payload(research:50)의 파트 제작 비용에서 research를 제거하면 '연구 포인트는 기술 연구에만'이라는 역할 분리가 명확해진다. 또한 조립 직전 RP 병목이 완화된다. `js/game-data.js:31-33`의 부품 cost 수정으로 간단히 적용 가능하다.
