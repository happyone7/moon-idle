param(
  [string]$ManifestPath = "mockups/comfy/prompt_bundles/moonidle_concept_pack_v1.json",
  [string]$WorkflowTemplatePath = "mockups/comfy/workflows/text2img_template_with_tokens.json",
  [string]$ComfyHost = "127.0.0.1",
  [int]$ComfyPort = 8188,
  [string]$Checkpoint = "sd_xl_base_1.0.safetensors",
  [int]$SeedBase = 220000,
  [string]$OutputDir = "mockups/comfy/out/requests",
  [int]$VariantsPerPrompt = 2,
  [switch]$Send
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

if (-not (Test-Path $WorkflowTemplatePath)) {
  throw "Workflow template not found: $WorkflowTemplatePath"
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$manifest = Get-Content -Raw $ManifestPath | ConvertFrom-Json
$template = Get-Content -Raw $WorkflowTemplatePath

function Escape-JsonValue {
  param([string]$value)
  return ($value -replace '\\', '\\\\' -replace '"', '\"' -replace "`r","" -replace "`n"," ")
}

$jobs = @()
$seed = $SeedBase
if ($manifest.default_size.width) {
  $defaultWidth = [int]$manifest.default_size.width
  $defaultHeight = [int]$manifest.default_size.height
} else {
  $defaultWidth = 1024
  $defaultHeight = 1024
}
$cfg = if ($manifest.default_cfg) { $manifest.default_cfg } else { 6.8 }
$steps = if ($manifest.default_steps) { $manifest.default_steps } else { 28 }
$sampler = if ($manifest.default_sampler) { $manifest.default_sampler } else { "euler" }
$negativeDefault = if ($manifest.negative_default) { $manifest.negative_default } else { "watermark, logo, text, fantasy" }
$clientId = "moonidle-batch-" + [guid]::NewGuid().ToString("N")

foreach ($job in $manifest.jobs) {
  for ($i = 0; $i -lt $VariantsPerPrompt; $i++) {
    $seedVal = $seed
    $seed++

    $suffix = "{0:D4}" -f ($i + 1)
    $filename = "moonidle_$($job.id)_$suffix" + "_seed$seedVal.png"
    $payloadText = $template
    $payloadText = $payloadText.Replace("__CLIENT_ID__", $clientId)
    $payloadText = $payloadText.Replace("__POSITIVE_PROMPT__", (Escape-JsonValue "$($job.prompt), $($job.category), MoonIdle concept art"))
    $payloadText = $payloadText.Replace("__NEGATIVE_PROMPT__", (Escape-JsonValue $negativeDefault))
    $payloadText = $payloadText.Replace("__CHECKPOINT__", $Checkpoint)
    $payloadText = $payloadText.Replace("__WIDTH__", "$defaultWidth")
    $payloadText = $payloadText.Replace("__HEIGHT__", "$defaultHeight")
    $payloadText = $payloadText.Replace("__CFG__", "$cfg")
    $payloadText = $payloadText.Replace("__STEPS__", "$steps")
    $payloadText = $payloadText.Replace("__SAMPLER__", $sampler)
    $payloadText = $payloadText.Replace("__SEED__", "$seedVal")
    $payloadText = $payloadText.Replace("__FILENAME_PREFIX__", (Escape-JsonValue "moonidle_$($job.id)_v$($i + 1)_$seedVal"))

    $outPath = Join-Path $OutputDir ("moonidle_$($job.id)_" + $suffix + "_seed$seedVal.json")
    Set-Content -Path $outPath -Value $payloadText -Encoding utf8

    if ($Send) {
      $uri = "http://$ComfyHost`:$ComfyPort/prompt"
      try {
        $payload = $payloadText | ConvertFrom-Json
        $response = Invoke-RestMethod -Uri $uri -Method Post -Body ($payload | ConvertTo-Json -Depth 20) -ContentType "application/json"
        Write-Host "Queued: $outPath"
        Write-Host "  queue response: $($response.prompt_id)"
      } catch {
        Write-Error "Failed to queue $($job.id): $($_.Exception.Message)"
      }
    } else {
      Write-Host "Generated request: $outPath"
    }
  }
}

Write-Host ""
Write-Host "Done. Total requests: $($manifest.jobs.Count * $VariantsPerPrompt)"
Write-Host "Saved to: $OutputDir"
Write-Host "Set -Send to actually post to http://$ComfyHost`:$ComfyPort/prompt"
