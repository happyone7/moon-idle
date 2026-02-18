# ComfyUI 실행 가이드 (Start-Process 우회)

Start-Process가 막혀 있어도 바로 실행 가능한 방식으로 정리했습니다.

## 1) ComfyUI 실행

```powershell
Set-Location "C:\UnityProjects\Soulspire\Tools\ComfyUI"
python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header "*"
```

또는

```powershell
.\mockups\comfy\start-comfyui.ps1
```

경로를 바꾸고 싶으면:

```powershell
.\mockups\comfy\start-comfyui.ps1 -ComfyRoot "D:\ComfyUI" -Port 8188
```

체크:
- http://127.0.0.1:8188/
- http://127.0.0.1:8188/system_stats
- http://127.0.0.1:8188/object_info

## 2) 컨셉아트 요청 JSON 생성

```powershell
cd c:\Users\happy\.gemini\antigravity\playground\primordial-station
.\mockups\comfy\run_concept_batch.ps1 -OutputDir mockups\comfy\out\requests -VariantsPerPrompt 2
```

기본 결과는 아래에 생성됩니다.
- `mockups/comfy/out/requests/*.json`

옵션 예시:

```powershell
.\mockups\comfy\run_concept_batch.ps1 `
  -ManifestPath .\mockups\comfy\prompt_bundles\moonidle_concept_pack_v1.json `
  -VariantsPerPrompt 3 `
  -ComfyHost 127.0.0.1 `
  -ComfyPort 8188 `
  -Checkpoint "sd_xl_base_1.0.safetensors" `
  -OutputDir .\mockups\comfy\out\requests
```

## 3) 실제 큐 전송

요청 JSON 생성은 기본 동작입니다. 실제 전송은 `-Send` 옵션.

```powershell
.\mockups\comfy\run_concept_batch.ps1 -Send
```

## 4) 요청 목록 정리

요청 파일을 표로 정리하려면:

```powershell
.\mockups\comfy\create_manifest_from_requests.ps1 -RequestDir .\mockups\comfy\out\requests -ManifestPath .\mockups\comfy\out\manifest.md
```

`run_concept_batch.ps1`는 다음 템플릿/자산을 사용합니다.
- 패키지: `mockups/comfy/prompt_bundles/moonidle_concept_pack_v1.json`
- 워크플로우: `mockups/comfy/workflows/text2img_template_with_tokens.json`

## 5) 렌더 이미지 임포트

ComfyUI 기본 출력 폴더(예: `mockups/comfy/out/images`)에 PNG가 생성되면, 아래 명령으로 목업 자산 폴더로 복사합니다.

```powershell
.\mockups\comfy\import_generated_images.ps1 -SourceDir "mockups/comfy/out/images" -TargetDir "mockups/assets/comfy_generated"
```
