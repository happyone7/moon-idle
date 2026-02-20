# Git Collaboration Rules

## Core Principles

- Commit immediately after completing work (prevent cross-agent conflicts)
- index.html 동시 편집 금지 — 단일 파일 구조, 한 명씩 순차 편집
- One logical change = one commit
- Commit messages in Korean

For commit conventions, Git Authors, and branch policies → see **CLAUDE.md "Git Policy"** section.

## 워크트리 규칙 (필수)

MoonIdle은 팀장별 전용 워크트리를 운영한다. **작업 시작 전 반드시 본인 워크트리에 있는지 확인.**

| 팀장 | 워크트리 경로 | 브랜치 |
|------|-------------|--------|
| 프로그래밍팀장 | `.worktrees/wt-dev-programmer` | `dev/programmer` |
| UI팀장 | `.worktrees/wt-dev-ui` | `dev/ui` |
| QA팀장 | `.worktrees/wt-dev-qa` | `dev/qa` |
| 사운드 디렉터 | `.worktrees/wt-dev-sound` | `dev/sound` |
| 빌더 | `.worktrees/wt-dev-build` | `dev/build` |
| TA | `.worktrees/wt-dev-design` | `dev/design` |

### 워크트리 작업 원칙

- **단독 작업**: 자기 워크트리(`wt-dev-*`)에서 `dev/*` 브랜치로 직접 편집+커밋. 브랜치 전환 불필요.
- **크로스팀 기능**: 자기 워크트리에서 `git checkout feature/*`로 전환 후 작업 → 끝나면 `git checkout dev/*`로 복귀.
- **메인 디렉토리 금지**: 메인 디렉토리(`primordial-station/`)는 sprint/N 브랜치로 체크아웃된 통합 작업 공간. 팀장이 직접 작업하면 충돌 위험.
- **스프린트 시작 시**: 새 sprint/N이 생성되면 각 팀장은 자기 dev/* 브랜치를 sprint/N 기준으로 rebase 후 작업 시작.

### 워크트리 상태 확인

```bash
git worktree list
```

현재 워크트리 목록과 각 브랜치 확인. 내 워크트리가 올바른 `dev/*` 브랜치를 가리키는지 검증.

## Pre-Work Checklist

```
□ git worktree list — 내 워크트리(wt-dev-{role})에서 작업 중인지 확인
□ 내 dev/* 브랜치가 최신 sprint/N 기준으로 업데이트되어 있는지 확인
□ git status — uncommitted changes 없는지 확인
□ 수정할 파일 목록 확인 (index.html 편집 시 다른 팀과 순서 조율)
□ Sprint Progress 문서에서 다른 팀장이 동일 파일 편집 중인지 확인
□ index.html 편집이 필요하면 개발PD에게 보고 후 순서 조율
```

## Post-Work Checklist

```
□ 즉시 커밋 (다른 팀 작업과 섞이지 않도록)
□ 커밋 메시지에 수정한 파일 명시
□ PM 에이전트 호출하여 Progress 문서 갱신
□ (QA 필요 시) QA팀장에게 리뷰 요청
```

## File Ownership

See CLAUDE.md "Scene/Prefab Policy" for ownership matrix.

## Scene Conflict Prevention

### Strategy A: Maximize Prefabs (current recommendation)
- Scene contains only empty root objects and managers
- All content managed via prefabs
- When scene edit required → assign one owner, work sequentially

### Strategy B: Additive Scene Split (future expansion)
```
GameScene.unity → split into:
  ├── GameScene_Environment.unity  (TA)
  ├── GameScene_Logic.unity        (Programmer)
  ├── GameScene_UI.unity           (UI)
  └── GameScene_Audio.unity        (Sound)
```
