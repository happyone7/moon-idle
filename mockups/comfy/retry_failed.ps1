$baseUri = "http://127.0.0.1:8188"
$dir = "c:\Users\happy\.gemini\antigravity\playground\primordial-station\mockups\comfy\out\requests"

@("bgm_02_research_grid_seed230001.json", "bgm_08_prestige_void_seed230007.json") | ForEach-Object {
  $file = Join-Path $dir $_
  $payload = Get-Content -Raw $file
  try {
    $resp = Invoke-RestMethod -Uri "$baseUri/prompt" -Method Post -Body $payload -ContentType "application/json"
    Write-Host "[OK] $_ -> $($resp.prompt_id)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "[FAIL $code] $_"
    Write-Host "  Body: $body"
  }
  Start-Sleep -Seconds 2
}
