---
name: soulspire-qa-ops
description: |
  Editor play-mode QA, screenshot visual verification, console error checks, dev-to-sprint merge gate.
  Triggers: "run QA", "verify", "merge check", "integration QA"
  Excludes: code modification, UI implementation, builds, asset creation
---

# Soulspire QA Operations

## Purpose
Verify game behavior in editor play-mode. Only work that passes QA gets merged to sprint branch.

## QA Types

### Unit QA (dev/* branch verification)

Prerequisites (do not start QA if unmet):
```
1. Confirm team lead has committed all work
2. Confirm Notion task card has "self-QA scope" documented
   -> If unmet, request completion from team lead and wait
```

Procedure:
```
1. Checkout target dev/* branch
2. refresh_unity — recompile
3. read_console — check compile errors
   -> Gate: 0 compile errors required. If errors, request fix from team lead immediately.
4. manage_editor(action="enter_play_mode") — start play
5. Verify items from references/checklist.md
6. manage_editor(action="take_screenshot") — capture evidence
7. manage_editor(action="exit_play_mode") — stop play
8. read_console — check runtime errors/warnings
```

On pass:
```bash
git checkout sprint{N}
git merge --no-ff dev/{team} -m "merge: {team} work merged (QA passed)"
```

On fail (re-verify loop, max 2 attempts):
```
1. Send fail details + evidence (console errors, screenshots) to team lead
2. After fix -> re-verify only failed items (not full re-run)
3. After 2 failed re-verifications -> escalate to DevPD (blocker report)
```

### Unit QA — Conditional Visual Verification

Determine whether visual verification is needed:
```
1. Check if work matches references/visual-verification-tasks.md
2. Match -> Run visual check in play-mode (include screenshots)
3. No match -> Skip visual check (static verification only)
```

### Integration QA (pre-build)

Prerequisites:
```
1. All unit QAs passed (verify all Notion cards show "passed")
2. All dev/* -> sprint merges completed
3. 0 compile errors on sprint branch
   -> If unmet, do not start integration QA; resolve remaining work first
```

```
1. Full flow test on sprint branch
2. Verify all items in references/checklist.md
3. Capture screenshots (Assets/Screenshots/)
4. All pass -> report results -> LeadPD approval -> build command to builder
5. If any failures:
   a. Identify which dev/* merge caused the issue
   b. Request fix from responsible team lead (fix in dev/*, re-merge)
   c. Re-verify only failed items
   d. After 2 failed re-verifications -> escalate to DevPD
```

### BAT (Build Acceptance Test)

Required before every build. Run after integration QA passes, before commanding builder:
```
1. Execute all items in references/bat.md
2. Verify basic loop in play-mode (Title -> Hub -> InGame -> RunEnd -> Hub)
3. Confirm 0 console Errors
4. All pass -> proceed to build / Any fail -> block build, fix and re-verify
```

## Merge Authority
- **Only QA lead can merge to sprint branch** (other team leads cannot merge directly)
- See DevPD_Guidelines.md section 5

## QA Result Integration

### Notion Task Card Update
After QA, update the task card status:
- DB ID: see `.env` `$NOTION_DB_ID`
- `QA Status` -> "Passed" or "Failed"
- `QA Result` -> Specific details (passed items, failed items, screenshot paths)
- `Related Commit` -> Verified commit hash

## Important Notes
- QA lead must not modify code — report bugs to responsible team lead
- Use QA author tag (see CLAUDE.md Git policy)
- Save screenshots to `Assets/Screenshots/`
- Report format: `## QA Result: [Pass/Fail]` with target branch, checklist N/N, visual/BAT status, failed items with symptoms, console errors, merge eligibility
