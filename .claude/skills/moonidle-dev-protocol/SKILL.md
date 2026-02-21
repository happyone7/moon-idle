---
name: MOONIDLE-dev-protocol
description: |
  MOONIDLE development rules: Git collaboration, worktree isolation, index.html single-file coordination, file ownership.
  All agents must read before code/asset work.
  Triggers: commit, branch, worktree, index.html edit, folder structure, file ownership
  Excludes: game design, balancing, sound production
---

# MOONIDLE Development Protocol

Read the references below before starting any code/asset work.

## Reference Files

1. **references/git-rules.md** — Worktree rules, pre/post-work checklists, index.html conflict prevention
2. **references/prefab-protocol.md** — File ownership, naming, folder structure, edit procedures

## Key Rules

1. **워크트리 필수**: 각 팀장은 반드시 자신의 전용 워크트리(`primordial-station/.worktrees/wt-dev-{role}`)에서 작업한다. 메인 디렉토리(sprint/N 체크아웃 상태)에서 직접 작업 금지.
2. **즉시 커밋**: 작업 완료 즉시 커밋. 팀별 `--author` 태그 필수 (CLAUDE.md 참조). 미커밋 상태로 세션 종료 금지.
3. **index.html 순차 편집**: 단일 파일 구조이므로 동시 편집 불가. 프로그래밍팀장 작업 완료 후 UI팀장이 이어서 작업.
4. **파일 소유권 확인**: 편집 전 해당 파일의 담당 팀 확인. 다른 팀 폴더 무단 수정 금지.

