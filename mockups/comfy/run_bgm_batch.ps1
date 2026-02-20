param(
  [string]$RequestDir  = "mockups/comfy/out/requests",
  [string]$ComfyHost   = "127.0.0.1",
  [int]   $ComfyPort   = 8188,
  [string]$OutputDir   = "mockups/comfy/out/audio",
  [switch]$DryRun,
  [switch]$WaitForDone
)

$ErrorActionPreference = "Stop"
$baseUri = "http://$ComfyHost`:$ComfyPort"

# ComfyUI 연결 확인
try {
  $stats = Invoke-RestMethod -Uri "$baseUri/system_stats" -TimeoutSec 5
  Write-Host "[OK] ComfyUI 연결 확인: v$($stats.system.comfyui_version)"
  Write-Host "     GPU: $($stats.devices[0].name)  VRAM여유: $([math]::Round($stats.devices[0].vram_free / 1GB, 1)) GB"
} catch {
  Write-Error "[ERROR] ComfyUI에 연결할 수 없습니다. http://$ComfyHost`:$ComfyPort 확인 필요"
  exit 1
}

# VRAM 여유 체크 (ACE-Step 3.5B는 7-8GB 필요)
$vramFree = $stats.devices[0].vram_free / 1GB
if ($vramFree -lt 6.0) {
  Write-Warning "VRAM 여유($([math]::Round($vramFree,1)) GB)가 부족합니다. ACE-Step 3.5B는 ~7GB 필요."
  Write-Warning "ComfyUI Manager에서 다른 모델 언로드 또는 ComfyUI 재시작 후 실행 권장."
  if (-not $DryRun) {
    $confirm = Read-Host "계속 진행하시겠습니까? (y/N)"
    if ($confirm -ne 'y') { exit 0 }
  }
}

# 출력 디렉토리 생성
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# BGM 요청 파일 수집
$files = Get-ChildItem -Path $RequestDir -Filter "bgm_*.json" | Sort-Object Name
if ($files.Count -eq 0) {
  Write-Error "bgm_*.json 파일 없음: $RequestDir"
  exit 1
}

Write-Host ""
Write-Host "=== BGM 배치 생성 시작: $($files.Count)개 트랙 ==="
if ($DryRun) { Write-Host "[DRY RUN] 실제 전송 없이 내용만 확인합니다." }
Write-Host ""

$queued = @()
foreach ($file in $files) {
  $payload = Get-Content -Raw $file.FullName | ConvertFrom-Json
  $trackId  = $payload.extra_data.track_id
  $desc     = $payload.extra_data.description
  $seed     = $payload.extra_data.seed

  Write-Host "[$($queued.Count + 1)/$($files.Count)] $trackId"
  Write-Host "  $desc"

  if (-not $DryRun) {
    try {
      $body     = $payload | ConvertTo-Json -Depth 20
      $response = Invoke-RestMethod -Uri "$baseUri/prompt" -Method Post `
                    -Body $body -ContentType "application/json"
      $queued  += @{ id = $response.prompt_id; track = $trackId }
      Write-Host "  → 큐 등록: $($response.prompt_id)"
    } catch {
      Write-Warning "  [FAIL] $trackId 전송 실패: $($_.Exception.Message)"
    }
  } else {
    Write-Host "  → [DRY RUN] 전송 생략"
  }

  # ACE-Step은 CPU/GPU 부하가 높으므로 트랙 사이 약간 대기
  if (-not $DryRun -and $files.IndexOf($file) -lt ($files.Count - 1)) {
    Start-Sleep -Seconds 3
  }
}

Write-Host ""
Write-Host "완료. $($queued.Count)개 트랙 큐 등록됨."
Write-Host "생성 진행 상황: $baseUri"
Write-Host ""
Write-Host "생성 완료 후 FLAC 파일 위치: ComfyUI output 폴더 → audio/bgm_*.flac"
Write-Host "OGG 변환 (ffmpeg 필요):"
Write-Host "  Get-ChildItem 'output/audio/bgm_*.flac' | ForEach-Object {"
Write-Host "    ffmpeg -i `$_.FullName -c:a libvorbis -q:a 7 (`$_.FullName -replace '.flac','.ogg')"
Write-Host "  }"

if ($WaitForDone -and $queued.Count -gt 0) {
  Write-Host ""
  Write-Host "=== 생성 완료 대기 중... ==="
  $pending = $queued.Clone()
  $completed = @()

  while ($pending.Count -gt 0) {
    Start-Sleep -Seconds 15
    try {
      $queueStatus = Invoke-RestMethod -Uri "$baseUri/queue" -TimeoutSec 10
      $runningIds  = @($queueStatus.queue_running | ForEach-Object { $_[1] })
      $pendingIds  = @($queueStatus.queue_pending | ForEach-Object { $_[1] })

      $stillPending = @()
      foreach ($item in $pending) {
        if ($item.id -notin $runningIds -and $item.id -notin $pendingIds) {
          $completed += $item
          Write-Host "[완료] $($item.track)"
        } else {
          $stillPending += $item
        }
      }
      $pending = $stillPending
      if ($pending.Count -gt 0) {
        Write-Host "진행 중: $($pending | ForEach-Object { $_.track } | Join-String ', ')"
      }
    } catch {
      Write-Warning "큐 상태 확인 실패: $($_.Exception.Message)"
    }
  }

  Write-Host ""
  Write-Host "=== 전체 $($completed.Count)개 트랙 생성 완료 ==="
}
