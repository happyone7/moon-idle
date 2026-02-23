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
| `js/balance-data.js` | 밸런스 상수 (`BALANCE` 객체 — game-state.js가 30+ 참조) |
| `js/main.js` | 탭 전환 로직 (`switchMainTab`) 및 렌더링 |
| `js/tabs/production.js` | 생산 탭 — 건물 건설 및 인원 배치 |
| `js/tabs/research.js` | 연구 탭 — 업그레이드 구매 |
| `js/tabs/assembly.js` | 조립 탭 — 로켓 조립 |
| `js/tabs/launch.js` | 발사 탭 — 단계별 실패/성공 판정 시스템 |
| `js/tabs/rocket.js` | 조립동 로켓 디스플레이 탭 |
| `js/tabs/mission.js` | 미션 탭 — 발사 히스토리 |
| `js/tabs/automation.js` | 자동화 탭 — moonstone 업그레이드 |
| `js/milestones.js` | 마일스톤 시스템 |
| `js/unlock.js` | 해금 시스템 로직 |
| `js/world.js` | 세계 상태 및 저장/로드 |
| `js/audio-bgm.js` | BGM 시스템 (phase 기반 플레이리스트, 발사 덕킹, 크로스페이드) |
| `js/i18n.js` | 다국어 시스템 (`I18N` 객체, 'en'/'ko' 2개 로케일) |
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
  - `researchProgress`, `selectedTech`, `researchQueue` (연구 시스템)
  - `opsRoles`, `citizens`, `specialists` (역할/시민/전문화 시스템)
  - `mfgActive`, `fuelInjection` (공정 기반 제작 + 연료 주입, Sprint 8)

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
- `produces` 값은 `money`, `iron`, `copper`, `fuel`, `electronics`, `research`, `bonus` 중 하나

**위반 예시:**
```javascript
// FAIL — desc 누락
{ id:'mine', name:'철광석 채굴기', icon:'[MIN]', produces:'iron', baseRate:20, baseCost:{money:2000}, wbClass:'wb-mine' }
```

### Step 2b: 파츠 정의 일관성 (공정 기반 시스템, Sprint 8+)

```bash
grep -n "id:" js/game-data.js | grep -A 0 "hull\|engine\|propellant\|pump_chamber"
```

**PASS 기준 (공정 기반 제작 시스템):**
- MK1 파츠 3종: `hull` (동체), `engine` (엔진), `propellant` (추진체)
- MK2+ 전용 파츠 1종: `pump_chamber` (펌프/연소실, `minQuality:'standard'`)
- 각 파츠는 `id`, `name`, `icon`, `cycles`, `cycleTime`, `cost` 속성 보유
- `cost` (cycleCost) 객체는 `iron`, `copper`, `fuel` 중 1개 이상 포함

**이전 파츠 구조 (`engine`, `fueltank`, `control`, `hull`, `payload`) 는 완전 교체됨 — 잔존 시 FAIL**

```bash
grep -n "fueltank\|payload\|control" js/game-data.js
```
**PASS 기준:** 위 명령어 결과에서 PARTS 배열 내 항목으로 등장하지 않아야 함 (AUTOMATION_UPGRADES의 `auto_parts_*` 레거시 참조는 예외)

### Step 2c: 업그레이드 시스템 일관성

#### Step 2c-1: RESEARCH_BRANCHES unlocks 키 확인

```bash
grep -n "unlocks:" js/game-data.js | head -20
```

**검사:** `RESEARCH_BRANCHES` 항목의 `unlocks` 배열 키가 `gs.unlocks`에 정의되어 있는지 확인합니다.

**PASS 기준:** 모든 unlocks 키가 `gs.unlocks`에 정의됨

#### Step 2c-2: BUILDING_UPGRADES 구조 확인 (Sprint 8+)

```bash
grep -n "const BUILDING_UPGRADES" js/game-data.js
```

**PASS 기준:** `BUILDING_UPGRADES`는 건물 ID를 키로 하는 **객체** (배열 아님)
- 각 업그레이드 항목은 `id`, `name`, `cost`, `desc` 속성 보유
- `repeatable:true` 항목은 `costScale` 속성도 보유
- `premium:true` 항목은 선행 조건 `req:` 속성 보유
- `mult:` 값이 있는 경우 1.05~3.0 범위 권장

```bash
grep -n "mult:" js/game-data.js | grep -v "auto_\|moonstone" | head -20
```

**FAIL 예시:**
```javascript
// FAIL — mult 값이 과도함
{ id:'ops_super', mult:10.0 }

// FAIL — BUILDING_UPGRADES가 배열인 경우 (예전 구조)
const BUILDING_UPGRADES = [ ... ]
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
- `housing` ($200) < `ops_center` ($300) < `mine` ($800) < `extractor` ($6,000) < ... < `launch_pad` ($120,000)
- 건물 비용이 대략 2~5배씩 증가 (초기 저렴 → 후반 급격히 증가)

**위반 예시:**
```javascript
// FAIL — mine이 ops_center보다 저렴함 (밸런싱 문제)
{ id:'ops_center', baseCost:{money:800} },
{ id:'mine', baseCost:{money:300} }, // 너무 저렴
```

### Step 4b: 업그레이드 배수 검증

```bash
grep -n "mult:" js/game-data.js | head -30
```

**PASS 기준 (2가지 업그레이드 유형 구분):**

| 유형 | 속성 | mult 범위 | 설계 의도 |
|------|------|-----------|-----------|
| repeatable | `repeatable:true, costScale:X` | 1.05~1.10 | 누적 복리 설계 (여러 번 구매할수록 효과 누적) |
| premium (★) | `premium:true, req:'...'` | 2.0~3.0 | 마일스톤 단일 대형 부스트 |
| addon 일회성 | (repeatable/premium 없음) | 1.3~1.8 | 애드온 건물 전용 단계별 업그레이드 |

**위반 예시:**
```javascript
// FAIL — mult 값이 과도함 (어떤 유형에도 해당 없음)
{ id:'mine_super', mult:10.0 }

// FAIL — repeatable인데 mult가 너무 큼 (nuance 소실)
{ id:'ops_sales', repeatable:true, mult:2.0 }
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

### Step 5a: 파츠 일관성 (공정 기반 시스템)

```bash
grep -n "parts:" js/game-state.js
```

**PASS 기준:** `gs.parts` 초기값이 다음 4개 키를 포함해야 합니다 (값: 0):
- `hull`, `engine`, `propellant`, `pump_chamber`

**이전 파츠 키 (`fueltank`, `control`, `payload`) 잔존 시 FAIL** — 마이그레이션 누락 의미

```bash
grep -n "fueltank\|payload\|control" js/game-state.js
```
**PASS 기준:** `gs.parts` 초기값에서 이 키들이 없어야 함 (조립 완료 이력 등 다른 컨텍스트에는 허용)

### Step 5b: gs.res 리소스 키 확인

```bash
grep -A 1 "res: {" js/game-state.js
```

**PASS 기준 (Sprint 8+):** `gs.res`에 다음 키가 포함되어야 합니다:
- `money`, `iron`, `copper`, `fuel`, `electronics`, `research`
- **`metal`은 더 이상 사용하지 않음** — Sprint 8에서 `iron`/`copper`로 분리됨

**FAIL 예시:**
```javascript
// FAIL — metal 잔존 (Sprint 8 마이그레이션 미완료)
res: { money:1500, metal:0, fuel:0, electronics:0, research:0 }

// PASS — iron/copper 분리
res: { money:1500, iron:0, copper:0, fuel:0, electronics:0, research:0 }
```

---

## Step 5c: 신규 데이터 상수 정의 확인

**파일:** `js/game-data.js`

**검사:** Sprint 8에서 추가된 데이터 상수가 정의되어 있는지 확인합니다.

```bash
grep -n "const OPS_ROLES\|const BLD_STAFF_NAMES\|const BLD_STAFF_ICONS\|const SPECIALIST_ROLES\|const RESEARCH_BRANCHES" js/game-data.js
```

**PASS 기준:** 4개 상수 모두 정의됨:
- `OPS_ROLES` — 운영센터 역할 배열 (`sales`, `accounting`, `consulting`)
- `BLD_STAFF_NAMES` — 건물별 직원 명칭 맵
- `BLD_STAFF_ICONS` — 건물별 직원 아이콘 HTML 맵
- `SPECIALIST_ROLES` — 전문화 역할 정의 (`research_lab`, `ops_center` 등)
- `RESEARCH_BRANCHES` — 연구 브랜치 배열 (시간 기반 연구 시스템, Sprint 8)

**FAIL 시 조치:**
- 누락된 상수를 `js/game-data.js`에 추가 (프로그래밍팀장 담당)

---

## Step 5d: BALANCE 상수 정의 확인

**파일:** `js/balance-data.js`, `js/game-state.js`

**검사:** `game-state.js`가 참조하는 `BALANCE.*` 최상위 키가 `balance-data.js`에 모두 정의되어 있는지 확인합니다.

```bash
node --input-type=commonjs << 'SCRIPT'
const code = require('fs').readFileSync('js/game-state.js', 'utf8');
const refs = [...new Set((code.match(/BALANCE\.([A-Z_]+)/g) || []).map(m => m.split('.')[1]))].sort();
const bd = require('fs').readFileSync('js/balance-data.js', 'utf8');
const defs = (bd.match(/^\s{2}([A-Z_]+):/gm) || []).map(m => m.trim().replace(':','')).sort();
const missing = refs.filter(k => defs.indexOf(k) === -1);
if (missing.length === 0) console.log('PASS — BALANCE 참조키 ' + refs.length + '개 모두 balance-data.js에 정의됨');
else console.log('FAIL — 누락 키:', missing);
SCRIPT
```

**PASS 기준:** 출력이 `✅ PASS` (누락 키 없음)

**FAIL 시 조치:**
- 누락된 키를 `js/balance-data.js`의 `BALANCE` 객체에 추가 (기획팀장 담당)
- 게임 로직을 변경하지 않고 상수 값만 추가

---

## Step 5e: I18N 언어 키 완결성 확인

**파일:** `js/i18n.js`

**검사:** `I18N.en`과 `I18N.ko`의 최상위 키 개수가 일치하는지 확인합니다.

```bash
node --input-type=commonjs << 'SCRIPT'
const code = require('fs').readFileSync('js/i18n.js', 'utf8');
const enBlock = code.match(/en:\s*\{([\s\S]*?)ko:/);
const koBlock = code.match(/ko:\s*\{([\s\S]*?)\n\s*\};/);
const countKeys = function(b) { return b ? (b[1].match(/^\s{4}[a-z_]+:/gm) || []).length : 0; };
const en = countKeys(enBlock), ko = countKeys(koBlock);
if (en === ko) console.log('PASS — I18N 키 개수 일치: en=' + en + ', ko=' + ko);
else console.log('FAIL — 키 개수 불일치: en=' + en + ', ko=' + ko);
SCRIPT
```

**PASS 기준:** `en`과 `ko`의 키 개수가 동일

**FAIL 시 조치:**
- 누락된 언어의 키를 추가
- `en` 기준으로 `ko`에 없는 키를 찾아 번역 추가 (UI팀장 또는 기획팀장 담당)

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

## Step 7: 발사 단계 상수 키 일관성 검증

**파일:** `js/tabs/launch.js`

**검사:** 단계별 발사 시스템의 6개 상수 (`STAGE_FAILURES`, `STAGE_NAMES`, `STAGE_TIMING`, `STAGE_SUCCESS_EVENT`, `STAGE_PCT`, `STAGE_TELEM`) 모두 동일한 스테이지 번호 세트(4~11, 총 8개)를 커버하는지 확인합니다.

```bash
node --input-type=commonjs << 'SCRIPT'
const code = require('fs').readFileSync('js/tabs/launch.js', 'utf8');
const consts = ['STAGE_FAILURES','STAGE_NAMES','STAGE_TIMING','STAGE_SUCCESS_EVENT','STAGE_PCT','STAGE_TELEM'];
consts.forEach(function(k) {
  const m = code.match(new RegExp('const ' + k + ' = \\{'));
  if (!m) { console.log(k + ': NOT FOUND'); return; }
  let depth = 0, i = m.index + m[0].length - 1, found = [];
  while (i < code.length) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (depth === 0) break; }
    else if (depth === 1 && /\d/.test(code[i]) && (i === 0 || /[,\{\s]/.test(code[i-1]))) {
      const num = code.slice(i).match(/^(\d+)\s*:/);
      if (num) found.push(num[1]);
    }
    i++;
  }
  const unique = found.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort(function(a,b) { return +a-+b; });
  const expected = [4,5,6,7,8,9,10,11].map(String);
  const ok = JSON.stringify(unique) === JSON.stringify(expected);
  console.log(k + ': ' + (ok ? 'PASS [4~11]' : 'FAIL ' + JSON.stringify(unique)));
});
SCRIPT
```

**PASS 기준:** 6개 상수 모두 `✅ [4~11]` 출력 (스테이지 4~11 총 8개 키 보유)

**FAIL 시 조치:**
- 누락된 스테이지 번호를 해당 상수에 추가
- 일반적으로 단일 행에 정의된 상수(`STAGE_PCT`, `STAGE_TELEM` 등)는 `,` 누락이 원인인 경우가 많음

**예외:**
- `STAGE_TIMING.delay/duration` 구조 때문에 파서가 오탐할 수 있음 — 4~11 키가 실제로 있는지 직접 확인

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
- ✅ PASS — 파츠 정의 4개 (hull, engine, propellant, pump_chamber)
- ⚠️ WARN — 업그레이드 'basic_prod'의 unlocks 키 'bld_quarry'가 gs.unlocks에 없음

### 3. 탭 시스템 검증
- ✅ PASS — 6개 탭 unlock 키 정의됨
- ✅ PASS — 탭 전환 로직 매칭

### 4. 경제 밸런싱 검증
- ✅ PASS — 건물비용 점진적 증가 (150 → 100000)
- ✅ PASS — 업그레이드 배수 범위 (repeatable: 1.05~1.10, premium: 2.0~3.0)

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
