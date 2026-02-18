# Audio Specs & Quality Standards

## Format
- Sample rate: 44100Hz / 16bit
- BGM format: OGG Vorbis (quality 6~8)
- SFX format: WAV uncompressed (short clips compressed in Unity)

## Duration
- BGM: 30s~3min (looped)
- Gameplay SFX: 0.2~2s
- UI SFX: 0.1~0.5s

## File Size
- BGM per track: 3~8MB (OGG)
- SFX per clip: 10~500KB

## Volume Standards
- Master output: -14 ~ -16 LUFS
- Within same category: ±3dB
- BGM + SFX simultaneous playback must have no masking

## Unity Import Settings
- BGM: Load In Background + Streaming
- SFX (short): Decompress On Load
- SFX (long): Compressed In Memory

## Performance Limits
- Simultaneous AudioSources: 32 or less
- Total sound memory: 50MB or less

## Asset Folder Structure
```
Assets/Audio/
├── BGM/
│   ├── BGM_Hub.ogg
│   ├── BGM_Combat_Stage01.ogg
│   └── BGM_Boss.ogg
├── SFX/
│   ├── UI/
│   │   ├── SFX_ButtonClick.wav
│   │   └── SFX_SkillPurchase.wav
│   ├── Combat/
│   │   ├── SFX_ArrowShoot.wav
│   │   └── SFX_MonsterDeath.wav
│   └── Feedback/
│       ├── SFX_LevelUp.wav
│       └── SFX_StageUnlock.wav
└── Mixers/
    └── MainMixer.mixer
```

## ComfyUI Model Usage
| Model | CLIPLoader type | Purpose |
|-------|----------------|---------|
| ACE-Step | ace_step | BGM generation (musical structure) |
| Stable Audio | stable_audio | SFX generation (effects, ambient) |

## Sound Direction (Soulspire)
- Genre: Dark fantasy tower defense
- Tone: Dark and tense, gothic atmosphere
- BGM keywords: dark orchestral, gothic, tension, epic
- SFX keywords: magical, dark fantasy, arcane, visceral
