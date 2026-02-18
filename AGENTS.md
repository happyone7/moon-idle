# Project AGENTS Instructions

## Skills
A skill is a set of local instructions stored in a `SKILL.md` file.

### Available skills
- game-design-compass: Unified game design planning workflow across role/genre/platform with measurable outputs. (file: .agent/skills/game-design-compass/SKILL.md)
- game-development: Game development orchestrator for platform/specialty routing and core engineering principles. (file: .agent/skills/game-development/SKILL.md)
- game-developer: Implementation-focused game engineering skill (systems, performance, architecture). (file: .agent/skills/game-developer/SKILL.md)
- idle-game-engine: Idle-game engine patterns (resource loop, buildings, offline progress, save/load). (file: .agent/skills/idle-game-engine/SKILL.md)
- space-theme-ui: Space-themed UI/CSS visual pattern guide. (file: .agent/skills/space-theme-ui/SKILL.md)
- web-games: Web game architecture guide (loop, input, render, responsive and browser constraints). (file: .agent/skills/web-games/SKILL.md)
- game-balance-economy: Idle/economy balancing skill with progression formulas and KPI checks. (file: .agent/skills/game-balance-economy/SKILL.md)
- frontend-test-automation: Playwright-based web game QA and regression automation workflow. (file: .agent/skills/frontend-test-automation/SKILL.md)
- performance-profiling-web: Browser performance profiling and optimization workflow for web games. (file: .agent/skills/performance-profiling-web/SKILL.md)
- save-migration-localstorage: localStorage schema versioning, migration, and rollback/recovery workflow. (file: .agent/skills/save-migration-localstorage/SKILL.md)
- pwa-offline-deploy: PWA installability/offline caching/deploy and cache invalidation workflow. (file: .agent/skills/pwa-offline-deploy/SKILL.md)
- web-accessibility-uiux: WCAG-oriented web game accessibility and UX quality checks. (file: .agent/skills/web-accessibility-uiux/SKILL.md)
- telemetry-analytics: Event/metric taxonomy, dashboards, and balancing analytics workflow. (file: .agent/skills/telemetry-analytics/SKILL.md)
- web-to-exe-steam-deploy: Package a web game to Windows EXE and upload builds to SteamPipe. (file: .agent/skills/web-to-exe-steam-deploy/SKILL.md)
- web-agent-worktree-qa-flow: Multi-agent git worktree setup and QA-pass merge gate workflow for web projects. (file: .agent/skills/web-agent-worktree-qa-flow/SKILL.md)
- industrial-space-ui-art: Industrial sci-fi game UI art direction for engineer-heavy space audiences. (file: .agent/skills/industrial-space-ui-art/SKILL.md)
- comfyui-art-batch: ComfyUI batch concept-art generation workflow (queue, seeds, curation). (file: .agent/skills/comfyui-art-batch/SKILL.md)
- comfyui-prompt-library: Prompt consistency and token governance for space-industrial concept art. (file: .agent/skills/comfyui-prompt-library/SKILL.md)
- moonidle-concept-art-direction: MoonIdle-specific visual direction for concept art and mockup asset packs. (file: .agent/skills/moonidle-concept-art-direction/SKILL.md)
- moonidle-agent-skill-standards: Quality standards for creating/modifying agents and skills. (file: .claude/skills/moonidle-agent-skill-standards/SKILL.md)
- moonidle-build-deploy: Build/deploy workflow for Unity + SteamCMD pipelines. (file: .claude/skills/moonidle-build-deploy/SKILL.md)
- moonidle-dev-protocol: Team development protocol (git rules, prefab/scene ownership). (file: .claude/skills/moonidle-dev-protocol/SKILL.md)
- moonidle-pm-sync: Sprint/progress synchronization workflow. (file: .claude/skills/moonidle-pm-sync/SKILL.md)
- moonidle-qa-ops: QA gate/checklist operations for integration readiness. (file: .claude/skills/moonidle-qa-ops/SKILL.md)
- moonidle-sound-direction: Audio direction/production workflow. (file: .claude/skills/moonidle-sound-direction/SKILL.md)

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

