# Game Train - GitHub Push Script
# Paste these commands one at a time in PowerShell

# 1. Initialize git and commit
git init
git branch -M main
git config user.email "ahsan9ali@gmail.com"
git config user.name "Ahsan"
git add .
git commit -m "Initial commit - Arkham Horror 2026 Learning Companion"

# 2. Push to GitHub (browser login will pop up)
git remote add origin https://github.com/aali2162/arkham-horror-2026.git
git push -u origin main
