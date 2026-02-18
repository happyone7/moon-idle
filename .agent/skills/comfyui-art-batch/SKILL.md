---
name: comfyui-art-batch
description: Batch concept-art generation workflow for ComfyUI. Use for prompt sets, queue batching, seed control, and iteration logs.
---

# ComfyUI Art Batch

Use this skill when you need multiple high-quality concept art variants quickly.

## Core Output
- A set of prompts and negative prompts for the target art type.
- Reproducible queue plan (`batch`, `seed`, `steps`, `sampler`, `cfg`).
- Asset naming convention and export map (`images`, `meta`, `prompt` linkage).

## Workflow

1. Define the concept scope
   - Scene type: `hub`, `rocket`, `moon surface`, `UI shell`, `control room`, `cinematic`.
   - Atmosphere tags: `engineering`, `gritty`, `industrial`, `space program`.
   - Resolution target: start `1024x1024` for concept, then upscale to production target.

2. Build a prompt package
   - Base positive prompt for visual core.
   - Negative prompt for consistency:
     - `watermark, logo, text, deformed hands, blurry, oversaturated, fantasy, cute, anime`.
   - Keep 6–12 prompts per scene type.

3. Queue execution
   - Use fixed `seed` bands per concept family for style lock.
   - Vary only seed/CFG between variants to compare composition.
   - Save every sample with filename pattern:
     - `moonidle_<category>_<scene>_v<ver>_seed<seed>_<idx>.png`

4. Curation pass
   - Score each result 1-5 by:
     - technical clarity
     - composition readability
     - color hierarchy
     - UI/prop legibility
     - style consistency with `MoonIdle`.
   - Keep the top 3 with notes for why they pass.

## Execution Notes
- Prefer deterministic seeds during concept freeze.
- Record API/queue changes when you switch base model or samplers.
- When unsure of composition, generate 1x4 or 2x2 layout variants first.

## Reusable Prompt Template
```
<subject>, engineering-grade space station / launch pad interior, cinematic composition,
industrial textures, realistic lighting, engineering interfaces, no fantasy characters,
high detail, volumetric light, no watermark, no text
```

