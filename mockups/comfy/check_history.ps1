# 최근 히스토리 확인
$h = Invoke-RestMethod "http://127.0.0.1:8188/history?max_items=5"
Write-Host "=== 최근 히스토리 5개 ==="
$h.PSObject.Properties | Select-Object -Last 5 | ForEach-Object {
  $id = $_.Name
  $item = $_.Value
  Write-Host "ID: $id"
  Write-Host "  status: $($item.status.status_str)"
  if ($item.status.messages) {
    $item.status.messages | Select-Object -Last 3 | ForEach-Object { Write-Host "  msg: $_" }
  }
  if ($item.outputs) {
    $item.outputs.PSObject.Properties | ForEach-Object {
      $nodeId = $_.Name
      $out = $_.Value
      Write-Host "  node $nodeId output: $($out | ConvertTo-Json -Depth 3 -Compress)"
    }
  }
  Write-Host ""
}

# ComfyUI 기본 output 폴더에서 audio 찾기
Write-Host "=== ComfyUI output audio 파일 탐색 ==="
$searchPaths = @(
  "C:\Users\happy\ComfyUI\output\audio",
  "C:\ComfyUI\output\audio",
  "C:\Users\happy\AppData\Roaming\ComfyUI\output\audio",
  "D:\ComfyUI\output\audio",
  "C:\Users\happy\Desktop\ComfyUI\output\audio"
)
$found = $false
foreach ($p in $searchPaths) {
  if (Test-Path $p) {
    Write-Host "Found: $p"
    Get-ChildItem $p -Filter "bgm_*.flac" | ForEach-Object { Write-Host "  $_" }
    $found = $true
  }
}
if (-not $found) { Write-Host "(기본 경로에 audio 폴더 없음 — ComfyUI 설치 경로 확인 필요)" }
