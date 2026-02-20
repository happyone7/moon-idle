# 모든 BGM 파일을 raw bytes로 전송 (JSON 파싱 없이)
$baseUri = "http://127.0.0.1:8188"
$dir = "c:\Users\happy\.gemini\antigravity\playground\primordial-station\mockups\comfy\out\requests"
$files = Get-ChildItem -Path $dir -Filter "bgm_*.json" | Sort-Object Name

Write-Host "=== BGM 10트랙 전송 ==="
$promptIds = @{}

foreach ($file in $files) {
  $rawBytes = [System.IO.File]::ReadAllBytes($file.FullName)

  try {
    $req              = [System.Net.WebRequest]::Create("$baseUri/prompt")
    $req.Method       = "POST"
    $req.ContentType  = "application/json"
    $req.ContentLength = $rawBytes.Length
    $outStream = $req.GetRequestStream()
    $outStream.Write($rawBytes, 0, $rawBytes.Length)
    $outStream.Close()

    $resp    = $req.GetResponse()
    $reader  = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body    = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "[OK] $($file.BaseName) -> $($body.prompt_id)"
    $promptIds[$file.BaseName] = $body.prompt_id
  } catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    $r    = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "[FAIL $code] $($file.BaseName): $($r.ReadToEnd())"
  }
  Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "전송 완료: $($promptIds.Count)/10"
Write-Host ""
Write-Host "=== 생성 완료 대기 (완료될 때 알림) ==="
$remaining = $promptIds.Clone()
$done      = @{}
$checks    = 0

while ($remaining.Count -gt 0) {
  Start-Sleep -Seconds 20
  $checks++

  try {
    $q = Invoke-RestMethod "$baseUri/queue" -TimeoutSec 5
    $h = Invoke-RestMethod "$baseUri/history?max_items=30" -TimeoutSec 5

    $toRemove = @()
    foreach ($key in $remaining.Keys) {
      $pid = $remaining[$key]
      if ($h.PSObject.Properties.Name -contains $pid) {
        $item = $h.$pid
        if ($item.status.completed -eq $true) {
          # 출력 파일 찾기
          $flacFile = $null
          $item.outputs.PSObject.Properties | ForEach-Object {
            if ($_.Value.audio) {
              $flacFile = $_.Value.audio[0].filename
            }
          }
          if ($item.status.status_str -eq "success") {
            Write-Host "[완료] $key -> $flacFile"
          } else {
            $errEntry = $item.status.messages | Where-Object { $_[0] -eq 'execution_error' } | Select-Object -First 1
            $errMsg = if ($errEntry -and $errEntry[1]) { $errEntry[1].exception_message } else { "unknown error" }
            Write-Host "[에러] $key : $errMsg"
          }
          $done[$key] = $flacFile
          $toRemove  += $key
        }
      }
    }
    foreach ($k in $toRemove) { $remaining.Remove($k) }

    if ($remaining.Count -gt 0) {
      Write-Host "[$checks] 대기 중: $($remaining.Count)개 (큐: Run=$($q.queue_running.Count) Pend=$($q.queue_pending.Count))"
    }
  } catch {
    Write-Warning "상태 확인 오류: $($_.Exception.Message)"
  }
}

Write-Host ""
Write-Host "=== 전체 결과 ==="
$done.Keys | Sort-Object | ForEach-Object {
  Write-Host "  $_ -> $($done[$_])"
}
Write-Host ""
Write-Host "완료. 생성된 FLAC 파일은 ComfyUI output 폴더의 audio/ 서브폴더에 있습니다."
Write-Host "ComfyUI 설치 경로: C:\UnityProjects\Soulspire\Tools\ComfyUI\output\audio\"
