@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules\" (
  echo Installing npm dependencies (first run)...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    cmd /k
    exit /b 1
  )
)

echo =========================================
echo Building Android APK with EAS (preview)
echo =========================================
echo.
echo Tip: If this window closes too fast, open "cmd" yourself, cd to this folder,
echo      then run: build-apk.bat
echo.

echo Checking Expo login status...
call npx --yes expo whoami
if errorlevel 1 (
  echo.
  echo You are not logged in to Expo.
  echo.
  echo --- Next step ---
  echo In the prompt below, run:  npx expo login
  echo When done, type:  exit
  echo Then run build-apk.bat again.
  echo.
  echo Keeping this window open with an interactive prompt...
  cmd /k
  exit /b 1
)

echo Starting cloud build...
REM Binary is "eas" (from devDependency eas-cli). Run "npm install" in this folder first.
call npx eas build --platform android --profile preview
if errorlevel 1 (
  echo Build failed.
  echo.
  echo Press any key to close this window, or run commands in the prompt below.
  cmd /k
  exit /b 1
)

echo Build command completed. Open the URL shown above to download APK.
echo.
pause
endlocal
