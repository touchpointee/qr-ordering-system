@echo off
setlocal

cd /d "%~dp0"

echo =========================================
echo Building Android APK with EAS (preview)
echo =========================================

echo Checking Expo login status...
call npx expo whoami
if errorlevel 1 (
  echo You are not logged in to Expo.
  echo Run: npx expo login
  pause
  exit /b 1
)

echo Starting cloud build...
call npx eas build --platform android --profile preview
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo Build command completed. Open the URL shown above to download APK.
pause
endlocal
