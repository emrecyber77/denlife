@echo off
cd /d "%~dp0"
title DENLIFE Kurulum
echo DENLIFE paketleri kuruluyor...
call npm install
if errorlevel 1 goto error
echo.
echo Kurulum tamamlandi. Bundan sonra START_DENLIFE.bat dosyasini acabilirsin.
pause
exit /b
:error
echo Kurulum basarisiz. Node.js LTS kurulu oldugundan emin ol.
pause
