param(
  [string]$RepoRoot = (Get-Location).Path,
  [string]$SprintBranch = "sprint/1",
  [string]$MainBranch = "",
  [string]$WorktreeRoot = "",
  [string[]]$Agents = @("programmer", "ui", "qa", "design", "sound", "build")
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

function Ensure-Branch([string]$branch, [string]$startPoint) {
  git -C $RepoRoot show-ref --verify --quiet ("refs/heads/" + $branch)
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating branch: $branch from $startPoint"
    git -C $RepoRoot branch $branch $startPoint | Out-Null
  }
}

function Resolve-BaseBranch() {
  if ($MainBranch) { return $MainBranch }

  git -C $RepoRoot show-ref --verify --quiet refs/heads/main
  if ($LASTEXITCODE -eq 0) { return "main" }

  git -C $RepoRoot show-ref --verify --quiet refs/heads/master
  if ($LASTEXITCODE -eq 0) { return "master" }

  $current = git -C $RepoRoot rev-parse --abbrev-ref HEAD
  if ($current) { return $current.Trim() }

  throw "Could not resolve base branch. Pass -MainBranch explicitly."
}

Write-Host "RepoRoot: $RepoRoot"
git -C $RepoRoot rev-parse --is-inside-work-tree | Out-Null
git -C $RepoRoot fetch --all --prune
$baseBranch = Resolve-BaseBranch

git -C $RepoRoot show-ref --verify --quiet ("refs/heads/" + $SprintBranch)
if ($LASTEXITCODE -ne 0) {
  git -C $RepoRoot show-ref --verify --quiet ("refs/remotes/origin/" + $SprintBranch)
  if ($LASTEXITCODE -eq 0) {
    git -C $RepoRoot branch $SprintBranch "origin/$SprintBranch" | Out-Null
  } else {
    Ensure-Branch -branch $SprintBranch -startPoint $baseBranch
  }
}

$repoParent = if ($WorktreeRoot) { $WorktreeRoot } else { Split-Path -Parent $RepoRoot }
if (-not (Test-Path $repoParent)) {
  New-Item -ItemType Directory -Path $repoParent | Out-Null
}

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
