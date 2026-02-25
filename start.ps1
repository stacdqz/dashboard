Write-Host "===================================================" -ForegroundColor Green
Write-Host "              ZERO_OS Dashboard" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] Checking dependencies..." -ForegroundColor Cyan
npm install --silent

Write-Host "[2/2] Booting up Next.js server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "The dashboard will be available at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""
npm run dev
