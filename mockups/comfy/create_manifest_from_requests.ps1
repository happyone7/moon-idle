param(
  [string]$RequestDir = "mockups/comfy/out/requests",
  [string]$ManifestPath = "mockups/comfy/out/manifest.md",
  [string]$BundlePath = "mockups/comfy/prompt_bundles/moonidle_concept_pack_v1.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RequestDir)) {
  throw "Request directory not found: $RequestDir"
}

$requests = Get-ChildItem -Path $RequestDir -Filter "moonidle_*.json" | Sort-Object Name
if (-not $requests) {
  throw "No request files found in $RequestDir"
}

$bundle = if (Test-Path $BundlePath) { Get-Content -Raw $BundlePath | ConvertFrom-Json } else { $null }
$bundleMap = @{}
if ($bundle) {
  foreach ($job in $bundle.jobs) {
    $bundleMap[$job.id] = @{
      category = $job.category
      scene = $job.scene
      prompt = $job.prompt
    }
  }
}

$lines = @()
$lines += "# MoonIdle Concept Render Manifest"
$lines += ""
$lines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += ""
$lines += "## Requests"
$lines += "| file | job_id | variant | seed | category | scene |"
$lines += "|---|---|---|---:|---|---|"

foreach ($req in $requests) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($req.Name)
  $match = [regex]::Match($name, '^moonidle_(?<job>.+)_(?<variant>\d{4})_seed(?<seed>\d+)$')
  if ($match.Success) {
    $jobId = $match.Groups["job"].Value
    $variant = $match.Groups["variant"].Value
    $seed = $match.Groups["seed"].Value
  }
  else {
    $jobId = "unknown"
    $variant = "unknown"
    $seed = "n/a"
  }

  $meta = $bundleMap[$jobId]
  $category = if ($meta) { $meta.category } else { "-" }
  $scene = if ($meta) { $meta.scene } else { "-" }

  $lines += "| $($req.Name) | $jobId | $variant | $seed | $category | $scene |"
}

Set-Content -Path $ManifestPath -Value ($lines -join "`n") -Encoding utf8
Write-Host "Manifest written: $ManifestPath"
