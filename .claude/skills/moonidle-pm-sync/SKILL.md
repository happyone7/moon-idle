---
name: MOONIDLE-pm-sync
description: |
  Sprint progress tracking, Sprint*_Progress.md updates, cross-team status reporting.
  Triggers: "update progress", "sprint status", "PM report"
  Excludes: code/UI/build/asset work
---

# MOONIDLE Sprint Sync

## Purpose
Keep sprint progress documents up-to-date and aggregate cross-team status reports.

## Progress Update Procedure

### Step 1: Gather Information
```
1. Run `git log --oneline -30` to check recent commits
2. Read current Sprint Progress document
3. (Team mode) Message each team lead for current status
```

### Step 2: Update Progress Document

See references/progress-format.md for format template.

Target file: `Docs/Sprint{N}_Progress.md` (current active sprint)

Update items:
- Per-team completed/in-progress/waiting status
- Commit hash links
- Blockers and dependencies
- Last updated timestamp

### Step 3: Status Report

Report format:
```
## Sprint Status Summary
- Completed: N / In Progress: N / Waiting: N
- Key progress: [one-line summary]
- Blockers: [describe if any, otherwise "None"]
- Next up: [1-2 highest priority tasks]
```

## Important Notes
- PM must never do code/UI/build/asset work
- Use PM author tag (see CLAUDE.md Git policy)
- Report bottlenecks to DevPD immediately

