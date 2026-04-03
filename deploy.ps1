# Auto-deploy script for Game Train
# Double-click this file to push all changes to GitHub + auto-deploy to Vercel
# Requires: git installed

$token = Get-Content "$PSScriptRoot\.github-token" -Raw -ErrorAction SilentlyContinue
if (-not $token) { $token = "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" }
$token = $token.Trim()

$env:GIT_ASKPASS = "echo"
$env:GIT_USERNAME = "aali2162"
$env:GIT_PASSWORD = $token

Set-Location $PSScriptRoot

# Set remote with token embedded
$remote = "https://aali2162:$token@github.com/aali2162/arkham-horror-2026.git"
git remote set-url origin $remote 2>$null

git add .
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to deploy - no changes detected." -ForegroundColor Yellow
    Start-Sleep 2
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Deploy: $timestamp"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deployed! Vercel will be live in ~30 seconds." -ForegroundColor Green
    Write-Host "https://arkham-horror-2026.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host "Push failed - check output above." -ForegroundColor Red
}

Start-Sleep 3
