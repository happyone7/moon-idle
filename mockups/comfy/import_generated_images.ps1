param(
  [string]$SourceDir = "mockups/comfy/out/images",
  [string]$TargetDir = "mockups/assets/comfy_generated",
  [string]$Pattern = "*.png"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

$files = Get-ChildItem -Path $SourceDir -Filter $Pattern
if (-not $files) {
  Write-Warning "No files matched Pattern='$Pattern' in $SourceDir"
  exit 0
}

foreach ($f in $files) {
  $dst = Join-Path $TargetDir $f.Name
  Copy-Item -Path $f.FullName -Destination $dst -Force
  Write-Host "copied: $($f.Name)"
}

Write-Host "Total copied: $($files.Count)"
Write-Host "Target: $TargetDir"
