# Steam Deployment Configuration

## App Info
- App ID: 4426340
- Depot ID: 4426341
- Steam Account: shatterbone7
- Partner ID: 377547
- Launch Option: MoonIdle.exe (Windows, Launch Default)

## Paths
- SteamCMD: see `.env` `$STEAMCMD_PATH`
- VDF Scripts: `SteamBuild/scripts/`
- Build Output: `SteamBuild/content/`
- Electron Source: `electron/`

## VDF Files

### app_build_dev.vdf — Development Build
- Purpose: Internal team verification
- Auto-live on `dev_test` branch after upload
- Requires `dev_test` branch pre-created in Steamworks

### app_build_qa.vdf — QA Build
- Purpose: QA verification
- Auto-live on `live_test` branch after upload
- Requires `live_test` branch pre-created in Steamworks

### app_build.vdf — Release Build
- Purpose: Public distribution
- Upload only; default branch must be set manually via API

## Publisher Web API
- Key: see `.env` `$STEAM_API_KEY`
- SetAppBuildLive endpoint:
  ```bash
  source .env
  curl -X POST "https://partner.steam-api.com/ISteamApps/SetAppBuildLive/v2/" \
    -d "key=$STEAM_API_KEY&appid=$STEAM_APP_ID&buildid=<BUILDID>&betakey=default"
  ```

## Steam Install Path
- see `.env` `$STEAM_INSTALL_PATH`
