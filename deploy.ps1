# Game Train — One-click deploy
# Double-click DEPLOY.bat on your desktop to run this silently.
# Requirements: .github-token file in project root (one-time setup, already done if push works)

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Game Train Deploy ===" -ForegroundColor Cyan

# Use stored token for auth (avoids interactive prompts)
$tokenFile = Join-Path $PSScriptRoot ".github-token"
if (Test-Path $tokenFile) {
    $token = (Get-Content $tokenFile -Raw).Trim()
    $remote = "https://aali2162:$token@github.com/aali2162/arkham-horror-2026.git"
    git remote set-url origin $remote
}

# Clear stale lock files
".git\index.lock", ".git\HEAD.lock", ".git\refs\heads\main.lock" | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Force }
}

# Push (commits are already prepared by Claude in the sandbox)
git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "DEPLOYED. Live in ~60s:" -ForegroundColor Green
    Write-Host "https://arkham-horror-2026.vercel.app" -ForegroundColor Cyan
    Start-Process "https://arkham-horror-2026.vercel.app"
} else {
    Write-Host "Push failed — check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
