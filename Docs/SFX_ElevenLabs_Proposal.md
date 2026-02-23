# MoonIdle SFX 전면 교체 제안서 — ElevenLabs Sound Effects

| 항목 | 내용 |
|------|------|
| **작성일** | 2026-02-23 |
| **작성자** | 사운드 디렉터 (Sound Director) |
| **문서 목적** | 현재 Web Audio OscillatorNode 기반 프로그래매틱 SFX를 ElevenLabs Sound Effects API로 생성한 실제 오디오 파일로 전면 교체하기 위한 마스터 제안서 |
| **대상** | 총괄PD, 개발PD, 프로그래밍팀장 |

---

## 1. 현재 상황 요약

### 1.1 현행 SFX 시스템 구조

MoonIdle의 전체 효과음은 **오디오 파일 없이** JavaScript Web Audio API의 `OscillatorNode`를 실시간 생성하여 재생하고 있다.

- **기본 함수**: `playSfx(type, freq, dur, vol, targetFreq)` — `js/game-state.js:631`
  - 단일 오실레이터를 생성하고 주파수 스위프(선택)를 적용하는 범용 함수
  - `SFX_GLOBAL_VOL` 배율로 전체 SFX 볼륨 보정
- **전용 SFX 함수 6종**: `js/audio-bgm.js:350~841` — 다중 오실레이터 + 엔벨로프를 직접 프로그래밍
- **인라인 호출 50건 이상**: 각 JS 파일에 `playSfx()` 직접 호출이 산재

### 1.2 문제점

| 문제 | 설명 |
|------|------|
| **음질 한계** | 단순 파형(sine/triangle/square/sawtooth)만 사용 — 실제 음향에 비해 전자음 느낌이 강함 |
| **표현력 부족** | 복잡한 사운드(폭발, 금속 충돌, 기계 동작 등)를 오실레이터 조합만으로 표현하기에 한계 |
| **유지보수 난이도** | SFX 파라미터가 코드 전역에 하드코딩 — 사운드 수정 시 여러 파일을 추적해야 함 |
| **일관성 결여** | 같은 카테고리 SFX라도 파일별로 다른 패턴으로 구현 — 통일된 사운드 아이덴티티 부재 |
| **브라우저 호환성** | OscillatorNode의 미세한 동작 차이로 브라우저별 재생 결과가 다를 수 있음 |

### 1.3 교체 목표

프로그래매틱 SFX **전량**을 ElevenLabs Sound Effects API로 생성한 고품질 오디오 파일로 교체하여:

1. **인더스트리얼 우주 테마**에 부합하는 사실적이고 몰입감 있는 효과음 확보
2. 코드에서 사운드 로직 분리 (데이터 드리븐 재생)
3. 모든 SFX의 볼륨/길이/톤 일관성 확보
4. 향후 Steam(Electron) 배포 시 프로페셔널한 오디오 품질 보장

---

## 2. 전체 SFX 목록

### 범례

- **구현**: `인라인` = playSfx() 직접 호출 / `전용함수` = audio-bgm.js 내 별도 함수 / `복합인라인` = 다중 playSfx + setTimeout 시퀀스
- **우선순위**: P1 = 핵심 게임플레이 (없으면 게임 경험 저하) / P2 = UI 피드백 (사용성) / P3 = 분위기/부가 (폴리싱)

### 2.1 UI 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| U01 | 탭 전환 클릭 | 전용함수 `sfxTabSwitch()` + 인라인 | `js/main.js:6`, `js/audio-bgm.js:406` | "Short soft UI click, digital interface tab switch, clean crisp click, sci-fi control panel" | 0.05s | P2 |
| U02 | 탭 열기 | 인라인 | `js/world.js:1303`, `js/tabs/production.js:23` | "Subtle UI panel slide open, soft whoosh with digital beep, futuristic interface" | 0.08s | P2 |
| U03 | 탭 닫기 | 인라인 | `js/world.js:1324`, `js/tabs/production.js:33` | "Subtle UI panel slide close, soft descending digital tone, futuristic interface" | 0.08s | P2 |
| U04 | 건물 상세 패널 열기 | 인라인 | `js/world.js:1342` | "Digital info panel appearing, soft chime with electronic sweep up, space station computer" | 0.12s | P2 |
| U05 | 정보 패널 열기 | 인라인 | `js/world.js:1451` | "Data readout display activation, gentle electronic ascending tone, sci-fi HUD" | 0.10s | P3 |
| U06 | 건물 선택/클릭 | 인라인 | `js/world.js:801` | "Digital selection click, crisp electronic ping, space station interface button" | 0.10s | P2 |
| U07 | 튜토리얼 텍스트 타이핑 | 인라인 | `js/tutorial-bot.js:64` | "Single tiny keystroke beep, retro computer terminal typing, very short digital blip" | 0.03s | P3 |
| U08 | 자원 상한 도달 경고 | 인라인 | `js/game-state.js:1216` | "Low frequency warning buzz, storage full alert, industrial space station alarm, short" | 0.15s | P2 |
| U09 | 업그레이드 실패 (자금 부족) | 인라인 | `js/game-state.js:582` | "Error buzzer, denied action beep, descending tone, space station negative feedback" | 0.10s | P2 |
| U10 | 미션 탭 클릭 | 인라인 | `js/tabs/mission.js:190` | "Soft navigation click, mission briefing open, space command interface" | 0.06s | P3 |

### 2.2 건설 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| C01 | 건물 건설 완료 | 인라인 | `js/game-state.js:161` | "Construction complete, metal scaffolding lock into place, heavy industrial clank with satisfying thud, space station module installation" | 0.25s | P1 |
| C02 | 건물 건설 확인 (클릭) | 인라인 | `js/world.js:1379` | "Confirm button press, industrial construction authorization beep, heavy mechanical click" | 0.15s | P1 |
| C03 | 애드온 건설 | 인라인 | `js/world.js:1095` | "Small module attachment, light mechanical snap with electronic confirmation, space station addon install" | 0.15s | P2 |
| C04 | 건물 업그레이드 (성공) | 복합인라인 | `js/game-state.js:161` (건설과 공유) | "Upgrade complete, power-up electronic sweep ascending, mechanical enhancement sound, industrial" | 0.20s | P1 |

### 2.3 인력 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| W01 | 직원 고용 | 인라인 | `js/game-state.js:513` | "Personnel hired, brief positive chime, badge scan beep, space station crew onboarding" | 0.12s | P1 |
| W02 | 직원 배치 | 인라인 | `js/world.js:1145` | "Worker assigned to station, soft confirmation click with electronic routing sound" | 0.12s | P2 |
| W03 | 운영센터 역할 배치 | 인라인 | `js/world.js:1248` | "Command role assignment, authoritative digital confirmation, mission control dispatch" | 0.12s | P2 |
| W04 | 직원 제거 | 인라인 | `js/world.js:1282` | "Worker unassigned, soft descending digital tone, personnel transfer notification" | 0.10s | P2 |
| W05 | 코인 클릭 (운영센터) | 인라인 | `js/game-state.js:602` | "Coin collect, bright digital cha-ching, quick satisfying currency pickup, arcade" | 0.08s | P1 |

### 2.4 생산 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| P01 | 수동 채광 | 인라인 | `js/tabs/production.js:10` | "Pickaxe strike on rock, single mining hit, metallic impact on ore, lunar mining" | 0.15s | P1 |
| P02 | 생산 증가 | 인라인 | `js/tabs/production.js:57` | "Production rate increase, mechanical gear shifting up, efficiency boost electronic sweep" | 0.10s | P2 |
| P03 | 제작 완료 (부품) | 복합인라인 | `js/game-state.js:533-534` | "Manufacturing complete, industrial machine finishing, metal part ejection with steam release, factory" | 0.25s | P1 |
| P04 | 연료 주입 성공 | 인라인 | `js/game-state.js:559` | "Fuel injected successfully, pressurized liquid flowing, brief hiss and confirmation beep, rocket" | 0.12s | P1 |
| P05 | 연료 주입 실패 | 인라인 | `js/game-state.js:562` | "Fuel injection failure, pressure drop warning, brief hiss followed by error buzz, mechanical" | 0.10s | P2 |

### 2.5 연구 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| R01 | 연구 시작 | 인라인 | `js/game-state.js:1031` | "Research initiated, laboratory equipment powering on, electronic startup sequence, science" | 0.10s | P1 |
| R02 | 연구 완료 | 복합인라인 | `js/game-state.js:1075-1077` | "Research breakthrough, eureka discovery chime, triumphant ascending electronic fanfare, science lab" | 0.35s | P1 |
| R03 | 연구 큐 추가 | 인라인 | `js/game-state.js:1174` | "Queue item added, soft digital slot-in sound, data entry confirmation, computer terminal" | 0.08s | P2 |
| R04 | 연구 큐 취소 | 인라인 | `js/game-state.js:1188` | "Queue item removed, soft descending digital tone, data deletion, computer terminal" | 0.06s | P2 |

### 2.6 조립 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| A01 | 부품 조립 시작 | 인라인 | `js/tabs/assembly.js:122` | "Assembly line start, mechanical arm engaging, industrial servo motor activation, rocket factory" | 0.10s | P1 |
| A02 | 부품 슬롯 클릭 | 인라인 | `js/tabs/assembly.js:152` | "Part slot selection, metallic component click, mechanical latch engage, assembly" | 0.06s | P2 |
| A03 | 조립 스테이지 완료 | 전용함수 `sfxAssemblyStageComplete()` | `js/audio-bgm.js:366` | "Assembly stage complete, mechanical locking sound with positive electronic chime, rocket part installed" | 0.20s | P1 |
| A04 | 전체 조립 완료 | 전용함수 `sfxAssemblyAllComplete()` | `js/audio-bgm.js:382` | "Full rocket assembly complete, grand mechanical completion sequence, heavy locks engaging, triumphant industrial fanfare, space achievement" | 0.50s | P1 |

### 2.7 발사 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| L01 | 연료 주입 시작 | 인라인 | `js/tabs/launch.js:12` | "Fuel loading initiated, pressurized gas flowing into tank, hissing valve opening, rocket fueling" | 0.15s | P1 |
| L02 | 카운트다운 단계 (틱) | 인라인 | `js/tabs/launch.js:370` | "Countdown tick, single precise digital beep, mission control clock, tense" | 0.08s | P1 |
| L03 | 1단계 엔진 점화 | 인라인 | `js/tabs/launch.js:403` | "Rocket first stage ignition, deep rumbling engine start, massive thrust buildup, low frequency roar" | 0.30s | P1 |
| L04 | 2단계 가속 | 인라인 | `js/tabs/launch.js:421` | "Second stage acceleration, increasing engine thrust, turbine spinning faster, rocket ascending" | 0.30s | P1 |
| L05 | 3단계 대기권 진입 | 인라인 | `js/tabs/launch.js:442` | "Atmospheric entry, wind rushing past spacecraft, air friction whoosh fading to silence, space" | 0.35s | P1 |
| L06 | 발사 성공 | 복합인라인 `playLaunchSfx()` | `js/game-state.js:651`, `js/tabs/launch.js:519` | "Rocket launch success, triumphant mission control celebration, epic ascending whoosh to silence, space achievement fanfare" | 0.60s | P1 |
| L07 | 발사 실패 (폭발) | 전용함수 `playSfx_launchFail()` | `js/audio-bgm.js:651`, `js/tabs/launch.js:521` | "Rocket explosion failure, massive low frequency blast, metal debris scattering, fire crackle fading to silence, catastrophic" | 1.00s | P1 |
| L08 | 카운트다운 타이머 음 | 인라인 | `js/tabs/launch.js:569` | "High-pitched countdown alert, urgent ascending beep, mission control timer warning" | 0.12s | P2 |
| L09 | 연료 소진 경고 | 복합인라인 | `js/tabs/launch.js:573-574` | "Fuel depleted alarm, urgent low buzzer with stuttering engine sound, critical warning" | 0.30s | P1 |
| L10 | 발사 결과 확인 | 복합인라인 | `js/tabs/launch.js:642-643` | "Mission result reveal, dramatic data readout, anticipation followed by confirmation tone" | 0.20s | P2 |

### 2.8 미션/탐사 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| M01 | 탐사 시작 | 인라인 | `js/tabs/mission.js:89` | "Exploration mission launch, satellite dish activating, signal transmission beep, space probe deployment" | 0.15s | P1 |
| M02 | 탐사 완료 | 인라인 | `js/tabs/mission.js:581` | "Exploration complete, incoming data signal received, positive discovery chime, space communication" | 0.20s | P1 |
| M03 | 미션 보상 수령 | 인라인 | `js/tabs/mission.js:261` | "Reward collected, satisfying loot pickup, treasure chest opening with coins, digital currency gain" | 0.12s | P1 |
| M04 | 미션 목표 달성 | 인라인 | `js/tabs/mission.js:403` | "Mission objective achieved, triumphant short fanfare, goal completion chime, space achievement" | 0.18s | P1 |
| M05 | 미션 선택 | 인라인 | `js/tabs/mission.js:426` | "Mission selected, briefing file opened, tactical map click, command decision" | 0.10s | P2 |
| M06 | 프레스티지 실행 | 인라인 | `js/tabs/mission.js:162` | "Prestige reset activation, time rewind swoosh, dimensional shift with energy release" | 0.25s | P1 |

### 2.9 시스템/업적 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| S01 | 업적 달성 | 전용함수 `playSfx_achievementUnlock()` | `js/audio-bgm.js:420` | "Achievement unlocked, triumphant ascending arpeggio, golden chime with sparkle, epic game reward" | 0.60s | P1 |
| S02 | 프레스티지 리셋 SFX | 전용함수 `playSfx_prestigeReset()` | `js/audio-bgm.js:480` | "Cosmic prestige reset, deep bass sweep down followed by ascending ethereal shimmer, dimensional shift, space rebirth" | 1.20s | P1 |
| S03 | 페이즈 클리어 팡파레 | 전용함수 `playSfx_phaseClear()` | `js/audio-bgm.js:559` | "Phase clear victory fanfare, fast ascending note sequence to sustained major chord, triumphant game level complete, orchestral" | 1.00s | P1 |
| S04 | 오프라인 복귀 알림 | 전용함수 `playSfx_offlineReturn()` | `js/audio-bgm.js:769`, `js/game-state.js:965` | "Welcome back notification, gentle ascending arpeggio, warm positive alert chime, friendly return greeting" | 0.55s | P2 |
| S05 | 마일스톤 달성 | 복합인라인 | `js/milestones.js:68-70` | "Milestone reached, epic achievement sound, dramatic percussion hit with ascending shimmer, grand accomplishment" | 0.20s | P1 |
| S06 | 마일스톤 보상 클릭 | 인라인 | `js/milestones.js:90` | "Milestone reward claimed, satisfying click with golden sparkle, premium reward pickup" | 0.12s | P2 |
| S07 | 기능 언락 | 인라인 | `js/unlock.js:40` | "New feature unlocked, exciting electronic reveal, futuristic door opening, access granted" | 0.18s | P1 |
| S08 | 탭 언락 | 인라인 | `js/unlock.js:128` | "New tab unlocked, interface expansion sound, digital menu appearing, system upgrade" | 0.15s | P1 |
| S09 | 건물 언락 | 인라인 | `js/unlock.js:141` | "New building unlocked, construction blueprint unfolding, architectural reveal with electronic chime" | 0.15s | P1 |

### 2.10 자동화 카테고리

| # | SFX 이름 | 현재 구현 | 트리거 위치 | ElevenLabs 프롬프트 제안 | 예상 길이 | 우선순위 |
|---|----------|-----------|-------------|--------------------------|-----------|----------|
| T01 | 자동화 업그레이드 | 인라인 | `js/tabs/automation.js:53` | "Automation upgrade, robotic arm activating, servo motor whir with electronic upgrade complete chime" | 0.15s | P2 |

---

## 3. ElevenLabs 활용 전략

### 3.1 카테고리별 제작 배치 계획

효율적인 프롬프트 재활용과 톤 일관성을 위해 아래와 같이 **5개 배치**로 묶어 제작한다.

| 배치 | 카테고리 | SFX 수 | 공통 프롬프트 키워드 | 제작 순서 |
|------|----------|--------|---------------------|-----------|
| **Batch 1** | 발사 (L01~L10) | 10 | "rocket, launch, engine, thrust, space" | 1순위 |
| **Batch 2** | 건설 + 생산 + 조립 (C01~C04, P01~P05, A01~A04) | 13 | "industrial, mechanical, factory, manufacturing" | 2순위 |
| **Batch 3** | 시스템/업적 (S01~S09) | 9 | "achievement, fanfare, unlock, reward, epic" | 3순위 |
| **Batch 4** | 미션/탐사 + 인력 (M01~M06, W01~W05) | 11 | "mission, command, personnel, space station" | 4순위 |
| **Batch 5** | UI + 자동화 (U01~U10, T01) | 11 | "UI click, interface, digital, subtle" | 5순위 |

### 3.2 프롬프트 스타일 가이드

MoonIdle의 **인더스트리얼 우주 테마** (SpaceX 미션컨트롤 참조)에 맞추어 모든 프롬프트에 다음 톤 키워드를 공통 적용한다.

#### 글로벌 톤 키워드
```
"industrial, space station, sci-fi, clean, futuristic"
```

#### 카테고리별 톤 보정

| 카테고리 | 추가 톤 키워드 | 금지 키워드 |
|----------|---------------|-------------|
| **UI** | "subtle, minimal, crisp, digital" | "loud, dramatic, orchestral" |
| **건설/생산** | "mechanical, heavy, metallic, factory" | "cartoon, toy, plastic" |
| **연구** | "electronic, laboratory, scientific, data" | "magical, fantasy, mystical" |
| **발사** | "rocket, thrust, massive, realistic, NASA" | "8-bit, retro, toy" |
| **업적/시스템** | "triumphant, rewarding, epic, golden" | "sad, ominous, dark" |
| **미션** | "military, tactical, command, satellite" | "casual, playful" |

#### 프롬프트 작성 규칙

1. **영문 프롬프트**: ElevenLabs는 영문 프롬프트 기준이므로 모든 프롬프트를 영문으로 작성
2. **길이 명시**: 프롬프트 끝에 예상 길이를 명시 (예: "0.3 seconds long")
3. **네거티브 프롬프트**: 원하지 않는 요소 명시 (예: "no voice, no music, just sound effect")
4. **레이어 묘사**: 복잡한 SFX는 시간순 레이어를 기술 (예: "starts with X, followed by Y, ends with Z")
5. **레퍼런스**: 가능하면 실제 참조 사운드를 기술 (예: "like SpaceX Falcon 9 engine ignition")

### 3.3 품질 기준

| 항목 | 기준 |
|------|------|
| **비트레이트** | 최소 192kbps (mp3), 128kbps (ogg) |
| **샘플레이트** | 44.1kHz |
| **채널** | 모노 (SFX 특성상 스테레오 불필요, 파일 크기 절감) |
| **피크 레벨** | -3dBFS 이하 (클리핑 방지) |
| **노이즈 플로어** | -60dBFS 이하 |
| **시작/끝 무음** | 양끝 10ms 이내 트리밍 (0-크로싱 포인트에서 컷) |

---

## 4. 구현 방안

### 4.1 파일 포맷 및 폴더 구조

#### 듀얼 포맷 전략

| 포맷 | 용도 | 이유 |
|------|------|------|
| **mp3** | 기본 재생 포맷 | 전 브라우저 호환, BGM과 동일 포맷 |
| **ogg** | 폴백 포맷 (선택) | mp3 디코딩 지연이 체감되는 경우 대비 — 초기에는 mp3만으로 시작 |

> Steam(Electron) 배포 시 mp3만으로 충분하므로, 초기에는 **mp3 단일 포맷**으로 진행하고 브라우저 호환 이슈 발생 시 ogg 폴백을 추가한다.

#### 폴더 구조

```
audio/
├── bgm/                          ← 기존 BGM (변경 없음)
│   ├── Circuit Breaker Protocol.mp3
│   └── ...
└── sfx/                          ← 신규 SFX 폴더
    ├── ui/
    │   ├── tab-switch.mp3        (U01)
    │   ├── tab-open.mp3          (U02)
    │   ├── tab-close.mp3         (U03)
    │   ├── detail-panel-open.mp3 (U04)
    │   ├── info-panel-open.mp3   (U05)
    │   ├── building-select.mp3   (U06)
    │   ├── tutorial-type.mp3     (U07)
    │   ├── cap-warning.mp3       (U08)
    │   ├── upgrade-fail.mp3      (U09)
    │   └── mission-tab-click.mp3 (U10)
    ├── construction/
    │   ├── build-complete.mp3    (C01)
    │   ├── build-confirm.mp3     (C02)
    │   ├── addon-build.mp3       (C03)
    │   └── upgrade-complete.mp3  (C04)
    ├── workforce/
    │   ├── hire.mp3              (W01)
    │   ├── assign.mp3            (W02)
    │   ├── ops-role-assign.mp3   (W03)
    │   ├── unassign.mp3          (W04)
    │   └── coin-click.mp3        (W05)
    ├── production/
    │   ├── manual-mine.mp3       (P01)
    │   ├── production-up.mp3     (P02)
    │   ├── craft-complete.mp3    (P03)
    │   ├── fuel-inject-ok.mp3    (P04)
    │   └── fuel-inject-fail.mp3  (P05)
    ├── research/
    │   ├── research-start.mp3    (R01)
    │   ├── research-complete.mp3 (R02)
    │   ├── queue-add.mp3         (R03)
    │   └── queue-cancel.mp3      (R04)
    ├── assembly/
    │   ├── assembly-start.mp3    (A01)
    │   ├── slot-click.mp3        (A02)
    │   ├── stage-complete.mp3    (A03)
    │   └── all-complete.mp3      (A04)
    ├── launch/
    │   ├── fuel-loading.mp3      (L01)
    │   ├── countdown-tick.mp3    (L02)
    │   ├── stage1-ignition.mp3   (L03)
    │   ├── stage2-accel.mp3      (L04)
    │   ├── stage3-atmo.mp3       (L05)
    │   ├── launch-success.mp3    (L06)
    │   ├── launch-fail.mp3       (L07)
    │   ├── countdown-alert.mp3   (L08)
    │   ├── fuel-depleted.mp3     (L09)
    │   └── result-reveal.mp3     (L10)
    ├── mission/
    │   ├── explore-start.mp3     (M01)
    │   ├── explore-complete.mp3  (M02)
    │   ├── reward-claim.mp3      (M03)
    │   ├── objective-done.mp3    (M04)
    │   ├── mission-select.mp3    (M05)
    │   └── prestige-exec.mp3     (M06)
    ├── system/
    │   ├── achievement.mp3       (S01)
    │   ├── prestige-reset.mp3    (S02)
    │   ├── phase-clear.mp3       (S03)
    │   ├── offline-return.mp3    (S04)
    │   ├── milestone.mp3         (S05)
    │   ├── milestone-reward.mp3  (S06)
    │   ├── feature-unlock.mp3    (S07)
    │   ├── tab-unlock.mp3        (S08)
    │   └── building-unlock.mp3   (S09)
    └── automation/
        └── auto-upgrade.mp3      (T01)
```

### 4.2 코드 통합 방법

#### 방안: SFX 매니저 패턴 (권장)

현행 `playSfx()` 인라인 호출을 **SFX 매니저 객체**로 교체하여 코드와 사운드를 분리한다.

##### 신규 모듈: `js/sfx-manager.js`

```javascript
/**
 * SFX Manager — 프리로드 + 캐시 + 이름 기반 재생
 * playSfx() 인라인 호출을 전부 SFX.play('이름') 호출로 교체
 */
const SFX = (() => {
  const _cache = {};  // name -> HTMLAudioElement
  const _vol = 0.5;   // 마스터 SFX 볼륨 (0~1)

  // SFX 매핑 테이블 — ID : 파일 경로
  const _map = {
    // UI
    'tab-switch':       'audio/sfx/ui/tab-switch.mp3',
    'tab-open':         'audio/sfx/ui/tab-open.mp3',
    'tab-close':        'audio/sfx/ui/tab-close.mp3',
    'detail-panel':     'audio/sfx/ui/detail-panel-open.mp3',
    'info-panel':       'audio/sfx/ui/info-panel-open.mp3',
    'building-select':  'audio/sfx/ui/building-select.mp3',
    'tutorial-type':    'audio/sfx/ui/tutorial-type.mp3',
    'cap-warning':      'audio/sfx/ui/cap-warning.mp3',
    'upgrade-fail':     'audio/sfx/ui/upgrade-fail.mp3',
    'mission-tab':      'audio/sfx/ui/mission-tab-click.mp3',
    // Construction
    'build-complete':   'audio/sfx/construction/build-complete.mp3',
    'build-confirm':    'audio/sfx/construction/build-confirm.mp3',
    'addon-build':      'audio/sfx/construction/addon-build.mp3',
    'upgrade-complete': 'audio/sfx/construction/upgrade-complete.mp3',
    // Workforce
    'hire':             'audio/sfx/workforce/hire.mp3',
    'assign':           'audio/sfx/workforce/assign.mp3',
    'ops-role':         'audio/sfx/workforce/ops-role-assign.mp3',
    'unassign':         'audio/sfx/workforce/unassign.mp3',
    'coin-click':       'audio/sfx/workforce/coin-click.mp3',
    // Production
    'manual-mine':      'audio/sfx/production/manual-mine.mp3',
    'production-up':    'audio/sfx/production/production-up.mp3',
    'craft-complete':   'audio/sfx/production/craft-complete.mp3',
    'fuel-ok':          'audio/sfx/production/fuel-inject-ok.mp3',
    'fuel-fail':        'audio/sfx/production/fuel-inject-fail.mp3',
    // Research
    'research-start':   'audio/sfx/research/research-start.mp3',
    'research-done':    'audio/sfx/research/research-complete.mp3',
    'queue-add':        'audio/sfx/research/queue-add.mp3',
    'queue-cancel':     'audio/sfx/research/queue-cancel.mp3',
    // Assembly
    'asm-start':        'audio/sfx/assembly/assembly-start.mp3',
    'asm-slot':         'audio/sfx/assembly/slot-click.mp3',
    'asm-stage':        'audio/sfx/assembly/stage-complete.mp3',
    'asm-all':          'audio/sfx/assembly/all-complete.mp3',
    // Launch
    'fuel-loading':     'audio/sfx/launch/fuel-loading.mp3',
    'cd-tick':          'audio/sfx/launch/countdown-tick.mp3',
    'stage1':           'audio/sfx/launch/stage1-ignition.mp3',
    'stage2':           'audio/sfx/launch/stage2-accel.mp3',
    'stage3':           'audio/sfx/launch/stage3-atmo.mp3',
    'launch-ok':        'audio/sfx/launch/launch-success.mp3',
    'launch-fail':      'audio/sfx/launch/launch-fail.mp3',
    'cd-alert':         'audio/sfx/launch/countdown-alert.mp3',
    'fuel-depleted':    'audio/sfx/launch/fuel-depleted.mp3',
    'result-reveal':    'audio/sfx/launch/result-reveal.mp3',
    // Mission
    'explore-start':    'audio/sfx/mission/explore-start.mp3',
    'explore-done':     'audio/sfx/mission/explore-complete.mp3',
    'reward-claim':     'audio/sfx/mission/reward-claim.mp3',
    'obj-done':         'audio/sfx/mission/objective-done.mp3',
    'mission-select':   'audio/sfx/mission/mission-select.mp3',
    'prestige-exec':    'audio/sfx/mission/prestige-exec.mp3',
    // System
    'achievement':      'audio/sfx/system/achievement.mp3',
    'prestige-reset':   'audio/sfx/system/prestige-reset.mp3',
    'phase-clear':      'audio/sfx/system/phase-clear.mp3',
    'offline-return':   'audio/sfx/system/offline-return.mp3',
    'milestone':        'audio/sfx/system/milestone.mp3',
    'milestone-reward': 'audio/sfx/system/milestone-reward.mp3',
    'feature-unlock':   'audio/sfx/system/feature-unlock.mp3',
    'tab-unlock':       'audio/sfx/system/tab-unlock.mp3',
    'building-unlock':  'audio/sfx/system/building-unlock.mp3',
    // Automation
    'auto-upgrade':     'audio/sfx/automation/auto-upgrade.mp3',
  };

  /** 프리로드 — 게임 시작 시 1회 호출 */
  function preload() {
    for (const [name, src] of Object.entries(_map)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = _vol;
      _cache[name] = audio;
    }
  }

  /** 재생 — 이름 기반 */
  function play(name) {
    if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;
    const audio = _cache[name];
    if (!audio) return;
    // 이미 재생 중이면 클론으로 중첩 재생 (빠른 반복 클릭 대응)
    if (!audio.paused) {
      const clone = audio.cloneNode();
      clone.volume = _vol;
      clone.play().catch(() => {});
      return;
    }
    audio.currentTime = 0;
    audio.volume = _vol;
    audio.play().catch(() => {});
  }

  /** 볼륨 설정 (0~1) */
  function setVolume(v) {
    _vol = Math.max(0, Math.min(1, v));
    for (const a of Object.values(_cache)) a.volume = _vol;
  }

  return { preload, play, setVolume, _map };
})();
```

##### 교체 예시

```javascript
// === Before (현행) ===
playSfx('triangle', 520, 0.1, 0.04, 780);        // 건물 건설
playSfx('square', 520, 0.08, 0.03, 660);          // 직원 고용
playSfx_launchFail();                               // 발사 실패

// === After (교체 후) ===
SFX.play('build-complete');                         // 건물 건설
SFX.play('hire');                                   // 직원 고용
SFX.play('launch-fail');                            // 발사 실패
```

##### 통합 절차

1. `js/sfx-manager.js` 신규 생성 + `index.html`에 `<script>` 태그 추가
2. `SFX.preload()`를 `init()` (main.js) 내에서 호출
3. 각 파일의 `playSfx()` / 전용 SFX 함수 호출부를 `SFX.play('name')`으로 일괄 교체
4. `game-state.js`의 기존 `playSfx()` 함수는 폴백용으로 당분간 유지 (미교체 호출이 있을 경우 대비)
5. 전수 교체 확인 후 `playSfx()` 및 `audio-bgm.js` SFX 섹션 제거

### 4.3 볼륨 일관성 정책

| 항목 | 기준 |
|------|------|
| **마스터 SFX 볼륨** | 0.5 (BGM 0.2과의 밸런스) |
| **개별 파일 노멀라이즈** | 모든 SFX 파일을 -6dBFS 기준으로 노멀라이즈 후 납품 |
| **카테고리별 보정** | UI 계열: 0.7배 / 시스템(팡파레): 1.0배 / 발사(폭발): 0.9배 |
| **파일 내 볼륨 통일** | ElevenLabs 생성 후 Audacity/ffmpeg로 일괄 노멀라이즈 |

> 기존 `SFX_GLOBAL_VOL` 상수(balance-data.js)는 SFX Manager의 `setVolume()`으로 대체한다.

---

## 5. 우선순위 및 배치 계획

### 5.1 우선순위 분류 요약

| 우선순위 | 정의 | SFX 수 | 비율 |
|----------|------|--------|------|
| **P1** | 핵심 게임플레이 — 없으면 게임 경험이 크게 저하되는 SFX | 33 | 61% |
| **P2** | UI 피드백 — 사용성 및 반응성을 높이는 SFX | 18 | 33% |
| **P3** | 분위기/부가 — 폴리싱 수준의 분위기 SFX | 3 | 6% |
| **합계** | | **54** | 100% |

### 5.2 제작 배치 일정 제안

| 단계 | 배치 | 포함 SFX | 수량 | 목표 |
|------|------|----------|------|------|
| **Phase 1** | Batch 1 (발사) + P1 시스템 | L01~L10, S01~S03, S05, S07~S09 | 19 | 핵심 게임 루프 사운드 확보 |
| **Phase 2** | Batch 2 (건설+생산+조립) P1 | C01~C04, P01~P05, A01~A04, W01, W05 | 15 | 산업/제작 사운드 스케이프 완성 |
| **Phase 3** | Batch 3~5 나머지 P1 + P2 | M01~M06, R01~R04, 나머지 P2 전부 | 17 | 전체 게임 SFX 커버 |
| **Phase 4** | P3 + 추가 변형 | U05, U07, U10 + 필요시 변형본 | 3+ | 최종 폴리싱 |

### 5.3 P1 SFX 상세 목록 (33건)

```
C01  건물 건설 완료          C02  건물 건설 확인
C04  건물 업그레이드         W01  직원 고용
W05  코인 클릭              P01  수동 채광
P03  제작 완료              P04  연료 주입 성공
R01  연구 시작              R02  연구 완료
A01  부품 조립 시작          A03  조립 스테이지 완료
A04  전체 조립 완료          L01  연료 주입 시작
L02  카운트다운 틱           L03  1단계 엔진 점화
L04  2단계 가속             L05  3단계 대기권
L06  발사 성공              L07  발사 실패 (폭발)
L09  연료 소진 경고          M01  탐사 시작
M02  탐사 완료              M03  미션 보상 수령
M04  미션 목표 달성          M06  프레스티지 실행
S01  업적 달성              S02  프레스티지 리셋
S03  페이즈 클리어           S05  마일스톤 달성
S07  기능 언락              S08  탭 언락
S09  건물 언락
```

---

## 6. 예상 비용 및 효율

### 6.1 ElevenLabs Sound Effects API 개요

| 플랜 | 가격 | SFX 생성 크레딧 | 비고 |
|------|------|-----------------|------|
| **Free** | $0/월 | 10,000 chars/월 (SFX API는 크레딧 기반) | 테스트용, 상업 불가 |
| **Starter** | $5/월 | 30,000 chars/월 | 상업 이용 가능 |
| **Creator** | $22/월 | 100,000 chars/월 | 고품질 모델 접근 |
| **Pro** | $99/월 | 500,000 chars/월 | 최대 품질 + 우선 처리 |

> Sound Effects API는 텍스트 프롬프트 길이 기준으로 크레딧을 소모하며, 생성된 오디오는 무제한 다운로드/사용 가능.

### 6.2 예상 제작 비용

| 항목 | 수량 | 추정 |
|------|------|------|
| **총 SFX 수** | 54건 | |
| **평균 프롬프트 길이** | ~100자 | 영문 기준 |
| **리테이크 포함 시도 횟수** | SFX당 3~5회 | 만족스러운 결과를 위한 반복 |
| **총 프롬프트 소비** | 54 x 100 x 5 = 27,000자 | 최대 추정치 |
| **권장 플랜** | **Starter ($5/월)** 1개월 | 30,000자로 전량 커버 가능 |
| **안전 마진 플랜** | **Creator ($22/월)** 1개월 | 100,000자 — 품질 만족까지 충분한 반복 가능 |

### 6.3 비용 효율 분석

| 비교 항목 | 프로그래매틱 (현행) | ElevenLabs (제안) |
|-----------|-------------------|-------------------|
| **초기 비용** | $0 | $5~$22 (1회) |
| **음질** | 전자음 한계 | 자연스러운 고품질 |
| **유지보수** | 코드 수정 필요 | 파일 교체만으로 가능 |
| **확장성** | 새 SFX마다 코드 작성 | 프롬프트 한 줄로 생성 |
| **테마 통일성** | 파일별 제각각 | 프롬프트 가이드로 통일 |
| **개발 시간** | 새 SFX당 30분~1시간 | 생성+트리밍 10분 |

### 6.4 라이선스 참고

- ElevenLabs Sound Effects API로 생성된 오디오는 **상업적 사용 가능** (Starter 이상)
- Steam 배포에 제한 없음
- 생성된 파일의 소유권은 사용자에게 귀속
- 단, Free 플랜은 비상업 목적 한정이므로 프로덕션 배포 시 반드시 유료 플랜 사용

---

## 부록: 교체 작업 체크리스트

- [ ] ElevenLabs 계정 생성 + 유료 플랜 구독
- [ ] Phase 1 SFX 생성 (발사 + 시스템 핵심)
- [ ] 생성 파일 노멀라이즈 + 트리밍 (ffmpeg/Audacity)
- [ ] `audio/sfx/` 폴더 구조 생성 + 파일 배치
- [ ] `js/sfx-manager.js` 구현
- [ ] `index.html`에 sfx-manager.js 스크립트 태그 추가
- [ ] Phase 1 SFX 코드 교체 (발사 탭 + 시스템 SFX)
- [ ] Phase 1 QA (재생 확인, 볼륨 밸런스, 트리거 타이밍)
- [ ] Phase 2 SFX 생성 (건설+생산+조립)
- [ ] Phase 2 코드 교체 + QA
- [ ] Phase 3 SFX 생성 (미션+연구+인력+UI)
- [ ] Phase 3 코드 교체 + QA
- [ ] Phase 4 폴리싱 (P3 SFX + 볼륨 미세 조정)
- [ ] 전용 SFX 함수(audio-bgm.js) + 구 playSfx() 제거
- [ ] 최종 플레이테스트 + 사운드 밸런스 조정
- [ ] Steam 빌드 포함 확인
