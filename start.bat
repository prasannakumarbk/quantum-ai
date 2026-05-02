@echo off
echo Starting QuantumCopilot Backend...
cd /d "%~dp0backend"
start "QuantumCopilot Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo.
echo Starting QuantumCopilot Frontend...
cd /d "%~dp0frontend"
start "QuantumCopilot Frontend" cmd /k "npm run dev"
echo.
echo QuantumCopilot is starting!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo Docs:     http://localhost:8000/docs
timeout /t 3
start http://localhost:5173
