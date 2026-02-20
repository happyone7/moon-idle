# 파일을 JSON 파싱 없이 raw 문자열로 직접 전송
$baseUri = "http://127.0.0.1:8188"
$dir = "c:\Users\happy\.gemini\antigravity\playground\primordial-station\mockups\comfy\out\requests"

@("bgm_02_research_grid_seed230001.json", "bgm_08_prestige_void_seed230007.json") | ForEach-Object {
  $rawBody = [System.IO.File]::ReadAllText((Join-Path $dir $_), [System.Text.Encoding]::UTF8)

  Write-Host "=== $_ raw send ==="
  try {
    $bytes   = [System.Text.Encoding]::UTF8.GetBytes($rawBody)
    $req     = [System.Net.WebRequest]::Create("$baseUri/prompt")
    $req.Method      = "POST"
    $req.ContentType = "application/json"
    $req.ContentLength = $bytes.Length
    $stream  = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $resp    = $req.GetResponse()
    $reader  = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body    = $reader.ReadToEnd()
    Write-Host "[OK $([int]$resp.StatusCode)] $body"
  } catch [System.Net.WebException] {
    $code   = [int]$_.Exception.Response.StatusCode
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body   = $reader.ReadToEnd()
    Write-Host "[FAIL $code] $body"

    # 에러 시 서버 error 엔드포인트 조회
    try {
      $errResp = Invoke-RestMethod -Uri "$baseUri/view_queue" -TimeoutSec 3
      Write-Host "Queue: $($errResp | ConvertTo-Json -Depth 2)"
    } catch {}
  }
  Start-Sleep -Seconds 1
}
