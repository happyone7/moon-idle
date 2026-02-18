param(
  [string]$RepoRoot = (Get-Location).Path,
  [string]$SprintBranch,
  [string]$DevBranch,
  [string]$QaReportPath,
  [string]$RequireMarker = "QA_RESULT=PASS",
  [switch]$Push
)

$ErrorActionPreference = "Stop"

if (-not $SprintBranch -or -not $DevBranch -or -not $QaReportPath) {
  throw "Required: -SprintBranch -DevBranch -QaReportPath"
}

git -C $RepoRoot rev-parse --is-inside-work-tree | Out-Null

$dirty = git -C $RepoRoot status --porcelain
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

$sprintExists = git -C $RepoRoot rev-parse --verify $SprintBranch 2>$null
if (-not $sprintExists) {
  throw "Sprint branch not found: $SprintBranch"
}

$devExists = git -C $RepoRoot rev-parse --verify $DevBranch 2>$null
if (-not $devExists) {
  throw "Dev branch not found: $DevBranch"
}

git -C $RepoRoot checkout $SprintBranch | Out-Null

$mergeMsg = "merge: $DevBranch -> $SprintBranch (QA passed)"
git -C $RepoRoot merge --no-ff $DevBranch -m $mergeMsg

if ($Push) {
  git -C $RepoRoot push origin $SprintBranch
}

Write-Host "Merge gate passed and merged: $DevBranch -> $SprintBranch"
