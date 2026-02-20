---
name: verify-moonidle-core
description: MoonIdle 핵심 게임 로직 일관성 검증. 게임 상태, 데이터 정합성, 탭 시스템, 경제 밸런싱을 검사. 게임 로직 변경 후 사용.
---

# Purpose

이 스킬은 MoonIdle의 핵심 게임 로직 일관성을 검증합니다:

1. **게임 상태 구조 무결성** — `gs` 객체의 필수 속성과 `saveVersion` 체크
2. **게임 데이터 정합성** — 건물/파츠/품질/업그레이드 정의 간 일관성 검증
3. **탭 시스템 등록** — `unlocks.tab_*` 키와 탭 전환 로직 매칭
4. **증분형 경제 밸런싱** — 건물비용, 생산량 배수, 업그레이드 효과 검증
5. **파일 간 참조 일관성** — game-data.js의 id와 game-state.js의 초기값 매칭

# When to Run

다음 작업 후 이 스킬을 실행하세요:

1. **게임 상태 수정** — `js/game-state.js`의 `gs` 객체 변경 후
2. **게임 데이터 추가/변경** — `js/game-data.js`에 건물/파츠/업그레이드 추가 또는 수정 후
3. **탭 기능 구현** — 새 탭 추가 또는 탭 해금 조건 변경 후
4. **경제 리밸런싱** — 건물비용, 생산량, 업그레이드 배수 조정 후
5. **세이브 버전 업그레이드** — `saveVersion` 변경 후 마이그레이션 로직 검증

# Related Files

| File | Purpose |
|------|---------|
| `js/game-state.js` | 게임 전역 상태 (`gs` 객체) 및 헬퍼 함수 |
| `js/game-data.js` | 건물, 파츠, 품질, 업그레이드 데이터 정의 |
| `js/main.js` | 탭 전환 로직 (`switchMainTab`) 및 렌더링 |
| `js/tabs/production.js` | 생산 탭 — 건물 건설 및 인원 배치 |
| `js/tabs/research.js` | 연구 탭 — 업그레이드 구매 |
| `js/tabs/assembly.js` | 조립 탭 — 로켓 조립 |
| `js/tabs/launch.js` | 발사 탭 — 발사 실행 |
| `js/tabs/mission.js` | 미션 탭 — 발사 히스토리 |
| `js/tabs/automation.js` | 자동화 탭 — moonstone 업그레이드 |
| `js/milestones.js` | 마일스톤 시스템 |
| `js/unlock.js` | 해금 시스템 로직 |
| `js/world.js` | 세계 상태 및 저장/로드 |
| `index.html` | 게임 메인 파일 (HTML/CSS 통합, 일부 초기화 로직 포함 가능) |

# Workflow

## Step 1: 게임 상태 구조 검증

**파일:** `js/game-state.js`

**검사:** `gs` 객체가 필수 속성을 모두 포함하는지 확인합니다.

```bash
grep -n "let gs = {" js/game-state.js
```

**PASS 기준:**
- `gs` 객체가 다음 속성을 포함해야 합니다:
  - `res`, `buildings`, `parts`, `assembly`, `upgrades`, `milestones`, `unlocks`, `settings`, `saveVersion`
  - `workers`, `assignments` (인원 시스템)
  - `launches`, `moonstone`, `history` (발사 기록)

**FAIL 시 조치:**
- 누락된 속성을 `gs` 초기값에 추가
- `saveVersion`이 현재 버전(2)과 일치하는지 확인

### Step 1a: saveVersion 확인

```bash
grep -n "saveVersion" js/game-state.js
```

**PASS 기준:** `saveVersion: 2` (현재 최신 버전)

**FAIL 시 조치:**
- 버전이 다르면 `js/world.js`의 마이그레이션 체인 확인
- 마이그레이션 함수가 누락된 경우 추가 필요

---

## Step 2: 게임 데이터 정합성 검증

**파일:** `js/game-data.js`

### Step 2a: 건물 정의 일관성

```bash
grep -n "const BUILDINGS = \[" js/game-data.js
```

**검사:** 각 건물 객체가 필수 속성을 포함하는지 확인합니다.

**PASS 기준:**
- 각 건물은 `id`, `name`, `icon`, `produces`, `baseRate`, `baseCost`, `desc`, `wbClass` 속성 보유
- `id`는 snake_case (예: `housing`, `ops_center`, `supply_depot`)
- `produces` 값은 `money`, `metal`, `fuel`, `electronics`, `research`, `bonus` 중 하나

**위반 예시:**
```javascript
// FAIL — desc 누락
{ id:'mine', name:'철광석 채굴기', icon:'[MIN]', produces:'metal', baseRate:20, baseCost:{money:2000}, wbClass:'wb-mine' }
```

### Step 2b: 파츠 정의 일관성

```bash
grep -n "const PARTS = \[" js/game-data.js
```

**PASS 기준:**
- 정확히 5개 파츠: `engine`, `fueltank`, `control`, `hull`, `payload`
- 각 파츠는 `id`, `name`, `icon`, `cost` 속성 보유
- `cost` 객체는 `metal`, `fuel`, `electronics` 중 1개 이상 포함

### Step 2c: 업그레이드 unlocks 일관성

```bash
grep -n "unlocks:" js/game-data.js | head -20
```

**검사:** 업그레이드의 `unlocks` 배열에 나열된 키가 `gs.unlocks`에 정의되어 있는지 확인합니다.

**방법:**
1. `js/game-data.js`에서 모든 `unlocks: [...]` 배열 추출
2. `js/game-state.js`의 `gs.unlocks` 객체와 비교
3. `unlocks` 배열의 모든 키가 `gs.unlocks`에 존재해야 함

**PASS 기준:** 모든 unlocks 키가 `gs.unlocks`에 정의됨

**FAIL 예시:**
```javascript
// game-data.js
{ id:'basic_prod', unlocks:['bld_mine', 'bld_quarry'] } // 'bld_quarry'는 gs.unlocks에 없음

// game-state.js
unlocks: {
  bld_mine: false,
  // bld_quarry 정의 누락
}
```

---

## Step 3: 탭 시스템 등록 검증

**파일:** `js/game-state.js`, `js/main.js`

### Step 3a: 탭 unlock 키 확인

```bash
grep -n "tab_" js/game-state.js
```

**PASS 기준:** `gs.unlocks`에 다음 탭 키가 정의되어 있어야 합니다:
- `tab_production`, `tab_research`, `tab_assembly`, `tab_launch`, `tab_mission`, `tab_automation`

### Step 3b: 탭 전환 로직 매칭

```bash
grep -n "activeTab ===" js/main.js
```

**검사:** `renderAll()` 함수에서 참조하는 탭 ID가 `gs.unlocks.tab_*` 키와 일치하는지 확인합니다.

**PASS 기준:**
- `switchMainTab(tabId)`에서 사용하는 `tabId` 값이 `gs.unlocks.tab_*`의 접두사 제거 버전과 일치
- 예: `switchMainTab('production')` ↔ `gs.unlocks.tab_production`

**FAIL 예시:**
```javascript
// main.js
if (activeTab === 'factory') renderFactoryTab(); // 'factory' 탭은 gs.unlocks.tab_factory가 없음
```

---

## Step 4: 증분형 경제 밸런싱 검증

**파일:** `js/game-data.js`

### Step 4a: 건물비용 공식 검증

**검사:** 건물 `baseCost`가 점진적으로 증가하는지 확인합니다 (증분형 게임 밸런싱).

**방법:**
1. `BUILDINGS` 배열에서 각 건물의 `baseCost.money` 추출
2. 자원 생산 건물(mine, extractor 등)이 수익 건물(ops_center)보다 비싸야 함
3. 고급 건물(solar_array, launch_pad)이 가장 비싸야 함

**PASS 기준:**
- `housing` (150) < `ops_center` (800) < `mine` (2000) < ... < `launch_pad` (100000)
- 건물 비용이 대략 1.5~2.5배씩 증가

**위반 예시:**
```javascript
// FAIL — mine이 ops_center보다 저렴함 (밸런싱 문제)
{ id:'ops_center', baseCost:{metal:800} },
{ id:'mine', baseCost:{money:500} }, // 너무 저렴
```

### Step 4b: 업그레이드 배수 검증

```bash
grep -n "mult:" js/game-data.js | head -20
```

**PASS 기준:**
- 건물 업그레이드의 `mult` 값은 1.2~2.0 범위
- 3단계 업그레이드 체인이 있는 경우 누적 배수가 3~5배

**위반 예시:**
```javascript
// FAIL — mult 값이 너무 큼 (밸런싱 문제)
{ id:'mine_super', mult:10.0 } // 10배는 과도함
```

---

## Step 5: 파일 간 참조 일관성 검증

**파일:** `js/game-data.js`, `js/game-state.js`

**검사:** `BUILDINGS` 배열의 모든 `id`가 `gs.buildings` 초기값에 존재하는지 확인합니다.

```bash
grep -o "id:'[a-z_]*'" js/game-data.js | grep -o "[a-z_]*" | sort -u > /tmp/building_ids.txt
grep -o "[a-z_]*:" js/game-state.js | grep -o "[a-z_]*" | sort -u > /tmp/gs_keys.txt
comm -23 /tmp/building_ids.txt /tmp/gs_keys.txt
```

**PASS 기준:** 출력이 비어 있음 (모든 건물 ID가 `gs.buildings`에 정의됨)

**FAIL 시 조치:**
- 누락된 건물 ID를 `gs.buildings` 초기값에 추가 (값: 0)

### Step 5a: 파츠 일관성

```bash
grep -n "parts:" js/game-state.js
```

**PASS 기준:** `gs.parts` 초기값이 `PARTS` 배열의 모든 `id`를 포함 (값: 0)

---

## Step 6: 종합 검증

위의 모든 검사를 통과한 경우, 마지막으로 파일 간 순환 참조가 없는지 확인합니다.

**검사:** 탭 파일들이 서로를 직접 참조하지 않는지 확인합니다.

```bash
grep -l "tabs/production" js/tabs/*.js
grep -l "tabs/research" js/tabs/*.js
```

**PASS 기준:** 출력이 비어 있음 (탭 파일 간 직접 참조 없음)

**FAIL 시 조치:** 순환 참조 제거 또는 공용 유틸리티 파일로 분리

---

# Output Format

검증 결과를 다음 형식으로 보고합니다:

```markdown
## MoonIdle 핵심 로직 검증 결과

### 1. 게임 상태 구조 검증
- ✅ PASS — `gs` 객체 필수 속성 모두 존재
- ✅ PASS — `saveVersion: 2` (최신)

### 2. 게임 데이터 정합성 검증
- ✅ PASS — 건물 정의 13개 (필수 속성 포함)
- ✅ PASS — 파츠 정의 5개 (engine, fueltank, control, hull, payload)
- ⚠️ WARN — 업그레이드 'basic_prod'의 unlocks 키 'bld_quarry'가 gs.unlocks에 없음

### 3. 탭 시스템 검증
- ✅ PASS — 6개 탭 unlock 키 정의됨
- ✅ PASS — 탭 전환 로직 매칭

### 4. 경제 밸런싱 검증
- ✅ PASS — 건물비용 점진적 증가 (150 → 100000)
- ✅ PASS — 업그레이드 배수 범위 (1.2~2.0)

### 5. 파일 간 참조 일관성
- ✅ PASS — 모든 건물 ID가 gs.buildings에 정의됨
- ✅ PASS — 모든 파츠 ID가 gs.parts에 정의됨

### 6. 종합 검증
- ✅ PASS — 탭 파일 간 순환 참조 없음

---

**종합:** 1개 경고 발견 — 'bld_quarry' unlock 키 누락
**권장 조치:** gs.unlocks에 `bld_quarry: false` 추가 또는 업그레이드에서 제거
```

---

# Exceptions

다음은 **문제가 아닙니다**:

1. **주석 처리된 건물/업그레이드** — 미래 기능으로 예약된 건물은 검증에서 제외
2. **테스트용 임시 값** — `gs` 초기값에 `_test` 또는 `_debug` 접두사가 있는 속성은 무시
3. **확장 가능한 배열** — `BUILDINGS`, `PARTS` 등은 추가 가능하므로 개수 증가는 정상
4. **동적으로 추가되는 unlocks** — 런타임에 동적으로 추가되는 unlock 키는 `gs.unlocks` 초기값에 없어도 됨 (마이그레이션 체인에서 추가)
5. **moonstone 업그레이드** — `AUTOMATION_UPGRADES`는 별도 탭이므로 `gs.msUpgrades`에 저장 (일반 `gs.upgrades`와 분리됨)
6. **애드온 선택** — `BUILDING_ADDONS`는 A/B 선택이므로 `gs.addons`에 선택된 옵션 ID만 저장
7. **인덱스 시작** — 배열 인덱스는 0부터, 건물 개수는 1부터 시작 (정상)
