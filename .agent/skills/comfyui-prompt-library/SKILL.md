---
name: comfyui-prompt-library
description: Build and maintain a consistent prompt library for space-industrial concept art. Use for style cards, negative prompt sets, and shot taxonomies.
---

# ComfyUI Prompt Library

Use this skill to standardize creative prompts so generated assets stay visually coherent.

## Library Structure
- `prompt_set`: broad theme groups (Mission Control, Rocket Manufacturing, Surface Ops, Science Interface).
- `mood`: `technical`, `tension`, `launch`, `achievement`.
- `output_type`: `wide background`, `panel texture`, `UI button`, `hero render`, `thumbnail`.

## Standard Stack
- 1 style seed set (shared)
- 1 base camera style
- 1 lighting style
- 1 resolution + aspect plan
- 1 negative prompt set

## Prompt Block Example
Use this pattern as a base:
- subject block (what to generate)
- technical block (materials, geometry, interfaces, scale)
- style block (industrial, realistic, cinematic)
- atmosphere block (smoke, light, soundless tension, motion trails)
- quality block (`8k`, `sharp`, `clean composition`)
- restriction block (`no people`, `no text`, `no logos`)

## Consistency Rule
- Every generated family must reuse:
  - 60% shared tokens with previous generation
  - same art style tokens (`materials`, `lighting`, `grain`, `depth-of-field` strength)
  - same camera framing family (`wide`, `close`, `detail`) per asset type

## Library Ops
1. Add new prompt in family folder.
2. Generate 3 seeded variants.
3. Keep 1 winner and 2 backups.
4. Record:
   - seed
   - CFG
   - sampler
   - checkpoint name
   - success note

## Governance
- Delete only with rationale.
- Tag each prompt family with version and update date.
- Keep a "fallback safe" prompt for quick replacement when generation fails.

