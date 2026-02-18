---
name: web-agent-worktree-qa-flow
description: Multi-agent Git worktree and QA merge-gate workflow for web projects. Use to set up dev/* worktrees, run QA pass gates, and merge dev branches into sprint branches safely.
---

# Web Agent Worktree QA Flow

Use this skill when multiple agents work in parallel and only QA-passed branches should merge into `sprint/*`.

## Scope

- Web project Git workflow (non-Unity).
- Agent branch/worktree isolation.
- QA report gate before merge.

## Setup

1. Create/update sprint and dev branches with dedicated worktrees.
2. Assign one agent per `dev/<agent>` branch.
3. Keep commits atomic and frequent.

Use:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-workflow/setup-agent-worktrees.ps1 -SprintBranch sprint/1
```

## QA Gate Merge

Only merge to sprint after QA report has PASS marker.

Use:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-workflow/qa-merge-gate.ps1 -SprintBranch sprint/1 -DevBranch dev/programmer -QaReportPath qa/dev-programmer.txt
```

## QA Report Format

Minimum required line in QA report:

```text
QA_RESULT=PASS
```

If missing, merge is blocked.

## References

- Process notes: `references/worktree-qa-merge-flow.md`
