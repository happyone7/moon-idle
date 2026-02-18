# Project AGENTS Instructions

## Skills
A skill is a set of local instructions stored in a `SKILL.md` file.

### Available skills
- game-design-compass: Unified game design planning workflow across role/genre/platform with measurable outputs. (file: .agent/skills/game-design-compass/SKILL.md)
- game-development: Game development orchestrator for platform/specialty routing and core engineering principles. (file: .agent/skills/game-development/SKILL.md)
- game-developer: Implementation-focused game engineering skill (systems, performance, architecture). (file: .agent/skills/game-developer/SKILL.md)
- idle-game-engine: Idle-game engine patterns (resource loop, buildings, offline progress, save/load). (file: .agent/skills/idle-game-engine/SKILL.md)
- space-theme-ui: Space-themed UI/CSS visual pattern guide. (file: .agent/skills/space-theme-ui/SKILL.md)
- soulspire-agent-skill-standards: Quality standards for creating/modifying agents and skills. (file: .claude/skills/soulspire-agent-skill-standards/SKILL.md)
- soulspire-build-deploy: Build/deploy workflow for Unity + SteamCMD pipelines. (file: .claude/skills/soulspire-build-deploy/SKILL.md)
- soulspire-dev-protocol: Team development protocol (git rules, prefab/scene ownership). (file: .claude/skills/soulspire-dev-protocol/SKILL.md)
- soulspire-pm-sync: Sprint/progress synchronization workflow. (file: .claude/skills/soulspire-pm-sync/SKILL.md)
- soulspire-qa-ops: QA gate/checklist operations for integration readiness. (file: .claude/skills/soulspire-qa-ops/SKILL.md)
- soulspire-sound-direction: Audio direction/production workflow. (file: .claude/skills/soulspire-sound-direction/SKILL.md)

## How to use skills
- Trigger rules: If the user names a skill (`$SkillName` or plain text), use that skill for that turn.
- Scope control: Use the minimal set of skills needed for the request; do not load everything by default.
- Progressive loading:
1. Open the chosen skill `SKILL.md`.
2. If it references relative paths, resolve relative to the skill directory first.
3. Load only the specific reference files needed to complete the task.
- Fallback: If a skill cannot be applied cleanly (missing files or mismatch with project stack), state why and continue with a practical fallback.

## Project fit note
- This repository is a web idle game (`index.html`), so Unity-specific skills are available for reference/protocol reuse but are not mandatory for core gameplay implementation.
