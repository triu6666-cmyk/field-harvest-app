@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo  収穫量管理アプリ - スマホ確認サーバー
echo ========================================
echo.
echo Windowsの許可画面が出た場合は「プライベートネットワーク」を許可してください。
echo.
"C:\Users\kouki kojima\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-server.js
echo.
echo サーバーが終了しました。
pause
