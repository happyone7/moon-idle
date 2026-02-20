# BGM 생성 완료 상태 모니터링
param(
  [string]$ComfyHost = "127.0.0.1",
  [int]$ComfyPort    = 8188
)

$baseUri = "http://$ComfyHost`:$ComfyPort"

# 히스토리에서 prompt_id 목록 조회
try {
  $hist = Invoke-RestMethod -Uri "$baseUri/history" -TimeoutSec 5
  $q    = Invoke-RestMethod -Uri "$baseUri/queue"   -TimeoutSec 5
} catch {
  Write-Host "[ERROR] ComfyUI 연결 실패: $($_.Exception.Message)"
  exit 1
}

$running = @($q.queue_running | ForEach-Object { $_[1] })
$pending = @($q.queue_pending | ForEach-Object { $_[1] })

Write-Host "=== BGM 생성 현황 ==="
Write-Host "큐 Running: $($running.Count)  Pending: $($pending.Count)"
Write-Host ""

# 히스토리에서 bgm_ 파일 찾기
$bgmFiles = @()
$hist.PSObject.Properties | ForEach-Object {
  $item = $_.Value
  $outputs = $item.outputs
  if ($outputs) {
    $outputs.PSObject.Properties | ForEach-Object {
      $nodeOut = $_.Value
      if ($nodeOut.audio) {
        $nodeOut.audio | ForEach-Object {
          if ($_.filename -match "bgm_") {
            $bgmFiles += @{
              filename  = $_.filename
              prompt_id = $item.prompt.client_id
              status    = "completed"
            }
          }
        }
      }
    }
  }
}

Write-Host "=== 완료된 BGM 파일 ==="
if ($bgmFiles.Count -eq 0) {
  Write-Host "(아직 완료된 파일 없음)"
} else {
  $bgmFiles | ForEach-Object {
    Write-Host "  [완료] $($_.filename)"
  }
}

Write-Host ""
Write-Host "큐 대기: $($pending.Count)개 / 실행 중: $($running.Count)개"
Write-Host "ComfyUI: http://$ComfyHost`:$ComfyPort"
Write-Host ""
Write-Host "생성 완료 후 파일 위치 (ComfyUI output 폴더의 audio/ 서브폴더):"
Write-Host "  기본: C:\Users\happy\ComfyUI\output\audio\bgm_*.flac"
Write-Host "  또는: ComfyUI 설치 경로의 output\audio\bgm_*.flac"
