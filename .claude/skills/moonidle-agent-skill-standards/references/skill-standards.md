# Skill Writing Standards

## 3-Level Information Architecture (Progressive Disclosure)

```
frontmatter (~100 words)  →  summary loaded when agent discovers skill
body (<500 lines)          →  procedures loaded when skill triggers
references/ (unlimited)    →  detailed data referenced from body
```

## Frontmatter

```yaml
---
name: MOONIDLE-[feature-name]
description: |
  One-line description. (~100 words max)
  Triggers: keyword1, keyword2
  Excludes: areas not covered
---
```

- name: `MOONIDLE-` prefix required
- description: ≤100 words, include triggers/exclusions

## Body

- ≤500 lines. Use numbered steps for sequential procedures.
- Reference files via markdown links: `[filename](references/filename.md)`
- Core rules/procedures only. Move detailed data to references/.

## References

- Checklists, config values, format templates, detailed procedures
- One topic per file. Unreferenced files are flagged as unused.
- For files >100 lines, include a table of contents at top.

## Skill vs Agent Responsibility

See CLAUDE.md section "Team Structure and Roles" for the full distinction. In short: skills define **procedures** ("how"), agents define **roles** ("who does what").

