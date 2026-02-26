@echo off
chcp 65001 >nul
echo ==========================================
echo    仓库管理系统 - 数据库重置脚本
echo ==========================================
echo.

echo [1/2] 正在重置数据库...
mysql -u root -p123456 -e "DROP DATABASE IF EXISTS warehouse; CREATE DATABASE warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo [错误] 数据库重置失败，请检查MySQL密码
    pause
    exit /b 1
)

echo [2/2] 数据库重置完成
echo ==========================================
pause
