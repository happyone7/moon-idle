---
name: web-steam-build-deploy
description: |
  Electron EXE wrapping + SteamCMD upload pipeline for web games.
  Usage: /web-steam-build-deploy dev | /web-steam-build-deploy release
argument-hint: "dev|qa|release"
---

# Web → Steam Build & Deploy

## Purpose
Package a web game into an Electron EXE and upload to Steam via SteamCMD. Project-specific settings are stored in `references/steam-config.md`.

## Usage
```
/web-steam-build-deploy dev       — dev_test 브랜치 업로드 (내부 테스트)
/web-steam-build-deploy qa        — live_test 브랜치 업로드 (QA 검증)
/web-steam-build-deploy release   — 릴리스 업로드 (수동 라이브 전환)
```

## Procedure

### Gate 0: Load Config
1. Read `references/steam-config.md` to get Steam App/Depot IDs, paths, VDF files
2. Verify `.env` exists with required secrets (`STEAMCMD_PATH`, `STEAM_ACCOUNT`, `STEAM_API_KEY`)

### Gate 1: Pre-build Checks
```
1. LeadPD build approval confirmed (prototype phase — required)
2. QA pass status confirmed (release/qa builds)
3. git status — no uncommitted changes
4. Current branch is intended build target
```

### Step 1: Electron Build
```bash
# From project root
cd electron/
npm install
npm run build    # or: npx electron-builder --win
```
1. Verify EXE exists at configured output path
2. On failure → check `electron/package.json` scripts, Node version

### Step 2: Local Test (required before Steam upload)
```
1. Launch built EXE, verify core functionality (UI display, game loop)
2. Check console/logs for errors
→ Gate: Local test pass required. Fail → fix and rebuild.
```

### Step 3: SteamCMD Upload
Build type → VDF selection (from `references/steam-config.md`):

| Build Type | VDF File | Auto-Live Branch |
|-----------|----------|-----------------|
| dev | app_build_dev.vdf | dev_test |
| qa | app_build_qa.vdf | live_test |
| release | app_build.vdf | (manual) |

```bash
source .env
"$STEAMCMD_PATH" +login "$STEAM_ACCOUNT" +run_app_build "../scripts/{VDF_FILE}" +quit
```

### Step 4: Release — Set Default Branch Live (release only)
```bash
source .env
curl -X POST "https://partner.steam-api.com/ISteamApps/SetAppBuildLive/v2/" \
  -d "key=$STEAM_API_KEY&appid=$STEAM_APP_ID&buildid={BUILDID}&betakey=default"
```

### Step 5: Post-upload Verification
```
1. Report upload result (buildid, branch)
2. For release builds: remind to verify on Steamworks partner dashboard
```

## Failure Handling

| Failure | Diagnosis | Action |
|---------|-----------|--------|
| Electron build fails | Check electron/package.json, Node version | Fix deps, retry |
| EXE not found | Build output path mismatch | Check steam-config.md paths |
| SteamCMD auth expired | Login session timeout | `+login` retry |
| SteamCMD upload fails | Network / VDF path error | Verify VDF paths, retry once |
| Missing Steam branch | dev_test/live_test not created | Ask LeadPD to create in Steamworks |

## Config Reference
All project-specific values (App ID, Depot ID, VDF paths, secrets) are in `references/steam-config.md`. Secrets are loaded from `.env` (not committed).
