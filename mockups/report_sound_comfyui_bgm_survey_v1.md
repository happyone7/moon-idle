# ComfyUI BGM 생성 환경 조사 보고서
작성: 사운드디렉터 | 날짜: 2026-02-20

---

## 1. ComfyUI 서버 상태

| 항목 | 값 |
|------|----|
| 서버 주소 | http://127.0.0.1:8188 |
| ComfyUI 버전 | 0.13.0 |
| Python | 3.12.10 (MSC v.1943 64bit) |
| PyTorch | 2.6.0+cu124 |
| GPU | NVIDIA GeForce RTX 3080 (CUDA 0) |
| GPU VRAM 총량 | 10.0 GB |
| GPU VRAM 여유 | ~1.9 GB (현재 기타 모델 로드 상태) |
| 시스템 RAM | 64 GB 총 / ~33 GB 여유 |

**결론**: 서버 정상 동작. RTX 3080으로 ACE-Step 3.5B 모델 실행 가능 (VRAM 상황에 따라 offload 활용 필요).

---

## 2. 사용 가능한 오디오 모델 목록

### 2-1. Checkpoints (직접 로드 가능)

| 모델 파일명 | 용도 | 확인 상태 |
|------------|------|----------|
| `ace_step_v1_3.5b.safetensors` | BGM 생성 (ACE-Step 1.0) | **있음** |
| `stable_audio_open_1.0.safetensors` | SFX/앰비언트 생성 (Stable Audio) | **있음** |
| `sd_xl_base_1.0.safetensors` | 이미지 생성 (SDXL) — 오디오 무관 | 있음 |
| `pixelArtSpriteDiffusion_safetensors.safetensors` | 픽셀아트 이미지 — 오디오 무관 | 있음 |

### 2-2. 오디오 보조 모델

| 카테고리 | 파일 | 용도 |
|---------|------|------|
| `text_encoders` | `t5_base.safetensors` | ACE-Step 텍스트 인코딩 |
| `audio_encoders` | (비어 있음) | — |

**핵심**: `ace_step_v1_3.5b.safetensors`와 `stable_audio_open_1.0.safetensors` 모두 설치 완료.

---

## 3. 사용 가능한 오디오 노드 목록

총 614개 노드 중 오디오 관련 노드 **33개** 확인됨.

### 3-1. ACE-Step 파이프라인 노드 (BGM 생성 핵심)

| 노드명 | 카테고리 | 역할 |
|-------|---------|------|
| `EmptyAceStepLatentAudio` | latent/audio | ACE-Step 1.0용 오디오 잠재 공간 생성 (초 단위) |
| `EmptyAceStep1.5LatentAudio` | latent/audio | **ACE-Step 1.5용** 잠재 공간 생성 — BPM/keyscale 지원 |
| `TextEncodeAceStepAudio` | conditioning | ACE-Step 1.0 텍스트 컨디셔닝 (tags + lyrics) |
| `TextEncodeAceStepAudio1.5` | conditioning | **ACE-Step 1.5 컨디셔닝** — BPM/duration/keyscale/timesignature 직접 입력 |
| `VAEDecodeAudio` | latent/audio | 잠재 공간 → 오디오 파형 디코딩 |
| `VAEDecodeAudioTiled` | latent/audio | 타일드 방식 디코딩 (긴 트랙용) |
| `VAEEncodeAudio` | latent/audio | 오디오 → 잠재 공간 인코딩 |
| `ReferenceTimbreAudio` | advanced/conditioning/audio | 참조 오디오 음색 컨디셔닝 |
| `LaplaceScheduler` | sampling/custom_sampling/schedulers | ACE-Step 전용 스케줄러 |

### 3-2. Stable Audio 파이프라인 노드 (SFX 생성용)

| 노드명 | 카테고리 | 역할 |
|-------|---------|------|
| `EmptyLatentAudio` | latent/audio | Stable Audio용 잠재 공간 |
| `ConditioningStableAudio` | conditioning | Stable Audio 컨디셔닝 (초 단위 시간 지정) |

### 3-3. 오디오 저장/로드 노드

| 노드명 | 출력 형식 | 비고 |
|-------|---------|------|
| `SaveAudio` | FLAC | 무손실 고품질 |
| `SaveAudioMP3` | MP3 | 범용 압축 |
| `SaveAudioOpus` | Opus | 고효율 웹용 |
| `LoadAudio` | — | 파일 로드 |
| `PreviewAudio` | — | UI 미리듣기 |
| `RecordAudio` | — | 마이크 녹음 |

### 3-4. 오디오 편집/처리 노드

| 노드명 | 기능 |
|-------|------|
| `AudioAdjustVolume` | 볼륨 조정 (dB 단위) |
| `AudioConcat` | 오디오 이어 붙이기 |
| `AudioMerge` | 오디오 레이어 믹싱 |
| `TrimAudioDuration` | 구간 자르기 (start_index + duration) |
| `SplitAudioChannels` | 스테레오→모노 분리 |
| `JoinAudioChannels` | 채널 합치기 |
| `ReferenceTimbreAudio` | 참조 음색 주입 |

### 3-5. Stability AI API 노드 (외부 API — 현재 미사용)

| 노드명 | 역할 |
|-------|------|
| `StabilityTextToAudio` | Stability AI 클라우드 TTA |
| `StabilityAudioToAudio` | Stability AI 클라우드 ATA |
| `StabilityAudioInpaint` | Stability AI 오디오 인페인팅 |

### 3-6. LTXV 오디오 노드 (영상 동기화용 — BGM과 무관)

`LTXVAudioVAELoader`, `LTXVAudioVAEDecode`, `LTXVAudioVAEEncode`, `LTXVEmptyLatentAudio`

---

## 4. TextEncodeAceStepAudio1.5 핵심 파라미터

이 노드가 BGM 생성의 중심. 직접 음악 이론 파라미터를 입력받는 것이 특징:

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `tags` | STRING | — | 장르/분위기/악기 태그 (쉼표 구분) |
| `lyrics` | STRING | — | 가사 (`[instrumental]` 사용 시 보컬 없음) |
| `bpm` | INT (10~300) | 120 | 템포 |
| `duration` | FLOAT (0~2000) | 120.0 | 생성 길이 (초) |
| `timesignature` | COMBO {2,3,4,6} | — | 박자 |
| `keyscale` | COMBO (장조/단조 34종) | — | 조성 (예: "D minor", "A major") |
| `language` | COMBO (23개 언어) | — | 가사 언어 (ko 포함) |
| `seed` | INT | 0 | 재현성 시드 |
| `generate_audio_codes` | BOOL | true | LLM 오디오 코드 생성 (품질↑, 속도↓) |
| `cfg_scale` | FLOAT (0~100) | 2.0 | CFG 가이던스 강도 |
| `temperature` | FLOAT (0~2) | 0.85 | 샘플링 온도 |

---

## 5. BGM 생성 가능 여부 결론

**결론: 완전 지원. 즉시 생성 가능.**

- ACE-Step 모델(`ace_step_v1_3.5b.safetensors`)과 ACE-Step 1.5 전용 노드(`TextEncodeAceStepAudio1.5`, `EmptyAceStep1.5LatentAudio`) 모두 설치 완료
- BPM, 조성(keyscale), 박자(timesignature), 길이(duration)를 노드 파라미터로 직접 제어 가능
- tags 필드로 장르/악기/분위기 텍스트 지정
- `SaveAudio`(FLAC), `SaveAudioMP3`(MP3) 두 형식 모두 지원
- `TrimAudioDuration`으로 정확한 루프 길이 트리밍 가능

---

## 6. 생성된 워크플로우 및 배치 요청 파일

### 6-1. 워크플로우 템플릿

| 파일 | 용도 |
|------|------|
| `mockups/comfy/workflows/acestep15_bgm_template.json` | ACE-Step 1.5 BGM 생성 기본 파이프라인 |

**파이프라인 구조**:
```
CheckpointLoaderSimple (ace_step_v1_3.5b)
    ↓ MODEL / CLIP / VAE
TextEncodeAceStepAudio1.5 (tags + bpm + keyscale + duration)
    ↓ CONDITIONING (positive + negative)
EmptyAceStep1.5LatentAudio (seconds)
    ↓ LATENT
KSampler (euler, simple, steps=60, cfg=2.0)
    ↓ LATENT
VAEDecodeAudio
    ↓ AUDIO
TrimAudioDuration (정확한 길이 컷)
    ↓ AUDIO
AudioAdjustVolume (볼륨 조정)
    ↓ AUDIO
SaveAudio (FLAC)
```

### 6-2. 10트랙 배치 요청 JSON (시드 고정)

| 파일명 | 트랙명 | BPM | 조성 | 길이 | 시드 |
|--------|--------|-----|------|------|------|
| `bgm_01_early_drive_seed230000.json` | bgm_early_drive | 134 | D minor | 90s | 230000 |
| `bgm_02_research_grid_seed230001.json` | bgm_research_grid | 110 | A minor | 90s | 230001 |
| `bgm_03_launch_tension_seed230002.json` | bgm_launch_tension | 145 | E minor | 90s | 230002 |
| `bgm_04_assembly_focus_seed230003.json` | bgm_assembly_focus | 120 | C minor | 90s | 230003 |
| `bgm_05_mid_ambient_seed230004.json` | bgm_mid_ambient | 90 | G minor | 120s | 230004 |
| `bgm_06_automation_hum_seed230005.json` | bgm_automation_hum | 100 | F minor | 90s | 230005 |
| `bgm_07_mission_epic_seed230006.json` | bgm_mission_epic | 125 | D major | 90s | 230006 |
| `bgm_08_prestige_void_seed230007.json` | bgm_prestige_void | 60 | B minor | 120s | 230007 |
| `bgm_09_moon_approach_seed230008.json` | bgm_moon_approach | 115 | F# minor | 90s | 230008 |
| `bgm_10_moon_surface_seed230009.json` | bgm_moon_surface | 130 | A major | 90s | 230009 |

---

## 7. 다음 단계 제안

### Step A: 테스트 생성 (즉시)
트랙 1개 (`bgm_01_early_drive`)를 ComfyUI UI에서 수동으로 워크플로우 로드 후 생성하여 품질 확인.
```
ComfyUI → Load Workflow → acestep15_bgm_template.json
```

### Step B: 배치 전송 스크립트 작성
`run_concept_batch.ps1`과 동일한 방식으로 오디오 배치 전송 스크립트(`run_bgm_batch.ps1`) 작성. 기존 JSON 파일들을 `/prompt` API로 순차 전송.

### Step C: 생성 결과 평가
- 각 트랙 품질 평가 (루프 포인트, 분위기 일치도)
- 음량 표준화 (-14 ~ -16 LUFS 목표, AudioAdjustVolume 활용)
- 필요 시 시드 또는 태그 조정 후 재생성

### Step D: FLAC → OGG 변환
게임 에셋용으로 SaveAudio(FLAC) 결과를 ffmpeg 또는 Audacity로 OGG Vorbis Q7 변환.
```
ffmpeg -i bgm_01_early_drive.flac -c:a libvorbis -q:a 7 bgm_01_early_drive.ogg
```

### Step E: BGM 연동 구현 (Sprint 2)
`js/audio-bgm.js`의 BGM 시스템에 생성된 OGG 트랙을 로드하는 방식으로 교체 또는 병행 사용.

---

## 8. VRAM 주의사항

RTX 3080 (10GB VRAM, 현재 여유 ~1.9GB):
- ACE-Step 3.5B는 약 7~8GB VRAM 필요
- 현재 다른 모델이 로드된 상태로 보임 → ComfyUI 재시작 또는 다른 모델 언로드 후 생성 권장
- `--lowvram` 옵션 또는 ComfyUI의 메모리 최적화 설정 활용 가능

---

*본 보고서는 2026-02-20 기준 ComfyUI 0.13.0 환경 조사 결과입니다.*
