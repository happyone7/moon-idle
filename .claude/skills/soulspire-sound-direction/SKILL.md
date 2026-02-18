---
name: soulspire-sound-direction
description: |
  ComfyUI audio generation (ACE-Step BGM, Stable Audio SFX) and math synthesis for game sound.
  Triggers: "create BGM", "make SFX", "sound generation", "ComfyUI audio"
  Excludes: UI implementation, code logic, image assets
---

# Soulspire Sound Production

## Purpose
Create BGM and SFX using ComfyUI MCP tools and Python math synthesis, then apply to Unity.

## BGM Production

### Step 1: Concept Check (Gate: no generation without confirmed concept)
```
1. Check sound requirements for target scene/situation in GDD (Docs/Design/GDD.md)
2. Check tone/mood in Art Direction (Docs/Design/ArtDirection_v0.1.md)
3. Check for duplicates in Assets/Audio/ via manage_asset(action="search")
   -> Gate: requirements + tone confirmed + no duplicates -> proceed to Step 2
```

### Step 2: Generate BGM via ComfyUI
See references/audio-specs.md for ComfyUI workflow configuration.

```
1. list_models — check available audio models
2. build_workflow or create_workflow — configure ACE-Step workflow
   - ACE-Step: BGM only (requires CLIPLoader type='ace_step')
3. execute_workflow — run generation
4. get_last_output — check result
5. download_output — download file
```

### Step 3: Quality Check (retry loop, max 3 attempts)
```
1. File length: must be 30s~3min
2. File size: must be 3~8MB (OGG)
3. If below standard -> adjust prompt (duration, BPM, etc.) and re-run Step 2
4. After 3 failed attempts -> report to DevPD (possible model/config issue)
```
-> Gate: Step 3 quality check passed before proceeding to Step 4

### Step 4: Apply to Unity (Multi-MCP: ComfyUI -> MCP Unity)
```
1. download_output (ComfyUI MCP) — download generated file locally
2. Copy file to Assets/Audio/BGM/ or Assets/Audio/SFX/
3. refresh_unity (MCP Unity) — detect asset
4. manage_asset(action="search") (MCP Unity) — confirm imported asset
5. Adjust import settings per references/audio-specs.md "Unity Import Settings"
6. read_console (MCP Unity) — check import errors. Fix format/settings and re-import if errors
```

## SFX Production

### Method A: ComfyUI Stable Audio
```
1. build_workflow — Stable Audio workflow
   - Stable Audio: SFX only (requires CLIPLoader type='stable_audio')
2. Generate with short prompt (0.5~2 seconds)
```

### Method B: Math Synthesis (Python)
Simple UI/feedback sounds created directly via Python:
```python
# Direct WAV generation (numpy + scipy)
# Combine sine waves, noise, envelopes
# Save directly to Assets/Audio/SFX/
```

### SFX Quality Check (retry loop, max 3 attempts)
```
1. File length: gameplay SFX 0.2~2s, UI SFX 0.1~0.5s
2. File size: 10~500KB
3. If below standard -> adjust prompt/parameters and regenerate
4. After 3 failed attempts -> report to DevPD
```

### Method Selection (Context-Aware)
| Type | Primary Method | Fallback |
|------|---------------|----------|
| BGM (30s+) | ComfyUI ACE-Step | None — report to DevPD on failure |
| Gameplay SFX (explosions, hits) | ComfyUI Stable Audio | Math synthesis if ComfyUI unavailable |
| UI SFX (clicks, popups) | Math synthesis | — (always available) |

```
ComfyUI availability check:
1. Call get_system_resources
2. No response/timeout -> ComfyUI not running
3. SFX: fall back to math synthesis; BGM: report to DevPD
```

## Important Notes
- Use Sound Director author tag (see CLAUDE.md Git policy)
- Asset paths: BGM -> `Assets/Audio/BGM/`, SFX -> `Assets/Audio/SFX/`
- All quality specs and import settings: see references/audio-specs.md
