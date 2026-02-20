---
name: verify-design-consistency
description: MoonIdle 디자인 시스템 통일성 검증. CSS 토큰, 아이콘 형식, 클래스 네이밍, ComfyUI 프롬프트 스타일을 검사. UI/디자인 변경 후 사용.
---

# Purpose

이 스킬은 MoonIdle의 인더스트리얼 우주 테마 디자인 시스템의 통일성을 검증합니다:

1. **디자인 토큰 일관성** — CSS 변수 사용 및 하드코딩 색상 제거
2. **아이콘 표기법 통일** — `[XXX]` 형식 준수 및 중복 방지
3. **CSS 클래스 네이밍 규칙** — 접두사 패턴 일관성
4. **ComfyUI 프롬프트 스타일** — 테마 키워드 일관성
5. **UI 목업 규격** — HTML 목업 파일 구조 및 디자인 토큰 사용

# When to Run

다음 작업 후 이 스킬을 실행하세요:

1. **CSS 스타일 수정** — `index.html`의 `<style>` 섹션 변경 후
2. **새 UI 컴포넌트 추가** — 버튼, 패널, 카드 등 UI 요소 추가 후
3. **게임 데이터 추가** — 새 건물/파츠/업그레이드 아이콘 정의 후
4. **ComfyUI 에셋 생성** — 새 컨셉 아트 또는 BGM 프롬프트 작성 후
5. **UI 목업 제작** — `mockups/*.html` 파일 생성 또는 수정 후

# Related Files

| File | Purpose |
|------|---------|
| `index.html` | 메인 게임 파일 (CSS 디자인 토큰 정의 `:root` 섹션 포함) |
| `js/game-data.js` | 게임 데이터 (아이콘 정의 — `icon:'[XXX]'`) |
| `mockups/sprint1_ui_mockup_*.html` | UI 목업 파일 (디자인 토큰 사용 검증) |
| `mockups/concept_*.html` | 컨셉 아트 키비주얼 목업 |
| `mockups/comfy/out/requests/bgm_*.json` | ComfyUI BGM 요청 (프롬프트 스타일) |
| `mockups/comfy/out/requests/concept_*.json` | ComfyUI 컨셉 아트 요청 |

# Workflow

## Step 1: 디자인 토큰 일관성 검증

**파일:** `index.html`

### Step 1a: CSS 변수 정의 확인

```bash
grep -A 20 "^:root {" index.html
```

**PASS 기준:** `:root` 블록에 다음 토큰이 정의되어 있어야 합니다:
- 색상: `--bg`, `--panel-bg`, `--green`, `--green-dim`, `--green-mid`, `--amber`, `--red`, `--white`
- 폰트: `--font`
- 테두리: `--border`
- 글로우: `--glow`, `--glow-strong`, `--amber-glow`

**FAIL 시 조치:**
- 누락된 토큰을 `:root` 블록에 추가
- 기존 토큰 이름과 일치하도록 수정

### Step 1b: 하드코딩 색상 탐지

```bash
grep -n "color:\s*#[0-9a-fA-F]\{6\}" index.html
grep -n "background:\s*#[0-9a-fA-F]\{6\}" index.html
```

**PASS 기준:** 출력이 비어 있거나, 예외 케이스만 존재

**예외 케이스:**
- `:root` 블록 내부 (토큰 정의)
- 주석 처리된 코드
- `rgba()`, `hsla()` 함수 사용 (동적 색상)

**위반 예시:**
```css
/* FAIL — 디자인 토큰 대신 하드코딩 */
.my-button {
  color: #00e676; /* 하드코딩 */
}

/* PASS — 디자인 토큰 사용 */
.my-button {
  color: var(--green);
}
```

**FAIL 시 조치:**
- 하드코딩된 색상을 해당하는 CSS 변수로 교체
- 새로운 색상이 필요하면 `:root`에 토큰 추가 후 사용

---

## Step 2: 아이콘 표기법 통일성 검증

**파일:** `js/game-data.js`

### Step 2a: 아이콘 형식 검증

```bash
grep -oP "icon:'\[[A-Z0-9]+\]'" js/game-data.js | grep -oP "\[[A-Z0-9]+\]" | sort -u
```

**PASS 기준:** 모든 아이콘이 `[XXX]` 형식 (3~4글자 대문자/숫자)

**위반 예시:**
```javascript
// FAIL — 소문자 사용
{ id:'mine', icon:'[min]' }

// FAIL — 5글자 이상
{ id:'housing', icon:'[HOUSE]' }

// FAIL — 괄호 없음
{ id:'engine', icon:'ENG' }

// PASS — 정상
{ id:'mine', icon:'[MIN]' }
```

**FAIL 시 조치:**
- 아이콘을 대문자로 변경
- 3~4글자로 축약 (예: `[HOUSE]` → `[HSG]`)
- 괄호 `[]` 추가

### Step 2b: 아이콘 중복 확인

```bash
grep -oP "icon:'\[[A-Z0-9]+\]'" js/game-data.js | grep -oP "\[[A-Z0-9]+\]" | sort | uniq -d
```

**PASS 기준:** 출력이 비어 있음 (중복 아이콘 없음)

**FAIL 시 조치:**
- 중복된 아이콘을 고유한 것으로 변경
- 예: `[OPS]`가 2개 → 하나는 `[OP2]` 또는 `[MGT]`로 변경

### Step 2c: wbClass 일관성 확인

```bash
grep -oP "wbClass:'wb-[a-z]+'" js/game-data.js | grep -oP "wb-[a-z]+" | sort -u
```

**PASS 기준:** 모든 `wbClass`가 `wb-` 접두사 + 소문자 형식

**예상 값:**
- `wb-housing`, `wb-ops`, `wb-mine`, `wb-refinery`, `wb-eleclab`, `wb-research`, `wb-solar`, `wb-launchpad`

**위반 예시:**
```javascript
// FAIL — 대문자 사용
{ id:'mine', wbClass:'WB-MINE' }

// FAIL — 접두사 누락
{ id:'mine', wbClass:'mine' }

// PASS — 정상
{ id:'mine', wbClass:'wb-mine' }
```

---

## Step 3: CSS 클래스 네이밍 규칙 검증

**파일:** `index.html`

### Step 3a: 클래스 접두사 패턴 추출

```bash
grep -oP 'class="[^"]+' index.html | cut -d'"' -f2 | cut -d' ' -f1 | grep -oP '^[a-z]+-' | sort -u
```

**PASS 기준:** 다음 접두사만 사용되어야 함:
- `title-` — 타이틀 화면 관련
- `nav-` — 내비게이션 탭
- `bld-` — 건물 리스트/카드
- `wb-` — 월드 건물 (배경 렌더링)
- `r-panel-` — 우측 패널
- `rl-` — 리소스 왼쪽 패널
- `tab-` — 탭 페인 및 관련 요소
- `save-` — 세이브 슬롯 모달
- `tuf-` — 토글/유틸리티 (toggle utility flag)
- `ms-` — 마일스톤 (milestone)

**위반 예시:**
```html
<!-- FAIL — 임의의 접두사 -->
<div class="my-custom-panel"></div>

<!-- FAIL — 접두사 없음 -->
<div class="panel"></div>

<!-- PASS — 정상 -->
<div class="r-panel-scroll"></div>
```

**FAIL 시 조치:**
- 적절한 접두사로 변경
- 새로운 UI 영역이면 새 접두사 정의 후 이 섹션에 추가

### Step 3b: 카멜케이스 금지 확인

```bash
grep -oP 'class="[^"]*[A-Z][^"]*"' index.html | head -10
```

**PASS 기준:** 출력이 비어 있음 (클래스명에 대문자 없음)

**위반 예시:**
```html
<!-- FAIL — 카멜케이스 -->
<div class="navTab"></div>

<!-- PASS — 케밥케이스 -->
<div class="nav-tab"></div>
```

---

## Step 4: ComfyUI 프롬프트 스타일 검증

**디렉토리:** `mockups/comfy/out/requests/`

### Step 4a: 테마 키워드 일관성 확인

```bash
grep -h "\"tags\":" mockups/comfy/out/requests/bgm_*.json | grep -oP 'industrial|space|mission control|rocket|manufacturing|factory'
```

**PASS 기준:** BGM 프롬프트에 인더스트리얼 우주 테마 키워드가 포함됨

**필수 키워드 (최소 1개 이상):**
- `industrial`, `space`, `mission control`, `rocket`, `manufacturing`, `factory`, `assembly`, `launch`

**위반 예시:**
```json
// FAIL — 테마와 무관한 키워드만 사용
{
  "tags": "jazz, smooth, relaxing, cafe, lounge, piano"
}

// PASS — 테마 키워드 포함
{
  "tags": "electronic, industrial, space program, mission control, 134 bpm"
}
```

### Step 4b: "no vocals" 규칙 확인

```bash
grep -h "\"tags\":" mockups/comfy/out/requests/bgm_*.json | grep -c "no vocals"
```

**PASS 기준:** BGM 파일 개수와 일치 (10개)

**FAIL 시 조치:**
- 모든 BGM 프롬프트에 "no vocals" 추가

### Step 4c: 컨셉 아트 프롬프트 확인 (선택사항)

```bash
ls mockups/comfy/out/requests/concept_*.json 2>/dev/null | wc -l
```

컨셉 아트 요청 파일이 있는 경우, 다음 키워드 포함 여부 확인:
- `blueprint`, `technical`, `industrial`, `space station`, `orbital`, `mission control`

---

## Step 5: UI 목업 규격 검증

**디렉토리:** `mockups/`

### Step 5a: 디자인 토큰 사용 확인

```bash
grep -l "var(--" mockups/*.html | wc -l
```

**PASS 기준:** 모든 HTML 목업 파일이 CSS 변수 사용 (하드코딩 색상 금지)

**FAIL 시 조치:**
- 목업 파일의 하드코딩 색상을 `var(--green)` 등으로 교체

### Step 5b: 폰트 스택 일관성 확인

```bash
grep "font-family" mockups/*.html | grep -v "Share Tech Mono"
```

**PASS 기준:** 출력이 비어 있거나, `:root` 정의만 존재

**위반 예시:**
```html
<!-- FAIL — 다른 폰트 사용 -->
<style>
body { font-family: Arial, sans-serif; }
</style>

<!-- PASS — 디자인 토큰 사용 -->
<style>
body { font-family: var(--font); }
</style>
```

---

# Output Format

검증 결과를 다음 형식으로 보고합니다:

```markdown
## 디자인 통일성 검증 결과

### 1. 디자인 토큰 일관성
- ✅ PASS — `:root` 블록에 13개 필수 토큰 정의됨
- ⚠️ WARN — index.html:245에 하드코딩 색상 발견: `color: #00e676;`

### 2. 아이콘 표기법
- ✅ PASS — 모든 아이콘이 `[XXX]` 형식 준수 (52개)
- ❌ FAIL — 중복 아이콘 발견: `[OPS]` (2개)

### 3. CSS 클래스 네이밍
- ✅ PASS — 10개 접두사 패턴 준수
- ✅ PASS — 카멜케이스 없음

### 4. ComfyUI 프롬프트
- ✅ PASS — BGM 10개 모두 테마 키워드 포함
- ✅ PASS — BGM 10개 모두 "no vocals" 포함

### 5. UI 목업 규격
- ✅ PASS — 목업 5개 모두 CSS 변수 사용
- ✅ PASS — 폰트 스택 일관성 유지

---

**종합:** 1개 실패, 1개 경고 — 수정 필요
**권장 조치:**
1. `[OPS]` 중복 해결 (하나를 `[MGT]`로 변경)
2. index.html:245 하드코딩 색상을 `var(--green)`으로 교체
```

---

# Exceptions

다음은 **문제가 아닙니다**:

1. **`:root` 블록 내 하드코딩 색상** — 토큰 정의이므로 허용
2. **주석 처리된 코드** — 임시 비활성화된 코드는 검증 제외
3. **동적 색상 계산** — `rgba()`, `hsla()`, `calc()` 함수 사용은 정상
4. **SVG fill 속성** — SVG 내부의 `fill="#xxx"` 속성은 예외 (CSS 변수 미지원 환경)
5. **외부 라이브러리 클래스** — 서드파티 CSS 프레임워크 클래스는 접두사 규칙 면제
6. **단일 사용 유틸리티 클래스** — `hidden`, `active`, `locked` 등 상태 클래스는 접두사 없어도 됨
7. **ComfyUI 템플릿 플레이스홀더** — `__TAGS__` 등 플레이스홀더는 검증 제외
8. **개발 중 목업** — 파일명에 `_draft`, `_wip` 포함 시 엄격한 검증 면제
9. **아이콘 특수 케이스** — 숫자 포함 아이콘 (`[P1]`, `[S2]`, `[E4]` 등) 정상
10. **일부 클래스 접두사 없음** — 전역 레이아웃 클래스(`body`, `html`, `*`)는 접두사 불필요
