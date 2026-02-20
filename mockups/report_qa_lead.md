# MoonIdle QA팀장 품질 보고서

작성일: 2026-02-20
작성자: QA팀장 (QAEngineer)
대상 브랜치: sprint/1
분석 파일: game-state.js, main.js, world.js, tabs/research.js, tabs/launch.js, game-data.js

---

## 1. 발견된 버그 목록 (심각도별)

### CRITICAL — 게임 진행 불가 수준

#### BUG-001: selectedTechId 전역 변수 중복 선언
- **파일**: `game-state.js:56` 및 `tabs/research.js:50`
- **재현 조건**: 게임 로드 후 연구 탭 진입 시 항상 발생. 연구 탭에서 `selectedTechId = null`로 초기화하는 let 선언이 game-state.js와 중복되어 `SyntaxError: Identifier 'selectedTechId' has already been declared` 런타임 오류를 유발할 수 있음. (strict mode 또는 모듈 환경에서 즉시 크래시)
- **예상 원인**: research.js가 game-state.js와 같은 전역 스코프에서 실행되는 단일 파일 구조임에도 불구하고, 두 파일 모두 `let selectedTechId = null;`을 선언함.
- **영향**: 비모듈(non-module) 스크립트 로딩 방식이라면 두 번째 let 선언이 `SyntaxError`를 일으켜 research.js 전체가 실행 불가 → 연구 시스템 완전 불능.

#### BUG-002: 문스톤 보상이 실제로 gs.moonstone에 반영되지 않음
- **파일**: `tabs/launch.js:8-20`
- **재현 조건**: 조립된 로켓을 발사하면 문스톤 보상 팝업이 표시되지만, `gs.moonstone`에 earned 값이 더해지는 코드가 없음.
- **예상 원인**: `launchFromSlot()` 함수에서 `pendingLaunchMs = earned`에 할당만 하고 `gs.moonstone += earned` 처리가 누락됨. 발사 오버레이에서 "계속하기" 버튼의 핸들러(`closeLaunchOverlay`)도 분석 범위에서 별도 구현을 찾을 수 없으므로 moonstone 반영 로직이 orphan 상태일 가능성이 높음.
- **영향**: 핵심 프레스티지 화폐 전혀 획득 불가 → 게임 장기 진행 완전 차단.

---

### HIGH — 주요 기능 오동작

#### BUG-003: 오프라인 보상 중복 적용 가능성 (calcOffline + tick 경쟁)
- **파일**: `game-state.js:533-550`, `game-state.js:556-564`
- **재현 조건**: `enterGame()` 내에서 `calcOffline()`이 호출된 직후 `setInterval(tick, 200)`이 등록됨. calcOffline에서 `gs.lastTick = now`를 설정하지만, 두 함수가 같은 이벤트 루프 싸이클에서 실행되면 첫 tick이 거의 즉시 호출되어 경미한 중복 생산이 발생할 수 있음. 더 큰 문제는 calcOffline 내부에서 `updateAssemblyJobs(now)`를 호출하고, 200ms 후 tick에서도 `updateAssemblyJobs(now)`를 다시 호출하는 구조임.
- **예상 원인**: 오프라인 계산과 일반 tick 간 lastTick 동기화 시점 불일치.
- **영향**: 조립 잡이 오프라인 중 완성된 경우 ready 상태가 중복 처리될 수 있음. `updateAssemblyJobs` 구현에 따라 이중 완성 처리 가능성 존재.

#### BUG-004: spend() 함수에 음수 방지 로직 없음
- **파일**: `game-state.js:233-235`
- **재현 조건**: `canAfford()` 체크 후 spend() 호출 사이에 tick이 끼어들어 자원이 감소하는 경우 (이론적 레이스 컨디션 — 단일 스레드 JS에서는 낮지만, 자원이 정확히 0에 근접한 상태에서 `getProduction()` 반환값이 음수인 경우 실제 발생 가능).
- **예상 원인**: `RESOURCES` 중 research 등은 research 탭 업그레이드 구매로 빠르게 소진될 수 있으며, 오프라인 계산 시 `prod[r.id] * elapsed`가 음수일 경우 자원이 음수로 내려갈 수 있음 (현재 모든 baseRate가 양수이므로 정상 생산에서는 발생 안 하지만, 버그나 데이터 수정 시 취약).
- **영향**: 음수 자원은 구매 로직 오동작 유발 (canAfford가 false를 반환해야 하는 상황에서 true 반환 가능성).

#### BUG-005: loadGame()의 defaultUnlocks에서 tab_launch, tab_assembly의 기본값 불일치
- **파일**: `game-state.js:459-480`
- **재현 조건**: 신규 세이브 데이터 없이 로드 시. gs 초기화(`game-state.js:23-42`)에서 `tab_launch: true, tab_assembly: false`이지만, `loadGame()` 내 `defaultUnlocks`에서는 `tab_launch: false, tab_assembly: false`로 정의됨.
- **예상 원인**: 세이브 데이터에 `unlocks` 키가 없는 경우(예: 구버전 세이브) `Object.assign({}, defaultUnlocks, saved.unlocks)` 병합 시 `tab_launch`가 false로 덮어써지며, 발사 탭이 잠기는 문제 발생.
- **영향**: 구버전 세이브 파일(unlocks 필드 누락) 불러오기 시 발사 탭 소실.

#### BUG-006: upgBuilding()의 레벨 표시 오프-바이-원 오류
- **파일**: `game-state.js:129`
- **재현 조건**: 건물을 업그레이드할 때마다 발생.
- **코드**: `notify(\`... Lv.${gs.bldLevels[bid] + 1} 업그레이드 완료\`)`
- **예상 원인**: `gs.bldLevels[bid]`는 업그레이드 횟수(0-based)인데, 이미 `+1`을 적용한 후 또 `+1`을 더해 표시함. 예를 들어 첫 업그레이드 후 bldLevels=1인데 "Lv.2 완료"라고 표시됨.
- **영향**: UI 레벨 표시가 항상 1 높게 표시 → 사용자 혼란.

---

### MEDIUM — UX 저해

#### BUG-007: 발사 애니메이션 중 renderAll() 호출 시 애니메이션 존 리셋
- **파일**: `tabs/launch.js:241-246`
- **재현 조건**: 발사 버튼 클릭 후 3.5초 애니메이션 재생 중, 500ms 주기의 `setInterval(renderAll, 500)`에 의해 `renderLaunchTab()`이 반복 호출됨. `launchInProgress` 플래그로 일부 보호하지만, `renderAll()`의 다른 부분(renderResources 등)이 호출되어 애니메이션 DOM 요소 외부 레이아웃을 변경할 수 있음.
- **예상 원인**: renderLaunchTab 내 `launchInProgress` 가드가 `preLaunch/animZone` 토글만 보호하고, 텔레메트리 DOM이나 launch-result는 보호하지 않음.
- **영향**: 발사 애니메이션 중 UI 깜빡임 또는 결과 패널 조기 소거 가능성.

#### BUG-008: 오프라인 계산에서 updateAssemblyJobs가 조립 완료를 처리하지만 이후 화면 갱신이 없음
- **파일**: `game-state.js:540`
- **재현 조건**: 오프라인 시간 동안 조립이 완료된 상태에서 게임 재진입 시.
- **예상 원인**: `calcOffline()`에서 `updateAssemblyJobs(now)` 호출 후 `renderAll()`을 호출하지 않음. (enterGame에서 calcOffline 후 renderAll을 나중에 호출하지만, 오프라인 배너 표시와 실제 조립 완료 알림이 동기화되지 않을 수 있음.)
- **영향**: 오프라인 후 조립 완료 여부가 즉각 UI에 반영되지 않을 수 있음.

#### BUG-009: 생산 허브 첫 방문 시 research_lab 배치 인원 미설정
- **파일**: `main.js:26-31`
- **재현 조건**: 신규 게임에서 생산 탭 최초 진입 시.
- **코드**: research_lab이 무상 건설될 때 workers +1을 추가하지만 `gs.assignments.research_lab = 1`을 설정하지 않음. ops_center는 `gs.assignments.ops_center = 1`을 설정하는데 research_lab은 누락.
- **영향**: 연구소 무상 건설 후 인원이 배치되지 않아 RP 생산이 즉시 시작되지 않음 → 신규 플레이어 혼란.

#### BUG-010: 세이브 슬롯 모달에서 lastTick 날짜 표시가 NaN 또는 1970년으로 표시될 수 있음
- **파일**: `main.js:228`
- **재현 조건**: lastTick이 0이거나 누락된 세이브 슬롯 로드 시.
- **코드**: `const date = new Date(s.lastTick).toLocaleDateString('ko-KR')` — lastTick이 0이면 "1970. 1. 1."로 표시됨.
- **영향**: 슬롯 정보 혼란.

#### BUG-011: 연구 탭 RP 수입원 계산에서 getBldUpgradeMult, getAddonMult 미반영
- **파일**: `tabs/research.js:144-148`
- **재현 조건**: 연구소에 건물 업그레이드 또는 애드온 설치 후 연구 탭 진입 시.
- **코드**: `const rate = b.baseRate * assigned * (prodMult.research || 1) * globalMult * getMoonstoneMult() * getSolarBonus()` — `getBldProdMult(b.id)`, `getBldUpgradeMult(b.id)`, `getAddonMult(b.id)`가 누락됨. 반면 `getProduction()`에서는 이 값들이 모두 반영됨.
- **영향**: 연구 탭의 "RP 수입원" 패널이 실제 생산량보다 낮게 표시됨 (숫자 불일치 → 신뢰도 하락).

---

### LOW — 사소한 이슈

#### BUG-012: fmtTime()이 오프라인 배너에서 초 단위 오프라인을 "0s"로 표시
- **파일**: `game-state.js:541`
- **재현 조건**: 오프라인 시간이 1분 미만인 경우 (`mins === 0`이므로 배너 미표시).
- **영향**: 5~59초 오프라인 시 배너 표시 없음. 미미하나 누락된 피드백.

#### BUG-013: `_getBldSlotCost()`가 bldLevels를 사용하여 슬롯 업그레이드와 건물 업그레이드 비용 동일 키 사용
- **파일**: `world.js:381-384`
- **재현 조건**: 건물 업그레이드(`upgBuilding`)와 슬롯 업그레이드(`buyBldSlotUpgrade`)가 모두 `gs.bldLevels[bid]`를 공유함. 따라서 어느 한쪽을 많이 구매하면 다른 쪽 비용도 함께 올라감.
- **영향**: 두 업그레이드 경로의 비용이 서로 간섭 — 의도된 설계인지 불명확하나 경제 균형 리스크.

#### BUG-014: `selectTech()` 레거시 함수가 buyUpgrade()를 직접 호출
- **파일**: `tabs/research.js:236-239`
- **재현 조건**: 외부에서 selectTech(uid) 호출 시 구매가 바로 실행됨.
- **영향**: "kept for compatibility" 주석 있으나, 실수로 호출 시 자원 소모 발생.

#### BUG-015: 세이브 삭제 후 saveGame() 자동 인터벌이 이전 슬롯에 기록할 수 있음
- **파일**: `main.js:297`
- **재현 조건**: 게임 진행 중 인게임 슬롯 전환 기능이 없는 현재 구조에서 타이틀로 돌아가지 않고 슬롯을 바꾸는 경우.
- **영향**: 현재는 타이틀 경유만 가능하므로 낮은 위험이나, 향후 기능 추가 시 취약점.

---

## 2. 세이브/로드 시스템 분석

### 마이그레이션 체인 견고성

**긍정적 측면:**
- `migrateLegacySave()`가 레거시 키(`moonIdle_v2`)를 슬롯1로 이전하며, 슬롯1 점유 여부를 먼저 확인함. 안전한 단방향 이전.
- `loadGame()`의 `Object.assign({}, defaultUnlocks, saved.unlocks)` 패턴은 미래 unlock 키 추가 시 backward compatibility를 보장함.
- 모든 세이브 관련 작업이 try-catch로 감싸져 있어 JSON 파싱 실패 시 게임이 크래시되지 않음.
- 업그레이드 side-effect(reliabilityBonus, slotBonus 등)를 로드 시 재적용하는 구조는 올바름.

**취약점:**

1. **버전 필드 미검증**: `loadGame()`에서 `saved.saveVersion`을 읽지 않음. `gs.saveVersion = 2`로 정의되어 있으나 실제 마이그레이션 분기 로직이 없음. 버전 1 세이브(어셈블리 에라 이전 데이터)가 로드되더라도 버전 체크 없이 병합 시도함.

2. **손상 데이터 처리**: `getSaveSlots()`에서 JSON 파싱 실패 시 `{ slot: i, empty: true }`를 반환함. 슬롯이 "빈 것처럼" 보이지만 실제로는 localStorage에 데이터가 남아 있어 "새 게임" 선택 시 덮어쓰기 확인 없이 기존 데이터가 삭제될 위험 없음(empty로 처리되므로 confirmNewInSlot이 아닌 doNewGameInSlot으로 직행). 이는 손상된 세이브에 대한 복구 옵션이 없음을 의미함.

3. **partial merge 위험**: `Object.assign(gs.res, saved.res)`는 saved.res에 없는 키(예: 미래에 추가될 리소스 타입)를 gs.res에서 지우지 않으나, saved.res에 알 수 없는 키가 있는 경우 gs.res에 오염됨.

4. **addons 재적용 중 slotBonus 누적 오류**: `loadGame()` 라인 504-522에서 add-on immediate effect를 재적용할 때, `partCostMult *= (1 - opt.effect.partCostReduct)` 방식을 사용함. `partCostMult`는 라인 485에서 1.0으로 초기화되므로 올바름. 그러나 `reliabilityBonus`, `slotBonus`는 0으로 초기화된 후 addon과 addonUpgrade 두 경로에서 모두 누산됨. 만약 addon effect에 rel이 있고 addonUpgrade에도 rel이 있으면 두 번 더해짐 — 이것은 **의도된 설계**이므로 버그가 아니나, BUILDING_UPGRADES의 rel도 같은 루프 위(라인 495-503)에서 재적용되므로 세 경로가 누산됨을 확인해야 함.

5. **localStorage 용량 초과 미처리**: `saveGame()`의 try-catch가 QuotaExceededError를 무시함. 알림 없이 세이브 실패 시 플레이어가 진행 내용 손실 사실을 알 수 없음.

---

## 3. 게임 루프 안정성

### tick() 함수 엣지케이스

```
// game-state.js:556-564
function tick() {
  const now = Date.now();
  const dt = Math.min((now - gs.lastTick) / 1000, 1);  // 최대 1초 클램프
  gs.lastTick = now;
  ...
}
```

- **최대 dt 클램프**: `Math.min(..., 1)`로 1초 클램프 → 200ms 인터벌 정상 동작 시 dt는 항상 ~0.2초. 브라우저 탭 비활성(숨겨진 탭) 시 타이머가 최소 1초로 제한될 수 있으나 클램프로 보호됨.
- **자원 음수 방지 없음**: `gs.res[r.id] = (gs.res[r.id] || 0) + prod[r.id] * dt` — 모든 baseRate가 양수이므로 현재는 문제 없으나, 미래 소비형 리소스 추가 시 음수 전환 취약점 존재.
- **getProduction() 반복 호출 비용**: tick(200ms) + renderAll(500ms)이 각각 getProduction()을 호출함. 건물 수가 증가할수록 호출 비용이 증가하지만, 현재 건물 수(13개)에서는 무시할 수 있는 수준.

### 오프라인 계산 정확도

```
// game-state.js:533-550
const elapsed = Math.min((now - gs.lastTick) / 1000, 8 * 3600);  // 8시간 상한
```

- **8시간 상한**: 방치형 게임으로서 합리적인 상한선.
- **5초 미만 무시**: `if (elapsed < 5) { gs.lastTick = now; return; }` — 의도적 설계이나, 4.9초 오프라인 시 생산 완전 무시. 체감 불공평할 수 있음.
- **조립 잡 오프라인 처리**: `updateAssemblyJobs(now)` 호출은 오프라인 중 완성된 조립을 처리함. 단, 이 함수가 분석 대상 파일에 없으므로 구현 검증 불가 (별도 파일 존재 추정).
- **연속 오프라인 계산 중 복리 없음**: 오프라인 자원 생산이 단순 선형(`prod * elapsed`)이므로 solar_array 등 생산 배율 누적 효과 없음 — 방치형 게임 설계상 허용 범위.

### 리소스 음수 방지

현재 tick에서 리소스 음수 방지 코드 없음. 모든 생산이 양수인 현재 설계에서는 실질적 위험 없으나, 향후 유지보수 위험. `Math.max(0, ...)` 클램프 추가 권장.

---

## 4. 입력/이벤트 처리 이슈

### 마우스 이벤트 릴레이 안정성

`world.js:929-986`의 히트 테스트 기반 hover 시스템에서 발견된 이슈:

1. **두 개의 mousemove 리스너 등록 (world.js:904, 930)**: `initWorldDrag()`에서 drag 처리용 mousemove와 hover 릴레이용 mousemove를 별도로 등록함. 두 리스너가 모든 mousemove 이벤트에서 실행됨 — 성능 저하 가능성 (throttle 없음).

2. **querySelectorAll 반복 호출**: hover 릴레이 리스너에서 `document.querySelectorAll('.world-bld[data-bid]')`를 매 mousemove마다 DOM에서 재질의함. 렌더링 시마다 buildings-layer가 `innerHTML = ''`로 재생성되므로 캐싱 불가 — 60fps 마우스 이동 시 성능 부담.

3. **overlay hover 유지 로직**: 오버레이 내부 커서 유지 시 `clearTimeout(_bldOvTimer)` 호출하는 로직은 올바름. 그러나 `bldOv.addEventListener('mouseleave', closeBldOv)` (world.js:981)와 `scheduleBldOvClose()` (world.js:972) 두 경로가 모두 오버레이를 닫으려 함 — 150ms 지연 vs 즉시 닫기 불일치.

4. **addonPre hover 이벤트 없는 경우**: addonChoice 없는 경우 `pointerEvents: 'none'`으로 설정되어 hover가 불가능함. 부모 hover 시 opacity 0.2로 표시되지만, 마우스가 addonPre 영역으로 들어가면 pointerEvents 없으므로 곧바로 부모 mouseleave가 발생 → scheduleBldOvClose 호출 → 오버레이 닫힘. 애드온 미설치 상태에서 애드온 슬롯 위치에 커서를 가져가면 오버레이가 즉시 닫히는 UX 문제.

### 빠른 클릭/탭 전환 시 레이스 컨디션

1. **생산 허브 첫 방문 중복 트리거**: `switchMainTab('production')`을 빠르게 여러 번 호출하면 `gs._prodHubVisited` 체크가 비동기 setTimeout(200ms, 500ms) 내에서 이루어지므로, 첫 번째 호출에서 `gs._prodHubVisited = true`를 설정하기 전에 두 번째 호출이 진입하는 경우 무상 건물이 두 번 건설될 수 있음. (main.js:15-37)
   - 실제로는 `gs._prodHubVisited = true`가 setTimeout 외부(라인 16)에서 즉시 설정되므로 안전하지만, notify의 setTimeout 내부에서만 hubChanged가 트리거되는 구조는 혼란스러움.

2. **bovClick 중 오버레이 재랜더링**: `bovClick()` → `buyBldUpgrade()` → `renderAll()` → `updateWorldBuildings()` 순서로 실행되면 buildings-layer가 innerHTML 초기화로 재생성됨. 이때 `_bldOvActions` 배열은 여전히 이전 상태를 참조하므로, 빠른 더블클릭 시 이미 구매된 업그레이드를 다시 클릭하는 상황이 발생할 수 있음. `buyBldUpgrade()` 내부의 `if (gs.bldUpgrades[upgId])` 중복 체크로 실제 이중 구매는 방지되나, 불필요한 notify("이미 완료된 업그레이드") 출력이 발생할 수 있음.

3. **launchFromSlot 중복 발사**: `launchFromSlot()` 함수에 `launchInProgress` 가드가 없음. 발사 버튼을 빠르게 두 번 클릭하면 같은 슬롯에서 두 번 발사가 시도될 수 있음. 첫 번째 호출에서 `gs.assembly.jobs[slotIdx] = null`이 설정되므로 두 번째 호출에서 `if (!job || !job.ready) return`으로 방어되지만, 버튼 비활성화가 renderAll 이후에만 갱신되므로 300-500ms 창에서 중복 클릭 위험 존재.

---

## 5. 회귀 테스트 체크리스트 (Playwright 기준)

총 20개 테스트 시나리오:

### 세이브/로드 (5개)

1. **TC-001** [세이브 마이그레이션]: `localStorage`에 `moonIdle_v2` 키를 수동 주입 후 게임 로드 → `moonIdle_slot_1`로 이전되고 `moonIdle_v2` 키 삭제 확인.

2. **TC-002** [슬롯 덮어쓰기 확인]: 슬롯1에 데이터 존재 상태에서 "새 게임" 클릭 → 슬롯1 클릭 → 덮어쓰기 확인 모달 표시 → 취소 시 기존 데이터 보존 확인.

3. **TC-003** [손상 데이터 내성]: `moonIdle_slot_1`에 `{ invalid json }` 주입 후 게임 로드 → 슬롯이 "빈 슬롯"으로 표시되고 크래시 없음 확인.

4. **TC-004** [오프라인 자원 보상]: `gs.lastTick`을 10분 전으로 설정 후 페이지 새로고침 → 오프라인 배너 표시 및 자원이 증가했음을 확인.

5. **TC-005** [업그레이드 효과 로드 후 복원]: automation 업그레이드 구매(globalMult ×1.5) 후 세이브 → 새로고침 후 production rate가 동일한지 확인.

### 건물/생산 시스템 (5개)

6. **TC-006** [생산 허브 첫 방문]: 신규 게임 시작 → 생산 탭 최초 클릭 → ops_center와 research_lab이 각각 1개 건설되고 workers가 +2 증가함을 확인.

7. **TC-007** [인원 배치 슬롯 한도]: mine 건물 1개(슬롯 1개) 상태에서 인원 2명 배치 시도 → 두 번째 배치에서 "슬롯 수용 한도 초과" 알림 확인.

8. **TC-008** [건물 업그레이드 이후 생산량 변화]: ops_center에 ops_sales 업그레이드 구매 → 생산량이 ×1.35 증가했음을 수치로 확인.

9. **TC-009** [태양광 어레이 보너스 반영]: solar_array 2개 구매 → 전체 생산 보너스가 +20% 적용되었는지 resources 패널 rate 변화로 확인.

10. **TC-010** [애드온 A/B 선택 후 변경 불가]: ops_center에 addon_inv_bank 설치 후 오버레이 재오픈 → 다른 애드온 옵션 버튼 비활성 또는 미표시 확인.

### 연구 시스템 (4개)

11. **TC-011** [선행 연구 미완료 시 구매 불가]: research 탭에서 `drill` 카드 클릭 → `basic_prod` 미구매 상태에서 "연구 실행" 버튼 disabled 확인.

12. **TC-012** [연구 구매 후 잠금 해제]: `basic_prod` 구매 → bld_mine 언락 확인 (생산 탭에서 광산 건설 버튼 표시).

13. **TC-013** [automation 구매 후 전역 배율 반영]: automation 구매 전후 모든 생산 건물의 생산량이 ×1.5 증가함을 확인.

14. **TC-014** [연구 탭 선택 상태 유지]: 연구 카드 클릭 후 다른 탭 전환 → 연구 탭 복귀 시 선택 카드 상태 유지 (selectedTechId 복원) 확인.

### 조립/발사 시스템 (4개)

15. **TC-015** [부품 없이 조립 시작 불가]: 부품 보유 없이 조립 시작 버튼 → disabled 상태 확인.

16. **TC-016** [조립 진행 시간 카운트다운]: PROTO-MK1 조립 시작(timeSec:30) → 30초 후 슬롯이 "발사 준비!" 상태로 전환됨을 확인.

17. **TC-017** [발사 후 문스톤 반영]: 로켓 발사 → 발사 오버레이에 표시된 earned 값이 gs.moonstone에 실제로 반영됨을 확인 (BUG-002 검증).

18. **TC-018** [GO/NO-GO 체크리스트]: launch_pad 미건설 상태 → chk_pad NO-GO 및 발사 버튼 disabled 확인. launch_pad 건설 후 → GO 전환 및 버튼 활성화 확인.

### 엣지케이스/회귀 (2개)

19. **TC-019** [빠른 탭 전환 중 workers 중복 부여]: 생산 탭을 1초 내 5회 빠르게 클릭 → workers 총 인원이 초기화 후 정확히 +2만 증가함을 확인 (중복 건물 생성 없음).

20. **TC-020** [세이브 버전 불일치 내성]: saveVersion이 없거나 1인 세이브 데이터 주입 → 로드 성공하고 defaultUnlocks 기본값이 올바르게 적용됨을 확인. 특히 tab_launch가 true로 설정되는지 검증.

---

## 6. 우선순위 수정 과제 TOP 5

### 1순위 — BUG-002: 문스톤 미반영 (CRITICAL)
`launchFromSlot()`에서 `gs.moonstone += earned` 추가 필요. `closeLaunchOverlay()` 함수 위치 파악 및 확인 필요. 방치형 게임의 핵심 프레스티지 화폐가 동작하지 않으면 장기 플레이 가치 없음.

### 2순위 — BUG-001: selectedTechId 중복 선언 (CRITICAL)
`tabs/research.js:50`의 `let selectedTechId = null;` 선언 제거 필요. game-state.js의 전역 변수를 재사용하도록 변경. 스크립트 로딩 순서에 따라 연구 시스템 전체가 비활성화되는 런타임 오류.

### 3순위 — BUG-005: loadGame defaultUnlocks 불일치 (HIGH)
`game-state.js:464`의 `tab_launch: false`를 `tab_launch: true`로 수정. 구버전 세이브 로드 시 발사 탭이 사라지는 치명적 UX 버그.

### 4순위 — BUG-009: 연구소 무상 건설 시 인원 미배치 (MEDIUM)
`main.js:29` 이후에 `if (!gs.assignments) gs.assignments = {};` 및 `gs.assignments.research_lab = 1;` 추가. 신규 플레이어 온보딩의 핵심 경험 품질 저하.

### 5순위 — BUG-011: 연구 탭 RP 수입원 계산 불일치 (MEDIUM)
`tabs/research.js:145`의 rate 계산식에 `getBldProdMult(b.id) * getBldUpgradeMult(b.id) * getAddonMult(b.id)` 추가. `getProduction()`과 동일한 계산식 사용 권장. 수치 불일치는 게임의 신뢰도를 직접적으로 훼손함.

---

## 부록: 분석 요약 지표

| 심각도 | 건수 |
|--------|------|
| CRITICAL | 2 |
| HIGH | 4 |
| MEDIUM | 5 |
| LOW | 4 |
| **합계** | **15** |

CRITICAL 2건(문스톤 미반영, selectedTechId 중복 선언)은 현재 스프린트 내 **즉시 수정** 권고.
HIGH 4건은 다음 Playwright BAT 통과 조건으로 설정 권고.

---

*본 보고서는 소스 코드 정적 분석 기반으로 작성되었습니다. updateAssemblyJobs(), applyMsUpgradesFromState(), closeLaunchOverlay(), renderProductionTab(), renderAssemblyTab(), renderMissionTab(), checkAutoUnlocks(), applyUnlocks(), buyBuilding() 등 분석 범위 외 함수의 구현에 따라 일부 항목이 수정될 수 있습니다.*
