# 사운드디렉터 작업제안서 v1
작성: 사운드디렉터 | 날짜: 2026-02-20

---

## 1. 현재 사운드 시스템 분석

### 1-1. 아키텍처 개요

MoonIdle의 사운드 시스템은 두 개의 독립된 레이어로 구성되어 있다.

**레이어 A — SFX 엔진 (`js/game-state.js`)**

```javascript
// audioCtx: 전역 AudioContext 인스턴스 (let audioCtx = null)
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSfx(type='sine', freq=440, dur=0.08, vol=0.03, targetFreq=null) {
  if (!gs.settings.sound) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (targetFreq) osc.frequency.exponentialRampToValueAtTime(targetFreq, now + dur);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);
}
```

파라미터 구조: `playSfx(파형타입, 시작주파수, 지속시간, 볼륨, 목표주파수)`
- `type`: `'sine'` / `'square'` / `'triangle'` / `'sawtooth'`
- `freq`: 시작 주파수 (Hz)
- `dur`: 지속 시간 (초)
- `vol`: 피크 볼륨 (0.0~1.0 범위, 실질 사용값은 0.02~0.12)
- `targetFreq`: 지정 시 지수 글라이드로 주파수 이동 (pitch slide)

envelope은 attack-decay 2단계만 존재: 즉시 vol까지 rise → dur 내 0.0001까지 exponential decay. 별도 sustain/release 없음.

**레이어 B — BGM 엔진 (`js/audio-bgm.js`)**

```javascript
const BGM = {
  ctx: null,
  nodes: [],
  track: 0,   // 0=DRIVE(main) 1=GRID(research) 2=LAUNCH(countdown)
  playing: false,
  masterGain: null,
  volume: 0.12,
  // ...
};
```

3트랙 절차적 BGM, 각 8초 루프 자동 반복:
- **TRACK 0 (DRIVE)**: D-minor 134 BPM — sawtooth bass + square 아르페지오 + sine 패드
- **TRACK 1 (GRID)**: A-minor 110 BPM — sawtooth bass + 글리치 버스트 + bright square 아르페지오
- **TRACK 2 (LAUNCH)**: E-minor 145 BPM — 강렬한 sawtooth 스탭 + triangle 라이징 패드

BGM은 게임 진입 시 `BGM.start(0)` 한 번 호출됨. 탭 전환이나 게임 진행 단계에 따른 자동 트랙 전환 로직 없음.

---

### 1-2. 현재 playSfx 호출 전체 목록

코드베이스 전체를 탐색하여 발견한 모든 `playSfx` 호출:

| 파일 | 함수/컨텍스트 | 호출 코드 | 용도 |
|------|-------------|----------|------|
| `game-state.js:134` | `upgBuilding()` | `playSfx('triangle', 520, 0.1, 0.04, 780)` | 건물 생산량 업그레이드 |
| `game-state.js:368` | `playLaunchSfx()` | `playSfx('triangle', 280, 0.12, 0.04, 380)` | 발사 SFX 1단계 |
| `game-state.js:369` | `playLaunchSfx()` | `setTimeout(() => playSfx('triangle', 420, 0.16, 0.05, 620), 120)` | 발사 SFX 2단계 |
| `game-state.js:370` | `playLaunchSfx()` | `setTimeout(() => playSfx('sawtooth', 680, 0.22, 0.04, 980), 250)` | 발사 SFX 3단계 |
| `assembly.js:11` | `abortAssembly()` | `playSfx('triangle', 220, 0.08, 0.05, 180)` | 조립 취소 (하강 슬라이드) |
| `assembly.js:25` | `craftPart()` | `playSfx('square', 520, 0.11, 0.03, 760)` | 부품 제작 완료 |
| `assembly.js:52` | `startAssembly()` | `playSfx('triangle', 310, 0.09, 0.03, 430)` | 조립 시작 |
| `launch.js:99` | `_runLaunchAnimation()` | `playSfx('triangle', 300+i*40, 0.06, 0.02, 400+i*30)` | 텔레메트리 단계별 비프 (루프) |
| `production.js:43` | `buyBuilding()` | `playSfx('triangle', 360, 0.08, 0.03, 520)` | 건물 건설 |
| `research.js:43` | `buyUpgrade()` | `playSfx('sawtooth', 440, 0.1, 0.028, 700)` | 기술 연구 완료 |
| `milestones.js:68` | `checkMilestones()` | `playSfx('square', 880, 0.12, 0.08, 1400)` | 마일스톤 달성 |
| `unlock.js:40` | 탭 해금 배너 | `playSfx('square', 880, 0.15, 0.06, 1200)` | 새 탭 해금 |
| `world.js:409` | 슬롯 업그레이드 | `playSfx('triangle', 580, 0.09, 0.04, 820)` | 건물 슬롯 +1 |
| `world.js:648` | (컨텍스트 추정: 건물 오버레이 액션) | `playSfx('triangle', 520, 0.1, 0.04, 780)` | 건물 관련 업그레이드 |
| `world.js:744` | (애드온 선택 추정) | `playSfx('triangle', 660, 0.12, 0.06, 1000)` | 애드온 관련 |
| `world.js:773` | (애드온 업그레이드 추정) | `playSfx('triangle', 700, 0.12, 0.04, 1100)` | 애드온 업그레이드 |
| `automation.js:53` | 자동화 토글 | `playSfx('triangle', 650, 0.12, 0.04, 900)` | 자동화 ON/OFF |
| `mission.js:79` | 문스톤 업그레이드 구매 | `playSfx('triangle', 520, 0.12, 0.04, 780)` | MS 업그레이드 |
| `mission.js:133` | 미션 관련 | `playSfx('triangle', 500, 0.12, 0.04, 760)` | 미션 액션 |

---

### 1-3. BGM 시스템 현황 상세

- BGM은 `enterGame()` 내 `BGM.start(0)` 단 한 번 호출
- 탭 전환 시 트랙 자동 전환 없음 (수동 BGM Next 버튼만 존재)
- 발사 시퀀스 중 TRACK 2 (LAUNCH BGM)으로 자동 전환 없음
- BGM 볼륨 고정 0.12 (마스터 게인)
- SFX는 BGM과 완전히 분리된 별도 `audioCtx` 사용 → 볼륨 믹싱 불가

---

### 1-4. 커버되지 않는 주요 게임 이벤트

아래 이벤트들은 사운드가 전혀 없음:

**생산/자원**
- 자원 수집량 한도 도달 (캡 경고)
- 오프라인 복귀 시 자원 보상 수령
- 인원 배치/철수 (quickAssign, quickUnassign)
- 인원 배치 최대치 도달 경고

**건물**
- 건물 호버 (월드 뷰에서 커서 올림)
- 건물 건설 애니메이션 진행 중 효과음
- 건물 오버레이 열기/닫기

**연구**
- 연구 카드 선택 (selectTech2)
- 연구 불가 상태 클릭 (자원 부족, 선행 미완료)

**조립**
- 조립 완료 순간 (updateAssemblyJobs에서 ready=true 되는 순간)
- 품질 선택 (selectQuality)

**발사**
- 발사 버튼 클릭 가능 상태 진입 ("ALL SYSTEMS GO")
- 발사 실패 결과
- 발사 오버레이 닫기 (이어하기)
- 프레스티지/재도전 확정

**마일스톤**
- 마일스톤 진행률 업데이트 (달성 직전 상태)

**UI/시스템**
- 타이틀 화면 부팅 시퀀스 타이핑 비프음
- 게임 저장 완료 확인음
- 탭 전환 클릭음
- 설정 토글 (사운드 ON/OFF 외)
- 오프라인 보고서 모달 열기

**앰비언트**
- 생산 건물 작동 주변음 (공장 소음, 드릴 소리 등)
- 우주 배경 앰비언트 (별, 진공)
- 연구 탭의 전자 장비 험 소리

---

## 2. 사운드 부재 문제점

### 2-1. 조립 완료 무음 [우선순위: HIGH]

`updateAssemblyJobs()`에서 `job.ready = true`가 되는 순간 알림 메시지는 뜨지만 사운드가 없다. 방치형 게임의 핵심 피드백 루프인 "기다림 → 완성" 순간에 청각 보상이 전혀 없어 플레이어가 탭을 보고 있지 않으면 완성 여부를 인지하기 어렵다.

### 2-2. 발사 실패 무음 [우선순위: HIGH]

성공 시 `playLaunchSfx()`를 호출하지만 실패(`success === false`)일 때 별도 사운드가 없다. 발사 실패는 게임의 핵심 긴장 이벤트임에도 피드백이 없어 결과 전달력이 떨어진다.

### 2-3. "ALL SYSTEMS GO" 진입 무음 [우선순위: HIGH]

발사 준비 완료 상태 (`allGo === true`) 진입 시 사운드가 없다. 방치형 게임에서 "목표 달성" 알림은 가장 중요한 청각 보상 포인트인데 이 타이밍이 완전히 비어 있다.

### 2-4. 인원 배치/철수 무음 [우선순위: MEDIUM]

`quickAssign`, `quickUnassign`, `withdrawAllWorkers`에 사운드가 없다. 생산 탭은 가장 빈번하게 인터랙션이 발생하는 공간인데 모든 조작이 무음이다. 버튼 클릭에 대한 즉각적 피드백 부재로 조작감이 둔하다.

### 2-5. 타이틀 부팅 시퀀스 무음 [우선순위: MEDIUM]

`BOOT_LINES` 10줄이 130ms 간격으로 타이핑되는데 비프음이 없다. 이 시퀀스는 분위기 조성의 핵심인데 시각적 CRT 느낌을 청각으로 보완하지 못하고 있다. 단, 타이틀 화면에서는 AudioContext 자동재생 정책 제약이 있어 구현 시 사용자 인터랙션 이후 시점에 한해 재생해야 한다.

### 2-6. 탭 전환 무음 [우선순위: MEDIUM]

`switchMainTab()` 호출 시 탭 클릭음이 없다. 인더스트리얼 UI 컨셉에서 패널 전환음은 정체성 강화에 기여하며 자주 호출되는 액션이다.

### 2-7. BGM 맥락 연동 없음 [우선순위: MEDIUM]

연구 탭에 TRACK 1 (GRID)이 어울리고, 발사 시퀀스에 TRACK 2 (LAUNCH)가 어울리지만 탭 전환 시 자동으로 BGM이 바뀌지 않는다. 3트랙이 존재함에도 사실상 TRACK 0만 평생 재생되는 상태다.

### 2-8. 앰비언트 부재 [우선순위: LOW]

건물이 많아질수록 생산 활동의 규모감이 시각으로만 표현된다. 광산, 정유 시설, 연구소 등의 작동음을 레이어로 쌓으면 플레이어가 진행감을 더 입체적으로 느낄 수 있다.

---

## 3. 제안 사운드 설계 — 전체 이벤트 맵

### 3-1. UI/메뉴 사운드

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 탭 전환 클릭 | triangle, 짧고 중성적인 click, 220Hz→330Hz, 0.05s | `playSfx('triangle', 220, 0.05, 0.025, 330)` | `switchMainTab()` 진입부 |
| 모달/오버레이 열기 | sine, 낮은 스윕 up, 180Hz→320Hz, 0.08s | `playSfx('sine', 180, 0.08, 0.02, 320)` | 오버레이 show 시점 |
| 모달/오버레이 닫기 | sine, 낮은 스윕 down, 320Hz→180Hz, 0.08s | `playSfx('sine', 320, 0.08, 0.02, 180)` | 오버레이 close 시점 |
| 사운드 ON 토글 | square, 확인음, 440Hz→660Hz, 0.1s | `playSfx('square', 440, 0.1, 0.035, 660)` | `toggleSound()` 내 sound=true 분기 |
| 오프라인 보고서 표시 | triangle, 3음 팡파르, 순차 setTimeout | 순차 3음 (아래 섹션 참조) | `_showOfflineReport()` 진입부 |
| 부팅 시퀀스 비프 | sine, 짧은 CRT 비프, 800Hz, 0.03s | `playSfx('sine', 800, 0.03, 0.015)` | `startTitleSequence()` 각 line setTimeout 내 |

### 3-2. 건물 사운드 (건설, 작동, 업그레이드)

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 건물 건설 완료 | triangle, 상승 슬라이드, 360→520, 0.08s (현재 있음) | `playSfx('triangle', 360, 0.08, 0.03, 520)` | `buyBuilding()` — 현재 구현됨 |
| 건물 호버 마우스오버 | sine, 매우 작은 hover 틱, 600Hz, 0.03s | `playSfx('sine', 600, 0.03, 0.01)` | `openBldOv()` 내 (throttle 필요) |
| 건물 생산량 업그레이드 | triangle, 현재와 동일하나 vol 상향 제안 | `playSfx('triangle', 520, 0.1, 0.04, 780)` | `upgBuilding()` — 현재 구현됨 |
| 슬롯 업그레이드 | triangle, 현재 구현됨 | `playSfx('triangle', 580, 0.09, 0.04, 820)` | `world.js` — 현재 구현됨 |
| 인원 배치 (+) | triangle, 짧은 클릭업, 300→400, 0.04s | `playSfx('triangle', 300, 0.04, 0.02, 400)` | `quickAssign()` |
| 인원 철수 (-) | triangle, 짧은 클릭다운, 400→300, 0.04s | `playSfx('triangle', 400, 0.04, 0.02, 300)` | `quickUnassign()` |
| 전체 인원 철수 | triangle, 하강 스윕, 440→220, 0.12s | `playSfx('triangle', 440, 0.12, 0.03, 220)` | `withdrawAllWorkers()` |

### 3-3. 생산 사운드 (자원 증가, 한도 도달)

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 자원 한도 도달 경고 | sawtooth, 경고 버즈, 150Hz 짧은 펄스 2회 | `playSfx('sawtooth', 150, 0.06, 0.04)` | `tick()` 내 자원 캡 체크 (이미 있으면 스킵) |
| 오프라인 자원 획득 | 3단계 상승 팡파르 | 순차 3음 (280, 380, 480Hz) | `_showOfflineReport()` 진입 시 |

### 3-4. 연구 사운드 (선택, 완료, 잠금 해제)

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 기술 카드 선택 | sine, 부드러운 select 틱, 380Hz, 0.05s | `playSfx('sine', 380, 0.05, 0.018)` | `selectTech2()` |
| 연구 완료 | sawtooth, 현재 구현됨 | `playSfx('sawtooth', 440, 0.1, 0.028, 700)` | `buyUpgrade()` — 현재 구현됨 |
| 연구 불가 클릭 | sine, 낮은 에러 틱, 150Hz, 0.05s | `playSfx('sine', 150, 0.05, 0.015)` | `buyUpgrade()` 내 조건 분기 실패 시 |
| 탭 해금 | square, 현재 구현됨 | `playSfx('square', 880, 0.15, 0.06, 1200)` | `unlock.js` — 현재 구현됨 |

### 3-5. 조립 사운드 (시작, 진행, 완성)

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 품질 선택 | triangle, 중성 틱, 400Hz, 0.04s | `playSfx('triangle', 400, 0.04, 0.02)` | `selectQuality()` |
| 조립 시작 | triangle, 현재 구현됨 | `playSfx('triangle', 310, 0.09, 0.03, 430)` | `startAssembly()` — 현재 구현됨 |
| 조립 완료 | square + 이후 보조음, 2단계 알림 | `playSfx('square', 660, 0.14, 0.07, 1000)` 후 50ms 뒤 `playSfx('sine', 880, 0.12, 0.04)` | `updateAssemblyJobs()` 내 `job.ready = true` 직후 |
| 조립 취소 | triangle, 현재 구현됨 (하강) | `playSfx('triangle', 220, 0.08, 0.05, 180)` | `abortAssembly()` — 현재 구현됨 |

### 3-6. 발사 시퀀스 사운드 (각 텔레메트리 단계별)

현재 `_runLaunchAnimation()`의 5단계 텔레메트리는 동일한 공식(`300+i*40, 0.06, 0.02, 400+i*30`)으로 단순 스텝 비프음만 존재. 각 단계의 중요도를 반영한 차별화 제안:

| 단계 | 레이블 | 이벤트 | 제안 음향 | 파라미터 |
|-----|-------|-------|---------|---------|
| T+0 | IGNITION | 점화 | sawtooth, 엔진 부스트 느낌, 저음 rise | `playSfx('sawtooth', 120, 0.18, 0.06, 280)` |
| T+3 | MAX-Q | 최대 동압 | triangle, 긴장된 고음 비프 | `playSfx('triangle', 580, 0.10, 0.04, 720)` |
| T+8 | MECO | 주엔진 연소 종료 | sine, 부드러운 cut-off | `playSfx('sine', 440, 0.12, 0.04, 280)` |
| T+12 | 단계 분리 | 기계적 분리음 | square, 짧은 impulse burst | `playSfx('square', 320, 0.06, 0.06, 480)` |
| T+20 | 목표 고도 | 성공 확인 | square, 상승 확인음 3회 | 별도 성공 팡파르 (아래 참조) |

**발사 성공 팡파르 (T+20 성공 시)**:
```javascript
playSfx('square', 523, 0.1, 0.06, 660);
setTimeout(() => playSfx('square', 659, 0.1, 0.06, 880), 120);
setTimeout(() => playSfx('square', 784, 0.18, 0.07, 1047), 240);
```

**발사 실패음 (현재 완전 미구현)**:
```javascript
// _showLaunchOverlay 또는 _runLaunchAnimation 내 success===false 분기
playSfx('sawtooth', 220, 0.20, 0.06, 80);
setTimeout(() => playSfx('sawtooth', 160, 0.22, 0.05, 60), 200);
```

**ALL SYSTEMS GO 알림 (현재 미구현)**:
```javascript
// renderLaunchTab() 내 allGo=true 전환 감지 시
playSfx('sine', 440, 0.08, 0.04, 660);
setTimeout(() => playSfx('sine', 660, 0.08, 0.04, 880), 100);
```

### 3-7. 마일스톤/업적 사운드

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 마일스톤 달성 | square, 현재 구현됨 | `playSfx('square', 880, 0.12, 0.08, 1400)` | `checkMilestones()` — 현재 구현됨 |
| 마일스톤 보상 즉시 지급 | triangle, 보상 확인음, 2단계 | 달성음 후 200ms 뒤 `playSfx('triangle', 1200, 0.08, 0.04)` | `_applyMilestoneReward()` |

### 3-8. 프레스티지/문스톤 사운드

| 이벤트명 | 음향 특성 | 파라미터 | 구현 위치 |
|---------|---------|---------|---------|
| 문스톤 업그레이드 구매 | triangle, 현재 구현됨 | `playSfx('triangle', 520, 0.12, 0.04, 780)` | `mission.js` — 현재 구현됨 |
| 프레스티지 확정 버튼 | 3음 팡파르 (D장조 느낌) | 성공 팡파르 + sawtooth 레이어 | `confirmLaunch()` 내 |
| 문스톤 획득 순간 (오버레이) | sine, 반짝이는 고음, 1200Hz→1600Hz, 0.1s | `playSfx('sine', 1200, 0.10, 0.03, 1600)` | `_showLaunchOverlay()` success 분기 |

### 3-9. 주변 환경음 (앰비언트)

앰비언트는 `setInterval` 기반으로 랜덤 트리거. Web Audio API의 oscillator를 활용한 절차적 생성:

| 앰비언트 | 음향 특성 | 발생 조건 | 주기 |
|---------|---------|---------|------|
| 공장 드릴 험 | sawtooth, 55Hz, vol 0.004, 0.5s | 광산(mine) 1개 이상 건설 시 | 3~5초 랜덤 |
| 냉각 시스템 쉬 | sine, 180Hz→240Hz, 0.3s, vol 0.006 | 크라이오 공장(cryo_plant) 건설 시 | 4~7초 랜덤 |
| 전자 장비 버즈 | sine, 440Hz, vol 0.003, 0.2s | 전자 연구소(elec_lab) 건설 시 | 5~8초 랜덤 |
| 우주 배경 노이즈 | (구현 방식 별도 — 아래 참조) | 항상 | 8초 주기 |

**우주 배경 노이즈 구현 방법 (Web Audio 노드 그래프)**:
AudioContext의 createBuffer로 white noise buffer를 생성하고 BiquadFilter(lowpass, 300Hz)를 통과시켜 deep space feel을 만든다. 볼륨은 0.004 이하로 아주 낮게 설정하여 BGM과 간섭하지 않도록 한다.

### 3-10. BGM 강화

현재 BGM은 3트랙이 모두 동일하게 8초 루프이며, 각 트랙이 잘 설계되어 있으나 게임 진행에 연동되지 않는 점이 가장 큰 약점이다.

**탭-BGM 자동 연동 제안**:
- Production/Assembly 탭: TRACK 0 (DRIVE — D-minor 134BPM, 공장 에너지)
- Research 탭: TRACK 1 (GRID — A-minor 110BPM, 사색적 글리치)
- Launch 탭 (발사 준비): TRACK 0 유지
- 발사 시퀀스 (`_runLaunchAnimation` 진입 시): TRACK 2 (LAUNCH — E-minor 145BPM, 긴장)
- 발사 결과 오버레이 (`_showLaunchOverlay`): BGM 일시 정지 후 팡파르 재생, 이후 TRACK 0 복귀

구현: `switchMainTab()` 내 탭별 BGM 전환 로직 추가, `_runLaunchAnimation()` 진입 시 `BGM.start(2)` 호출.

---

## 4. 앰비언트/BGM 강화 제안

### 4-1. 게임 진행 단계별 BGM 제안

**초반 (첫 건물 ~ 첫 연구 전)**: TRACK 0 (DRIVE). 플레이어가 처음 게임에 들어와 기초 시스템을 구축하는 단계. 134BPM의 추진력 있는 D-minor가 적절하다.

**중반 (연구 중 ~ 조립 중)**: Research 탭 방문 시 TRACK 1 (GRID) 자동 전환. 110BPM의 느리고 사색적인 A-minor 글리치 사운드가 연구 몰입감을 높인다. Assembly 탭 복귀 시 TRACK 0으로 전환.

**발사 대기 (ALL SYSTEMS GO)**: TRACK 0에서 `BGM.setVolume(0.18)`으로 볼륨을 살짝 올려 긴장감 암시. 실제 트랙 전환은 하지 않음.

**발사 시퀀스 진입**: `BGM.start(2)` — 145BPM LAUNCH 트랙. 7초 발사 시퀀스 전체를 커버한다. 발사 완료 후 `BGM.start(0)` 복귀.

**프레스티지 직전 (문스톤 누적 상당량)**: 미래에 TRACK 3을 추가할 여지가 있음 — D장조 계열의 개선된 패드, 상승 느낌.

### 4-2. 절차적 사운드 레이어링 (Web Audio API AudioNode 그래프)

현재 `playSfx`는 단일 Oscillator → Gain → destination의 선형 체인이다. 아래 그래프로 확장하면 더 풍부한 SFX 표현이 가능하다:

```
Oscillator 1 (fundamental)
        \
         GainNode (envelope) ──→ ConvolverNode (reverb) ──→ MasterGain ──→ destination
        /                     (작은 room IR 사용)
Oscillator 2 (harmonic)
```

**구체적 개선**:
1. ConvolverNode를 추가하여 발사 팡파르에 짧은 홀 리버브 적용
2. BiquadFilter(highpass, 80Hz)를 SFX 체인에 삽입하여 저역 노이즈 차단
3. 마일스톤/탭해금 등 중요 이벤트에 Oscillator 2개를 병렬로 쌓아 풍성한 화음 효과

```javascript
// 개선된 2-oscillator SFX 예시 구조 (향후 구현 참고)
function playRichSfx(freq1, freq2, dur, vol) {
  const ctx = ensureAudio();
  const masterG = ctx.createGain();
  masterG.gain.setValueAtTime(vol, ctx.currentTime);
  masterG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  masterG.connect(ctx.destination);
  [freq1, freq2].forEach(f => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = f;
    osc.connect(masterG);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  });
}
```

---

## 5. 구현 우선순위 & 스프린트 계획

| 스프린트 | 작업 내용 | 예상 효과 |
|---------|---------|---------|
| **Sprint 2** | (1) 조립 완료 알림음 구현 (2) 발사 실패음 구현 (3) ALL SYSTEMS GO 알림음 (4) 인원 배치/철수 클릭음 (5) 탭 전환 클릭음 (6) 기술 카드 선택음 | 핵심 피드백 루프 완성. 가장 빈번한 인터랙션 이벤트를 커버. 조작감 체감 개선 효과 즉각적 |
| **Sprint 3** | (1) BGM-탭 자동 연동 (`switchMainTab` 내 `BGM.start(N)` 연결) (2) 발사 시퀀스 단계별 차별화 SFX (5단계 독립 음향) (3) 타이틀 부팅 비프음 (4) 오프라인 보고서 팡파르 (5) 마일스톤 보상 보조음 | 게임 전체 서사 흐름에 사운드가 연동됨. 발사 시퀀스의 몰입도 대폭 향상. 스테이지별 사운드 정체성 확립 |
| **Sprint 4** | (1) 앰비언트 레이어 시스템 구현 (건물 수 기반 랜덤 스케줄링) (2) SFX 믹서 확장 (카테고리별 볼륨 토글) (3) ConvolverNode 리버브 추가 (팡파르 전용) (4) BGM 볼륨 크로스페이드 구현 | 게임 월드 생동감 최대화. 접근성 향상 (카테고리 뮤트). 발사 연출 퀄리티 스튜디오급 수준 도달 |

---

## 6. 즉시 구현 가능한 playSfx 호출 코드 예시 10가지

아래는 각 구현 위치에 한 줄 추가하면 즉시 적용 가능한 코드다:

```javascript
// 1. 탭 전환 클릭음 — switchMainTab() 첫 줄에 추가
playSfx('triangle', 220, 0.05, 0.025, 330);

// 2. 인원 배치 (+) — quickAssign() 내 성공 분기에 추가
playSfx('triangle', 300, 0.04, 0.02, 400);

// 3. 인원 철수 (-) — quickUnassign() 내 성공 분기에 추가
playSfx('triangle', 400, 0.04, 0.02, 300);

// 4. 조립 완료 알림 — updateAssemblyJobs() 내 job.ready = true 직후
playSfx('square', 660, 0.14, 0.07, 1000);

// 5. 발사 실패음 — _showLaunchOverlay() 또는 _runLaunchAnimation() success===false 분기
playSfx('sawtooth', 220, 0.20, 0.06, 80);

// 6. 기술 카드 선택 — selectTech2() 내 추가
playSfx('sine', 380, 0.05, 0.018);

// 7. ALL SYSTEMS GO 알림 — renderLaunchTab()에서 allGo 전환 감지 시
playSfx('sine', 440, 0.08, 0.04, 660);

// 8. 문스톤 획득 반짝임 — _showLaunchOverlay() success===true 분기
playSfx('sine', 1200, 0.10, 0.03, 1600);

// 9. 오프라인 보고서 팡파르 1단계 — _showOfflineReport() 진입 시
playSfx('triangle', 392, 0.08, 0.05, 523);

// 10. 품질 선택 틱 — selectQuality() 내 추가
playSfx('triangle', 400, 0.04, 0.02, 500);

// 11. 발사 성공 팡파르 (3음, 순차) — T+20 성공 or 오버레이 표시 시
playSfx('square', 523, 0.10, 0.06, 660);
setTimeout(() => playSfx('square', 659, 0.10, 0.06, 880), 130);
setTimeout(() => playSfx('square', 784, 0.18, 0.07, 1047), 260);

// 12. 전체 인원 철수 스윕 — withdrawAllWorkers() 내
playSfx('triangle', 440, 0.12, 0.03, 220);
```

---

## 7. 기술 고려사항

### 7-1. 웹 브라우저 AudioContext 자동재생 정책

Chrome/Firefox 등 모던 브라우저는 사용자 인터랙션 없이 AudioContext를 resume하지 않는다. 현재 코드는 `ensureAudio()`에서 이미 `audioCtx.state === 'suspended'` 체크 후 `resume()`을 호출하고 있으므로 기본 정책은 대응되어 있다.

그러나 타이틀 화면 부팅 시퀀스 비프음은 페이지 로드 즉시 실행되어 사용자 인터랙션 이전에 발생한다. 이 경우 버튼(새게임/이어하기) 클릭 이벤트 이후에만 오디오를 활성화해야 한다. `init()` 내 버튼 이벤트 핸들러에서 `ensureAudio()`를 먼저 호출하는 방식으로 AudioContext를 사전 활성화하면 해결된다.

BGM의 `BGM.start()` 역시 현재 `enterGame()` 내 1200ms 지연 후 호출되므로 사용자가 이미 버튼을 클릭한 이후 시점으로 안전하다.

### 7-2. 성능 최적화

현재 `playSfx`는 호출마다 새 Oscillator와 GainNode를 생성하고 stop 후 GC에 의존한다. 빠른 연속 클릭(인원 배치 버튼 연타)이나 발사 시퀀스처럼 짧은 시간 내 다수 호출이 발생할 경우 노드 누적이 일어날 수 있다.

**권장 최적화**:
1. **사운드 쿨다운**: 탭 전환음, 인원 배치음처럼 연속 발생 가능한 SFX에는 마지막 호출 시각을 기록하고 50ms 이내 재호출 시 스킵
2. **GainNode 직후 disconnect**: `osc.stop(t)` 시 `osc.onended = () => { osc.disconnect(); gain.disconnect(); }` 추가하여 빠른 GC 유도
3. **앰비언트 전용 AudioNode 풀**: 앰비언트 구현 시 미리 생성한 노드를 재사용하는 풀 패턴 적용

```javascript
// 쿨다운 유틸리티 예시 (구현 참고용)
const _sfxCooldown = {};
function playSfxCD(key, minInterval, ...args) {
  const now = Date.now();
  if (_sfxCooldown[key] && now - _sfxCooldown[key] < minInterval) return;
  _sfxCooldown[key] = now;
  playSfx(...args);
}
```

### 7-3. 사운드 설정 (음량 조절, 개별 카테고리 토글)

현재 사운드 설정은 `gs.settings.sound` (boolean, ON/OFF 전체)와 BGM 마스터 볼륨(`BGM.volume = 0.12`)만 존재한다. SFX 볼륨 컨트롤이 없고 BGM/SFX 분리 토글이 없다.

**Sprint 4에서 도입 제안하는 설정 구조**:
```javascript
gs.settings = {
  sound: true,        // 전체 사운드 ON/OFF (현재)
  sfxVol: 0.5,        // SFX 마스터 볼륨 (0~1, playSfx의 vol에 곱함)
  bgmVol: 0.12,       // BGM 볼륨 (BGM.setVolume에 전달)
  ambientVol: 0.3,    // 앰비언트 볼륨
  sfxUi: true,        // UI 클릭음 ON/OFF
  sfxEvent: true,     // 이벤트음(달성, 완료 등) ON/OFF
};
```

설정 UI는 기존 SND:ON/OFF 버튼을 확장하여 슬라이더 + 카테고리 토글로 개선한다. 이는 Sprint 4에서 UI팀장과 협업하여 구현한다.

### 7-4. 모바일/저사양 환경 고려

웹게임이므로 모바일 브라우저에서도 실행 가능해야 한다. iOS Safari는 AudioContext 제약이 더 엄격하며, 앰비언트 레이어가 다수 활성화될 경우 저사양 기기에서 레이턴시가 증가할 수 있다. 앰비언트 시스템 구현 시 동시 활성 oscillator 수를 8개 이하로 제한하는 캡을 두고, 모바일 감지 시 앰비언트를 기본 비활성화하는 것을 권장한다.

---

*본 제안서는 MoonIdle Sprint 1 기준 코드 분석에 근거하여 작성되었다. 구현은 사운드디렉터가 `dev/sound` 브랜치에서 단독 작업 후 QA팀장 검증을 거쳐 sprint/1(또는 sprint/2)에 머지한다.*
