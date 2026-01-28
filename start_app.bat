@echo off
SETLOCAL EnableDelayedExpansion
TITLE Viveka Vara Launcher (Local Mode)

echo ==========================================
echo       VIVEKA VARA - LOCAL STARTUP
echo ==========================================
echo.

cd /d "%~dp0"

REM --- Check for Node.js ---
node -v >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detected.
echo.

REM --- Check for Python ---
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] Python detected. Ensuring backend dependencies are installed...
pip install -r backend/requirements.txt
if !errorlevel! neq 0 (
    echo [WARNING] Failed to install some Python dependencies.
    echo The application might not function correctly.
)
echo.

REM --- Check for node_modules ---
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Environment check passed (Local Mode).
echo.

echo [INFO] Starting Emotion Bridge Backend...
start "Emotion AI Bridge" /min python backend/emotion_bridge.py
if %errorlevel% neq 0 (
    echo [WARNING] Failed to start Python backend automatically.
    echo Please run: python backend/emotion_bridge.py
)
echo.

echo [INFO] Starting Viveka Vara...
call npm run dev -- --open

if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Application failed to start.
    pause
)

ENDLOCAL
