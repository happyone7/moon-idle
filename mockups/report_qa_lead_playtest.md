# QA팀장 플레이테스트 버그 리포트 v2
날짜: 2026-02-20
분석 대상: MoonIdle sprint/1 HEAD (commit 890e134)

## 테스트 환경
소스 코드 정적 분석 + 플로우 시뮬레이션. 전체 13개 JS 파일 직접 열람.
시나리오별 상태 변이를 추적하고, 호출 체인·조건 분기를 수동으로 추적하였음.

---

## 버그 목록

---

### BUG-P01: confirmLaunch 후 closeLaunchOverlay 호출로 moonstone 이중 지급 가능
- **심각도**: HIGH
- **재현 조건**: 발사 오버레이(launch-overlay)에서 `[문스톤 획득 후 재시작]` 버튼 클릭
- **예상 동작**: 문스톤이 `pendingLaunchMs`만큼 정확히 1회 지급
- **실제 동작**: `confirmLaunch()`가 `gs.moonstone += pendingLaunchMs` 후 `pendingLaunchMs = 0`으로 초기화하고 내부에서 `closeLaunchOverlay()`를 호출. `closeLaunchOverlay()`는 `if (pendingLaunchMs > 0)` 가드로 이중 지급을 막고 있어 정상적으로 동작하지만, 만약 향후 `confirmLaunch` 내부의 `pendingLaunchMs = 0` 라인이 누락되거나 순서가 바뀌면 즉시 이중 지급이 발생하는 취약한 구조임. 또한 `renderMissionTab()`에서 동적으로 생성된 `#btn-prestige` 버튼(`onclick="confirmLaunch()"`)과 `init()`에서 `addEventListener('click', confirmLaunch)`로 바인딩된 정적 `#btn-prestige` 버튼이 동시에 존재할 때 이벤트가 두 번 실행될 수 있음.
- **근거 코드**:
  - `js/tabs/mission.js:83-84` — `gs.moonstone += pendingLaunchMs;` 후 즉시 `pendingLaunchMs = 0`
  - `js/tabs/mission.js:124` — `closeLaunchOverlay()` 재호출
  - `js/tabs/mission.js:249` — `renderMissionTab()`에서 `id="btn-prestige"` 버튼 동적 생성 + `onclick="confirmLaunch()"`
  - `js/main.js:355-357` — `init()`에서 `#btn-prestige`에 `addEventListener('click', confirmLaunch)` 바인딩
- **수정 제안**: `renderMissionTab()`의 동적 prestige 버튼에서 `id="btn-prestige"` 제거 또는 `init()`의 정적 리스너 바인딩 방식으로 통일. `confirmLaunch()` 내부에서 `closeLaunchOverlay()` 호출 전 `pendingLaunchMs = 0` 순서 보장을 명시적으로 문서화할 것.

---

### BUG-P02: getAddonTimeMult()가 startAssembly 및 auto_assemble에서 사용되지 않음
- **심각도**: HIGH
- **재현 조건**: launch_pad 애드온(addon_launch_ctrl 또는 ctrl_autonomous) 설치 후 조립 시작
- **예상 동작**: 애드온 효과 `timeMult`(예: -15%, -20%)가 조립 시간에 반영되어 endAt이 단축되어야 함
- **실제 동작**: `startAssembly()`의 `endAt` 계산에 `getAddonTimeMult()` 호출이 없음. `pad_fuelfeed` 건물 업그레이드(`timeMult:0.8`)도 동일하게 조립 시간에 반영되지 않음.
- **근거 코드**:
  - `js/tabs/assembly.js:46` — `endAt: now + q.timeSec * 1000 * (getMilestoneAssemblyMult())` — `getAddonTimeMult()` 누락
  - `js/tabs/automation.js:221` — `endAt: now + q.timeSec * 1000` — `getAddonTimeMult()`와 `getMilestoneAssemblyMult()` 모두 누락
  - `js/game-state.js:201-209` — `getAddonTimeMult()` 함수가 정의되어 있지만 호출부 없음
  - `js/game-data.js:127` — `pad_fuelfeed` 업그레이드 `timeMult:0.8` 정의
- **수정 제안**: `startAssembly()` endAt 계산식에 `* getAddonTimeMult()`를 추가. `auto_assemble` 자동 조립 코드에도 동일하게 적용. `getBldUpgradeMult`처럼 `timeMult`를 종합하는 헬퍼 함수 통합 고려.

---

### BUG-P03: hideTechTip() 함수 미정의 — Escape키 누를 때 ReferenceError
- **심각도**: HIGH
- **재현 조건**: 생산 탭에서 Escape 키를 누를 때
- **예상 동작**: 건물 오버레이와 기술 툴팁이 닫혀야 함
- **실제 동작**: `hideTechTip` 함수가 어느 JS 파일에도 정의되어 있지 않음. Escape 키 핸들러가 `hideTechTip()`를 호출하면 `ReferenceError: hideTechTip is not defined`가 발생하고 `closeBldOv()`도 실행되지 않을 가능성이 있음(브라우저에 따라 다름).
- **근거 코드**:
  - `js/world.js:976` — `document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBldOv(); hideTechTip(); } });`
  - `js/tabs/research.js` — `tech-tip` 요소 관련 show/hide 함수 없음
  - Grep 결과: `hideTechTip` 정의 없음
- **수정 제안**: `js/world.js` 또는 `js/tabs/research.js`에 `function hideTechTip() { const el = document.getElementById('tech-tip'); if (el) el.style.display = 'none'; }` 추가.

---

### BUG-P04: auto_assemble이 getMilestoneAssemblyMult() 미적용으로 마일스톤 조립 시간 단축 무효
- **심각도**: MEDIUM
- **재현 조건**: `all_parts` 마일스톤 달성(조립 시간 -10%) 후 `auto_assemble` 자동화 활성화
- **예상 동작**: 자동 조립도 마일스톤 보너스인 -10%가 적용되어야 함
- **실제 동작**: `automation.js`의 `auto_assemble` 코드에서 `endAt` 계산 시 `getMilestoneAssemblyMult()` 호출이 없음. 수동 조립(`startAssembly`)은 적용되지만 자동 조립은 미적용.
- **근거 코드**:
  - `js/tabs/automation.js:221` — `endAt: now + q.timeSec * 1000` (배율 없음)
  - `js/tabs/assembly.js:46` — `endAt: now + q.timeSec * 1000 * (getMilestoneAssemblyMult() ? ... : 1)` (배율 있음)
- **수정 제안**: `automation.js:221`을 `endAt: now + q.timeSec * 1000 * getAddonTimeMult() * (typeof getMilestoneAssemblyMult === 'function' ? getMilestoneAssemblyMult() : 1)`로 수정.

---

### BUG-P05: auto_worker 자동 배치 시 slotCap 초과 가능
- **심각도**: MEDIUM
- **재현 조건**: `auto_worker` 자동화 활성화 상태에서 여유 인원이 있을 때
- **예상 동작**: 인원 배치 슬롯 한도(`bldSlotLevels` 포함)를 초과하지 않아야 함
- **실제 동작**: `auto_worker` 로직에서 비율 기반 배분 시 `slotCap` 검사가 없음. `gs.assignments[b.id] = current + extra`에서 `slotCap = (gs.buildings[b.id] || 0) + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id]) || 0)`를 초과할 수 있음. 수동 `quickAssign()`에서는 slotCap 검사를 하지만 자동 배치는 생략됨.
- **근거 코드**:
  - `js/tabs/automation.js:115-133` — `slotCap` 계산 없이 `gs.assignments[b.id] = current + extra`
  - `js/tabs/production.js:15-17` — `quickAssign()`에서 slotCap 검사: `if (assigned >= slotCap) { notify(...); return; }`
- **수정 제안**: auto_worker의 각 건물 배분 시 `const slotCap = (gs.buildings[b.id]||0) + ((gs.bldSlotLevels&&gs.bldSlotLevels[b.id])||0);`를 계산하고 `Math.min(slotCap, current + extra) - current`로 extra를 클램핑.

---

### BUG-P06: renderProductionTab() 내 rate 계산에 getBldProdMult/getBldUpgradeMult/getAddonMult 미포함
- **심각도**: MEDIUM
- **재현 조건**: 건물 생산 업그레이드 또는 애드온 설치 후 생산 탭 열기
- **예상 동작**: 생산 탭의 `+X.XX/s` 표시가 실제 생산량(getProduction())과 일치해야 함
- **실제 동작**: `renderProductionTab()` 내 rate 표시 계산식이 `b.baseRate * assigned * (prodMult[b.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus()`만 사용. `getBldProdMult(b.id)`, `getBldUpgradeMult(b.id)`, `getAddonMult(b.id)`가 누락되어 UI에 표시된 값이 실제 생산량보다 적게 표시됨.
- **근거 코드**:
  - `js/tabs/production.js:132` — `const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();`
  - `js/game-state.js:268` — `getProduction()` 계산: `b.baseRate * assigned * ... * getBldProdMult(b.id) * getBldUpgradeMult(b.id) * getAddonMult(b.id) * msBonus`
- **수정 제안**: `production.js:132`의 rate 계산에 `* getBldProdMult(b.id) * getBldUpgradeMult(b.id) * getAddonMult(b.id)`를 추가하거나, `getProduction()` 결과에서 건물별로 분리 계산.

---

### BUG-P07: UPGRADES 목록의 auto_worker_assign, auto_assemble_restart가 게임에서 실제로 아무런 효과 없음
- **심각도**: MEDIUM
- **재현 조건**: 연구 탭에서 `auto_worker_assign` 또는 `auto_assemble_restart` 연구 완료
- **예상 동작**: 설명에 기재된 대로 기능이 동작해야 함
- **실제 동작**: 두 업그레이드의 `effect: ()=>{}` — 빈 함수이고 `unlocks: []`. 해당 ID로 `runAutomation()`이나 다른 로직에서 체크하는 코드가 없음. 연구 포인트를 소모하지만 아무 효과가 없음. `auto_assemble`과 `auto_worker` 기능은 별도의 `AUTOMATION_UPGRADES`(moonstone)로만 구현되어 있음.
- **근거 코드**:
  - `js/game-data.js:61-62` — `effect:()=>{}`, `unlocks:[]`
  - `js/tabs/automation.js` 전체 — `auto_worker_assign`, `auto_assemble_restart` ID 참조 없음
- **수정 제안**: 두 업그레이드를 UPGRADES에서 제거하거나, 실제 기능을 구현하거나, 플레이어에게 "자동화 탭의 해당 자동화 기능을 해금"으로 unlocks 배열에 연결.

---

### BUG-P08: 프레스티지 후 milestones 보상 재지급 가능 (all_buildings, orbit_200)
- **심각도**: MEDIUM
- **재현 조건**: 프레스티지(confirmLaunch) 실행 후 다시 플레이 시
- **예상 동작**: 마일스톤 달성 상태는 영구 유지되어야 하며 보상은 최초 1회만 지급
- **실제 동작**:
  - `confirmLaunch()`에서 `savedUnlocks`는 보존하지만 `gs.milestones`는 저장·복원하지 않음 (누락). 따라서 `gs.milestones = {}`로 리셋됨.
  - 리셋 후 다시 조건 달성 시 `checkMilestones()`가 마일스톤을 재달성하여 보상을 다시 지급함.
  - 특히 `orbit_200`은 문스톤 +5, `all_buildings`는 인원 +2, `first_mine`은 RP +5를 재지급.
- **근거 코드**:
  - `js/tabs/mission.js:86-113` — `savedMilestones` 변수 없음, `gs.milestones` 리셋됨
  - `js/milestones.js:54-75` — `checkMilestones()`: `if (gs.milestones[m.id]) return;` — 리셋 후 다시 통과
- **수정 제안**: `confirmLaunch()` 내에 `const savedMilestones = gs.milestones || {};`를 추가하고 복원 블록에서 `gs.milestones = savedMilestones;`를 추가.

---

### BUG-P09: 발사 오버레이의 타이틀이 실패 시에도 "달 탐사 성공"으로 표시됨
- **심각도**: MEDIUM
- **재현 조건**: 발사 실패(`rollSuccess === false`) 후 오버레이 표시
- **예상 동작**: 실패 시 "발사 실패" 또는 적절한 실패 메시지가 표시되어야 함
- **실제 동작**: `index.html`의 `#launch-overlay` 타이틀이 정적 텍스트 `// 달 탐사 성공`으로 하드코딩. `_showLaunchOverlay()`에서 `#lo-ms` 요소의 텍스트는 성공/실패에 따라 변경되지만, `<div class="lo-title">// 달 탐사 성공</div>`는 변경되지 않음.
- **근거 코드**:
  - `index.html:1412` — `<div class="lo-title">// 달 탐사 성공</div>` (정적)
  - `js/tabs/launch.js:129-153` — `_showLaunchOverlay()`에서 `.lo-title` 요소 업데이트 없음
- **수정 제안**: `_showLaunchOverlay()` 내에서 `const loTitle = document.querySelector('#launch-overlay .lo-title'); if (loTitle) loTitle.textContent = success ? '// 달 탐사 성공' : '// 발사 실패';`를 추가.

---

### BUG-P10: openBldOv() 내 rateStr 계산에 getAddonMult 미포함
- **심각도**: LOW
- **재현 조건**: 건물 오버레이에서 인원 배치 행의 설명 확인
- **예상 동작**: 오버레이의 `+X.XX/s` 설명이 실제 생산량과 일치해야 함
- **실제 동작**: `openBldOv()` 내 `desc` 문자열의 rate 계산과 `rateStr` 계산 모두 `getAddonMult(b.id)` 누락.
- **근거 코드**:
  - `js/world.js:441` — `assign` action desc: `bld.baseRate * (prodMult[...]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id)` — `getAddonMult` 누락
  - `js/world.js:551` — `rateStr`: 동일하게 `getAddonMult` 누락
- **수정 제안**: 두 계산식 끝에 `* getAddonMult(bld.id)` 추가.

---

### BUG-P11: calcOffline()의 자동 발사가 launchInProgress를 체크하지 않음
- **심각도**: LOW
- **재현 조건**: 오프라인 복귀 시 발사 애니메이션이 진행 중인 상태(이론적 시나리오)
- **예상 동작**: 오프라인 자동 발사와 실시간 발사 애니메이션이 충돌하지 않아야 함
- **실제 동작**: `calcOffline()`의 `auto_launch` 처리 블록에서 `launchInProgress` 플래그를 확인하지 않음. 반면 `runAutomation()`의 `auto_launch`는 `if (launchInProgress) break;`로 보호되어 있음. 실제 재현 가능성은 낮지만 코드 일관성 결여.
- **근거 코드**:
  - `js/game-state.js:582-603` — 오프라인 auto_launch 처리: `launchInProgress` 체크 없음
  - `js/tabs/automation.js:238` — `if (launchInProgress) break;`
- **수정 제안**: `calcOffline()` 내 auto_launch 블록에 `if (launchInProgress) continue;` 추가.

---

### BUG-P12: fmtDec()에 Infinity 입력 시 잘못된 출력
- **심각도**: LOW
- **재현 조건**: 생산 배율이 극단적으로 커져서 Infinity가 발생하는 엣지 케이스
- **예상 동작**: `fmtDec(Infinity)` → 적절한 fallback 텍스트
- **실제 동작**: `fmtDec()`의 NaN 가드는 있지만 Infinity 가드가 없음. `n >= 1e9`로 분기되어 `(Infinity/1e9).toFixed(1)+'B'` = `'InfinityB'`를 반환.
- **근거 코드**:
  - `js/game-state.js:75-80` — `fmtDec(n)`: `if (typeof n !== 'number' || isNaN(n)) return '0.0';` — `isFinite` 체크 없음
  - `fmt()` 동일 패턴: `js/game-state.js:67-73`
- **수정 제안**: `if (typeof n !== 'number' || !isFinite(n)) return '0.0';`로 수정.

---

### BUG-P13: auto_addon 자동화가 애드온 설치의 side-effect(rel, slotBonus, partCostMult)를 적용하지 않음
- **심각도**: HIGH
- **재현 조건**: `auto_addon` 자동화 활성화 후 건물 건설 시 애드온 자동 설치
- **예상 동작**: 애드온 효과(신뢰도 보너스, 슬롯 보너스, 부품 비용 절감)가 즉시 적용되어야 함
- **실제 동작**: `automation.js`의 `auto_addon` 코드는 `gs.addons[b.id] = opt.id`만 설정하고, `buyAddonOption()`에서 수행하는 side-effect(`reliabilityBonus += opt.effect.rel`, `slotBonus += opt.effect.slotBonus`, `partCostMult *= (1 - opt.effect.partCostReduct)`)를 적용하지 않음.
- **근거 코드**:
  - `js/tabs/automation.js:148-161` — `gs.addons[b.id] = opt.id;` 후 effect 적용 없음
  - `js/world.js:717-721` — `buyAddonOption()`에서 effect 적용: `reliabilityBonus += opt.effect.rel;` 등
- **수정 제안**: `automation.js`의 auto_addon 설치 블록에 `if (opt.effect) { if (opt.effect.rel) reliabilityBonus += opt.effect.rel; if (opt.effect.slotBonus) slotBonus += opt.effect.slotBonus; if (opt.effect.partCostReduct) partCostMult *= (1 - opt.effect.partCostReduct); }` 추가.

---

### BUG-P14: 스크립트 로드 순서 — main.js가 milestones.js 이후에 로드되지만 game-state.js 의존성 체크 없음
- **심각도**: LOW
- **재현 조건**: 없음 (현재 구조는 정상이지만 취약한 구조)
- **예상 동작**: 의존성 오류 없이 초기화
- **실제 동작**: 현재 로드 순서 `game-data → game-state → i18n → unlock → world → production → research → assembly → launch → mission → automation → milestones → audio-bgm → main`는 기술적으로 정상. 그러나 `game-state.js`에서 `typeof getMilestoneProdBonus === 'function'` 패턴으로 방어적으로 호출하는 것이 `milestones.js`가 늦게 로드되기 때문임. 이 패턴이 일관되지 않고 일부는 직접 호출.
- **근거 코드**:
  - `index.html:1465-1478` — 스크립트 로드 순서
  - `js/game-state.js:267` — `typeof getMilestoneProdBonus === 'function' ? getMilestoneProdBonus() : 1` (방어적)
  - `js/game-state.js:312` — `typeof getMilestoneMsBonus === 'function' ? getMilestoneMsBonus() : 1` (방어적)
  - `js/tabs/assembly.js:46` — `typeof getMilestoneAssemblyMult === 'function' ? getMilestoneAssemblyMult() : 1` (방어적)
- **수정 제안**: 현재 패턴 유지. 문서화 권장.

---

### BUG-P15: renderMissionTab()의 prevDone 로직이 잘못된 위상 잠금 판정을 함
- **심각도**: LOW
- **재현 조건**: PHASE 1과 PHASE 3는 완료했지만 PHASE 2가 미완료인 상태 (이론적으로 불가능하지만 역사 데이터 이상 시 발생 가능)
- **예상 동작**: 위상 진행이 순서대로 잠금/해금
- **실제 동작**: `if (done) prevDone = true;`로 완료 시 prevDone을 true로 설정하지만 `if (!done) prevDone = false;`가 나중에 실행되어 완료된 위상 직후의 위상도 `locked = true`가 될 수 있음. `prevDone` 갱신 순서가 `done` 판정 후 즉시 `if (!done) prevDone = false`로 덮어쓰여 중간에 잠금이 올바르게 처리되지 않는 경우가 있음.
- **근거 코드**:
  - `js/tabs/mission.js:167-181` — `let prevDone = true;` 후 루프 내 `if (done) prevDone = true; ... if (!done) prevDone = false;`
- **수정 제안**: 위상 잠금 결정을 루프 시작 시 `prevDone` 스냅샷으로 판단하고, 루프 끝에 `prevDone = done`으로 갱신.

---

## 기술 부채 / 리팩토링 권고

### TD-01: successfulLaunches 필드가 세이브에 포함되지 않음
- `gs.successfulLaunches`는 `launchFromSlot()`, `calcOffline()`, `runAutomation()` 세 곳에서 `gs.successfulLaunches = (gs.successfulLaunches || 0) + 1`로 증가시키지만, `loadGame()`의 복원 코드에 `gs.successfulLaunches` 복원이 없음. 로드 후 0으로 리셋됨. 현재 UI에 표시되지 않아 영향도는 낮지만, 향후 통계/마일스톤에 사용 시 오류 원인이 됨.
- `js/game-state.js:431-545` — `loadGame()` 내 `successfulLaunches` 복원 없음

### TD-02: UPGRADES의 auto_worker_assign, auto_assemble_restart가 dead code
- 연구 포인트를 소모하지만 게임플레이에 아무 효과가 없는 더미 기술이 연구 트리에 존재 (BUG-P07 참조).

### TD-03: renderProductionTab()의 rate 표시와 getProduction() 간 계산 중복 및 불일치
- 생산량 계산이 `getProduction()`, `renderProductionTab()`, `openBldOv()` 세 군데에 중복 구현되어 있으며 일부 배율이 누락됨 (BUG-P06, BUG-P10). 중앙화된 `getBuildingRate(bld, assigned)` 헬퍼 함수 추출 권장.

### TD-04: 글로벌 변수 launchInProgress의 생명주기 관리 취약
- `launchInProgress`는 `_runLaunchAnimation()`에서 `true`로 설정되고 `setTimeout 3500ms` 후 `false`로 복귀. 탭 전환 시 `renderLaunchTab()`이 `launchInProgress`를 확인하여 DOM 재렌더링을 방지하지만, 3.5초 타이머 완료 전에 페이지 리프레시(F5)가 발생하면 `launchInProgress`가 `false`로 저장되므로 문제 없음. 그러나 탭 전환 시 `lc-pre-launch`가 숨겨진 상태로 다른 탭을 방문하다 돌아오면 `renderLaunchTab()`이 `launchInProgress === true`이면 `return`하여 리셋되지 않음. 3.5초 타이머 완료 후에야 정상화되어 발사 직후 2~3초간 발사 탭이 빈 화면으로 표시될 수 있음.

### TD-05: 연구 탭 재렌더링 시 selectedTechId 상세 패널이 재생성됨
- `renderResearchTab()`이 `layout.innerHTML`을 전체 교체하고 마지막에 `renderTechDetail(selectedTechId)` 재호출. 500ms마다 `renderAll()` → `renderResearchTab()`이 실행되므로 상세 패널이 초당 2회씩 재생성됨. 스크롤 위치 초기화 등 UX 이슈 유발 가능.

---

## 통과된 항목

1. **뉴게임 정상 시작**: `startNewGame()`에서 모든 gs 필드가 명시적으로 초기화됨. prodMult, globalMult 등 전역 변수도 리셋됨. 정상.
2. **세이브/로드 기본 패턴**: `loadGame()`에서 `saved.X || {}` 패턴이 일관되게 적용됨. bldSlotLevels 복원 포함.
3. **getTotalAssigned / getAvailableWorkers 정확성**: `Object.values(gs.assignments||{}).reduce(...)` 패턴 정확. 음수 방어 없지만 실제로 음수 배치가 발생하지 않음.
4. **마일스톤 중복 달성 방지**: `if (gs.milestones[m.id]) return;` 가드 정상 작동 (단, BUG-P08의 프레스티지 리셋 이슈는 별도).
5. **launchFromSlot 중복 방지**: `if (launchInProgress) return;` 가드 정상.
6. **gs.history 배열 안전성**: `Array.isArray(gs.history)`로 체크 후 사용. MILESTONES 체크 함수도 방어적.
7. **PARTS.every()의 gs.parts 체크**: `gs.parts && gs.parts[p.id]` 패턴으로 undefined 방어.
8. **fmtTime NaN/음수 입력**: `Math.max(0, Math.floor(sec))`로 방어.
9. **인원 배치 slotCap 계산(quickAssign, assignWorker)**: bldSlotLevels 정확히 사용.
10. **loadGame() 레거시 업그레이드 효과 재적용**: `Object.keys(gs.upgrades).forEach(uid => ... upg.effect())`로 prodMult 등 복원 정상.
11. **migrateLegacySave() 슬롯1 충돌 방지**: 슬롯1이 이미 있으면 마이그레이션 건너뜀. 정상.

---

## 우선순위 수정 필요 TOP 5

| 순위 | 버그 ID | 제목 | 심각도 | 이유 |
|------|---------|------|--------|------|
| 1 | BUG-P13 | auto_addon side-effect 미적용 | HIGH | 애드온 효과(신뢰도, 슬롯, 부품 비용)가 자동 설치 시 완전히 무시됨. 플레이어가 원인을 파악하기 어려움 |
| 2 | BUG-P02 | getAddonTimeMult() 미사용 | HIGH | 발사대 애드온 업그레이드 비용을 지불했지만 조립 시간 단축이 전혀 발생하지 않음 |
| 3 | BUG-P03 | hideTechTip 미정의 ReferenceError | HIGH | Escape 키 사용 시 콘솔 에러 발생, closeBldOv도 실행 안 될 수 있음 |
| 4 | BUG-P08 | 프레스티지 후 마일스톤 보상 재지급 | MEDIUM | 문스톤 +5, 인원 +2 등을 매 프레스티지마다 반복 획득 가능한 밸런스 파괴 |
| 5 | BUG-P07 | auto_worker_assign/auto_assemble_restart 무효 기술 | MEDIUM | 연구 포인트를 소모하는 기술이 아무 효과가 없어 플레이어 신뢰도 손상 |
