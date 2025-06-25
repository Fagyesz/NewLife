@echo off
echo ================================
echo   Firebase Deployment Script
echo ================================
echo.

echo [1/5] Creating production environment with API key...
powershell -Command "(Get-Content src/environments/environment.prod.ts) -replace 'REPLACE_WITH_YOUR_API_KEY', 'AIzaSyApSls7Q347UekrAeod0zkl-_srrvDNXro' | Set-Content src/environments/environment.prod.ts"

echo [2/5] Building Angular app for production...
call ng build --configuration=production
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Restoring secure environment file...
powershell -Command "(Get-Content src/environments/environment.prod.ts) -replace 'AIzaSyApSls7Q347UekrAeod0zkl-_srrvDNXro', 'REPLACE_WITH_YOUR_API_KEY' | Set-Content src/environments/environment.prod.ts"

echo [4/5] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo [5/5] ✅ Deployment successful!
echo.
echo Your app is live at: https://bapti-50b84.web.app
echo.
pause 