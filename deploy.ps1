# Game Train - Auto Deploy
# Reads GitHub token and pushes all changes

$token = "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"
$repo = "aali2162/arkham-horror-2026"

Write-Host "=== Game Train Deploy ===" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Embed token in remote URL so no password prompt
$remote = "https://aali2162:$token@github.com/$repo.git"
git remote set-url origin $remote

# Stage everything
git add .

# Check if there is anything to commit
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes to deploy." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Deploy: $timestamp"

# Push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done! Vercel will be live in ~30 seconds:" -ForegroundColor Green
    Write-Host "https://arkham-horror-2026.vercel.app" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. See error above." -ForegroundColor Red
    Write-Host ""
}
