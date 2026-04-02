# Game Train - Arkham Horror 2026 - Deployment Script
# Run from: C:\Users\alix4\Game Train\arkham-horror-2026\

Write-Host ""
Write-Host "=== GAME TRAIN DEPLOYMENT SCRIPT ===" -ForegroundColor Cyan
Write-Host ""

# STEP 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: git not found. Install from https://git-scm.com" -ForegroundColor Red
    exit 1
}
Write-Host "  git found" -ForegroundColor Green

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) not found." -ForegroundColor Red
    Write-Host "  Install: winget install GitHub.cli" -ForegroundColor Yellow
    Write-Host "  Then run: gh auth login" -ForegroundColor Yellow
    exit 1
}
Write-Host "  GitHub CLI (gh) found" -ForegroundColor Green

$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub CLI not authenticated. Running gh auth login..." -ForegroundColor Yellow
    gh auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Auth failed. Exiting." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  GitHub CLI authenticated" -ForegroundColor Green

# STEP 2: Initialize git repo
Write-Host ""
Write-Host "Step 2: Initializing git repository..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    Write-Host "  Git initialized" -ForegroundColor Green
} else {
    Write-Host "  Git already initialized" -ForegroundColor Green
}

git config user.email "ahsan9ali@gmail.com"
git config user.name "Ahsan"

# STEP 3: Create .gitignore
if (-not (Test-Path ".gitignore")) {
    $gitignoreContent = "node_modules/`n/.next/`n/out/`n.env`n.env.local`n.env.development.local`n.env.test.local`n.env.production.local`n.vercel`n*.tsbuildinfo`nnext-env.d.ts`n.DS_Store`nThumbs.db"
    Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
    Write-Host "  Created .gitignore" -ForegroundColor Green
}

# STEP 4: Stage and commit
Write-Host ""
Write-Host "Step 3: Staging and committing files..." -ForegroundColor Yellow

git add .
git commit -m "Initial commit - Arkham Horror 2026 Learning Companion"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Nothing new to commit (already committed)" -ForegroundColor Yellow
} else {
    Write-Host "  Committed" -ForegroundColor Green
}

# STEP 5: Create GitHub repo and push
Write-Host ""
Write-Host "Step 4: Creating GitHub repo and pushing..." -ForegroundColor Yellow

$repoCheck = gh repo view aali2162/arkham-horror-2026 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Repo already exists on GitHub" -ForegroundColor Yellow
    $remoteCheck = git remote get-url origin 2>&1
    if ($LASTEXITCODE -ne 0) {
        git remote add origin https://github.com/aali2162/arkham-horror-2026.git
    }
} else {
    gh repo create arkham-horror-2026 --private --source=. --remote=origin --description "Arkham Horror: The Card Game 2026 - Interactive Learning Companion"
    Write-Host "  GitHub repo created" -ForegroundColor Green
}

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    git push -u origin main --force
}
Write-Host "  Pushed to GitHub" -ForegroundColor Green

# STEP 6: Deploy to Vercel
Write-Host ""
Write-Host "Step 5: Deploying to Vercel..." -ForegroundColor Yellow

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "  Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

$supabaseUrl = "https://etkmpjioayiqpsjruqre.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0a21wamlvYXlpcXBzanJ1cXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY2ODQsImV4cCI6MjA5MDcyMjY4NH0.-kazRGVLbNZNml6bVOIuVJwfIXh_08yllQEI3EsKLGQ"

vercel --yes --name arkham-horror-2026 --env NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl --env NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "  Your app is live - check above for URL" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "Vercel deploy had an issue - see output above." -ForegroundColor Yellow
    Write-Host "Manual fallback: vercel.com/new -> import arkham-horror-2026 repo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next: Test in 2 browsers for real-time sync, share with Tania" -ForegroundColor Cyan
