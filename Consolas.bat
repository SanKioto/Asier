@echo off
:: -------------------------------
:: Script para ejecutar SKB y ASIER
:: -------------------------------

:: Rutas de los bots
set SKB_PATH=C:\Users\SanKioto\Documents\Grimorio\bot-py\bot-lite\prueva.js
set ASIER_PATH=C:\Users\SanKioto\Documents\Grimorio\bot-py\bot-lite\asier.js

:REINICIO
echo --------------------------------------
echo Iniciando SKB (BOT)...
echo --------------------------------------
start "" /B cmd /c "node "%SKB_PATH%" && echo SKB cerrado || echo SKB fallo"

echo --------------------------------------
echo Iniciando ASIER (BOT)...
echo --------------------------------------
start "" /B cmd /c "node "%ASIER_PATH%" && echo ASIER cerrado || echo ASIER fallo"

echo --------------------------------------
echo Ambos bots iniciados. Monitoreando...
echo --------------------------------------

:: Espera 10 segundos antes de volver a comprobar
timeout /t 10 >nul

:: Volver al inicio para reiniciar los bots si alguno se cerró
goto REINICIO
