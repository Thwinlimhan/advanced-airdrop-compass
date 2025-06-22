@echo off
echo 🚀 Starting Airdrop Compass Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Start backend
echo 🔧 Starting backend server...
cd backend
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 Development environment is starting!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:3001
echo 🏥 Health:   http://localhost:3001/api/v1/health/health
echo.
echo Close the command windows to stop the servers
pause 