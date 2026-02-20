# MoonIdle Steam Deployment Checklist

## Pre-Build
- [ ] All JS files lint-clean (no console.error on startup)
- [ ] index.html loads with no broken asset references
- [ ] Audio files present in audio/bgm/ (15 MP3s)
- [ ] QA smoke tests PASS
- [ ] Version bumped in electron/package.json

## Electron Build
- [ ] `npm install` in project root succeeds
- [ ] `npm run build:dir` creates dist/ without errors
- [ ] `dist/win-unpacked/MoonIdle.exe` launches and game plays
- [ ] Window title shows "MoonIdle"
- [ ] Audio plays (BGM starts after clicking New Game + enabling sound)
- [ ] localStorage save/load works (save, close, reopen)
- [ ] No DevTools in production build

## Steam Depot
- [ ] App ID: 4426340, Depot ID: 4426341
- [ ] steam_build.vdf references dist/win-unpacked/ as content root
- [ ] steamcmd.exe login with account shatterbone7
- [ ] Upload: `steamcmd +login shatterbone7 +run_app_build steam_build.vdf +quit`
- [ ] Verify build in Steamworks partner dashboard
- [ ] Set branch: default (not beta)

## Post-Upload Validation
- [ ] Install from Steam library on clean machine
- [ ] Launch via Steam (not direct EXE)
- [ ] Achievement / overlay SDK check (Steamworks.NET disabled — skip)
- [ ] Play 5 minutes, save, exit, relaunch → state restored

## Rollback Plan
- Keep previous depot build ID noted: ___________
- Rollback: Steamworks → Builds → Set previous build as default
