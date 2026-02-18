# MoonIdle v7 Design Tokens
## Tone & Manner Reference — Sprint 1

> Source: `sprint1_ui_mockup_v7_mission_control.html`
> Approved by 총괄PD (Sprint 1). Use for all subsequent UI work.

---

## Color Palette

```css
:root {
  --bg:          #010800;   /* 거의 검정, 미묘한 dark green tint */
  --panel-bg:    #020d04;   /* 패널 배경, bg보다 약간 밝음 */
  --green:       #00e676;   /* 포스퍼 그린 — 주요 텍스트/강조 */
  --green-dim:   #1a5c34;   /* 테두리, 비활성 요소 */
  --green-mid:   #00994d;   /* 보조 텍스트, 섹션 타이틀 */
  --amber:       #ffab00;   /* 경고/진행 중/활성 상태 */
  --red:         #ff1744;   /* 에러/실패/위험 */
  --font:        'Share Tech Mono', monospace;
  --border:      1px solid #1a5c34;
  --glow:        0 0 6px #00e67680;
  --glow-strong: 0 0 12px #00e676, 0 0 24px #00e67650;
}
```

---

## Typography

| 용도 | 크기 | 자간 | 색상 |
|------|------|------|------|
| 메인 타이틀 | 15px | 3px | `--green` |
| 섹션 헤더 | 11px | 3px | `--green` |
| 섹션 서브타이틀 | 10px | 2px | `--green-mid` |
| 본문 텍스트 | 13px | — | `--green` |
| 보조 텍스트 | 11px | 0.5px | `--green-mid` |
| 소형 레이블 | 9–10px | 1px | `--green-mid` |
| 경고/강조 | any | any | `--amber` |
| 에러 | any | any | `--red` |
| 대형 카운트다운 | 80px | 8px | `--amber` |

---

## CRT Effects

```css
/* 스캔라인 오버레이 */
body::before {
  content: '';
  position: fixed; inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent, transparent 2px,
    rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

/* CRT 비네트 */
body::after {
  content: '';
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
  pointer-events: none;
  z-index: 9998;
}

/* CRT 플리커 */
@keyframes crt-flicker {
  0%,92%,94%,97%,100% { opacity: 1; }
  93% { opacity: 0.85; }
  96% { opacity: 0.90; }
}
```

---

## ASCII Rocket Library

### 발사 시퀀스용 (소형)
```
        *
       /|\
      / | \
     /  |  \
    / BETA  \
   /___mk.2__\
  |           |
  |  ENGINE   |
  |___________|
```

### 패널 표시용 (중형 — 상세 시스템 레이블 포함)
```
           *
          /|\
         / | \
        /  |  \
       /   |   \
      / BETA mk.2\
     /____________\
    |  [PAYLOAD]   |
    |   _______    |
    |  |       |   |
    |  |  NAV  |   |
    |  |  SYS  |   |
    |  |_______|   |
    |               |
    |   [AVIONICS]  |
    |   _________   |
    |  | O     O |  |
    |  |  GYRO  |   |
    |  |_________|  |
    |               |
    |  [PROPULSION] |
    |   _________   |
    |  |         |  |
    |  | ENGINE  |  |
    |  | 156 kN  |  |
    |  |_________|  |
    |               |
    |_______________|
   /                 \
  / [LOX]   [RP-1]   \
 /_____________________ \
        |   |   |
        |   |   |
       /|   |   |\
      / |   |   | \
     /__|___|___|__\
```

### 엔진 화염 (exhaust)
```
  |   |   |
 /|\ /|\ /|\
/ | X | X | \
   |||||||
  |||||||||
 |||||||||||
  |||||||||
   |||||||
    |||||
     |||
      |
```

---

## Layout Conventions

- 패널 헤더: `::before { content: '//' }` prefix
- 버튼: `background: none`, `border: 2px solid`, 폰트 대문자
- 게이지 바: `height: 8px`, 테두리 `1px solid --green-dim`
- 테이블 헤더: `background: #021508`, `color: --green-mid`
- 섹션 구분: `border-bottom: var(--border)` 사용
- 스크롤바: 4px 너비, `--green-dim` thumb

---

## DO / DON'T

| DO | DON'T |
|----|-------|
| 직각 테두리 (border-radius: 0) | 둥근 모서리 사용 |
| Share Tech Mono 전용 | 다른 폰트 혼용 |
| 인라인 그린 글로우 효과 | 외부 이미지 아이콘 |
| `//` 섹션 prefix | 불릿 포인트 (•) |
| 대문자 레이블 | 소문자 섹션명 |
| ASCII 아트 시각화 | SVG/비트맵 인물 이미지 |
