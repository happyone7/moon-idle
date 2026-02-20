# MoonIdle ASCII 건물 구현 가이드

> **작성**: 2026-02-21
> **배경**: Sprint 6~7에서 건물 우측 돌출·지지대 쏠림 버그를 반복 겪은 경험에서 도출
> **대상**: 프로그래밍팀장, UI팀장 — `js/world.js` 건물 ASCII 아트 수정 시 필독

---

## 1. 핵심 원칙

### 1-1. 폰트는 반드시 Courier New 계열만 사용

```css
/* index.html — .world-bld CSS 블록 */
font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;
```

**절대 `var(--font)` (Share Tech Mono) 사용 금지.**

| 폰트 | 박스 드로잉 문자 (╔═╗║╚╝) | 블록 문자 (█) | 결과 |
|------|---------------------------|--------------|------|
| Share Tech Mono | ❌ 미지원 → 시스템 폰트 폴백 | ✅ 지원 | **폭 불일치 → 우측 돌출** |
| Courier New | ✅ 동일 폭 | ✅ 동일 폭 | 정상 정렬 |

> **이유**: Share Tech Mono의 `unicode-range`는 U+0000~00FF에 한정되어 박스 드로잉 문자(U+2500~257F)를 커버하지 않는다. 결과적으로 ╔═╗║╚╝는 Courier New로 폴백되고 █는 Share Tech Mono 폭으로 렌더링되어 **같은 글자 수여도 시각적 폭이 다르게 보인다**.

---

## 2. 건물 아트 구조 규칙

### 2-1. 기반부(████) 폭 = 박스 외폭

모든 건물의 기반부(마지막 줄 블록 문자)는 **박스 외곽선의 총 폭과 동일해야 한다.**

```
╔══════════╗   ← 박스 외폭 = 12자 (╔ + 10 + ╗)
║  CONTENT ║
╚══════════╝
████████████   ← 기반부도 12자 (공백 없음)
```

| 건물 유형 | 박스 외폭 | 기반부 |
|-----------|-----------|--------|
| ops_center / supply_depot (기본) | 12자 (`╔══════════╗`) | `████████████` (12블록) |
| ops_center premium/24h/sales 변형 | 12자 | `████████████` (12블록) |
| research_lab / r_and_d | 14자 | `██████████████` (14블록) |
| eleclab | 12자 | `████████████` (12블록) |
| housing (기본) | 13자 | `█████████████` (13블록) |
| housing township | 9자 | `█████████` (9블록) |
| mine (기본/robot/deep) | 15자 | `███████████████` (15블록) |
| wb-refinery | 10자 | `██████████` (10블록) |
| solar 3패널 | 15자 (1공백+14) | ` ██████████████` (1공백+14블록) ← 박스도 공백 시작 |
| addon (inv_bank, tech_hub) | 10자 (1공백+8) | ` ████████` (1공백+8블록) |
| _scaffoldAscii | 9자 (2공백+7) | `  ███████` (2공백+7블록) |

### 2-2. 의도적 선행 공백과 실수 구분

일부 건물은 **박스 자체가 공백으로 시작**하므로 기반부에도 동일한 공백이 필요하다.

```
 ╔╗    ╔╗    ╔╗   ← solar 3패널: 1공백으로 시작 (총 15자)
 ██████████████   ← 기반부도 1공백+14블록 = 15자 ✅
```

**판단 기준**: 박스 1행(상단 가로줄)의 선행 공백 수 == 기반부의 선행 공백 수

---

## 3. 수정 작업 절차

### Step 1: 박스 외폭 계산

수정할 건물의 아트 상단 행(`╔...╗`)에서 총 글자 수를 센다.

```javascript
// 예: ops_center
// '╔══════════╗' → 12자
// 기반부는 반드시 12자로 맞춰야 함
```

### Step 2: 기반부 글자 수 확인

```javascript
// 해당 건물의 기반부 라인을 찾아서 길이 확인
'████████████'.length   // 12 ✅
' ██████████'.length    // 11 ❌ (선행 공백 1 + 블록 10)
'███████████'.length    // 11 ❌ (블록 11, 박스 10에 맞춰야 할 경우)
```

### Step 3: 전수조사 스크립트 (Node.js)

새 건물 추가 또는 기존 건물 수정 후 **반드시** 실행:

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

각 건물별 `total`이 박스 외폭과 일치하는지 확인한다.

### Step 4: 구문 오류 검사

```bash
node --check js/world.js
node --check js/game-data.js
node --check js/game-state.js
```

---

## 4. 자주 발생하는 실수 유형

### 실수 A: 선행 공백이 붙은 기반부

```javascript
// ❌ 잘못됨 — 기반부에 의도치 않은 공백 1자
return ' ██████████\n';   // 11자 (박스는 12자)

// ✅ 수정
return '████████████\n';  // 12자
```

**증상**: 건물 기반부(지지대)가 좌측 또는 우측으로 쏠려 보임

### 실수 B: 기반부가 1자 더 넓음

```javascript
// ❌ 잘못됨 — 블록이 1개 더 많음
return '███████████\n';   // 11자 (박스는 10자인 wb-refinery)

// ✅ 수정
return '██████████\n';    // 10자
```

**증상**: 기반부가 건물보다 우측으로 튀어나옴

### 실수 C: 폰트 문제를 문자 수 문제로 오인

문자 수가 맞는데도 시각적으로 돌출이 보이면 **폰트 렌더링 문제**다.

```css
/* 확인: index.html의 .world-bld font-family가 이것인지 체크 */
font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace;

/* 절대 이것이면 안 됨 */
font-family: var(--font);  /* ❌ Share Tech Mono → 폴백 발생 */
```

---

## 5. 신규 건물 추가 시 체크리스트

```
□ 박스 상단 행 총 글자 수 계산
□ 기반부 블록 수 = 박스 외폭 (선행 공백 포함 일치)
□ node 전수조사 스크립트 실행 후 total 확인
□ node --check js/world.js 구문 검사
□ Playwright 스모크 테스트 실행
□ 브라우저에서 시각 확인 (건물 아트 정렬 이상 없음)
```

---

## 6. 관련 파일 및 커밋 참조

| 파일 | 역할 |
|------|------|
| `js/world.js` | 건물 ASCII 아트 정의 (`getBldAscii()` 함수) |
| `index.html` | `.world-bld` CSS (font-family 정의) |
| `qa/sprint6_qa_report.md` | Sprint 6 좌측 돌출 수정 QA |
| `qa/sprint6_qa_report_v2.md` | solar 3패널 오탐 정정 QA |
| `qa/sprint7_qa_report.md` | P7-4 ASCII 기반부 10건 수정 QA |
| `qa/sprint7_qa_final.md` | 최종 통합 QA (Playwright PASS) |

**핵심 커밋**:
- `17725d6` — 좌측 돌출 수정 (앞 공백 제거)
- `31c22a0` — 우측 돌출 수정 (ops/refinery/scaffold 10건)
- `6eae7f9` — 폰트 통일 (Courier New)
