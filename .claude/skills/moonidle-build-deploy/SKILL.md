---
name: MOONIDLE-build-deploy
description: |
  Full pipeline for Unity Windows build → SteamCMD upload → branch live configuration.
  Triggers: "build", "Steam upload", "dev_test deploy", "release build"
  Excludes: game logic, UI, asset creation
---

# MOONIDLE Build & Deploy

## Purpose
Generate Unity Windows builds and upload via SteamCMD. Three paths: dev/QA/release.

## Prerequisites (Gate 0 — do NOT proceed if unmet)
```
1. Lead PD build approval confirmed (required during prototype phase)
2. QA pass status confirmed — Notion task card "QA Status" = "Pass"
3. Currently on sprint branch (building from dev/* is forbidden)
→ If any unmet → report to DevPD, do not proceed
```

## Build Procedure

### Step 1: Unity Preparation
```
1. manage_scene(action="save") — save scene
2. refresh_unity — recompile
3. read_console — verify 0 compile errors
→ Gate 1: 0 errors required. If errors → request fix from Programmer.
```

### Step 2: Windows Build (max 2 retries on failure)
```
4. execute_menu_item → Tools/Build Windows
5. sleep 20 (wait for build)
6. Verify: SteamBuild/content/MOONIDLE.exe exists
7. On failure:
   a. read_console — check errors
   b. Forward errors to Programmer for fix
   c. After fix → restart from Step 1
   d. 2 failures → escalate to DevPD
```
→ Gate 2: MOONIDLE.exe must exist before Step 2.5.

### Step 2.5: Local Copy Test (required before Steam CDN)
```
1. Copy build output to Steam install folder:
   source .env
   cp -r "SteamBuild/content/"* "$STEAM_INSTALL_PATH/"
2. Launch game, verify core functionality (UI display, game loop)
3. Check Player.log: AppData/LocalLow/SBGames/MOONIDLE/Player.log
→ Gate 2.5: Local test pass required. Fail → fix and rebuild.
```

### Step 3: Steam Upload (auto VDF selection)

Build type auto-detection when not specified:
```
IF DevPD mentions "release build" or "default branch" → release
ELIF DevPD mentions "QA build" or "live_test" → QA
ELIF after integration QA pass → QA
ELSE → dev build (default)
```

| Build Type | VDF File | Auto-Live Branch |
|-----------|----------|-----------------|
| Dev | app_build_dev.vdf | dev_test |
| QA | app_build_qa.vdf | live_test |
| Release | app_build.vdf | (manual setup required) |

```bash
source .env
"$STEAMCMD_PATH" +login "$STEAM_ACCOUNT" +run_app_build "../scripts/<VDF_FILE>" +quit
```

### Step 4: Upload Failure Handling (max 2 retries)
```
1. Check error message (auth expired, network, VDF path error)
2. Auth issue → re-login SteamCMD, retry
3. VDF/path issue → verify paths in references/steam-config.md
4. 2 failures → escalate to DevPD
```

### Step 5: Release Build — Set Default Branch Live
Use the SetAppBuildLive API endpoint from references/steam-config.md with the buildid from SteamCMD output.
On failure → verify buildid is correct.

### Step 6: Notifications

**Telegram**: `python Tools/notify.py build "<build type> build <success/fail>"`

**Notion Task Card Update**:
- DB ID: from `.env` `$NOTION_DB_ID`
- Set `QA Status` → "Build Complete" or "Build Failed"
- Set `Related Commit` → target commit hash

