@echo off
setlocal

echo Cleaning up old processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul

echo Starting MIET Chatbot System...

:: Start Backend
echo -----------------------------------
echo Starting Backend Server...
start "Backend Server" cmd /c "cd backend && if exist venv\Scripts\activate (call venv\Scripts\activate) && python main.py"

:: Start Frontend
echo -----------------------------------
echo Starting Frontend Server...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo -----------------------------------
echo Both servers are starting in new windows.
echo Check the individual windows for logs.
echo -----------------------------------
pause
