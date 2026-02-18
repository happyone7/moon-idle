---
name: soulspire-agent-skill-standards
description: |
  Quality standards for creating/modifying agents and skills. No general knowledge; project-specific only.
  Triggers: agent creation, skill creation, agent modification, skill modification
  Excludes: gameplay code, UI, builds
---

# Agent/Skill Quality Standards

Follow these standards when creating or modifying agents (`.claude/agents/`) or skills (`.claude/skills/`).

## Reference Files

- [Agent writing standards](references/agent-standards.md) — body structure, prohibitions, required sections
- [Skill writing standards](references/skill-standards.md) — frontmatter, body, references rules
- [Validation checklist](references/validation-checklist.md) — 6 auto-checks after creation/modification

## Core Principles

1. **No general knowledge**: Do not include content Claude already knows (generic C# patterns, NUnit, UI Toolkit, etc.)
2. **Project-specific only**: File paths, SO structures, team collaboration rules, MCP tool usage
3. **Skills = procedures, Agents = roles**: Skills define "how" (procedures/rules), agents define "who does what" (roles/context)
4. **Validate after changes**: Run all 6 items in references/validation-checklist.md
5. **Notion sync**: Update Notion "Agent-Skill Mapping" page when agents/skills change
