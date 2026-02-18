# Worktree QA Merge Flow (Web)

## Branch Model

- `main`: release-stable.
- `sprint/N`: integration branch for current sprint.
- `dev/<agent>`: per-agent execution branch.

## Recommended Agent Set

- `dev/programmer`
- `dev/ui`
- `dev/qa`
- `dev/design`
- `dev/sound`
- `dev/build`

## Worktree Layout (example)

- `../wt-dev-programmer`
- `../wt-dev-ui`
- `../wt-dev-qa`
- `../wt-dev-design`
- `../wt-dev-sound`
- `../wt-dev-build`

## Merge Gate Rule

1. QA runs branch checks and writes report file.
2. Report must include `QA_RESULT=PASS`.
3. Merge command runs only after gate check passes.
4. Merge commit message should identify source branch and QA gate result.

## Failure Policy

- If QA fails, block merge and return fixes to source branch.
- Re-run QA and regenerate report before retry.
