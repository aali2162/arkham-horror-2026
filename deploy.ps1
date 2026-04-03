# Game Train - Auto Deploy
# Double-click DEPLOY.bat to run this

Set-Location $PSScriptRoot

$remote = "https://aali2162:$(Get-Content $PSScriptRoot\.github-token -Raw)@github.com/aali2162/arkham-horror-2026.git".Trim()
git remote set-url origin $remote

git add .
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "Nothing to deploy." -ForegroundColor Yellow
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Deploy: $timestamp"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Live in ~30s: https://arkham-horror-2026.vercel.app" -ForegroundColor Green
} else {
    Write-Host "Push failed." -ForegroundColor Red
}
