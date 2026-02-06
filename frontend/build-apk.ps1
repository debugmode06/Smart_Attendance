# Vidyatra APK Build Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Vidyatra APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Build the React app
Write-Host "`n[1/4] Building React frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend build successful!" -ForegroundColor Green

# Step 2: Sync with Capacitor
Write-Host "`n[2/4] Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Capacitor sync failed" -ForegroundColor Red
    exit 1
}

Write-Host "Capacitor sync successful!" -ForegroundColor Green

# Step 3: Build Debug APK
Write-Host "`n[3/4] Building Debug APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: APK build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "Debug APK built successfully!" -ForegroundColor Green

# Step 4: Locate APK
Write-Host "`n[4/4] Locating APK file..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " Build Complete! " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nAPK Location:" -ForegroundColor Yellow
    Write-Host "  $apkPath" -ForegroundColor White
    
    $fullPath = Resolve-Path $apkPath
    Write-Host "`nFull Path:" -ForegroundColor Yellow
    Write-Host "  $fullPath" -ForegroundColor White
    
    # Copy to root for easy access
    Copy-Item $apkPath "vidyatra-debug.apk"
    Write-Host "`nCopied to: vidyatra-debug.apk" -ForegroundColor Green
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Transfer APK to your Android device" -ForegroundColor White
    Write-Host "2. Enable 'Install from Unknown Sources'" -ForegroundColor White
    Write-Host "3. Install the APK" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: APK not found at expected location" -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
