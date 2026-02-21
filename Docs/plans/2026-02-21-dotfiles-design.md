# Claude Code Dotfiles 설계

**날짜**: 2026-02-21
**작성자**: 개발PD
**상태**: 승인됨

---

## 목표

새 환경에서 Claude Code 설정(스킬, 권한)을 즉시 복원할 수 있는 dotfiles 레포 구성.
다른 사람에게도 동일한 환경을 제공할 수 있도록 공유 가능하게 만든다.

---

## 결정 사항

- **적용 범위**: 글로벌 (`~/.claude/`) — 모든 프로젝트에 즉시 적용
- **설치 방식**: `git clone` + `install.ps1`/`install.sh` (2줄로 완료)
- **갱신 방식**: `git pull` + `install.ps1` (2줄로 완료)
- **git 중첩 없음**: 레포를 `~/dotfiles`에 클론, 설치 스크립트가 `~/.claude/`에 복사

---

## 레포 구조

```
~/dotfiles/
├── install.ps1          # Windows 설치 스크립트
├── install.sh           # Mac/Linux 설치 스크립트
├── settings.json        # ~/.claude/settings.json 으로 복사
├── skills/
│   ├── brainstorming/
│   ├── systematic-debugging/
│   ├── frontend-design/
│   ├── manage-skills/
│   ├── verify-implementation/
│   ├── tesseract-qa-ops/        # moonidle-qa-ops 리네임
│   ├── tesseract-build-deploy/  # moonidle-build-deploy 리네임
│   └── tesseract-dev-protocol/  # moonidle-dev-protocol 리네임
└── README.md
```

---

## 설치 스크립트 동작

1. `~/.claude/skills/`가 없으면 생성
2. `skills/*` → `~/.claude/skills/` 에 복사 (기존 파일 덮어쓰기)
3. `settings.json` → `~/.claude/settings.json` 에 복사 (기존 파일 백업 후 덮어쓰기)
4. MCP 서버 패키지 설치 (playwright 등 `npm`/`npx` 기반)
5. 완료 메시지 출력

---

## MCP 서버

설치 스크립트에서 자동 설치 + `docs/mcp-setup.md`에 상세 가이드:
- `playwright` — 브라우저 자동화 / E2E 테스트
- 추가 MCP는 README 안내에 따라 수동 등록 (API 키 등 민감 정보 포함 항목)

---

## 포함하지 않는 것

- **에이전트** (`.claude/agents/`) — 프로젝트별로 다름, 이 레포에서 제외
- **`settings.local.json`** — API 키, 로컬 경로 포함, `.gitignore`에 명시
- **`moonidle-*` 전용 스킬** (verify-moonidle-core 등) — primordial-station 레포에 유지

---

## 사용 흐름

```bash
# 새 환경 초기 설정 (1회)
git clone https://github.com/happyone7/dotfiles ~/dotfiles
~/dotfiles/install.ps1        # Windows
# ~/dotfiles/install.sh       # Mac/Linux

# 설정 업데이트
cd ~/dotfiles && git pull && ./install.ps1
```
