# MoonIdle - 달 탐사 로켓 제작소

## 프로젝트 개요
달에 가기 위한 로켓을 조립하는 방치형(Idle) 웹게임. 바닐라 HTML/CSS/JS로 개발, Steam(Electron EXE) 배포 예정.

## 기술 스택
- **언어**: HTML5 / CSS3 / JavaScript (ES6+, 바닐라, 외부 라이브러리 없음)
- **플랫폼**: 웹 브라우저 + Steam (Electron EXE 래핑 예정)
- **저장**: localStorage (saveVersion v2, 마이그레이션 체인 적용)
- **배포**: GitHub Pages (웹) / SteamPipe (EXE)

## 프로젝트 구조
- `index.html` - 게임 전체 (단일 파일, 모든 로직 포함)
- `mockups/` - UI 목업 HTML, ComfyUI 워크플로우, 컨셉 에셋
- `Docs/` - 기획 문서, 스프린트 진행 현황, DevPD 지침서
- `.claude/agents/` - 에이전트 정의
- `.agent/skills/` - 스킬 정의
- `.worktrees/` - 팀장별 git worktree (dev/*)
- `qa/` - QA 리포트 파일
- `scripts/` - 워크트리/QA 자동화 스크립트

## Steam 정보
- **게임 이름**: MoonIdle
- **App ID**: 미정
- **플랫폼**: Windows (Electron EXE)
- **Steam 계정**: shatterbone7

## MCP 서버
- **mcp-unity**: 웹 프로젝트에서 재활용 (포트 8080, 프로토콜 참조용)
- **comfy-ui-builder**: ComfyUI 이미지/오디오 생성
- **playwright**: 웹 자동화 / E2E 테스트
- **Notion**: 업무 카드/문서 관리

---

## 팀 구조 및 역할

### 팀 별칭
- **총괄PD** (사용자): 최종 의사결정, 방향 설정
- **개발PD** (Claude/Codex): 업무 조율 및 할당 **전용** — 코드/UI/빌드 직접 작업 절대 금지
- **기획팀장** (game-designer): 메카닉 설계, 밸런싱, SO 수치 조정
- **프로그래밍팀장** (unity-gameplay-programmer): 코어 게임플레이 코드 구현
- **QA팀장** (unity-qa-engineer): 에디터 QA, 머지 게이트
- **UI팀장** (unity-ui-developer): 모든 UI/UX 구현
- **빌더** (unity-build-engineer): 빌드, CI/CD, Steam 배포
- **TA** (unity-technical-artist): 아트디렉팅, 셰이더, 스프라이트, VFX, ComfyUI AI 에셋
- **사운드 디렉터** (unity-sound-director): BGM/SFX 제작, 믹싱, Unity 적용
- **PM** (project-manager): 스프린트 현황 취합, 문서 갱신

### 위임 원칙 (필수 준수 — 예외 없음)
1. **개발PD는 절대 직접 코딩/UI/빌드 작업하지 않음** — 무조건 해당 에이전트에게 위임
2. **에이전트 실패 시에도 개발PD 직접 작업 금지** — 네트워크 오류/MCP 장애/API 에러 등으로 에이전트가 실패하면 원인 해결 후 에이전트를 재실행할 것. 어떤 예외 상황에서도 개발PD가 "직접 하겠다"고 판단해서는 안 됨
3. **실무자 자체 QA**: 프로그래밍팀장, UI팀장, 기획팀장 등은 작업 후 자체 QA
4. **QA 조기 착수**: 각 팀장 작업 단위 완료 시 즉시 해당 부분 QA
5. **QA 통과 후 빌더에게 빌드 명령**: 모든 작업 완료 + QA 통과 → 빌더가 빌드
6. **UI 작업은 반드시 UI팀장 경유**: UI 수정/생성은 unity-ui-developer 에이전트 사용
7. **UI팀장이 목업 + Unity 구현 모두 담당** (프로토타입 단계)
8. **UI 명세는 PPT로 작성** (기획팀장이 디자인 없는 레이아웃 명세 담당)
9. **TA↔UI 역할 분리**: TA는 UI 컨셉/이미지 리소스만, UI 시스템 구현은 UI팀장 담당
10. **SO 수치 수정은 기획팀장 담당**: 코드 변경 없이 SO 수치만 바꾸는 작업은 기획팀장이 직접 수행

### 개발PD 3인 체제
- 개발PD 01: Claude Code, 개발PD 02: Claude Code, 개발PD 03: Codex
- **정보공유 핵심 문서**: `Docs/DevPD_Guidelines.md`
- 작업 전 반드시 Sprint Progress 문서 + git log 확인
- 작업 후 반드시 PM 호출하여 진행 현황 갱신

---

## Git 정책

### 브랜치 구조
```
main                    ← 릴리스/배포 (Steam 빌드 기준)
 └── sprint/N           ← 스프린트 통합 (QA 통과된 작업만 합류)
      ├── feature/*     ← 크로스팀 기능 통합 (2개+ 팀 협업 시)
      └── dev/*         ← 팀장별 작업 (워크트리 연결)
```

| 브랜치 | 역할 | 머지 권한 | 수명 |
|--------|------|-----------|------|
| **main** | Steam 배포용 안정 빌드 | 총괄PD | 영구 |
| **sprint/N** | 스프린트 통합. QA 통과 작업만 합류 | QA팀장 | 스프린트 종료 시 main 머지 + 태그 |
| **feature/\*** | 크로스팀 기능 통합용 (예: feature/idle-gold) | 개발PD(생성), 각 팀장(합류) | 기능 완료 후 sprint 머지 → 삭제 |
| **dev/\*** | 팀장별 단독 작업 (워크트리 고정) | 해당 팀장 | 영구 (sprint 머지 후 rebase) |

### 브랜칭 규칙
- **sprint 머지 권한**: QA팀장만 (QA 통과 필수)
- **스프린트 격리**: 이전 스프린트 브랜치에 다음 스프린트 작업 절대 커밋 금지
- **허용 브랜치만 존재**: main, sprint/N, feature/*, dev/* 외 브랜치 생성 금지

### 작업 흐름
- **단독 작업**: dev/* → QA 통과 → sprint/N 머지
- **크로스팀 기능**: 개발PD가 feature/* 생성 → 각 팀장이 feature/*에서 직접 작업 → 통합 QA → sprint/N 머지 → feature/* 삭제
- **크로스팀 의존성 처리**: 선행 팀 작업 완료 → feature/*에 머지 → 후행 팀이 feature/* 최신 pull 후 이어 작업
- **스프린트 시작**: main에서 sprint/N 분기 → 각 dev/*를 sprint/N 기반으로 갱신
- **스프린트 종료**: sprint/N → main 머지 + 버전 태그 (예: v0.5.0)

### 머지 순서 (의존성 기반 권장)
1. dev/game-designer (SO 데이터 — 다른 팀이 참조)
2. dev/programmer (코어 로직)
3. dev/ta (아트 에셋)
4. dev/sound (오디오 — 독립적)
5. dev/ui (UI — 위 항목에 의존)
6. dev/build (빌드 설정 — 최종)

### 팀장별 Git Author (커밋 시 필수 사용)
- 기획: `--author="GameDesigner <game-designer@moonidle.dev>"`
- 프로그래밍: `--author="GameplayProgrammer <gameplay-programmer@moonidle.dev>"`
- QA: `--author="QAEngineer <qa-engineer@moonidle.dev>"`
- UI: `--author="UIDeveloper <ui-developer@moonidle.dev>"`
- TA: `--author="TechnicalArtist <technical-artist@moonidle.dev>"`
- 사운드: `--author="SoundDirector <sound-director@moonidle.dev>"`
- 빌더: `--author="BuildEngineer <build-engineer@moonidle.dev>"`
- PM: `--author="ProjectManager <project-manager@moonidle.dev>"`
- 개발PD: `--author="DevPD <dev-pd@moonidle.dev>"`

### 커밋 규칙
- 커밋 메시지는 **한글**로 작성
- 작업 완료 즉시 커밋 (미커밋 상태로 세션 종료 금지)
- 프로젝트 관리 파일(에이전트/스킬/메모리/문서) 수정 후 다른 작업으로 넘어갈 때 즉시 커밋
- **stash 금지** — 브랜치 전환 전 반드시 커밋 (WIP 접두사 허용)

### Git Worktree
에이전트별 독립 워킹 디렉토리. 각 팀장이 자기 워크트리에서 동시 작업 가능:
```
primordial-station/                      ← 메인 (sprint/N)
primordial-station/.worktrees/wt-dev-programmer\  ← dev/programmer
primordial-station/.worktrees/wt-dev-ui\          ← dev/ui
primordial-station/.worktrees/wt-dev-design\      ← dev/design
primordial-station/.worktrees/wt-dev-qa\          ← dev/qa
primordial-station/.worktrees/wt-dev-sound\       ← dev/sound
primordial-station/.worktrees/wt-dev-build\       ← dev/build
```

#### 워크트리 작업 원칙
- **단독 작업**: 자기 워크트리(wt-dev-*)에서 dev/* 브랜치로 직접 편집+커밋. 브랜치 전환 불필요
- **크로스팀 기능**: 자기 워크트리에서 `git checkout feature/*`로 전환 후 작업 → 끝나면 `git checkout dev/*`로 복귀
- **Playwright 작업**: 메인 프로젝트에서 수행 (index.html 참조)
- **메인 파일**: index.html은 단일 파일이므로 동시 편집 충돌 주의 — 팀 간 편집 순서 조율 필요

---

## index.html 편집 정책
- **단일 파일 구조**: 모든 게임 로직이 index.html 한 파일에 있음 — 충돌 위험 인지
- **프로그래밍팀장**: 게임 로직(JS) 및 상태 관리 코드 담당
- **UI팀장**: CSS 스타일, HTML 구조(탭/패널 레이아웃) 담당
- **TA**: 에셋 파일(mockups/, 이미지, SVG)만 수정 — index.html 직접 수정 금지
- **편집 순서**: 프로그래밍팀장 작업 완료 후 UI팀장이 이어서 작업 (동시 편집 금지)
- index.html 수정이 필요하면 개발PD에게 보고 후 순서 조율

---

## 디자인 문서 관리 (로컬 md 기준 + Notion 동기화)
- **에이전트 기준 문서**: `Docs/Design/` 로컬 md 파일 (항상 최신 상태 유지)
- **총괄PD 확인 공간**: Notion (기획 확인, 피드백, 외부 공유용)
- **동기화 흐름**: 기획팀장이 로컬 md 수정 → Notion에도 최신화 → git 커밋
- **동기화 책임**: 기획팀장 (game-designer)
- **에이전트는 Notion을 직접 참조하지 않음** (로컬 md만 참조)
- **총괄PD 피드백**: 총괄PD가 Notion에서 기획을 수시로 확인하고 기획팀장에게 피드백

---

## 빌드/배포 정책
- 배포 절차는 `deploy` 스킬 참조 (`/deploy beta` 또는 `/deploy live`)
- **프로토타입 기간: 배포 전 반드시 총괄PD 승인 필요**
- **로컬 브라우저 테스트 통과 후에만 GitHub Pages 배포 진행**

---

## QA 정책
- QA 운영 절차는 `moonidle-qa-ops` 스킬 참조
- **sprint 브랜치 머지는 QA팀장만 가능** (QA 통과 필수)
- **빌드 전 Playwright 스모크 테스트 필수** (1건이라도 실패 시 빌드 금지)

---

## 스프린트 운영
- **공수 산정**: 에이전트 병렬 실행 기준 1시간 = 단일 에이전트 6~8시간 분량
- 모든 팀장에게 업무 배분 (유휴 팀 최소화), 팀당 2~3건
- 상세 지침: `Docs/DevPD_Guidelines.md` 8.1절
- **스프린트 종료 시 필수 프로세스**:
  1. **팀 플레이테스트 + 리뷰 회의**: 빌드를 전 팀장이 플레이하고, 현재 빌드 평가 + 게임 완성도에 필요한 내용을 공유. 기획팀장이 피드백을 취합하여 기획서에 반영
  2. **DevPD 문서 리뷰**: 해당 스프린트에서 발생한 문제(버그, QA 실패, 프로세스 장애)를 분석하고, 원인이 된 문서(skill, agent, CLAUDE.md, prefab-protocol 등)의 정책/절차 불일치·누락·모호함을 식별하여 수정 적용
- **Notion 동기화**:
  - 스프린트 계획서 최종 컨펌 시 Notion에 동기화 (PM 담당)
  - 스프린트 진행 기록 (Progress.md) PM이 수시로 Notion에 동기화

---

## 에이전트/스킬 거버넌스
- frontmatter 수정, 스킬 생성/변경, reference/asset 구성 변경은 **반드시 총괄PD 컨펌 후 실행**
- 스킬 생성/수정 후 6항목 자동 검증 필수 (SKILL.md 존재, frontmatter 유효성, description/body 길이, 참조 유효성, 미사용 리소스)
- 에이전트/스킬 변경 시 노션 "에이전트 - 스킬 매핑" 페이지 동기화 필수
- 스프린트 종료 후 각 팀장이 게임 플레이 후 개선점 보고서 PPT 3페이지 이내 작성

## Skills

| 스킬 | 설명 |
|------|------|
| verify-moonidle-core | MoonIdle 핵심 게임 로직 일관성 검증 (게임 상태, 데이터 정합성, 탭 시스템, 경제 밸런싱) |
| verify-comfyui-workflows | ComfyUI 워크플로우 및 배치 스크립트 일관성 검증 (JSON 스키마, 시드 고정, 파일 명명 규칙) |
| verify-design-consistency | 디자인 시스템 통일성 검증 (CSS 토큰, 아이콘 형식, 클래스 네이밍, ComfyUI 프롬프트) |
| verify-ascii-rendering | ASCII 건물 렌더링 일관성 검증 (폰트 정의, 기반부 정렬, 박스 외폭 일치, 선행 공백 규칙) |

---

## CLAUDE.md / MEMORY.md 관리 원칙
- **CLAUDE.md** (git 커밋): 따라야 할 **규칙과 지시** — 팀 정책, 컨벤션, 워크플로우, 코딩 표준
- **MEMORY.md** (로컬 `~/.claude/`): 작업에 도움이 되는 **맥락 정보** — 환경 설정, 민감 정보, 디버깅 경험, 학습한 패턴
- 판단 기준: "이것은 따라야 할 규칙인가?" → CLAUDE.md / "이것은 작업 맥락 정보인가?" → MEMORY.md
- MEMORY.md는 CLAUDE.md와 **중복 금지** — 규칙이 CLAUDE.md에 있으면 MEMORY.md에 다시 쓰지 않음
- **수정 권한**: CLAUDE.md와 MEMORY.md 모두 **총괄PD 승인 후에만 수정** (에이전트/스킬 거버넌스와 동일 기준)

---

## 중요 교훈
- **index.html 동시 편집 금지**: 단일 파일 구조이므로 팀 간 편집 순서 반드시 조율
- **localStorage 마이그레이션**: saveVersion 확인 후 체인 실행 — 버전 건너뜀 금지
- **Playwright 테스트**: 브라우저에서 직접 열기(`file://`)로 실행, 서버 불필요
