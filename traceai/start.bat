@echo off
echo ================================================
echo  TRACEAI - AI-Powered Missing Person Assistant
echo  IBM Bob x NFSU Hackathon 2026
echo ================================================
echo.

echo Starting Backend (FastAPI on port 8000)...
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
start "TRACEAI Backend" cmd /k "cd /d %~dp0backend && python run.py"

echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo Starting Frontend (Vite on port 5173)...
start "TRACEAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================================
echo  TRACEAI is starting up!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo.
echo  Demo login:
echo    Email:    demo@nfsu.traceai
echo    Password: TraceAI@123
echo ================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
