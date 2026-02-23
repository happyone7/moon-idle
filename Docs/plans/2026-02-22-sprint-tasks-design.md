# Sprint Tasks Design — 2026-02-22

## 승인된 8개 작업

### 작업 1: balance-data.js 신규 생성 + 수치 분리
- `js/balance-data.js` 생성, `BALANCE` 단일 객체로 모든 하드코딩 수치 분리
- game-state.js에서 `BALANCE.xxx` 참조로 변경
- index.html에서 game-data.js 다음, game-state.js 이전에 로드

### 작업 2: 시민 분양 가격 횟수 기반으로 변경
- `gs.citizenRecruits` 필드 추가 (누적 분양 횟수)
- `getCitizenCost()`: `gs.citizens` → `gs.citizenRecruits` 참조
- `allocateCitizen()`: `gs.citizenRecruits++` 추가
- `startNewGame()`: `gs.citizenRecruits = 0`
- `loadGame()`: 마이그레이션 — `citizenRecruits` 없으면 `gs.citizens`로 초기화

### 작업 3: 업적 보상 수령 버튼 (미션 탭)
- 마일스톤 상태: `true` → `'unlocked'` (달성·미수령), `'claimed'` (수령 완료)
- `checkMilestones()`: `_applyMilestoneReward` 호출 제거, `'unlocked'` 설정
- 보너스 헬퍼: `=== 'claimed'` 체크로 변경
- `renderMilestonePanel()`: 수령 버튼 추가 (`claimMilestone(id)`)
- `claimMilestone()`: 신규 함수 — 보상 적용 + `'claimed'` 설정
- `loadGame()`: 기존 `true` → `'claimed'` 마이그레이션

### 작업 4: 운영센터 ASCII 18자 폭 확대
- world.js ops_center 모든 ASCII 블록: 14자 → 18자
- `ADDON_POSITIONS.ops_center` 업데이트
- verify-ascii-rendering 스킬 baseline 업데이트

### 작업 5: 선행조건 미충족 업그레이드/애드온 비노출
- world.js `openBldOv()` 내 업그레이드 루프: `reqMet` false면 actions에 추가하지 않음
- 애드온 업그레이드도 동일 처리

### 작업 6-8: 조립동 레이아웃 5열→4열 재배치
- 현재 구조: 자원패널(왼쪽) + 3col(left/center/right) + 생산허브패널(오른쪽)
- 변경: 맨 오른쪽 생산허브 패널은 조립 탭에서 별도 제거 불필요 (이미 글로벌 패널)
- assembly.js 3col → 재배치:
  - col-left (30%): 부품현황 + 조립슬롯 (기존 right → left)
  - col-center (40%): 로켓 도면 + BOM + 진행상황
  - col-right (30%): 로켓 클래스 + 스펙 + 품질등급 + science-box

## 구현 순서
1 → 2 → 3 → 4 → 5 → 6-8 → 검증 → 베타 배포
