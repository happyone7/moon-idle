---
name: verify-ascii-rendering
description: MoonIdle ASCII 건물 렌더링 일관성 검증. 폰트 정의, 기반부 정렬, 박스 외폭 일치, 선행 공백 규칙을 검사. ASCII 건물 수정 후 사용.
---

# Purpose

이 스킬은 MoonIdle의 ASCII 건물 아트 렌더링 품질과 일관성을 검증합니다:

1. **폰트 정의 검증** — `.world-bld` CSS가 Courier New 계열 폰트 사용 (Share Tech Mono 금지)
2. **기반부 정렬 검증** — 각 건물의 기반부(████) 폭이 박스 외곽선 폭과 정확히 일치
3. **선행 공백 일관성** — 박스 상단 행의 선행 공백 수 == 기반부 선행 공백 수
4. **박스 드로잉 문자 사용** — 정확한 box-drawing 문자 (╔═╗║╚╝) 사용
5. **구문 유효성 검증** — `js/world.js` JavaScript 문법 검사

# When to Run

다음 작업 후 이 스킬을 실행하세요:

1. **신규 건물 추가** — `js/world.js`의 `_bldAscii()` 함수에 새 건물 아트 추가 후
2. **기존 건물 수정** — ASCII 아트 라인(박스 또는 기반부) 변경 후
3. **건물 업그레이드 아트 추가** — `bu.upgrade_name` 조건부 아트 추가 후
4. **폰트 스타일 변경** — `index.html`의 `.world-bld` CSS 수정 후
5. **Sprint QA 전** — 모든 ASCII 건물이 정상 렌더링되는지 최종 검증

# Related Files

| File | Purpose |
|------|---------|
| `js/world.js` | ASCII 건물 아트 정의 (`_bldAscii()` 함수, 300+ 라인) |
| `index.html` | `.world-bld` CSS 정의 (font-family, 색상, 애니메이션) |
| `Docs/ASCII_Building_Guide.md` | ASCII 건물 구현 가이드 (폰트/정렬 규칙 문서화) |
| `mockups/ascii-art/buildings/*.txt` | ASCII 아트 목업 파일 (mine, research_lab, solar_array 등) |
| `qa/sprint6_qa_report.md` | Sprint 6 좌측 돌출 버그 수정 QA |
| `qa/sprint7_qa_report.md` | Sprint 7 우측 돌출 버그 수정 QA (10건 ASCII 기반부 정렬) |

# Workflow

## Step 1: 폰트 정의 검증

**파일:** `index.html`

### Step 1a: .world-bld CSS 블록 찾기

```bash
grep -n "\.world-bld {" index.html
```

**PASS 기준:** `.world-bld` CSS 블록이 존재해야 함

### Step 1b: font-family 정의 확인

`.world-bld` CSS 블록 내용을 읽고 `font-family` 속성을 확인합니다.

**PASS 기준:**

```css
.world-bld {
  font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
  /* 기타 속성... */
}
```

**FAIL 예시:**

```css
/* ❌ FAIL — Share Tech Mono 사용 금지 */
.world-bld {
  font-family: var(--font);  /* Share Tech Mono → 박스 드로잉 문자 폴백 → 폭 불일치 */
}

/* ❌ FAIL — Share Tech Mono 직접 사용 */
.world-bld {
  font-family: 'Share Tech Mono', monospace;
}

/* ✅ PASS — Courier New 계열 사용 */
.world-bld {
  font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
}
```

**근거:**

Share Tech Mono는 `unicode-range: U+0000-00FF`만 커버하여 박스 드로잉 문자(U+2500-257F)를 지원하지 않습니다. 결과적으로 ╔═╗║╚╝는 Courier New로 폴백되고 █는 Share Tech Mono 폭으로 렌더링되어 **같은 글자 수여도 시각적 폭이 달라집니다**.

**FAIL 시 조치:**

```css
/* index.html — .world-bld 블록 수정 */
.world-bld {
  font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
}
```

---

## Step 2: 기반부 정렬 검증 (전수조사 스크립트)

**파일:** `js/world.js`

### Step 2a: 기반부 라인 추출 및 폭 계산

다음 Node.js 스크립트를 실행하여 모든 기반부(████ 포함 라인)를 추출하고 폭을 계산합니다:

```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('js/world.js', 'utf8');
const lines = code.split('\n');
const results = [];
lines.forEach((line, i) => {
  if (line.includes('█')) {
    const content = line.replace(/.*?[''\`](.*)[''\`].*/, '\$1');
    const leadSp = content.match(/^( *)/)[1].length;
    const blocks = (content.match(/█/g) || []).length;
    results.push({ line: i+1, leadSp, blocks, total: leadSp + blocks, sample: content.slice(0,20) });
  }
});
console.table(results);
"
```

**출력 예시:**

```
┌─────────┬──────┬────────┬────────┬───────┬──────────────────────┐
│ (index) │ line │ leadSp │ blocks │ total │       sample         │
├─────────┼──────┼────────┼────────┼───────┼──────────────────────┤
│    0    │  51  │   0    │   9    │   9   │ '█████████'          │
│    1    │  63  │   0    │   9    │   9   │ '█████████'          │
│    2    │  75  │   0    │  13    │  13   │ '█████████████'      │
│    3    │  85  │   0    │  13    │  13   │ '█████████████'      │
│   ...   │ ...  │  ...   │  ...   │  ...  │ ...                  │
└─────────┴──────┴────────┴────────┴───────┴──────────────────────┘
```

### Step 2b: 건물별 예상 폭과 대조

다음 건물별 박스 외폭 표준값과 스크립트 출력의 `total` 값을 비교합니다:

| 건물 유형 (wbClass) | 박스 외폭 | 기반부 예상 total | 선행 공백 | 블록 수 |
|---------------------|-----------|-------------------|-----------|---------|
| `wb-housing` (township) | 9자 | 9 | 0 | 9 |
| `wb-housing` (dorm/welfare 기본) | 13자 | 13 | 0 | 13 |
| `wb-housing` (dorm/welfare tier≥2) | 13자 | 13 | 0 | 13 |
| `wb-ops` (ops_center 기본) | 12자 | 12 | 0 | 12 |
| `wb-ops` (premium/24h/sales 변형) | 12자 | 12 | 0 | 12 |
| `wb-supply` (supply_depot) | 12자 | 12 | 0 | 12 |
| `wb-mine` (기본/robot/deep) | 15자 | 15 | 0 | 15 |
| `wb-refinery` | 10자 | 10 | 0 | 10 |
| `wb-eleclab` | 12자 | 12 | 0 | 12 |
| `wb-research` (research_lab) | 14자 | 14 | 0 | 14 |
| `wb-research` (r_and_d) | 14자 | 14 | 0 | 14 |
| `wb-solar` (3패널) | 15자 | 15 | 1 | 14 |
| `wb-addon` (inv_bank, tech_hub) | 10자 | 10 | 1 | 8 |
| `_scaffoldAscii` (비건물 — 공사 중) | 9자 | 9 | 2 | 7 |
| `wb-launchpad` (launch_pad 기본) | 15자 | 15 | 0 | 15 |
| `wb-launchpad` (gantry 변형) | 15자 | 15 | 0 | 15 |

**PASS 기준:**

스크립트 출력의 각 라인에서:
- `total` 값이 해당 건물 유형의 **박스 외폭**과 정확히 일치
- `leadSp` 값이 해당 건물 박스 상단 행의 선행 공백 수와 일치

**FAIL 예시:**

```
| line │ leadSp │ blocks │ total │       sample         │
| 123  │   1    │  10    │  11   │ ' ██████████'        │  ← ops_center 기반부 (박스 외폭 12자인데 11자)
```

위 경우, ops_center의 박스 외폭은 `╔══════════╗` (12자)인데 기반부는 11자 → **FAIL**

**FAIL 시 조치:**

해당 라인 번호로 `js/world.js` 이동하여 기반부를 수정합니다:

```javascript
// ❌ FAIL — js/world.js:123
return (
  '╔══════════╗\n' +  // 12자
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  ' ██████████'        // 11자 (선행 공백 1 + 블록 10)
);

// ✅ 수정
return (
  '╔══════════╗\n' +  // 12자
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  '████████████'       // 12자 (선행 공백 0 + 블록 12)
);
```

---

## Step 3: 선행 공백 일관성 검증

**파일:** `js/world.js`

### Step 3a: 의도적 선행 공백이 있는 건물 식별

다음 건물 유형은 **박스 자체가 공백으로 시작**하므로 기반부에도 동일한 선행 공백이 필요합니다:

| 건물 유형 | 박스 상단 선행 공백 | 기반부 선행 공백 | 예시 |
|-----------|---------------------|------------------|------|
| `wb-solar` (3패널) | 1 | 1 | ` ╔╗    ╔╗    ╔╗` → ` ██████████████` |
| `wb-addon` | 1 | 1 | ` ╔══════╗` → ` ████████` |
| `_scaffoldAscii` | 2 | 2 | `  ╔═════╗` → `  ███████` |

### Step 3b: 검사 방법

Step 2a의 전수조사 스크립트 출력에서 `leadSp > 0`인 라인을 필터링합니다:

```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('js/world.js', 'utf8');
const lines = code.split('\n');
const results = [];
lines.forEach((line, i) => {
  if (line.includes('█')) {
    const content = line.replace(/.*?[''\`](.*)[''\`].*/, '\$1');
    const leadSp = content.match(/^( *)/)[1].length;
    const blocks = (content.match(/█/g) || []).length;
    if (leadSp > 0) {
      results.push({ line: i+1, leadSp, blocks, total: leadSp + blocks, sample: content.slice(0,25) });
    }
  }
});
console.table(results);
"
```

**PASS 기준:**

선행 공백이 있는 모든 기반부가 위 표의 **의도적 선행 공백** 항목과 일치해야 함.

**FAIL 예시:**

```
| line │ leadSp │ blocks │ total │         sample           │
| 210  │   1    │  11    │  12   │ ' ███████████'           │  ← ops_center (선행 공백 의도 없음)
```

ops_center는 선행 공백이 없어야 하는데 `leadSp = 1` → **FAIL**

**FAIL 시 조치:**

```javascript
// ❌ FAIL — 의도치 않은 선행 공백
return (
  '╔══════════╗\n' +
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  ' ███████████'  // 선행 공백 1자 + 블록 11 = 12자 (박스 폭과 일치하지만 선행 공백은 불필요)
);

// ✅ 수정
return (
  '╔══════════╗\n' +
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  '████████████'  // 선행 공백 0 + 블록 12 = 12자
);
```

---

## Step 4: 박스 드로잉 문자 일관성 검증

**파일:** `js/world.js`

### Step 4a: 정확한 box-drawing 문자 사용 확인

```bash
grep -n "[╔╗╚╝═║╠╣╦╩╬]" js/world.js | head -20
```

**PASS 기준:**

ASCII 건물 아트에 다음 box-drawing 문자만 사용되어야 함:

| 문자 | Unicode | 용도 |
|------|---------|------|
| `╔` | U+2554 | 박스 좌상단 |
| `╗` | U+2557 | 박스 우상단 |
| `╚` | U+255A | 박스 좌하단 |
| `╝` | U+255D | 박스 우하단 |
| `═` | U+2550 | 가로 이중선 |
| `║` | U+2551 | 세로 이중선 |
| `╠` | U+2560 | 좌측 T자 분기 |
| `╣` | U+2563 | 우측 T자 분기 |
| `╦` | U+2566 | 상단 T자 분기 |
| `╩` | U+2569 | 하단 T자 분기 |
| `╬` | U+256C | 십자 교차 |

**FAIL 예시:**

```javascript
// ❌ FAIL — 단일선 문자 사용 (이중선과 혼용 금지)
return (
  '┌──────────┐\n' +  // 단일선 ┌─┐
  '│ OPS CTR  │\n' +  // 단일선 │
  '└──────────┘\n' +  // 단일선 └─┘
  '████████████'
);

// ✅ PASS — 이중선 통일
return (
  '╔══════════╗\n' +  // 이중선 ╔═╗
  '║ OPS CTR  ║\n' +  // 이중선 ║
  '╚══════════╝\n' +  // 이중선 ╚═╝
  '████████████'
);
```

### Step 4b: 블록 문자 일관성 확인

```bash
grep -oP "[█▓▒░▀▄]" js/world.js | sort -u
```

**PASS 기준:**

다음 블록 문자만 사용되어야 함:

| 문자 | Unicode | 용도 |
|------|---------|------|
| `█` | U+2588 | 기반부 (전체 블록) |
| `▓` | U+2593 | 건물 내부 표현 (진한 음영) |
| `▒` | U+2592 | 건물 내부 표현 (중간 음영) |
| `░` | U+2591 | 건물 내부 표현 (연한 음영) |
| `▀` | U+2580 | 지붕 표현 (상단 반 블록, 선택사항) |
| `▄` | U+2584 | 바닥 표현 (하단 반 블록, 선택사항) |

**FAIL 예시:**

```javascript
// ❌ FAIL — 기반부에 ▓ 사용 (기반부는 반드시 █ 전체 블록만 사용)
return (
  '╔══════════╗\n' +
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  '▓▓▓▓▓▓▓▓▓▓▓▓'  // ▓ 사용 금지
);

// ✅ PASS — 기반부는 █만 사용
return (
  '╔══════════╗\n' +
  '║ OPS CTR  ║\n' +
  '╚══════════╝\n' +
  '████████████'   // ✅
);
```

**예외:** 건물 **내부** 표현에는 `▓▒░` 사용 가능 (예: housing의 `║ ▓▓ ▓▓ ▓▓  ║`)

---

## Step 5: JavaScript 구문 유효성 검증

**파일:** `js/world.js`

### Step 5a: 구문 검사

```bash
node --check js/world.js
```

**PASS 기준:** 출력이 비어 있음 (오류 없음)

**FAIL 예시:**

```
js/world.js:245
  return (
         ^

SyntaxError: missing ) after argument list
    at Module._compile (node:internal/modules/cjs/loader:1364:18)
```

**원인:** ASCII 아트 문자열 내부의 따옴표/백슬래시 이스케이프 누락 또는 괄호 불일치

**FAIL 시 조치:**

오류 메시지의 라인 번호로 이동하여 구문 오류 수정:

```javascript
// ❌ FAIL — 문자열 내부 따옴표 이스케이프 누락
return (
  '╔══════════╗\n' +
  '║ IT'S OPS ║\n' +  // '가 문자열 종료로 인식됨
  '╚══════════╝\n' +
  '████████████'
);

// ✅ 수정 — 이스케이프 추가
return (
  '╔══════════╗\n' +
  '║ IT\'S OPS ║\n' +  // \' 이스케이프
  '╚══════════╝\n' +
  '████████████'
);
```

---

## Step 6: ASCII 아트 목업 파일 검증 (선택사항)

**디렉토리:** `mockups/ascii-art/buildings/`

### Step 6a: 목업 파일 존재 확인

```bash
ls mockups/ascii-art/buildings/*.txt
```

**PASS 기준:** 최소 6개 이상의 건물 목업 파일 존재

**예상 파일:**

- `mine.txt`
- `research_lab.txt`
- `solar_array.txt`
- `elec_lab.txt`
- `refinery.txt`
- `launch_pad.txt`

### Step 6b: 목업 파일과 코드 일치 확인 (샘플)

`mockups/ascii-art/buildings/mine.txt`를 읽고 `js/world.js`의 `wb-mine` 케이스와 비교합니다.

**PASS 기준:**

목업 파일의 ASCII 아트가 코드의 기본(tier=0) 아트와 **시각적으로 유사**해야 함 (정확히 일치하지 않아도 됨 — 목업은 컨셉 참조용)

**FAIL 시 조치:**

코드와 목업이 크게 다른 경우, 둘 중 하나를 업데이트하여 일관성 유지

---

# Output Format

검증 결과를 다음 형식으로 보고합니다:

```markdown
## ASCII 건물 렌더링 검증 결과

### 1. 폰트 정의
- ✅ PASS — `.world-bld` CSS에 Courier New 계열 폰트 사용 (index.html:474)
- ❌ FAIL — `.world-bld`에 `var(--font)` 사용 (Share Tech Mono 금지)

### 2. 기반부 정렬 (전수조사)
- ✅ PASS — 52개 기반부 라인 모두 박스 외폭과 일치
- ❌ FAIL — 3개 기반부 폭 불일치:
  - js/world.js:123 — ops_center 기반부 11자 (박스 외폭 12자)
  - js/world.js:210 — refinery 기반부 11자 (박스 외폭 10자)
  - js/world.js:340 — solar 3패널 기반부 14자 (박스 외폭 15자, 선행 공백 누락)

### 3. 선행 공백 일관성
- ✅ PASS — 의도적 선행 공백 건물 3종 (solar, addon, scaffold) 모두 정상
- ⚠️ WARN — js/world.js:123에 의도치 않은 선행 공백 1자 발견 (ops_center)

### 4. 박스 드로잉 문자
- ✅ PASS — 이중선 문자(╔═╗║╚╝╠╣) 일관성 유지
- ✅ PASS — 블록 문자(█▓▒░) 정상 사용

### 5. 구문 유효성
- ✅ PASS — `node --check js/world.js` 오류 없음
- ❌ FAIL — SyntaxError at line 245 (괄호 불일치)

### 6. 목업 파일 (선택)
- ✅ PASS — 6개 건물 목업 파일 존재
- ⚠️ INFO — mine.txt와 코드 tier=0 아트 시각적 유사성 확인됨

---

**종합:** 2개 실패, 1개 경고 — 수정 필요

**권장 조치:**
1. js/world.js:123 — ops_center 기반부를 12자로 수정 (선행 공백 제거)
2. js/world.js:210 — refinery 기반부를 10자로 수정
3. js/world.js:340 — solar 3패널 기반부에 선행 공백 1자 추가
4. js/world.js:245 — 구문 오류 수정 (괄호 또는 따옴표 이스케이프)
```

---

# Exceptions

다음은 **문제가 아닙니다**:

1. **목업 파일과 코드 불일치** — 목업은 컨셉 참조용이며, 코드가 더 상세하거나 다를 수 있음 (경고로만 표시)
2. **내부 장식 문자** — 건물 **내부**(`║`로 둘러싸인 영역)에서 `▓▒░`, 숫자, 문자, 기호 등 사용은 정상
3. **주석 처리된 아트** — 주석(`//`)으로 비활성화된 ASCII 아트는 검증 제외
4. **애드온 건물의 부모 건물 참조** — `ADDON_POSITIONS` 객체에서 부모 건물 위치를 참조하는 것은 정상
5. **높이 단계별 아트 변형** — 동일 건물이 `tier` 값에 따라 여러 아트 변형을 가지는 것은 정상 (각 변형의 기반부 폭만 일치하면 됨)
6. **스캐폴드(`_scaffoldAscii`)** — 공사 중 임시 건물 표현이므로 선행 공백 2자는 의도적 (정상)
7. **목업 디렉토리의 다른 파일** — `mockups/ascii-art/assembly/`, `launch/`, `missions/`, `research/`, `ui/` 디렉토리의 파일들은 건물 아트가 아니므로 검증 제외 (정보 제공만)
8. **CSS 애니메이션 및 색상** — `.world-bld` CSS에서 `color`, `text-shadow`, `animation` 속성은 검증 범위 밖 (폰트만 확인)
9. **동적 높이 조정** — `_bldHeightTier(cnt)` 함수로 건물 개수에 따라 높이가 달라지는 것은 정상 동작
10. **박스 내부 가로 구분선** — `╠═════╣` 같은 중간 구분선 사용은 정상 (시각적 구조 표현)
