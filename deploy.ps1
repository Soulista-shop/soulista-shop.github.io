# Push soulista.shop to origin/main (triggers Vercel deploy when the repo is connected).
# Run from PowerShell: .\deploy.ps1
# Optional: .\deploy.ps1 -Message "your commit message"
# Use -NoCommit to only push (skip auto-commit when you have local commits only).

param(
    [string] $Message = "",
    [switch] $NoCommit
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".git")) {
    Write-Error "No .git folder here. Run this script from the soulista.shop repo root (same folder as deploy.ps1)."
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") {
    Write-Warning "Current branch is '$branch', not 'main'. Pushing this branch anyway."
}

$dirty = git status --porcelain
if ($dirty -and -not $NoCommit) {
    $msg = if ($Message) { $Message } else { "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    Write-Host "Committing changes: $msg"
    git add -A
    git commit -m $msg
} elseif ($dirty -and $NoCommit) {
    Write-Warning "Working tree has uncommitted changes but -NoCommit was set. Push may fail or omit files."
}

Write-Host "Pushing to origin $branch ..."
git push origin $branch
Write-Host "Done. If Vercel is linked to this repo, a production deploy should start automatically."
