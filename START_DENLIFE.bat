@echo off
cd /d "%~dp0"
title DENLIFE Baslat

if not exist .env.local (
  echo.
  echo HATA: .env.local bulunamadi.
  echo Eski DENLIFE projenizdeki .env.local dosyasini bu klasore kopyalayin.
  echo Ayrintilar icin README_FIRST.txt dosyasini okuyun.
  pause
  exit /b 1
)

if not exist node_modules\next (
  echo DENLIFE paketleri kuruluyor...
  call npm install
  if errorlevel 1 goto error
)

echo DENLIFE sunucusu aciliyor...
start "DENLIFE Server" cmd /k "cd /d %~dp0 && npm run dev"
echo Sunucunun hazirlanmasi bekleniyor...
timeout /t 8 /nobreak >nul

echo Baslangic verileri senkronlaniyor...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/api/import/all' -TimeoutSec 40 | Out-Null } catch { Write-Host 'Otomatik senkron atlandi; site yine acilacak.' }"

start "" "http://localhost:3000"
exit /b 0

:error
echo.
echo Kurulum sirasinda hata olustu. Node.js LTS kurulu oldugundan emin olun.
pause
