# Git Collaboration Rules

## Core Principles

- Commit immediately after completing work (prevent cross-agent conflicts)
- No concurrent scene/prefab edits (one person at a time)
- One logical change = one commit
- Commit messages in Korean

For commit conventions, Git Authors, and branch policies → see **CLAUDE.md "Git Policy"** section.

## Pre-Work Checklist

```
□ git status — check for uncommitted changes
□ git pull --rebase — sync to latest
□ List files to modify (especially .unity, .prefab)
□ Check Sprint Progress doc for other agents editing same files
□ If scene edit needed → report to DevPD first
```

## Post-Work Checklist

```
□ No stray objects left in scene
□ New objects are prefab-ized
□ Commit immediately (don't mix with other agent's work)
□ Commit message lists modified scene/prefab files
□ Call PM agent to update Progress doc
```

## File Ownership

See CLAUDE.md "Scene/Prefab Policy" for ownership matrix.

## Scene Conflict Prevention

### Strategy A: Maximize Prefabs (current recommendation)
- Scene contains only empty root objects and managers
- All content managed via prefabs
- When scene edit required → assign one owner, work sequentially

### Strategy B: Additive Scene Split (future expansion)
```
GameScene.unity → split into:
  ├── GameScene_Environment.unity  (TA)
  ├── GameScene_Logic.unity        (Programmer)
  ├── GameScene_UI.unity           (UI)
  └── GameScene_Audio.unity        (Sound)
```
