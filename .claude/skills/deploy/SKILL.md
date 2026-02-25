---
name: deploy
description: |
  Web project deploy: /deploy beta (surge.sh) or /deploy live (GitHub Pages).
argument-hint: "beta|live"
---

# Web Deploy

## Purpose
Deploy web projects to beta (surge.sh) or live (GitHub Pages). Project-specific settings are stored in `references/deploy-config.md`.

## Usage
```
/deploy beta    — surge.sh 베타 배포
/deploy live    — GitHub Pages 라이브 배포
```

## Procedure

### Gate 0: Load Config
1. Read `references/deploy-config.md` to get project settings
2. Verify required fields exist: `project.name`, `project.source_dir`, target-specific settings

### Gate 1: Pre-deploy Checks
```
1. git status — check for uncommitted changes
   → If uncommitted changes exist → WARN user, ask to commit first
2. git log --oneline -1 — confirm latest commit
3. Verify source_dir exists and contains index.html (or configured entry file)
```

### Step 1: Deploy Beta (argument = "beta")
```bash
# Read domain from deploy-config.md [beta] section
npx surge --project {source_dir} --domain {beta.domain}
```
- On success → report URL to user
- On failure → check surge login status (`npx surge whoami`), retry once

### Step 2: Deploy Live (argument = "live")
```bash
# Read branch and remote from deploy-config.md [live] section
git push {live.remote} {live.branch}
```
- GitHub Pages auto-builds from the configured branch
- On success → report URL to user
- On failure → check remote access, branch status

### Step 3: Post-deploy Verification
```
1. Report deployed URL
2. Note: surge.sh deploys are instant; GitHub Pages may take 1-2 minutes
```

## Failure Handling

| Failure | Diagnosis | Action |
|---------|-----------|--------|
| surge not logged in | `npx surge whoami` fails | Run `npx surge login` |
| surge upload timeout | Network issue | Retry once |
| git push rejected | Remote ahead | Pull first, resolve conflicts |
| GH Pages 404 | Branch mismatch or Pages not enabled | Check repo Settings > Pages |

## Config Reference
All project-specific values (domains, branches, URLs) are in `references/deploy-config.md`. To use this skill in a different project, copy the skill directory and edit only the config file.
