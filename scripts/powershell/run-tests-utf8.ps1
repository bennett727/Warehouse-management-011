# PowerShell UTF-8 Test Runner
# This script sets UTF-8 encoding before running tests to avoid garbled Chinese characters

# Set output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Set PowerShell to use UTF-8
chcp 65001 | Out-Null

# Set environment variable for Node.js
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend Test Runner (UTF-8)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$frontendDir = Join-Path $projectRoot "frontend"
if (Test-Path $frontendDir) {
    Set-Location $frontendDir
} else {
    Write-Host "Error: Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Running tests with UTF-8 encoding..." -ForegroundColor Green
Write-Host ""

# Run tests
npm test -- --run --reporter=verbose

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tests completed" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
