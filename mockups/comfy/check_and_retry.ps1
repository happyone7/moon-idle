# 유니크 client_id로 bgm_02, bgm_08 재시도
$baseUri = "http://127.0.0.1:8188"
$dir = "c:\Users\happy\.gemini\antigravity\playground\primordial-station\mockups\comfy\out\requests"

# 큐 현재 상태 확인
$q = Invoke-RestMethod -Uri "$baseUri/queue"
Write-Host "큐: Running=$($q.queue_running.Count) Pending=$($q.queue_pending.Count)"

# object_info로 TextEncodeAceStepAudio1.5 keyscale 옵션 조회
try {
  $info = Invoke-RestMethod -Uri "$baseUri/object_info/TextEncodeAceStepAudio1.5" -TimeoutSec 5
  $keyscales = $info.TextEncodeAceStepAudio1_5.input.required.keyscale[0]
  Write-Host "지원 keyscale 목록:"
  $keyscales | ForEach-Object { Write-Host "  $_" }
} catch {
  Write-Warning "object_info 조회 실패: $($_.Exception.Message)"
}

# bgm_02 재시도 (유니크 client_id)
Write-Host ""
Write-Host "=== bgm_02 재시도 ==="
$payload = Get-Content -Raw (Join-Path $dir "bgm_02_research_grid_seed230001.json") | ConvertFrom-Json
$payload.client_id = "moonidle_bgm_retry_02_" + [guid]::NewGuid().ToString("N").Substring(0,8)
$body = $payload | ConvertTo-Json -Depth 20
try {
  $resp = Invoke-RestMethod -Uri "$baseUri/prompt" -Method Post -Body $body -ContentType "application/json"
  Write-Host "[OK] bgm_02 -> $($resp.prompt_id)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $errBody = $reader.ReadToEnd()
  Write-Host "[FAIL $code] $errBody"
}

# bgm_08 재시도 (유니크 client_id)
Write-Host ""
Write-Host "=== bgm_08 재시도 ==="
$payload = Get-Content -Raw (Join-Path $dir "bgm_08_prestige_void_seed230007.json") | ConvertFrom-Json
$payload.client_id = "moonidle_bgm_retry_08_" + [guid]::NewGuid().ToString("N").Substring(0,8)
$body = $payload | ConvertTo-Json -Depth 20
try {
  $resp = Invoke-RestMethod -Uri "$baseUri/prompt" -Method Post -Body $body -ContentType "application/json"
  Write-Host "[OK] bgm_08 -> $($resp.prompt_id)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $errBody = $reader.ReadToEnd()
  Write-Host "[FAIL $code] $errBody"
}
