# Game Train - One-click deploy
# Double-click DEPLOY.bat on your desktop to run this.

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Game Train Deploy ===" -ForegroundColor Cyan

# Use stored token for auth
$tokenFile = Join-Path $PSScriptRoot ".github-token"
if (Test-Path $tokenFile) {
    $token = (Get-Content $tokenFile -Raw).Trim()
    $remote = "https://aali2162:${token}@github.com/aali2162/arkham-horror-2026.git"
    git remote set-url origin $remote
}

# Clear stale lock files
$locks = @(".git\index.lock", ".git\HEAD.lock", ".git\refs\heads\main.lock")
foreach ($lock in $locks) {
    if (Test-Path $lock) { Remove-Item $lock -Force }
}

# Stage and commit any pending changes
$status = git status --porcelain 2>&1
if ($status) {
    Write-Host "Committing staged changes..." -ForegroundColor Yellow
    git add -A
    git commit -m "Session 11: Full Parchment redesign — end-to-end cream background across all pages"
    Write-Host "Committed." -ForegroundColor Green
} else {
    Write-Host "Nothing to commit." -ForegroundColor Gray
}

# Push
git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "DEPLOYED. Live in ~60s:" -ForegroundColor Green
    Write-Host "https://arkham-horror-2026.vercel.app" -ForegroundColor Cyan
    Start-Process "https://arkham-horror-2026.vercel.app"
} else {
    Write-Host "Push failed - check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to close..."
$x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
