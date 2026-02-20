# 아트디렉터 비주얼 개선안 보고서 v2
작성: 아트디렉터 (TechnicalArtist) | 날짜: 2026-02-20

---

## 1. 현재 비주얼 시스템 현황

### 1-1. 사용 중인 색상 팔레트 (CSS 변수 기반)

`index.html` `:root` 블록에 정의된 디자인 토큰:

| 변수명 | 값 | 용도 |
|---|---|---|
| `--bg` | `#010800` | 최하위 배경 |
| `--panel-bg` | `#020d04` | 패널/사이드바 배경 |
| `--green` | `#00e676` | 활성 텍스트, 테두리, 핵심 강조 |
| `--green-dim` | `#1a5c34` | 비활성 테두리, 섹션 헤더 |
| `--green-mid` | `#00994d` | 서브 텍스트, 생산 레이트 |
| `--amber` | `#ffab00` | 화폐, 경고, 발사 관련 강조 |
| `--red` | `#ff1744` | 에러, 크리티컬 상태 |
| `--white` | `#c8ffd4` | 최상위 강조 텍스트 |
| `--amber-dim` | `#7a5100` | 낮은 우선순위 amber 요소 |
| `--green-deep` | `#003d1a` | 깊은 그린 배경 |
| `--text-muted` | `#4a6a4a` | 자동화 탭 설명 텍스트 |
| `--locked` | `#1a2a1a` | 잠긴 UI 요소 |

글로우 효과 토큰:
- `--glow`: `0 0 6px #00e67680` (약한 초록 글로우)
- `--glow-strong`: `0 0 12px #00e676, 0 0 24px #00e67650` (강한 이중 글로우)
- `--amber-glow`: `0 0 8px #ffab0080` (amber 글로우)

폰트: `'Share Tech Mono', monospace` — 전체 UI에 단일 모노스페이스 폰트 사용

---

### 1-2. 현재 적용된 애니메이션/이펙트 목록

코드에서 확인된 `@keyframes` 정의:

| 애니메이션 이름 | 위치 | 설명 |
|---|---|---|
| `crt-flicker` | `index.html:56` | CRT 모니터 깜빡임 (10s 주기, `#app`에 적용) |
| `title-fade-out` | `index.html:93` | 타이틀 화면 페이드아웃 (0.8s) |
| `tab-unlock` | `index.html:330` | 탭 언락 시 amber → green 색상 전환 |
| `tuf-in` / `tuf-out` | `index.html:340` | 탭 언락 플래시 배너 등장/퇴장 |
| `tuf-pulse` | `index.html:342` | 배너 텍스트 글로우 펄스 |
| `tkrun` | `index.html:446` | 하단 틱커 텍스트 스크롤 (45s 루프) |
| `ghost-pulse` | `index.html:474` | 미건설 건물 유령 펄스 (3s) |
| `wb-build` | `index.html:480` | 건물 건설 등장 애니메이션 (scaleY + blur, 0.85s) |
| `wb-upgrade` | `index.html:487` | 건물 업그레이드 brightness 플래시 (0.7s) |
| `addon-pulse` | `index.html:499` | 미설치 애드온 투명도 펄스 (2s) |
| `notif-in` / `notif-out` | `index.html:403` | 알림 슬라이드인/아웃 |
| `wb-prod-pulse` | `index.html:990` | 활성 건물 글로우 펄스 (2.5s) |
| `node-available-pulse` | `index.html:724` | 연구 노드 가용 상태 펄스 |
| `pulse-green` | `index.html:829` | GO 체크리스트 박스 글로우 |
| `pulse-amber` | `index.html:881` | 발사 커밋 박스 amber 글로우 |
| `rocket-launch` | `index.html:917` | 로켓 상승 (translateY -400px, 3s) |
| `exhaust-flicker` | `index.html:919` | 배기 텍스트 깜빡임 (0.15s step) |
| `tab-fade-in` | `index.html:976` | 탭 전환 페이드인 (0.18s) |

CRT 효과:
- `body::before`: `repeating-linear-gradient` 스캔라인 (2px 간격, 12% 불투명)
- `body::after`: `radial-gradient` 비네팅 (중앙→가장자리 0→65% 어둠)

---

### 1-3. ASCII 건물 아트 현황 (`js/world.js`)

`_bldAscii()` 함수에서 건물별 업그레이드 단계에 따른 ASCII 아트 반환:

| 건물 클래스 | 기본 아트 | 업그레이드 단계 |
|---|---|---|
| `wb-housing` | 2층 구조 (`╔═══╗` + `║ ▒▒ ║`) | hsg_dorm → hsg_welfare → hsg_township |
| `wb-ops` | `╔══════════╗ / ║ OPS CTR ║` | ops_sales → ops_24h → ops_premium |
| `wb-mine` | T자형 (`╔════╩═══╩════╗`) | mine_deep → mine_robot |
| `wb-refinery` | 이중 탱크 (가는 + 넓은) | 단일 단계 |
| `wb-eleclab` | PCB 패턴 (`▒░▒░▒░▒░▒`) | 단일 단계 |
| `wb-research` | 격자 창문 (`▓░▓░▓░`) | rsh_cross → rsh_super |
| `wb-solar` | 태양광 패널 (`╔╗ / ╠╣ / │`) | sol_hieff → sol_tracker |
| `wb-launchpad` | 로켓 + 발사대 (`/▲╲` + `╔═══════╗`) | pad_reinforce → pad_fuelfeed |

건물 상태 클래스:
- `wb-state-ghost`: opacity 0.30~0.50 펄스, 미건설 스캐폴드 표시
- `wb-state-idle`: opacity 0.60, 인원 미배치
- `wb-state-active`: opacity 1, 글로우 + 2.5s 펄스 애니메이션

워커 도트: `●` 문자, `font-size: 11px`, 초록 글로우, `_tickWorkers()` 80ms 간격 이동

---

### 1-4. 발사 애니메이션 현황 (`js/tabs/launch.js`)

`_runLaunchAnimation()` 함수 흐름:
1. **로켓 ASCII 렌더링** (`animWrap.innerHTML`): 고정 패턴 6줄 (`*`, `/|\\`, `ENGINE`, `_______`)
2. **launching 클래스 추가** (100ms 후): `rocket-launch` 3s ease-in, translateY(-400px) 발동
3. **배기 표시** (`exhaust-art`): `|||` / `|||||` 패턴, amber, `exhaust-flicker` 0.15s
4. **텔레메트리 라인** 5단계 순차 출력 (0ms ~ 2400ms):
   - T+0 IGNITION → T+3 MAX-Q → T+8 MECO → T+12 단계분리 → T+20 목표고도
   - 각 라인마다 `telem-bar-fill` 진행바 + 퍼센트
5. **결과 패널** (3000ms): `.launch-result.show` 표시
6. **오버레이** (3500ms): `#launch-overlay` 전체화면 표시

발사 오버레이 (`_showLaunchOverlay()`):
- 로켓 ASCII + `rocket-launch` 4s 애니메이션 반복
- 성공: amber `// 달 탐사 성공` / 실패: `// 발사 실패`
- 문스톤 보상 텍스트, 통계 그리드

`_lcRocketArtHtml()`: 발사 탭 중앙 컬럼 로켓 아트 (18줄 per-part 색상):
- 부품 미조립: `#1f3520` (매우 어두운 초록)
- 부품 조립 완료: `var(--amber)`
- 발사 준비: `var(--green)` 전체

---

### 1-5. 강점과 약점 분석

**강점:**
- 디자인 토큰 체계가 잘 정립되어 있음 (`--green`, `--amber`, `--red` 3색 시스템)
- CRT 이펙트(스캔라인 + 비네팅 + 플리커)가 테마에 충실
- 건물별 업그레이드 ASCII 아트가 단계별로 구별됨
- 발사 시퀀스가 텔레메트리 → 결과 → 오버레이의 3단 구조로 완성도 있음
- `wb-build`/`wb-upgrade` 건물 등장 애니메이션이 scaleY + blur 조합으로 자연스러움

**약점:**
- 발사 로켓 ASCII가 고정 텍스트 6줄로 빈약 (발사 탭 로켓 18줄 대비 열악)
- 파티클/분진 이펙트 전무: 건물 건설, 생산, 발사 등 주요 이벤트에 시각적 피드백 부족
- 숫자 플로팅 없음: 자원 획득 시 `+1` 같은 floating number 없어 즉각적 만족감 결여
- 세계관(달 탐사)에 비해 배경이 단순: 달 표면 요소, 성좌, 먼지 효과 없음
- 타이틀 화면이 텍스트+버튼만으로 구성, 로고 ASCII 아트 수준에서 멈춤
- 월드 배경 그라데이션(`#000508`→`#010d03`)이 단조로움 — 성운/별자리 없음

---

## 2. 개선 필요 영역 (우선순위 순)

### 2-1. 타이틀/로딩 화면

**현재 문제점:**

`index.html:77` `.title-logo`는 단순 텍스트:
```css
.title-logo { font-size: 52px; letter-spacing: 12px; color: var(--green);
  text-shadow: var(--glow-strong); }
```
`#boot-log`(200px 고정 높이)에 텍스트 라인만 스크롤. 이 화면이 게임의 첫 인상인데, ASCII 로고가 없고 배경 이미지도 없음. `.title-btn`의 hover 효과도 `border-color + text-shadow` 변경뿐으로 단조롭다.

**목표 비주얼 방향:**
- ASCII 대형 로켓 로고를 타이틀 배경에 배치 (CRT 글리치 효과 포함)
- 부팅 로그에 타이핑 효과 적용 (현재 즉시 추가)
- 별이 내리는 배경 파티클 추가
- 버튼 hover 시 스캔 라인 효과

**구체적 구현 방법:**

```css
/* 타이틀 배경 별 파티클 (CSS-only) */
#title-screen::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 10% 15%, #00e67640 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 40%, #00e67630 0%, transparent 100%),
    radial-gradient(2px 2px at 70% 20%, #00e67620 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 60%, #00e67640 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 80%, #00e67630 0%, transparent 100%);
  animation: title-stars-drift 20s linear infinite;
}
@keyframes title-stars-drift {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-20px); }
}

/* 버튼 스캔라인 hover */
.title-btn::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    to bottom, transparent 0px, transparent 3px,
    rgba(0,230,118,0.06) 3px, rgba(0,230,118,0.06) 4px
  );
  opacity: 0;
  transition: opacity 0.15s;
}
.title-btn:hover::after { opacity: 1; }
```

---

### 2-2. 월드 뷰 (건물 표현)

**현재 문제점:**

`index.html:234` 월드 배경:
```css
#world-bg {
  background: linear-gradient(to bottom,
    #000508 0%, #000d04 18%, #011505 38%,
    #010d03 60%, #010900 80%, var(--bg) 100%);
}
```
하늘 레이어(`#sky-layer`, 160px)에 `.star`는 `width: 2px; height: 2px` 단순 녹색 사각형. `#ground-line`(`#0a1a08`→`#020d04` 그라데이션)은 달 표면이라기보다 그냥 어두운 줄. 세계관 몰입을 방해하는 가장 큰 약점.

`js/world.js:302` 스캐폴드(미건설):
```javascript
function _scaffoldAscii() {
  return (
    '     |\n'  +
    '  ╔══╧══╗\n' +
    '  ║/////║\n' +
    '  ║ TBD ║\n' +
    '  ╚═════╝\n' +
    '  ███████'
  );
}
```
모든 미건설 건물이 동일한 스캐폴드를 보여줘 개성이 없음.

**목표 비주얼 방향:**
- 달 표면 분화구 패턴을 ASCII로 ground-line에 추가
- 별자리/성운을 sky-layer에 CSS 그라데이션으로 표현
- 건물별 스캐폴드를 건물 형태 기반으로 차별화
- 지평선에 달이 떠있는 시각적 요소 추가

**구체적 구현 방법:**

```css
/* 달 지평선 효과 */
#ground-line::before {
  content: '';
  position: absolute; top: -8px; left: 0; right: 0; height: 8px;
  background: repeating-linear-gradient(
    to right,
    transparent 0px, transparent 30px,
    #0a2010 30px, #0a2010 32px,
    transparent 32px, transparent 80px,
    #081508 80px, #081508 82px
  );
  opacity: 0.6;
}

/* 하늘 성운 효과 */
#sky-layer::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 200px 60px at 20% 30%, #00e67608 0%, transparent 100%),
    radial-gradient(ellipse 150px 40px at 75% 20%, #00cfff05 0%, transparent 100%),
    radial-gradient(circle 3px at 15% 25%, #00e67660 0%, transparent 100%),
    radial-gradient(circle 2px at 60% 15%, #ffffff40 0%, transparent 100%),
    radial-gradient(circle 2px at 85% 35%, #00e67650 0%, transparent 100%);
}
```

---

### 2-3. 발사 시퀀스 (애니메이션)

**현재 문제점:**

`js/tabs/launch.js:52` 발사 로켓 ASCII가 고정 6줄:
```javascript
animWrap.innerHTML = `
<pre class="launch-rocket-ascii" id="launch-rocket-pre">    *
   /|\\
  / | \\
 /  |  \\
|ENGINE |
|_______|</pre>`;
```
발사 탭의 `_lcRocketArtHtml()`에서 18줄 상세 로켓을 렌더링하는 것과 대조적으로, 실제 발사 애니메이션에서는 6줄 단순 로켓이 사용됨. 발사 시퀀스의 클라이맥스 장면임에도 비주얼 임팩트가 크게 부족.

`index.html:917` 발사 애니메이션:
```css
.launch-rocket-ascii.launching {
  animation: rocket-launch 3s ease-in forwards;
}
@keyframes rocket-launch {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-400px); }
}
```
단순 상승 이동만 있음. 진동, 화염 확산, 열기 왜곡 등 없음.

**목표 비주얼 방향:**
- 발사 로켓을 `_lcRocketArtHtml()`의 18줄 버전으로 교체
- 발사 진동 효과 (수평 흔들림) 추가
- 배기 확산 효과 (배기 텍스트가 점점 넓어지는 패턴)
- 오버레이 진입 시 화면 플래시 이펙트

**구체적 구현 방법:**

```css
/* 발사 진동 + 상승 복합 애니메이션 */
@keyframes rocket-launch-v2 {
  0%   { transform: translateY(0)      translateX(0); }
  5%   { transform: translateY(-10px)  translateX(-2px); }
  10%  { transform: translateY(-20px)  translateX(2px); }
  15%  { transform: translateY(-35px)  translateX(-1px); }
  20%  { transform: translateY(-55px)  translateX(1px); }
  30%  { transform: translateY(-100px) translateX(0); }
  50%  { transform: translateY(-200px) translateX(0); }
  100% { transform: translateY(-500px) translateX(0); opacity: 0; }
}

/* 배기 확산 애니메이션 */
@keyframes exhaust-expand {
  0%   { letter-spacing: -1px; opacity: 1; color: var(--amber); }
  30%  { letter-spacing: 2px; color: #ff6600; }
  60%  { letter-spacing: 6px; opacity: 0.7; color: #ff4400; }
  100% { letter-spacing: 12px; opacity: 0; }
}

/* 발사 시 화면 플래시 */
@keyframes launch-flash {
  0%   { opacity: 0; }
  10%  { opacity: 0.4; }
  30%  { opacity: 0; }
}
.launch-flash-overlay {
  position: fixed; inset: 0; z-index: 6999;
  background: #ffab00;
  pointer-events: none;
  animation: launch-flash 0.5s ease-out forwards;
}
```

---

### 2-4. UI 패널/오버레이

**현재 문제점:**

`index.html:365` `.panel`:
```css
.panel { background: rgba(2,13,4,0.96); border: var(--border); padding: 12px 16px; }
.panel-header::before { content: '// '; }
```
모든 패널이 동일한 단색 테두리(`1px solid #1a5c34`)와 배경. 계층감이 없고 시각적으로 단조롭다. 활성/비활성 패널 구별 없음.

`#bld-ov` 건물 오버레이:
```css
#bld-ov { border: 1px solid var(--green);
  box-shadow: 0 0 22px rgba(0,230,118,0.18); }
```
그림자가 약함. 오버레이가 배경에서 충분히 떠오르지 않음.

**목표 비주얼 방향:**
- 패널 상단에 `linear-gradient` 강조 선 추가
- 활성 패널 배경에 미세한 노이즈 패턴
- 오버레이 그림자 강화 + 코너 장식

**구체적 구현 방법:**

```css
/* 패널 상단 강조 선 */
.panel {
  background: rgba(2,13,4,0.96);
  border: var(--border);
  border-top: 1px solid var(--green-mid);
  padding: 12px 16px;
  position: relative;
}
.panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(
    to right, transparent, var(--green-mid) 30%, var(--green) 50%,
    var(--green-mid) 70%, transparent
  );
  opacity: 0.6;
}

/* 건물 오버레이 강화 */
#bld-ov {
  border: 1px solid var(--green);
  box-shadow:
    0 0 30px rgba(0,230,118,0.25),
    0 0 60px rgba(0,230,118,0.10),
    inset 0 0 20px rgba(0,230,118,0.03);
}

/* 코너 장식 (::before, ::after 활용) */
#bld-ov::before {
  content: '┌';
  position: absolute; top: -1px; left: -1px;
  color: var(--green); font-size: 12px; line-height: 1;
}
```

---

### 2-5. 피드백 이펙트 (구매/생산/알림)

**현재 문제점:**

`index.html:399` 알림 시스템:
```css
.notif-item {
  animation: notif-in 0.2s ease, notif-out 0.4s ease 2.6s forwards;
}
@keyframes notif-in { from { opacity: 0; transform: translateX(40px); } }
```
오른쪽에서 슬라이드인하는 단순 알림 외에 추가 피드백 없음. 건물 구매, 자원 생산, 업그레이드 완료 등 주요 이벤트에서 즉각적 시각 피드백(플로팅 숫자, 파티클)이 전무하다.

`js/world.js:854` `_triggerBuildAnim()`:
```javascript
pre.classList.add('wb-anim-build');
setTimeout(() => pre.classList.remove('wb-anim-build'), 1000);
```
건물 등장 애니메이션은 있으나, 그 외 파티클/이펙트 없음.

**목표 비주얼 방향:**
- 자원 획득 시 floating number (`+12`) 오버레이
- 건물 구매 시 ASCII 파티클 폭발 (`*`, `+`, `·`)
- 업그레이드 완료 시 화면 테두리 플래시

---

## 3. 즉시 적용 가능한 CSS/HTML 개선 코드 5가지

### 개선안 1: 플로팅 숫자 이펙트 (자원 획득 피드백)

```css
/* floating-number: 자원 획득 시 숫자가 위로 떠오르며 사라짐 */
@keyframes float-number {
  0%   { transform: translateY(0); opacity: 1; }
  30%  { transform: translateY(-15px); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}
.float-num {
  position: fixed;
  font-family: var(--font);
  font-size: 13px;
  color: var(--amber);
  text-shadow: 0 0 8px var(--amber);
  pointer-events: none;
  z-index: 8500;
  animation: float-number 1.5s ease-out forwards;
  white-space: nowrap;
}
.float-num.green { color: var(--green); text-shadow: var(--glow); }
.float-num.red   { color: var(--red);   text-shadow: 0 0 8px var(--red); }
```

JS 사용 예시 (world.js의 `buyBuilding()` 호출 이후):
```javascript
function spawnFloatNumber(x, y, text, cls = '') {
  const el = document.createElement('div');
  el.className = 'float-num ' + cls;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}
// 예: spawnFloatNumber(e.clientX, e.clientY, '+' + fmtDec(earned, 1), 'green');
```

---

### 개선안 2: ASCII 파티클 이펙트 (건물 건설/업그레이드)

```css
/* ASCII 파티클 — 건물 건설 or 업그레이드 시 폭발 효과 */
@keyframes ascii-particle {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
}
.ascii-particle {
  position: fixed;
  font-family: var(--font);
  font-size: 12px;
  pointer-events: none;
  z-index: 8400;
  animation: ascii-particle 0.8s ease-out forwards;
  color: var(--green);
  text-shadow: 0 0 6px currentColor;
}
```

JS 스폰 함수:
```javascript
function spawnBuildParticles(x, y) {
  const chars = ['*', '+', '·', '◆', '▸', '▹', '░'];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.className = 'ascii-particle';
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    const angle = (i / 8) * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle) * dist - 20 + 'px');
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.color = Math.random() > 0.5 ? 'var(--green)' : 'var(--amber)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}
```

---

### 개선안 3: 건물 활성화 글로우 강화 (wb-state-active 개선)

```css
/* 현재: 단순 펄스
   .world-bld.wb-state-active { animation: wb-prod-pulse 2.5s ease-in-out infinite; }
   개선: 색상 전환 포함 3단계 펄스 */

@keyframes wb-prod-pulse-v2 {
  0%   { text-shadow: 0 0 4px rgba(0,230,118,0.30); color: var(--green); }
  40%  { text-shadow: 0 0 10px rgba(0,230,118,0.70), 0 0 20px rgba(0,230,118,0.25); }
  50%  { text-shadow: 0 0 14px rgba(0,230,118,0.90), 0 0 30px rgba(0,230,118,0.35);
         color: var(--white); }
  100% { text-shadow: 0 0 4px rgba(0,230,118,0.30); color: var(--green); }
}

/* 워커 수에 따른 글로우 강도 차별화 */
.world-bld.wb-state-active { animation: wb-prod-pulse-v2 2.5s ease-in-out infinite; }
.world-bld.wb-state-active.has-workers {
  animation: wb-prod-pulse-v2 1.8s ease-in-out infinite; /* 더 빠른 펄스 */
}

/* 미작동(idle) 건물 — 약한 호흡 효과 */
@keyframes wb-idle-breath {
  0%,100% { opacity: 0.55; }
  50%     { opacity: 0.70; }
}
.world-bld.wb-state-idle { animation: wb-idle-breath 4s ease-in-out infinite; }
```

---

### 개선안 4: 발사 카운트다운 텍스트 애니메이션

```css
/* T-10 카운트다운: 숫자가 깜빡이며 등장 */
@keyframes countdown-tick {
  0%   { opacity: 0; transform: scale(1.4); color: var(--red); }
  20%  { opacity: 1; transform: scale(1.0); }
  80%  { opacity: 1; }
  100% { opacity: 0.3; }
}
.countdown-num {
  font-size: 48px;
  font-family: var(--font);
  color: var(--red);
  text-shadow: 0 0 20px var(--red), 0 0 40px rgba(255,23,68,0.5);
  text-align: center;
  display: block;
  animation: countdown-tick 0.9s ease-out forwards;
  letter-spacing: 8px;
}

/* GO 신호 — 초록 플래시 */
@keyframes go-signal {
  0%   { opacity: 0; transform: scale(0.5); }
  30%  { opacity: 1; transform: scale(1.1); }
  60%  { transform: scale(1.0); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: scale(1.2); }
}
.go-signal {
  font-size: 64px;
  font-family: var(--font);
  color: var(--green);
  text-shadow: var(--glow-strong);
  text-align: center;
  display: block;
  animation: go-signal 1.2s ease-out forwards;
  letter-spacing: 12px;
}
```

---

### 개선안 5: 하단 자원 생산 미니 파티클 (생산 펄스 시각화)

```css
/* 자원 바(rl-bar-fill) 생산 중 펄스 — 현재 0.8s transition만 있음 */
@keyframes resource-tick {
  0%   { box-shadow: none; }
  50%  { box-shadow: 0 0 6px var(--green-mid), 0 0 12px rgba(0,153,77,0.3); }
  100% { box-shadow: none; }
}
.rl-bar-fill.ticking { animation: resource-tick 1s ease-in-out; }

/* 자원 값 업데이트 시 숫자 강조 (JS로 .updated 클래스 토글) */
@keyframes value-bump {
  0%   { color: var(--green-mid); transform: scale(1); }
  30%  { color: var(--green); transform: scale(1.12); text-shadow: var(--glow); }
  100% { color: var(--green-mid); transform: scale(1); }
}
.rl-val.updated { animation: value-bump 0.4s ease-out; }
.rl-val.amber.updated {
  animation: value-bump 0.4s ease-out;
  --green-mid: var(--amber);  /* amber 자원은 amber 강조 */
}

/* 문스톤 획득 시 전용 이펙트 */
@keyframes moonstone-earn {
  0%   { transform: scale(1) rotate(0deg); }
  25%  { transform: scale(1.3) rotate(-5deg); text-shadow: 0 0 20px var(--amber); }
  50%  { transform: scale(1.1) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.rl-ms-val.earning { animation: moonstone-earn 0.6s ease-out; }
```

---

## 4. 중기 비주얼 로드맵

### Sprint 2 (즉시 착수 가능)

1. **플로팅 숫자 이펙트** (개선안 1): JS 2~3줄 + CSS 10줄. `buyBuilding()`, `buyBldUpgrade()`, `_showLaunchOverlay()` 3곳에 삽입.
2. **ASCII 파티클** (개선안 2): `_triggerBuildAnim()`, `_triggerUpgradeAnim()` 호출 시 동시 발동.
3. **발사 시퀀스 로켓 교체**: `_runLaunchAnimation()` 내 고정 6줄 ASCII를 `_lcRocketArtHtml()`에서 생성한 HTML로 교체. 발사 클라이맥스 품질 대폭 향상.
4. **발사 진동 + 배기 확산** (개선안 3): `rocket-launch-v2` 키프레임 교체.

### Sprint 3

5. **타이틀 화면 ASCII 대형 로켓 로고**: 40~50자 너비 로켓 ASCII 아트를 `#title-screen` 배경에 배치. `opacity: 0.12` 수준으로 워터마크처럼.
6. **달 표면 지평선 개선**: `#ground-line::before`에 분화구 패턴 CSS 추가.
7. **ComfyUI 배경 이미지 통합**: 달 표면 배경 이미지를 `#world-bg`의 `background-image`에 레이어로 추가 (CSS `mix-blend-mode: overlay`로 기존 색상과 혼합).

### ComfyUI 생성 에셋 활용 방안

- **달 표면 배경**: `moonidle_hangar_bg_industrial.svg` 활용 가능 (현재 mockups/assets에 있음). `#world-scene` 하단 배경으로 적용.
- **로켓 일러스트**: ComfyUI로 픽셀 아트 스타일 로켓 생성 → PNG → `#launch-overlay` 배경 레이어로 사용. CSS `filter: hue-rotate(120deg) saturate(0.5)`로 초록 색조 통일.
- **발사 화염**: ComfyUI 생성 불꽃 이미지 → CSS `animation: flame-flicker` + `mix-blend-mode: screen` 합성으로 ASCII 배기와 병행.
- **타이틀 배경**: `moonidle_cam_feed_bg.svg`를 타이틀 화면 배경 레이어로 검토.

---

## 5. 컬러 팔레트 개선안

### 현재 팔레트 문제점

현재 팔레트는 **단일 초록 계열**이 지배적이어서, 세계관(달 탐사 + 인더스트리얼)의 '우주' 느낌이 부족. `--bg: #010800`은 순수 검정에 가까워 심도감이 없고, 파란 계열 accent가 전혀 없다.

```css
/* 현재 팔레트 */
:root {
  --bg:         #010800;  /* 거의 검정 */
  --panel-bg:   #020d04;  /* 거의 검정 */
  --green:      #00e676;  /* 형광 초록 */
  --green-dim:  #1a5c34;  /* 어두운 초록 */
  --green-mid:  #00994d;  /* 중간 초록 */
  --amber:      #ffab00;  /* 진한 amber */
  --red:        #ff1744;
  --white:      #c8ffd4;  /* 초록빛 흰색 */
}
```

### 제안 팔레트 v2 (우주 인더스트리얼)

```css
:root {
  /* 기존 유지 (하위 호환) */
  --bg:           #010800;
  --panel-bg:     #020d04;
  --green:        #00e676;
  --green-dim:    #1a5c34;
  --green-mid:    #00994d;
  --amber:        #ffab00;
  --red:          #ff1744;
  --white:        #c8ffd4;

  /* === 추가 제안 토큰 === */

  /* 심우주 파란 계열 (SpaceX 미션컨트롤 분위기) */
  --cyan:         #00cfff;  /* 데이터 강조, 고고도 표시 */
  --cyan-dim:     #005577;  /* 비활성 cyan */
  --space-blue:   #001a33;  /* 우주 배경 보조 */

  /* 개선된 배경 — 순수 검정에서 '우주 느낌'으로 */
  --bg-v2:        #010a12;  /* 매우 어두운 파란빛 검정 */
  --panel-bg-v2:  #020e16;  /* 패널: 파란빛 어두움 */

  /* 달 표면 색상 */
  --moon-surface: #1a1a1a;  /* 달 지표 */
  --moon-dust:    #2a2820;  /* 달 먼지 */
  --moon-crater:  #0d0d0d;  /* 분화구 */

  /* 보강된 글로우 */
  --glow-cyan:    0 0 8px #00cfff80;  /* cyan 글로우 */
  --glow-red:     0 0 8px #ff174480;  /* red 글로우 */

  /* 개선된 amber — 약간 따뜻하게 */
  --amber-v2:     #ffc107;  /* 기존보다 노란빛 강조 */
  --amber-hot:    #ff8c00;  /* 엔진 화염, 발사 경고 */
}

/* 적용 예시: 발사 탭 텔레메트리 — cyan 강조 */
.telem-event {
  color: var(--cyan);           /* 기존: var(--green) */
  text-shadow: var(--glow-cyan);
}

/* 적용 예시: GO/NO-GO 배지 — 더 강한 대비 */
.chk-badge {
  background: rgba(0,230,118,.12);  /* 기존 .07 → .12 */
  border-color: var(--green);
  box-shadow: 0 0 4px rgba(0,230,118,0.3);
}

/* 적용 예시: 미션컨트롤 느낌 — 발사 커밋 박스에 cyan 활용 */
#lc-commit-box {
  border-color: var(--amber-v2);
  background: #000e18;          /* 파란빛 어두운 배경 */
  box-shadow: 0 0 20px rgba(255,193,7,0.15),
              inset 0 0 30px rgba(0,207,255,0.03);
}
```

### 팔레트 전환 전략

전체 팔레트 전환은 리스크가 크므로, **추가(additive) 방식** 권장:
1. 기존 `--green`, `--amber` 등 변수는 유지 (하위 호환 보장)
2. 새 변수(`--cyan`, `--bg-v2` 등)를 추가하고, 신규 UI 요소에만 적용
3. 발사 탭, 타이틀 화면 등 핵심 화면부터 순차 전환
4. 전체 교체는 Sprint 3~4에 진행하며 총괄PD 승인 후 확정

---

*보고서 끝. 위 개선안은 기존 CSS 변수 시스템과의 하위 호환성을 유지하며, UI팀장(unity-ui-developer)에게 구현 위임 예정.*
