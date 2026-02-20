$file = "mockups\comfy\out\requests\bgm_01_early_drive_seed230000.json"
$uri  = "http://127.0.0.1:8188/prompt"

$payload = Get-Content -Raw $file
Write-Host "=== Payload ==="
Write-Host $payload
Write-Host ""
Write-Host "=== Sending to ComfyUI ==="
try {
  $response = Invoke-WebRequest -Uri $uri -Method Post -Body $payload -ContentType "application/json"
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $($response.Content)"
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $body   = $reader.ReadToEnd()
  Write-Host "Body: $body"
}
