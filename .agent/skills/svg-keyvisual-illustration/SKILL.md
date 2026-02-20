---
name: svg-keyvisual-illustration
description: Web-native key visual (원화) and concept art illustration using SVG + CSS. Use for game splash screens, atmospheric environment art, hero key visuals, and promotional illustrations — no external tools required.
---

# SVG Key Visual Illustration (원화)

Use this skill to produce high-quality game concept art and key visuals directly in SVG/HTML, without requiring AI generation tools.

## When to Use
- Game splash screens and title screens
- Concept art for design direction confirmation
- Background illustrations (hangar, control room, launch pad, space)
- Promotional hero key visuals
- Mockup companion art (concept to complement UI mockups)

## Output Types

### 1. Atmospheric Scene Illustration (씬 원화)
Full widescreen (1920×1080) environmental scenes with:
- Layered depth: far background / midground / foreground elements
- Character silhouettes (engineers, technicians) — not facial detail, just shape and posture
- Environmental storytelling (pipes, cables, control panels, scaffolding)
- Practical lighting sources (monitor glow, heat vents, floodlights)

### 2. Technical Key Visual (기술 키비주얼)
Hybrid art combining technical drawing elements with illustrative rendering:
- Blueprint-to-reality transitions
- Schematic overlays on photorealistic elements
- Annotated hero renders with callout details
- Cross-section "reveal" compositions

### 3. Character/Role Silhouettes (캐릭터 실루엣)
Engineering staff as silhouette forms only:
- 5–7 distinct postures per scene (standing at console, leaning over desk, pointing at screen)
- No face detail — purely shape-based for broad appeal
- Color variation by role (engineer = dark navy, lead = white hardhat silhouette)

## SVG Illustration Techniques

### Atmosphere & Lighting
```css
/* Screen glow effect */
filter: drop-shadow(0 0 8px #00e676) drop-shadow(0 0 20px #00e67640);

/* Volumetric fog layer */
background: radial-gradient(ellipse at 50% 80%, rgba(0,180,100,0.08) 0%, transparent 60%);

/* God rays (light shafts) */
background: repeating-linear-gradient(
  -45deg,
  transparent 0px, transparent 40px,
  rgba(255,200,100,0.03) 40px, rgba(255,200,100,0.03) 80px
);
```

### Depth Layers (3-layer system)
1. **BG Layer** (`z-index: 1`): Sky/ceiling, far structural elements, gradient atmosphere
2. **MID Layer** (`z-index: 2`): Primary environment (consoles, machinery, scaffolding)
3. **FG Layer** (`z-index: 3`): Character silhouettes, foreground details, UI overlay elements

### SVG Component Library
Use `<defs>` + `<use>` for repeatable elements:
- Monitor banks (CRT screens in arrays)
- Pipe/conduit runs
- Grating/grid floor panels
- Cable bundles
- Warning light clusters

### CSS Animation for Concept Art
- **Scanline sweep**: `@keyframes scan { 0% { top: -100% } 100% { top: 100% } }` — 8s loop
- **Monitor flicker**: `@keyframes flicker { 0%,100%{opacity:1} 95%{opacity:0.95} 97%{opacity:0.85} }` — 6s loop
- **Exhaust shimmer**: `@keyframes heat { 0%,100%{filter:blur(2px)} 50%{filter:blur(4px)} }` — 2s loop
- **Status light pulse**: `@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }` — 1.5s loop

## Composition Rules (원화 구도 원칙)

1. **Rule of thirds**: Key subject (rocket, main console) on vertical 1/3 lines
2. **Leading lines**: Use pipes, walkways, cable runs to direct eye to focal point
3. **Silhouette contrast**: Engineers always darker than background to read clearly
4. **Light hierarchy**: 1 primary light source (monitor glow / flood) + 1 ambient + 1 accent
5. **Depth of field**: FG slightly desaturated/blurred, MID sharp, BG faded
6. **Frame within frame**: Use archways, console banks, or windows as natural framing devices

## Style Consistency with MoonIdle

### v7 Mission Control style
- Color: `#010800` bg, `#00e676` primary, `#ffab00` amber accent
- Light: distributed CRT monitor glow, warm amber overhead
- Mood: tension-filled pre-launch, focused engineers
- Font elements: Share Tech Mono labels on screens

### v10 Blueprint style
- Color: `#071428` bg, `#4db8ff` lines, `#cce8ff` annotation text
- Light: cool drafting-table illumination, blueprint paper texture
- Mood: methodical, analytical, precision engineering
- Font elements: Courier Prime engineering notation

## Asset Naming Convention
```
concept_<theme>_<scene>_<variant>_<width>x<height>.html
concept_v7mc_controlroom_hero_1920x1080.html
concept_v10bp_blueprintreveal_hero_1920x1080.html
```

## Production Checklist
- [ ] Viewport: `1920×1080` viewBox (or `16:9` aspect ratio)
- [ ] Layer structure: BG / MID / FG in separate SVG groups
- [ ] Min 2 animated elements (glow pulse, scan line, or exhaust shimmer)
- [ ] Silhouettes: 3–5 engineer figures minimum for scale reference
- [ ] Text elements: max 3 labels (title, subtitle, version indicator)
- [ ] File size: aim for <150KB uncompressed HTML
- [ ] Works without internet connection (no external font required for concept art)
