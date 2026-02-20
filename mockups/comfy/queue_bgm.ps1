param(
  [string]$RequestDir = "mockups\comfy\out\requests",
  [string]$ComfyHost  = "127.0.0.1",
  [int]   $ComfyPort  = 8188,
  [string[]]$Only     = @()
)

$baseUri = "http://$ComfyHost`:$ComfyPort"
$files   = Get-ChildItem -Path $RequestDir -Filter "bgm_*.json" | Sort-Object Name

if ($Only.Count -gt 0) {
  $files = $files | Where-Object { $Only | ForEach-Object { $files.Name -like "*$_*" } }
}

Write-Host "=== ComfyUI 큐 상태 확인 ==="
$q = Invoke-RestMethod -Uri "$baseUri/queue" -TimeoutSec 5
Write-Host "Running: $($q.queue_running.Count)  Pending: $($q.queue_pending.Count)"

$pendingIds = @($q.queue_pending | ForEach-Object { $_[1] })
$runningIds = @($q.queue_running | ForEach-Object { $_[1] })

Write-Host ""
Write-Host "=== BGM 큐 등록 (중복 제외) ==="
$queued = 0
foreach ($file in $files) {
  $payload  = Get-Content -Raw $file.FullName | ConvertFrom-Json
  $trackId  = $payload.extra_data.track_id

  # 이미 큐에 있는지 확인 (client_id 기반)
  # ComfyUI는 client_id 중복 방지를 하지 않으므로, 트랙별 unique client_id 설정
  try {
    $body = $payload | ConvertTo-Json -Depth 20
    $resp = Invoke-RestMethod -Uri "$baseUri/prompt" -Method Post -Body $body -ContentType "application/json"
    Write-Host "[OK] $trackId → $($resp.prompt_id)"
    $queued++
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Warning "[FAIL $statusCode] $trackId : $($_.Exception.Message)"
  }
  Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "$queued 개 트랙 큐 등록 완료."
Write-Host "ComfyUI 진행상황: http://$ComfyHost`:$ComfyPort"
