@echo off
title 📦 Publicador Daniela Santos App
color 0A

echo.
echo ============================================================
echo    📱 DANIELA SANTOS - Unhas • Estética • Massagem
echo    🚀 Publicador Automático para GitHub Pages
echo ============================================================
echo.
echo 📂 Pasta: E:\3Software\Calendar Appointments (PWA) - Daniela Santos
echo 🌐 Site: https://gon-ca-lo.github.io/Calendar-Appointments-PWA---Daniela-Santos/
echo.

cd /d "E:\3Software\Calendar Appointments (PWA) - Daniela Santos"

echo 📝 Verificando alterações...
echo.
git status

echo.
echo ============================================================
echo.
echo 📌 Prima ENTER para adicionar todos os ficheiros...
pause > nul

echo.
echo 📌 A adicionar ficheiros modificados...
git add .
echo ✅ Ficheiros adicionados!

echo.
echo 💬 Escreva uma descrição para esta atualização:
set /p mensagem="> "

if "%mensagem%"=="" set mensagem="Atualização - %date% %time%"

echo.
echo 📦 A fazer commit...
git commit -m "%mensagem%"
echo ✅ Commit realizado!

echo.
echo ☁️  A enviar para GitHub...
git push

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo    ✅ PUBLICADO COM SUCESSO!
    echo    🌐 Site: https://gon-ca-lo.github.io/Calendar-Appointments-PWA---Daniela-Santos/
    echo    ⏱️  Atualização disponível em 2-5 minutos
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo    ❌ ERRO AO PUBLICAR!
    echo    Verifique a ligação à internet e tente novamente.
    echo ============================================================
)

echo.
echo Prima qualquer tecla para fechar...
pause > nul