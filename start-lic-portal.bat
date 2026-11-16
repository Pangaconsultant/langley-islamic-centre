@echo off
title Langley Islamic Centre (LIC) - Portal Server
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"
if not exist "node_modules" (
    echo Installing Next.js dependencies...
    call "C:\Program Files\nodejs\npm.cmd" install
)
echo Starting Langley Islamic Centre Portal on http://localhost:3000 ...
start "" "http://localhost:3000"
call "C:\Program Files\nodejs\npm.cmd" run dev
pause
