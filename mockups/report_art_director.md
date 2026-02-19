# MoonIdle 아트디렉터 개선 제안서

작성일: 2026-02-20
작성자: TA (Technical Artist / Art Director)
대상 파일: `index.html`, `js/world.js`, `mockups/sprint1_ui_mockup_v2_industrial.html`

---

## 1. 현재 비주얼 스타일 평가

### 1.1 색상 팔레트 일관성 (CSS 변수 활용도)

**강점**

현재 코드는 `:root`에 7개의 디자인 토큰을 체계적으로 정의하고 있다.

```css
--bg:         #010800   /* 배경       */
--panel-bg:   #020d04   /* 패널 배경  */
--green:      #00e676   /* 활성 요소  */
--green-dim:  #1a5c34   /* 비활성     */
--green-mid:  #00994d   /* 서브 텍스트*/
--amber:      #ffab00   /* 경고/돈    */
--red:        #ff1744   /* 에러       */
--white:      #c8ffd4   /* 강조 텍스트*/
```

토큰을 전역적으로 활용하는 규율이 잘 지켜지고 있고, `--glow`, `--glow-strong`, `--amber-glow` 같은 그림자 토큰도 일관되게 사용된다.

**문제점 — 직접 하드코딩된 색상값 혼재**

변수 밖에서 직접 박힌 컬러값이 다수 존재한다.

- `#0a1a0a`, `#0a1808`, `#060f08`, `#081408` — 패널 배경의 변형이 토큰 없이 혼재
- `#7a5100` — amber의 dim 변형이 토큰화되지 않음 (최소 5곳에서 반복)
- `#1a3a1a`, `#2a3a2a`, `#1a4020` — 비활성/잠금 상태 색상이 제각각
- `#6a8a6a`, `#8aaa8a` — 퀘스트/미션 텍스트 전용 색상이 정의 없이 사용됨
- `rgba(0,230,118, 0.xx)` — 투명도 변형이 6~7개의 다른 알파값으로 흩어짐

**권장 추가 토큰**

```css
--amber-dim:    #7a5100
--green-deep:   #0a1a0a   /* 패널 내부 구분선/배경 */
--text-muted:   #6a8a6a   /* 퀘스트, 힌트 텍스트  */
--locked:       #1a3a1a   /* 잠금 상태 공통       */
--green-alpha:  rgba(0,230,118, 0.06)  /* 호버 배경 */
```

### 1.2 ASCII 아트 퀄리티 및 통일감

**강점**

- 박스 드로잉 문자(`╔ ═ ║ ╚ ╝ ╠ ╣`)를 사용한 일관된 건물 외형
- 업그레이드 티어별 ASCII 변형이 체계적으로 구현됨 (예: `wb-housing` 기본→dorm→welfare→township 4단계)
- 발사대(`wb-launchpad`)의 로켓 실루엣 `/▲╲` 형태는 테마에 잘 맞음

**문제점**

- 건물 간 높이/너비 불균형: `wb-housing` 11자 폭 vs `wb-mine` 14자 폭 vs `wb-research` 13자 폭. 지평선 정렬 시 시각적 혼란 발생
- `_scaffoldAscii()`의 `║/////║` 표현이 너무 단순하고 다른 건물의 디테일 수준과 격차가 큼
- `wb-refinery`는 공백 분리 형태( `╔═╗  ╔══╗`)로 다른 건물처럼 단일 박스가 아니어서 선택 영역 히트박스 불일치 발생 가능
- 애드온 건물(`─╔══════╗`)의 `-` 연결 표현이 부모 건물 우측 에지와 맞닿지 않아 단절감이 있음
- 태양광 패널 (`wb-solar`)이 단순 `╔╗ ╠╣ ╚╝` 2개로, 다른 건물 대비 너무 단조롭고 작음

### 1.3 폰트/타이포 가독성

**강점**

- `Share Tech Mono` 단일 폰트 정책으로 일관성 있는 터미널 미학 구현
- `letter-spacing` 적극 활용으로 헤더 계층 구분

**문제점**

- 본문 최소 폰트 사이즈가 **9px** (`rdp-viz-hd`, `rc-art-label`, `.qs-section-hd` 등)까지 내려감. 135ppi 미만 모니터에서 가독성 붕괴
- 정보 계층이 3단계(11px 서브, 13px 본문, 15~17px 헤더) 이상으로 분화되어 있으나 일부 섹션에서 11px와 10px, 9px가 뒤섞임
- 목업(`sprint1_ui_mockup_v2_industrial.html`)은 `Orbitron` + `Space Grotesk` 조합을 제안하는데, 현재 게임의 모노 폰트와 완전히 다른 방향. 두 접근법 중 하나를 명확히 선택해야 함

---

## 2. 화면별 UX 분석

### 2.1 생산 탭 (월드뷰 + 건물 패널)

**구조 개요**

- `#world-bg` (fixed, z-index:0) — 스크롤 가능한 3200px 파노라마 배경
- `#prod-bld-panel` (inline-block, 220px 우측 고정) — 건물 목록 오버레이
- `#bld-ov` (fixed, 490px) — 호버 시 건물 상세 오버레이

**UX 강점**

- 건물 상태(ghost/idle/active)를 CSS 클래스로 시각화하고 opacity와 text-shadow 조합으로 구분
- 호버 시 490px 2열 오버레이(액션 목록 + 설명)로 충분한 정보 제공
- `wb-anim-build`와 `wb-anim-upgrade` 애니메이션이 피드백을 명확히 전달

**UX 문제점**

1. **월드뷰가 탭 뒤 레이어(z-index:0)에 고정**되어 있어 생산 탭이 아닐 때 배경이 blur+dim 처리됨. 탭 전환 시 배경 전환 딜레이(0.5s)가 존재하는데, 다른 탭으로 이동 중 월드 배경이 잠깐 선명하게 보이다 흐려지는 시각적 노이즈 발생
2. **건물 패널(`#prod-bld-panel`)이 우측 상단 절대 위치**(`text-align:right`)로 배치되어 있어 좌측 자원 패널과 3컬럼 레이아웃이 깨짐. 월드 위에 floating 형태로 올라가 있어 소형 화면에서 건물 클릭 영역을 가림
3. **워커 도트(●)가 무작위 x 위치**에서 선형 이동하며 건물과의 연관성이 없음. 배치된 워커가 해당 건물 영역 안에서 움직이지 않아 생산 상태 시각화 효과 반감
4. **z-index 충돌**: `#app`이 z-index:10이고 `#world-bg`가 z-index:0이어서 실제 building `<pre>` 요소가 app 레이어 뒤에 있음. 이를 해결하기 위해 `initWorldDrag()`에서 `getBoundingClientRect` 기반 수동 히트 테스트를 구현하고 있는데, 이는 취약하고 성능 비용이 있는 우회책. 구조적 개선이 필요함

### 2.2 연구 탭 (카드 트리)

**구조 개요**

- `rsh-layout2` (flex 수평) — 좌측 트리 + 우측 디테일 패널(196px)
- 티어별 열(`rsh-tier-col`) + 화살표 구분자(`rsh-tier-arrow`)로 좌우 스크롤 트리 구현

**UX 강점**

- `rsh-card2.available`에 `node-available-pulse` 애니메이션으로 연구 가능 상태 강조
- 클릭 시 우측 디테일 패널이 업데이트되는 인터랙션 패턴은 직관적

**UX 문제점**

1. **연결선이 없음**: `rsh-tier-arrow`가 단순 텍스트 `>` 화살표로 카드 간 선행 요건 관계를 표현함. 어떤 카드가 어떤 카드를 필요로 하는지 시각적으로 파악 불가능 — SVG 연결선 또는 의사 엘리먼트 라인 필요
2. **잠금 카드(opacity:0.45)**가 실제 어떤 조건에서 잠금 해제되는지 트리상으로 식별하기 어려움. 선행 카드가 완료되지 않은 경우 잠금 카드에 "선행 요건 이름" 표시 필요
3. **우측 디테일 패널 너비(196px)**가 좁아 한국어 기준 2줄로 줄바꿈되는 항목이 많음. 최소 220px 이상 권장
4. **연구 완료 시 피드백 없음**: 카드가 `done` 상태가 되면 opacity가 낮아지며 희미해지는데, 완료 효과(파티클, 플래시 등)가 없어 달성감이 부족

### 2.3 발사 탭

**구조 개요**

- 3컬럼 레이아웃 (좌:28% 조립현황, 중:44% 로켓 디스플레이+커밋, 우:28% 이력/통계)
- `#lc-commit-box` — amber pulse 애니메이션 발사 버튼 영역

**UX 강점**

- GO/NO-GO 체크리스트(`chk-row`)가 발사 전 상태를 명확하게 요약
- 발사 버튼이 pulse-amber 애니메이션으로 준비 상태를 강조
- 실패 확률 시각화(`lc-fail-bar`)가 ASCII 바 차트로 직관적

**UX 문제점**

1. **로켓 디스플레이 영역**이 단순 `<pre>` ASCII로만 구성. 실제 발사 시 `rocket-launch` 키프레임 (`translateY(-400px)`)이 실행되지만, overflow:hidden으로 잘려 로켓이 패널 위로 올라가다 사라지는 효과가 극적이지 않음
2. **발사 결과 화면**(`#launch-overlay`)이 검정 배경에 amber 텍스트 단순 나열. 성공/실패 연출이 없고 Moonstone 획득 같은 중요 이벤트에 적절한 연출이 부재
3. **3컬럼 레이아웃**에서 좌측과 우측이 같은 28%를 차지하는데, 조립 현황 정보량이 이력/통계보다 훨씬 많아 좌측 패널이 스크롤이 자주 발생함 (좌:32%, 중:40%, 우:28% 비율 권장)

---

## 3. 개선이 시급한 비주얼 이슈 TOP 5

### Issue 1: 폰트 최소 크기 미준수 — 9px 텍스트 다수 존재

**영향**: 정보 가독성, 접근성

**문제 위치**

```css
.rc-art-label { font-size: 9px; }       /* 로켓 조립 아트 레이블 */
.rsh-c2-status { font-size: 9px; }     /* 연구 카드 상태 */
.rdp-viz-hd { font-size: 9px; }         /* 연구 디테일 시각화 헤더 */
.qs-section-hd { font-size: 9px; }     /* 퀘스트 섹션 헤더 */
.lc-fail-lvl { font-size: 9px; }        /* 발사 실패 레벨 뱃지 */
.rc-stat-hd { font-size: 9px; }         /* 로켓 스탯 헤더 */
```

**개선안**

```css
/* 최소 폰트 크기 정책: 10px 미만 금지 */
.rc-art-label,
.rsh-c2-status,
.rdp-viz-hd,
.qs-section-hd,
.lc-fail-lvl,
.rc-stat-hd {
  font-size: 10px;   /* 9px → 10px */
}
```

### Issue 2: 하드코딩 색상값 — CSS 변수 미사용으로 테마 일관성 저하

**영향**: 디자인 일관성, 유지보수성

**문제 위치 (상위 5개)**

```css
/* 현재 */
.bov-desc-hint { color: #1a3a1a; }          /* --locked 토큰 없음   */
background: #0a1a0a                          /* --green-deep 없음    */
color: #7a5100                               /* --amber-dim 없음     */
color: #6a8a6a                               /* --text-muted 없음    */
color: #8aaa8a                               /* 중복 dim 색상        */
```

**개선안**: `:root`에 누락 토큰 추가 후 치환

```css
:root {
  /* 기존 7개에 추가 */
  --amber-dim:  #7a5100;
  --green-deep: #0a1a0a;
  --text-muted: #6a8a6a;
  --locked:     #1a3a1a;
}
```

### Issue 3: 월드뷰 z-index 구조 — 건물 히트테스트 우회 방식의 취약성

**영향**: 인터랙션 정확도, 성능, 모바일 대응 불가

**현재 구조**

```
#world-bg   (z-index: 0, position: fixed)
  └── .world-bld <pre> (z-index: 0)
#app        (z-index: 10, position: relative)
  └── 모든 UI (z-index: 10 이상)
```

`#app`이 `#world-bg` 위를 덮어 건물 mouseenter 이벤트가 차단됨. 현재 `mousemove`에서 `getBoundingClientRect`로 수동 히트테스트를 수행하는 우회책 사용 중.

**개선안**

월드 배경과 건물 레이어를 app 레이아웃 내부로 통합하고, z-index 계층을 명확히 재정의:

```css
/* 건물 레이어를 app 내부 positioned 레이어로 이동 */
#world-scene-inner {
  position: absolute;
  inset: 0;
  z-index: 1;       /* 배경 위 */
  pointer-events: none;
}
.world-bld {
  pointer-events: auto;   /* 건물만 선택적으로 이벤트 수신 */
}
/* UI 패널들 */
#prod-bld-panel { z-index: 5; }
#bld-ov         { z-index: 10; }
```

### Issue 4: 연구 트리 카드 간 관계선 부재

**영향**: 정보 아키텍처, 선행 요건 파악 난이도

**개선안 (CSS 의사 요소 방식)**

```css
/* 티어 열 사이 화살표를 가로선으로 교체 */
.rsh-tier-arrow {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
}
.rsh-tier-arrow::before {
  content: '';
  position: absolute;
  left: 0; right: 0;
  top: 50%;
  height: 1px;
  background: linear-gradient(90deg, var(--green-dim), transparent);
}
```

장기적으로는 SVG 연결선(현재 `#tree-svg`에 이미 SVG 요소가 존재함)을 활용하여 개별 카드 간 곡선 연결선을 렌더링하는 방식 권장.

### Issue 5: 건물 호버 오버레이의 설명 패널이 초기 상태에서 힌트 텍스트만 표시

**영향**: 정보 탐색 효율성

**현재**

```html
<div class="bov-desc-col" id="bov-desc">
  <div class="bov-desc-hint">항목에 마우스를<br>올려 상세 확인</div>
</div>
```

오버레이를 열면 우측 패널에 "항목에 마우스를 올려 상세 확인"만 보임. 유저가 액션을 hover해야 설명이 나타남.

**개선안**

오버레이 오픈 시 기본으로 첫 번째 액션 항목의 desc를 표시하거나, 건물 자체 설명(`bld.desc`)을 초기값으로 표시:

```javascript
// openBldOv() 내부 수정
dp.innerHTML = `
  <div class="bov-desc-name">${bld.icon} ${bld.name}</div>
  <div class="bov-desc-body">${bld.desc || '항목에 마우스를 올려 상세 확인'}</div>
`;
```

---

## 4. 신규 비주얼 요소 제안

### 4.1 애니메이션 강화 포인트

**A. 건물 생산 활동 표시 — 파동 이펙트**

현재 active 건물은 `text-shadow` 강도가 올라가는 것뿐. 생산 중인 건물에 주기적인 파동 효과 추가:

```css
@keyframes bld-production-pulse {
  0%, 100% {
    text-shadow: 0 0 8px rgba(0,230,118,0.55);
    opacity: 1;
  }
  50% {
    text-shadow: 0 0 18px rgba(0,230,118,0.9), 0 0 36px rgba(0,230,118,0.3);
    opacity: 0.92;
  }
}

.world-bld.wb-state-active {
  animation: bld-production-pulse 2.4s ease-in-out infinite;
}
```

**B. 자원 획득 수치 팝업 (+N 플로팅 텍스트)**

건물 클릭 또는 생산 주기마다 획득 수량이 건물 위로 떠오르다 사라지는 효과:

```css
@keyframes resource-float {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  70%  { opacity: 0.9; transform: translateY(-24px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-44px) scale(0.9); }
}

.res-float {
  position: absolute;
  font-family: var(--font);
  font-size: 11px;
  color: var(--green);
  text-shadow: var(--glow);
  pointer-events: none;
  animation: resource-float 1.1s ease-out forwards;
  z-index: 50;
}
```

**C. 탭 전환 진입 애니메이션**

현재 탭 전환은 즉시 display:block 전환. 페이드+슬라이드 진입 추가:

```css
@keyframes tab-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-pane.active {
  animation: tab-enter 0.18s ease-out;
}
```

**D. 연구 완료 플래시 이펙트**

```css
@keyframes research-complete {
  0%  { box-shadow: 0 0 0 0 rgba(0,230,118,0); }
  30% { box-shadow: 0 0 0 12px rgba(0,230,118,0.6), 0 0 28px rgba(0,230,118,0.4); }
  60% { box-shadow: 0 0 0 24px rgba(0,230,118,0); }
  100%{ box-shadow: none; }
}

.rsh-card2.just-completed {
  animation: research-complete 0.7s ease-out forwards;
}
```

### 4.2 이펙트 추가 제안

**A. 발사 시퀀스 파티클**

발사 버튼 클릭 시 중앙 컬럼에 캔버스 기반 파티클 폭발 이펙트. 색상: amber/orange 계열 스파크 + 초록 연기 궤적. `canvas` 요소를 `#lc-anim-zone` 내부에 오버레이로 배치.

**B. 화면 플래시 (발사 카운트다운 "IGNITION" 순간)**

```css
@keyframes ignition-flash {
  0%, 100% { background: transparent; }
  10%      { background: rgba(255,171,0,0.25); }
  20%      { background: transparent; }
  30%      { background: rgba(255,171,0,0.12); }
}

body.ignition-flash::before {
  /* 기존 CRT 오버레이 재활용, 순간 amber 플래시 */
  animation: ignition-flash 0.5s ease-out;
}
```

**C. 지평선 스캔라인 (목업 참조)**

`sprint1_ui_mockup_v2_industrial.html`의 `.scanline` 방식(단일 줄 가로 이동)을 현재 게임의 CRT 효과와 병행:

```css
@keyframes scan-sweep {
  from { transform: translateY(-100%); }
  to   { transform: translateY(100vh); }
}

#world-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    transparent 48%,
    rgba(0,230,118,0.05) 50%,
    transparent 52%);
  animation: scan-sweep 8s linear infinite;
  pointer-events: none;
}
```

**D. 건물 건설 "구성 중" 스캐폴드 애니메이션**

현재 `_scaffoldAscii()`의 `║/////║`를 frame-by-frame 애니메이션으로 교체:

```javascript
// 건설 중 건물은 3~4프레임 ASCII로 교체
const SCAFFOLD_FRAMES = [
  '  ╔══╧══╗\n  ║/////║\n  ║ TBD ║\n  ╚═════╝\n  ███████',
  '  ╔══╧══╗\n  ║\\\\\\\\\\║\n  ║ TBD ║\n  ╚═════╝\n  ███████',
];
```

---

## 5. 인더스트리얼 우주 테마 강화 방안

### 5.1 현재 테마 진단

현재 게임은 **"달 기지 터미널 화면"** 미학(CRT 단색 그린)을 구현하고 있다. 이는 일관성 있고 독특한 비주얼이지만, "인더스트리얼 우주" 또는 "SpaceX 미션컨트롤" 분위기와는 방향이 다르다.

목업(`sprint1_ui_mockup_v2_industrial.html`)이 제안하는 방향은 다음과 같다:
- **색상**: 딥 네이비 배경 + 시안/틸/앰버 조합 (`#04070f` 배경, `#6ed0ff` 시안)
- **폰트**: Orbitron (헤딩) + Space Grotesk (본문) — 현대적 SF 분위기
- **패널**: 반투명 유리형 (`rgba` 배경 + 테두리 blur), 둥근 모서리
- **이펙트**: 격자 드리프트 배경, 궤도 링 애니메이션, hero 이미지 float

두 방향성이 충돌하고 있으므로 **명확한 아트 디렉션 결정이 선행**되어야 한다.

### 5.2 방향 A — 현재 CRT 터미널 스타일 강화 (권장, 낮은 리스크)

현재 `#010800` 그린 터미널 미학을 유지하되, 인더스트리얼 질감을 강화하는 방향.

**구현 요소**

**A-1. 배경 그라디언트에 깊이 추가**

```css
/* 현재 */
background: linear-gradient(to bottom, #000d03 0%, #011205 38%, #010900 65%, var(--bg) 100%);

/* 개선: 지평선 너머 어두운 우주 + 지표면 산업 구역 */
background:
  radial-gradient(ellipse at 30% 20%, #002208 0%, transparent 50%),
  radial-gradient(ellipse at 70% 10%, #001a04 0%, transparent 40%),
  linear-gradient(to bottom,
    #000200  0%,
    #001a06 20%,
    #011a05 50%,
    #010900 80%,
    var(--bg) 100%);
```

**A-2. 지평선에 산업 연기/증기 효과**

```css
/* ground-line 위에 안개 레이어 추가 */
#ground-fog {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to top,
    rgba(0,20,8,0.8) 0%,
    rgba(0,230,118,0.04) 60%,
    transparent 100%);
  pointer-events: none;
}
```

**A-3. 패널 내부에 서브 그리드 질감**

```css
/* 패널에 미세 격자 추가 */
.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(#00e67608 1px, transparent 1px),
    linear-gradient(90deg, #00e67608 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.5;
}
```

**A-4. 건물별 특성화 텍스트 색상**

```css
/* 산업 시설(광산, 정제소)은 amber 틴트 */
.world-bld.wb-mine.wb-state-active,
.world-bld.wb-refinery.wb-state-active {
  color: #c8e88a;  /* 약간 황록색 - 중공업 느낌 */
  text-shadow: 0 0 8px rgba(160,220,80,0.5);
}

/* 연구 시설은 청록 틴트 */
.world-bld.wb-research.wb-state-active {
  color: #88d8e0;
  text-shadow: 0 0 8px rgba(100,200,220,0.5);
}

/* 발사대는 순수 그린 유지 (히어로 건물) */
.world-bld.wb-launchpad.wb-state-active {
  color: var(--green);
  text-shadow: var(--glow-strong);
}
```

### 5.3 방향 B — 목업 디자인 적용 (높은 임팩트, 높은 공수)

목업의 `Orbitron` 폰트, 반투명 패널, 시안 팔레트를 실제 게임에 적용하는 방향. 이 경우 전체 CSS 팔레트 교체와 폰트 변경이 필요하여 Sprint 1 범위를 초과할 가능성이 높다.

**현실적인 단계적 적용 계획**:
- Sprint 2: 타이틀 화면만 목업 스타일 적용 (첫 인상 개선)
- Sprint 3: 발사 탭 리디자인 (클라이맥스 화면)
- Sprint 4: 전체 UI 테마 통합

### 5.4 SpaceX 미션컨트롤 분위기 구현 공통 요소

어느 방향을 선택하든 적용 가능한 미션컨트롤 요소:

**데이터 디스플레이 미학**
- 현재 `lc-drow` / `chk-row` 패턴을 더 넓게 활용 — 모든 수치를 레이블:값 한 줄 형식으로 통일
- 소수점 이하 표현 통일 (현재 2자리 → 3자리 통일 권장)
- 단위 표시 일관성: `/s`, `kg`, `%` 등이 혼재됨

**카운트다운/타이머 시각화**
- 발사 준비 중 카운트다운 타이머를 7세그먼트 폰트 스타일로 표시
- `letter-spacing: 4px` + 큰 폰트 크기 활용

**상태 등급 시스템 (GO/NO-GO 확장)**
- 현재 체크리스트는 2값(GO/NO-GO). 여기에 MARGINAL(경계) 상태 추가
- 색상 코딩: GO=green, MARGINAL=amber, NO-GO=red (현재도 amber/red 구분이 일부 있으나 불일치)

---

## 6. 모바일 대응 시 주의사항

### 6.1 현재 모바일 대응 상태

`<meta name="viewport" content="width=device-width, initial-scale=1.0">`이 선언되어 있으나 실제 CSS에 모바일 전용 미디어 쿼리가 **전혀 없다**. 다음 항목이 모바일에서 심각하게 작동하지 않음:

| 요소 | 문제 |
|------|------|
| `#world-bg` (3200px 고정 폭) | 터치 드래그 이벤트 미지원 (`mousedown/mousemove` 기반) |
| 호버 기반 건물 오버레이 | 터치 디바이스에서 hover 없음 → 건물 상호작용 불가 |
| `font-size: 9~11px` 텍스트 | 모바일 최소 터치 영역 44px 미충족 |
| 3컬럼 발사 탭 레이아웃 | 375px 기준에서 각 컬럼 약 105px — 사용 불가 |
| `#prod-bld-panel` (220px 고정) | 375px 화면에서 콘텐츠 영역 155px만 남음 |

### 6.2 모바일 대응 우선순위 권장사항

**즉시 적용 가능 (CSS만)**

```css
/* 세로 방향 모바일 최소 대응 */
@media (max-width: 640px) {
  /* 폰트 크기 하한선 올리기 */
  html { font-size: 14px; }

  /* 레이아웃 1컬럼 전환 */
  #res-left { display: none; }    /* 자원 패널 숨기기 (탑바로 이동) */
  #rp       { display: none; }    /* 우측 패널 숨기기              */

  /* 탭 가로 스크롤 */
  #nav-tabs { overflow-x: auto; flex-wrap: nowrap; }

  /* 발사 탭 단일 컬럼 */
  #pane-launch.active {
    flex-direction: column;
  }
  .lc-col-left, .lc-col-center, .lc-col-right {
    flex: none;
    max-width: 100%;
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--green-dim);
  }
}
```

**터치 드래그 지원 (JS 수정 필요)**

```javascript
// initWorldDrag() 내 터치 이벤트 추가
wb.addEventListener('touchstart', e => {
  drag = true;
  dragX = e.touches[0].pageX;
  dragSL = wb.scrollLeft;
}, { passive: true });

wb.addEventListener('touchmove', e => {
  if (!drag) return;
  wb.scrollLeft = dragSL - (e.touches[0].pageX - dragX) * 1.3;
}, { passive: true });

wb.addEventListener('touchend', () => { drag = false; });
```

**건물 인터랙션 터치 대응**

호버 기반 오버레이를 터치에서는 탭 기반으로 전환:

```javascript
// 터치 디바이스 감지
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

if (isTouch) {
  // 건물 탭: 첫 탭 오버레이 표시, 두 번째 탭 닫기
  pre.addEventListener('touchend', e => {
    e.preventDefault();
    const bldOvEl = document.getElementById('bld-ov');
    if (bldOvEl.style.display !== 'none') {
      closeBldOv();
    } else {
      cnt > 0 ? openBldOv(bld, pre) : openGhostOv(bld, pre);
    }
  });
}
```

### 6.3 모바일 우선 레이아웃 전환 시 권장 구조

장기적으로 발사 탭 등 주요 탭은 모바일에서 "카드 스와이프" 방식으로 전환하는 것이 UX상 적합하다. 현재 3컬럼을 `swiper-container` 형태로 재구성하거나, CSS `scroll-snap` 기반 수평 스크롤 패널로 전환하는 방안을 Sprint 2 UI 설계 시 고려할 것을 권장한다.

---

## 부록: 적용 우선순위 매트릭스

| 제안 | 임팩트 | 공수 | 우선순위 |
|------|--------|------|----------|
| 9px 폰트 → 10px 교체 | 중 | 낮음 | Sprint 1 즉시 |
| CSS 변수 누락 토큰 추가 | 낮음 | 낮음 | Sprint 1 즉시 |
| 건물 설명 초기값 표시 | 중 | 낮음 | Sprint 1 즉시 |
| 탭 진입 페이드 애니메이션 | 중 | 낮음 | Sprint 1 즉시 |
| 건물 production pulse 애니메이션 | 높음 | 낮음 | Sprint 1 즉시 |
| 터치 드래그 지원 | 높음 | 중간 | Sprint 2 |
| 연구 트리 연결선 | 중 | 중간 | Sprint 2 |
| 발사 파티클 이펙트 | 높음 | 높음 | Sprint 2 |
| 인더스트리얼 배경 강화 | 높음 | 중간 | Sprint 2 |
| 전체 테마 목업 적용 | 최고 | 매우 높음 | Sprint 3+ |

---

*본 제안서는 `index.html` (CSS 전체 + HTML 구조), `js/world.js` (ASCII 아트, 건물 인터랙션), `mockups/sprint1_ui_mockup_v2_industrial.html` (목업 참조)를 기반으로 작성되었습니다. 구현 우선순위 결정은 총괄PD 최종 컨펌 후 UI팀장(unity-ui-developer)에게 위임하여 진행합니다.*
