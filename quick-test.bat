@echo off
echo ========================================
echo RIDE HISTORY QUICK TEST
echo ========================================
echo.

echo Step 1: Checking if backend is running...
netstat -ano | findstr :5000
if %errorlevel% neq 0 (
    echo [ERROR] Backend is NOT running on port 5000
    echo Please start backend: cd backend ^&^& npm start
    pause
    exit /b 1
) else (
    echo [OK] Backend is running on port 5000
)
echo.

echo Step 2: Checking database bookings...
node backend/checkBookings.js
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Open browser to http://localhost:5173
echo 2. Login as: musa@gmail.com
echo 3. Go to Customer Dashboard
echo 4. Click "Ride History" tab
echo 5. Press F12 to see console logs
echo.
echo Look for "=== RIDE HISTORY DEBUG ===" in console
echo ========================================
pause
