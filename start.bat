@echo off
echo ========================================================
echo Starting ProofWork: Electrician Skill Passport & Matching
echo ========================================================

echo 1. Starting Backend API on http://127.0.0.1:8000 ...
start "ProofWork Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo 2. Starting Frontend Web App on http://127.0.0.1:5173 ...
start "ProofWork Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo ProofWork is now launching!
echo Frontend: http://127.0.0.1:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Demo Worker Login: +919845012341 (OTP: 123456)
echo Demo Contractor Login: +919900112233 (OTP: 123456)
echo ========================================================
pause
