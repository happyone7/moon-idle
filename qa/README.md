# QA Reports

Use one report file per dev branch.

Example:
- `qa/dev-programmer.txt`
- `qa/dev-ui.txt`

Required merge-gate marker:

```text
QA_RESULT=PASS
```

If marker is missing, merge is blocked.
