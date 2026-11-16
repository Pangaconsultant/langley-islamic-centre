@echo off
title Deploy Langley Islamic Centre (LIC) Portal to Vercel (No GitHub Required)
color 0B
echo ============================================================================
echo   LANGLEY ISLAMIC CENTRE (LIC) - DIRECT VERCEL CLOUD DEPLOYER
echo   Deploys directly from this folder on your PC to Vercel (No GitHub needed!)
echo ============================================================================
echo.
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"

echo Step 1: Logging in to your Vercel account in the browser...
call "C:\Program Files\nodejs\npx.cmd" vercel login

echo.
echo Step 2: Deploying LIC Portal directly to Production on Vercel...
echo (Press ENTER to accept the default answers when prompted)
call "C:\Program Files\nodejs\npx.cmd" vercel --prod

echo.
echo ============================================================================
echo   DEPLOYMENT COMPLETE! Copy your live https://...vercel.app link above!
echo ============================================================================
pause
