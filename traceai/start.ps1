Write-Host "================================================" -ForegroundColor Cyan
Write-Host " TRACEAI - AI-Powered Missing Person Assistant" -ForegroundColor White
Write-Host " IBM Bob x NFSU Hackathon 2026" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Backend (FastAPI on port 8000)..." -ForegroundColor Yellow
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:PYTHONIOENCODING='utf-8'; `$env:PYTHONUTF8='1'; python run.py" -WindowStyle Normal

Write-Host "Waiting for backend to initialize..."
Start-Sleep -Seconds 5

Write-Host "Starting Frontend (Vite on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " TRACEAI is starting up!" -ForegroundColor Green
Write-Host " Frontend: http://localhost:5173" -ForegroundColor White
Write-Host " Backend:  http://localhost:8000" -ForegroundColor White
Write-Host " API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host " Demo login:" -ForegroundColor Gray
Write-Host "   Email:    demo@nfsu.traceai" -ForegroundColor White
Write-Host "   Password: TraceAI@123" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser in 6 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"
