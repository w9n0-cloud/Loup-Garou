@echo off
REM ════════════════════════════════════════════════════════════
REM 🐺 LA MEUTE - Script de Build (Windows)
REM ════════════════════════════════════════════════════════════
REM Crée les archives client et serveur du modpack
REM Usage: build.bat [client|server|all]
REM ════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM Configuration
for /f "tokens=2" %%a in ('findstr /C:"VERSION:" VERSION.txt') do set VERSION=%%a
set CLIENT_NAME=LaMeute-Client-%VERSION%.zip
set SERVER_NAME=LaMeute-Server-%VERSION%.zip

echo ════════════════════════════════════════════════════
echo 🐺 LA MEUTE - Build Script v%VERSION%
echo ════════════════════════════════════════════════════
echo.

REM Vérifier si 7zip est installé
where 7z >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 7-Zip n'est pas installé !
    echo    Téléchargez-le sur https://www.7-zip.org/
    pause
    exit /b 1
)

REM Menu principal
set ACTION=%1
if "%ACTION%"=="" set ACTION=all

if "%ACTION%"=="client" goto build_client
if "%ACTION%"=="server" goto build_server
if "%ACTION%"=="all" goto build_all
goto usage

:build_client
echo 📦 Construction du client...
if exist build\client rmdir /s /q build\client
mkdir build\client

echo   ├─ Copie de manifest.json...
copy manifest.json build\client\ >nul

echo   ├─ Copie de modrinth.index.json...
copy modrinth.index.json build\client\ >nul

echo   ├─ Copie du dossier overrides...
xcopy overrides build\client\overrides\ /E /I /Q >nul

echo   ├─ Création de l'archive ZIP...
cd build\client
7z a -tzip "..\..\%CLIENT_NAME%" * >nul
cd ..\..

echo   └─ Nettoyage...
rmdir /s /q build\client

echo ✅ Client construit : %CLIENT_NAME%
echo.
if "%ACTION%"=="client" goto end
goto build_server

:build_server
echo 🖥️  Construction du serveur...
if exist build\server rmdir /s /q build\server
mkdir build\server

echo   ├─ Copie des fichiers serveur...
if exist server xcopy server build\server\ /E /I /Q >nul

echo   ├─ Copie de kubejs...
mkdir build\server\kubejs
xcopy overrides\kubejs\server_scripts build\server\kubejs\server_scripts\ /E /I /Q >nul
if exist overrides\kubejs\startup_scripts xcopy overrides\kubejs\startup_scripts build\server\kubejs\startup_scripts\ /E /I /Q >nul

echo   ├─ Copie des configs...
mkdir build\server\config
xcopy overrides\config build\server\config\ /E /I /Q >nul

echo   ├─ Copie des mods...
mkdir build\server\mods
if exist overrides\mods\*.jar copy overrides\mods\*.jar build\server\mods\ >nul 2>nul

echo   ├─ Création du README...
(
echo # 🐺 LA MEUTE - Serveur
echo.
echo ## Installation
echo.
echo 1. Installez Forge 47.2.0 pour Minecraft 1.20.1
echo 2. Copiez tous les fichiers dans le dossier du serveur
echo 3. Acceptez l'EULA ^(éditez eula.txt^)
echo 4. Lancez avec start.bat
echo.
echo ## Configuration
echo.
echo - Éditez server.properties pour la configuration
echo - RAM recommandée : 4-8 GB
echo - Ports : 25565 ^(TCP^)
echo.
echo ## Support
echo.
echo Voir le CHANGELOG.md principal pour les updates.
) > build\server\README.md

echo   ├─ Création de l'archive ZIP...
cd build\server
7z a -tzip "..\..\%SERVER_NAME%" * >nul
cd ..\..

echo   └─ Nettoyage...
rmdir /s /q build\server

echo ✅ Serveur construit : %SERVER_NAME%
echo.
goto end

:build_all
call :build_client
call :build_server
goto end

:usage
echo ❌ Usage: %0 [client^|server^|all]
exit /b 1

:end
echo ════════════════════════════════════════════════════
echo ✨ Build terminé !
echo ════════════════════════════════════════════════════
echo.
echo 📦 Fichiers créés :
dir /b *.zip 2>nul
echo.
echo 💡 Prochaines étapes :
echo   1. Testez les archives
echo   2. Upload sur CurseForge/Modrinth
echo   3. Mettez à jour le CHANGELOG.md
echo   4. Créez un tag git: git tag v%VERSION%
echo.
echo 🐺 Que la chasse commence ! 🌕
pause
