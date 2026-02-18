# Agent Writing Standards

## Frontmatter (requires Lead PD approval to change)

```yaml
---
name: "emoji agent-name"
description: |
  One-line role description. (~100 words max)
  Triggers: "keyword1", "keyword2"
  Excludes: areas not covered
skills:
  - soulspire-dev-protocol
  - soulspire-qa-ops
---
```

- name: Required. Agent identifier
- description: Required. 100 words max, include triggers/exclusions
- skills: Optional. Skills to preload into agent context at startup

## Body Required Sections

1. `# [Agent Name]`
2. `## Role` — one sentence
3. `## Project Context` — project-specific paths, SO types, architecture
4. `## [Domain-specific sections]` — agent-unique procedures
5. `## Self QA` — post-work verification steps (MCP tools)
6. `## Commit Rules` — author tag
7. `## Collaboration` — team interaction (only existing agents)

## Body Prohibitions

- Generic C# patterns, framework tutorials, design principles (Claude already knows)
- References to non-existent agents
- General expertise bullet lists (token waste)
- CI/CD pipeline examples not used in project

## Body Allowed Content

- Project file paths (`Assets/Scripts/Core/`, `Assets/Audio/BGM/`)
- SO structure/field tables (TowerData, NodeData)
- MCP tool usage (`manage_editor(action="play")`)
- Team collaboration rules (TA↔UI separation, SO edits by game-designer)
- Quality metrics (draw calls < 200, LUFS -14~-16)
- Preconditions/failure handling (Lead PD approval, compile error → stop)

## Size Guidelines

- frontmatter description: ~100 words
- body: **50~80 lines** recommended (>100 lines → split to skill references)
- code blocks: project-specific examples only (≤5 lines)
