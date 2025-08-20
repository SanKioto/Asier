@echo off
cd /d "%~dp0"

REM Ajustar tamaño de la consola: 60 columnas x 30 líneas
mode con: cols=60 lines=30

REM Ejecutar start.js que maneja Asier y maestro.js
node start.js

pause
