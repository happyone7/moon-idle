param(
  [string]$ComfyRoot = "C:\UnityProjects\Soulspire\Tools\ComfyUI",
  [int]$Port = 8188
)

$pythonExe = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $pythonExe) {
  throw "python not found. Install Python 3 and ensure python is on PATH."
}

if (-not (Test-Path $ComfyRoot)) {
  throw "ComfyUI 경로가 없습니다: $ComfyRoot"
}

Set-Location -LiteralPath $ComfyRoot
$mainPy = Join-Path -Path $ComfyRoot -ChildPath "main.py"
if (-not (Test-Path $mainPy)) {
  throw "main.py가 없습니다. ComfyUI 경로를 다시 확인하세요."
}

Write-Host "[ComfyUI] Starting server..."
Write-Host "  path: $ComfyRoot"
Write-Host "  port: $Port"
Write-Host "  stop: Ctrl + C"

& $pythonExe $mainPy --listen 0.0.0.0 --port $Port --enable-cors-header "*"
