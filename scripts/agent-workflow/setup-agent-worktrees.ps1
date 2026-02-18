param(
  [string]$RepoRoot = (Get-Location).Path,
  [string]$SprintBranch = "sprint/1",
  [string]$MainBranch = "main",
  [string[]]$Agents = @("programmer", "ui", "qa", "design", "sound", "build")
)

$ErrorActionPreference = "Stop"

function Ensure-Branch([string]$branch, [string]$startPoint) {
  $exists = git -C $RepoRoot rev-parse --verify $branch 2>$null
  if (-not $exists) {
    Write-Host "Creating branch: $branch from $startPoint"
    git -C $RepoRoot branch $branch $startPoint | Out-Null
  }
}

Write-Host "RepoRoot: $RepoRoot"
git -C $RepoRoot rev-parse --is-inside-work-tree | Out-Null
git -C $RepoRoot fetch --all --prune

$sprintExists = git -C $RepoRoot rev-parse --verify $SprintBranch 2>$null
if (-not $sprintExists) {
  $remoteSprint = git -C $RepoRoot rev-parse --verify "origin/$SprintBranch" 2>$null
  if ($remoteSprint) {
    git -C $RepoRoot branch $SprintBranch "origin/$SprintBranch" | Out-Null
  } else {
    Ensure-Branch -branch $SprintBranch -startPoint $MainBranch
  }
}

$repoParent = Split-Path -Parent $RepoRoot

foreach ($agent in $Agents) {
  $devBranch = "dev/$agent"
  Ensure-Branch -branch $devBranch -startPoint $SprintBranch

  $wtPath = Join-Path $repoParent ("wt-dev-" + $agent)
  if (Test-Path $wtPath) {
    Write-Host "Worktree exists: $wtPath"
  } else {
    Write-Host "Adding worktree: $wtPath -> $devBranch"
    git -C $RepoRoot worktree add $wtPath $devBranch | Out-Null
  }
}

Write-Host "Done. Current worktrees:"
git -C $RepoRoot worktree list
