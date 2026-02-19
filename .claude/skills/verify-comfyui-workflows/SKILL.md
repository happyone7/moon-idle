---
name: verify-comfyui-workflows
description: ComfyUI 워크플로우 및 배치 스크립트 일관성 검증. JSON 스키마, 시드 고정, 파일 명명 규칙을 검사. ComfyUI 에셋 생성 작업 후 사용.
---

# Purpose

이 스킬은 ComfyUI 에셋 생성 워크플로우의 일관성을 검증합니다:

1. **워크플로우 JSON 유효성** — 요청 파일과 템플릿의 스키마 검증
2. **시드 고정 일관성** — 파일명과 `noise_seed` 값 매칭
3. **파일 명명 규칙** — `bgm_##_<description>_seed######.json` 패턴 준수
4. **배치 스크립트 참조** — PowerShell 스크립트가 참조하는 경로 유효성
5. **워크플로우 호환성** — 요청 파일이 사용하는 노드 클래스 일관성

# When to Run

다음 작업 후 이 스킬을 실행하세요:

1. **새 BGM 요청 추가** — `mockups/comfy/out/requests/` 디렉토리에 새 JSON 파일 추가 후
2. **워크플로우 템플릿 수정** — `mockups/comfy/workflows/` 템플릿 변경 후
3. **배치 스크립트 수정** — PowerShell 스크립트 변경 후
4. **시드 범위 변경** — 고정 시드 번호 변경 후
5. **ComfyUI 노드 업그레이드** — ACE-Step 버전 변경 또는 노드 클래스 변경 후

# Related Files

| File | Purpose |
|------|---------|
| `mockups/comfy/workflows/acestep15_bgm_template.json` | ACE-Step 1.5 BGM 생성 템플릿 (플레이스홀더 포함) |
| `mockups/comfy/out/requests/bgm_01_early_drive_seed230000.json` | BGM #01 요청 (DRIVE 트랙, 시드 230000) |
| `mockups/comfy/out/requests/bgm_02_research_grid_seed230001.json` | BGM #02 요청 (GRID 트랙, 시드 230001) |
| `mockups/comfy/out/requests/bgm_03_launch_tension_seed230002.json` | BGM #03 요청 (TENSION 트랙, 시드 230002) |
| `mockups/comfy/out/requests/bgm_04_assembly_focus_seed230003.json` | BGM #04 요청 (FOCUS 트랙, 시드 230003) |
| `mockups/comfy/out/requests/bgm_05_mid_ambient_seed230004.json` | BGM #05 요청 (AMBIENT 트랙, 시드 230004) |
| `mockups/comfy/out/requests/bgm_06_automation_hum_seed230005.json` | BGM #06 요청 (HUM 트랙, 시드 230005) |
| `mockups/comfy/out/requests/bgm_07_mission_epic_seed230006.json` | BGM #07 요청 (EPIC 트랙, 시드 230006) |
| `mockups/comfy/out/requests/bgm_08_prestige_void_seed230007.json` | BGM #08 요청 (VOID 트랙, 시드 230007) |
| `mockups/comfy/out/requests/bgm_09_moon_approach_seed230008.json` | BGM #09 요청 (APPROACH 트랙, 시드 230008) |
| `mockups/comfy/out/requests/bgm_10_moon_surface_seed230009.json` | BGM #10 요청 (SURFACE 트랙, 시드 230009) |
| `mockups/comfy/send_all_bgm.ps1` | 모든 BGM 요청 일괄 전송 스크립트 |
| `mockups/comfy/queue_bgm.ps1` | ComfyUI 큐 확인 스크립트 |
| `mockups/comfy/run_bgm_batch.ps1` | 배치 실행 메인 스크립트 |
| `mockups/comfy/status.ps1` | ComfyUI 서버 상태 확인 |

# Workflow

## Step 1: 요청 파일 JSON 유효성 검증

**디렉토리:** `mockups/comfy/out/requests/`

**검사:** 모든 BGM 요청 JSON 파일이 유효한 JSON 형식인지 확인합니다.

```bash
find mockups/comfy/out/requests -name "*.json" -type f -exec python -m json.tool {} \; 2>&1 | grep -i error
```

**PASS 기준:** 출력이 비어 있음 (JSON 파싱 에러 없음)

**FAIL 시 조치:**
- JSON 문법 오류 수정 (쉼표 누락, 괄호 불일치 등)
- 유효성 검사 도구로 재확인

---

## Step 2: 파일 명명 규칙 검증

**검사:** 요청 파일명이 `bgm_##_<description>_seed######.json` 패턴을 따르는지 확인합니다.

```bash
ls mockups/comfy/out/requests/ | grep -E "^bgm_[0-9]{2}_[a-z_]+_seed[0-9]{6}\.json$"
```

**PASS 기준:**
- 모든 파일명이 정규식 패턴과 일치
- `##`는 01~10 범위 (2자리 숫자)
- `seed######`는 6자리 숫자 (예: 230000~230009)

**FAIL 예시:**
```
bgm_1_drive_seed230000.json       # FAIL — 번호가 1자리 (01로 수정 필요)
bgm_01_drive_230000.json          # FAIL — 'seed' 접두사 누락
bgm_01_DriveTrack_seed230000.json # FAIL — description에 대문자 사용 (소문자+언더스코어만 허용)
```

---

## Step 3: 시드 고정 일관성 검증

**검사:** 각 요청 파일의 `noise_seed` 값이 파일명의 시드와 일치하는지 확인합니다.

```bash
for f in mockups/comfy/out/requests/bgm_*.json; do
  filename=$(basename "$f")
  seed_in_name=$(echo "$filename" | grep -oP 'seed\K[0-9]{6}')
  seed_in_file=$(grep -oP '"noise_seed":\s*\K[0-9]+' "$f")
  if [ "$seed_in_name" != "$seed_in_file" ]; then
    echo "MISMATCH: $filename — 파일명 시드=$seed_in_name, JSON 시드=$seed_in_file"
  fi
done
```

**PASS 기준:** 출력이 비어 있음 (모든 파일의 시드 일치)

**FAIL 시 조치:**
- 파일명 또는 JSON 내 `noise_seed` 값을 일치하도록 수정
- 시드 범위: 230000~230009 (10개 트랙)

---

## Step 4: 필수 노드 존재 검증

**검사:** 각 요청 파일이 필수 ComfyUI 노드를 포함하는지 확인합니다.

```bash
grep -l "CheckpointLoaderSimple" mockups/comfy/out/requests/*.json | wc -l
grep -l "TextEncodeAceStepAudio" mockups/comfy/out/requests/*.json | wc -l
grep -l "RandomNoise" mockups/comfy/out/requests/*.json | wc -l
```

**PASS 기준:**
- 각 명령어의 출력이 10 (총 파일 개수와 일치)
- 필수 노드: `CheckpointLoaderSimple`, `TextEncodeAceStepAudio`, `RandomNoise`, `BasicGuider`, `SamplerCustomAdvanced`, `VAEDecode`, `SaveAudio`

**FAIL 시 조치:**
- 누락된 노드를 워크플로우에 추가
- 템플릿과 비교하여 구조 일치 여부 확인

---

## Step 5: 배치 스크립트 경로 검증

**검사:** PowerShell 스크립트가 참조하는 파일 경로가 유효한지 확인합니다.

```bash
grep -o "mockups/comfy/out/requests/.*\.json" mockups/comfy/*.ps1 | while read path; do
  if [ ! -f "$path" ]; then
    echo "NOT FOUND: $path"
  fi
done
```

**PASS 기준:** 출력이 비어 있음 (모든 참조 경로가 존재)

**FAIL 시 조치:**
- 스크립트에서 참조하는 경로를 실제 파일 경로로 수정
- 파일 이동 시 스크립트도 함께 업데이트

### Step 5a: send_all_bgm.ps1 검증

```powershell
# PowerShell에서 실행 (Windows 환경)
Select-String -Path "mockups/comfy/send_all_bgm.ps1" -Pattern "bgm_\d{2}_.*_seed\d{6}\.json"
```

**PASS 기준:** 스크립트가 10개 BGM 파일을 모두 참조

---

## Step 6: 워크플로우 템플릿 호환성 검증

**파일:** `mockups/comfy/workflows/acestep15_bgm_template.json`

**검사:** 템플릿의 플레이스홀더가 요청 파일에서 올바르게 치환되었는지 확인합니다.

```bash
grep -o "__[A-Z_]*__" mockups/comfy/workflows/acestep15_bgm_template.json | sort -u
```

**출력 예상:** `__BPM__`, `__CLIENT_ID__`, `__DURATION__`, `__KEY_SCALE__`, `__LYRICS__`, `__SEED__`, `__TAGS__`, `__TIME_SIGNATURE__`

**검사 2:** 요청 파일에 플레이스홀더가 남아있지 않은지 확인

```bash
grep -l "__[A-Z_]*__" mockups/comfy/out/requests/*.json
```

**PASS 기준:** 출력이 비어 있음 (요청 파일에 플레이스홀더 없음)

**FAIL 시 조치:**
- 요청 파일에서 미치환 플레이스홀더를 실제 값으로 교체
- 템플릿 사용 시 모든 플레이스홀더 치환 확인

---

## Step 7: 시드 범위 중복 검증

**검사:** 시드 번호가 중복되지 않는지 확인합니다.

```bash
grep -hroP 'seed\K[0-9]{6}' mockups/comfy/out/requests/*.json | sort | uniq -d
```

**PASS 기준:** 출력이 비어 있음 (중복 시드 없음)

**FAIL 시 조치:**
- 중복된 시드를 고유한 번호로 변경
- 시드 범위: 230000~230009 (BGM 10개) 또는 230010~ (추가 트랙용)

---

## Step 8: ACE-Step 버전 일관성 검증

**검사:** 모든 요청 파일이 동일한 ACE-Step 버전을 사용하는지 확인합니다.

```bash
grep -h "class_type.*AceStep" mockups/comfy/out/requests/*.json | sort -u
```

**PASS 기준:**
- 단일 버전만 출력 (예: `"class_type": "TextEncodeAceStepAudio"`)
- 또는 템플릿에서 지정한 버전과 일치 (예: `TextEncodeAceStepAudio1.5`)

**FAIL 예시:**
```
"class_type": "TextEncodeAceStepAudio"      # 버전 1.0
"class_type": "TextEncodeAceStepAudio1.5"   # 버전 1.5
```
→ 혼용 금지, 하나로 통일 필요

---

# Output Format

검증 결과를 다음 형식으로 보고합니다:

```markdown
## ComfyUI 워크플로우 검증 결과

### 1. JSON 유효성 검증
- ✅ PASS — 10개 요청 파일 모두 유효한 JSON

### 2. 파일 명명 규칙 검증
- ✅ PASS — 10개 파일 모두 `bgm_##_<description>_seed######.json` 패턴 준수

### 3. 시드 고정 일관성 검증
- ✅ PASS — 모든 파일의 시드 일치 (230000~230009)

### 4. 필수 노드 존재 검증
- ✅ PASS — CheckpointLoaderSimple: 10개
- ✅ PASS — TextEncodeAceStepAudio: 10개
- ✅ PASS — RandomNoise: 10개

### 5. 배치 스크립트 경로 검증
- ✅ PASS — send_all_bgm.ps1이 10개 파일 모두 참조
- ✅ PASS — 모든 참조 경로 유효

### 6. 워크플로우 템플릿 호환성
- ✅ PASS — 템플릿 플레이스홀더 8개 식별
- ✅ PASS — 요청 파일에 미치환 플레이스홀더 없음

### 7. 시드 범위 중복 검증
- ✅ PASS — 중복 시드 없음

### 8. ACE-Step 버전 일관성
- ✅ PASS — 모든 파일이 TextEncodeAceStepAudio 사용 (버전 1.0)

---

**종합:** 모든 검사 통과 — ComfyUI 워크플로우 일관성 확인됨
```

---

# Exceptions

다음은 **문제가 아닙니다**:

1. **템플릿 플레이스홀더** — `acestep15_bgm_template.json`에 `__PLACEHOLDER__` 형식이 있는 것은 정상 (템플릿 파일이므로)
2. **노드 버전 차이** — 요청 파일이 템플릿과 다른 ACE-Step 버전을 사용하는 경우, 의도적으로 구버전을 사용할 수 있음 (단, 파일 내에서 일관성 유지 필요)
3. **추가 PowerShell 스크립트** — `check_and_retry.ps1`, `debug_bgm_request.ps1`, `monitor_bgm.ps1` 등은 유틸리티이므로 요청 파일 참조가 없어도 됨
4. **시드 범위 확장** — 230010 이상의 시드는 미래 트랙용으로 예약 가능
5. **description 길이** — 파일명의 `<description>` 부분은 가독성을 위해 길어질 수 있음 (예: `bgm_01_early_drive_electronic_industrial_seed230000.json`)
6. **client_id 중복** — 여러 요청 파일이 동일한 `client_id`를 사용하는 것은 정상 (배치 처리 시 동일 클라이언트로 간주)
7. **워크플로우 출력 경로** — `SaveAudio` 노드의 `filename_prefix`는 각 트랙마다 다를 수 있음 (정상)
