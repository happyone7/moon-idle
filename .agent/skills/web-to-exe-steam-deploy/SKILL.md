---
name: web-to-exe-steam-deploy
description: Package web games as Windows EXE and deploy to Steam. Use for Electron packaging, artifact validation, SteamPipe upload, and release branch rollout.
---

# Web To EXE Steam Deploy

Use this skill when shipping a browser game to Steam as a desktop executable.

## Recommended Stack

1. Wrap web app with Electron.
2. Build distributables using `electron-builder` (or equivalent).
3. Upload via SteamPipe (SteamCMD + VDF scripts).

## Workflow

1. Packaging
- Define Electron main process and app window startup.
- Point to local build artifacts (not dev server) for production.
2. Build
- Produce Windows executable artifacts.
- Verify launch, save path, and crash-free startup.
3. Steam Upload
- Prepare app/depot VDF and content folder.
- Run SteamCMD build upload.
4. Post-upload verification
- Confirm build id and launch option mapping.
- Install from Steam test branch and smoke test.

## References

- Electron distribution guide: https://www.electronjs.org/docs/latest/tutorial/application-distribution
- electron-builder docs: https://www.electron.build/
- SteamPipe upload docs: https://partner.steamgames.com/doc/sdk/uploading
