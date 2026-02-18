param(
  [string]$RepoRoot = (Get-Location).Path,
  [string]$SprintBranch,
  [string]$DevBranch,
  [string]$QaReportPath,
  [string]$RequireMarker = "QA_RESULT=PASS",
  [switch]$AllowUntracked,
  [switch]$Push
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

if (-not $SprintBranch -or -not $DevBranch -or -not $QaReportPath) {
  throw "Required: -SprintBranch -DevBranch -QaReportPath"
}

git -C $RepoRoot rev-parse --is-inside-work-tree | Out-Null

$statusArgs = @("status", "--porcelain")
if ($AllowUntracked) {
  $statusArgs += "--untracked-files=no"
}
$dirty = git -C $RepoRoot @statusArgs
if ($dirty) {
  throw "Working tree is not clean. Commit/stash-like changes are not allowed for merge gate."
}

if (-not (Test-Path $QaReportPath)) {
  throw "QA report not found: $QaReportPath"
}

$qaText = Get-Content -Raw -Encoding utf8 $QaReportPath
if ($qaText -notmatch [regex]::Escape($RequireMarker)) {
  throw "QA gate failed. Missing marker '$RequireMarker' in $QaReportPath"
}

git -C $RepoRoot fetch --all --prune

git -C $RepoRoot show-ref --verify --quiet ("refs/heads/" + $SprintBranch)
if ($LASTEXITCODE -ne 0) {
  throw "Sprint branch not found: $SprintBranch"
}

git -C $RepoRoot show-ref --verify --quiet ("refs/heads/" + $DevBranch)
if ($LASTEXITCODE -ne 0) {
  throw "Dev branch not found: $DevBranch"
}

git -C $RepoRoot checkout $SprintBranch | Out-Null

$mergeMsg = "merge: $DevBranch -> $SprintBranch (QA passed)"
git -C $RepoRoot merge --no-ff $DevBranch -m $mergeMsg

if ($Push) {
  git -C $RepoRoot push origin $SprintBranch
}

Write-Host "Merge gate passed and merged: $DevBranch -> $SprintBranch"
