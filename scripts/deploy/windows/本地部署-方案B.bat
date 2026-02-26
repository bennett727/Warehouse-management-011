@echo off
chcp 65001 >nul
echo ==========================================
echo    仓库管理系统 - 本地部署方案B
echo    （使用现有开发环境）
echo ==========================================
echo.

REM 检查MySQL是否运行
mysql -u root -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [错误] MySQL未运行，请先启动MySQL
    echo.
    echo 启动方法：
    echo   1. 打开服务管理器：services.msc
    echo   2. 找到 MySQL 服务
    echo   3. 点击启动
    echo.
    pause
    exit /b 1
)

echo [1/3] 检查数据库...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
mysql -u root -e "CREATE USER IF NOT EXISTS 'wms'@'localhost' IDENTIFIED BY 'wms123';" 2>nul
mysql -u root -e "GRANT ALL PRIVILEGES ON warehouse.* TO 'wms'@'localhost';" 2>nul
mysql -u root -e "FLUSH PRIVILEGES;" 2>nul
echo [OK] 数据库准备完成

echo.
echo [2/3] 构建前端...
cd "%~dp0frontend"
call npm run build 2>nul
if errorlevel 1 (
    echo [提示] 前端构建失败，使用开发模式运行
    set FRONTEND_MODE=dev
) else (
    echo [OK] 前端构建完成
    set FRONTEND_MODE=prod
)

echo.
echo [3/3] 启动服务...
echo.

REM 创建启动脚本
cd "%~dp0"
(
echo @echo off
echo chcp 65001 ^>nul
echo echo ==========================================
echo echo    仓库管理系统 - 本地运行
echo ==========================================
echo echo.
echo echo 正在启动后端服务...
echo echo 数据库: MySQL localhost:3306/warehouse
echo echo 后端API: http://localhost:8080/api
echo echo.
echo cd "%~dp0spring_boot"
echo set DB_URL=jdbc:mysql://localhost:3306/warehouse?useSSL=false^&serverTimezone=Asia/Shanghai
echo set DB_USERNAME=wms
echo set DB_PASSWORD=wms123
echo set JWT_SECRET=wL9vQk2mP8xN3bK7jH5gF1dS6aZ4cX9wL9vQk2mP8xN3bK7jH5gF1dS6aZ4cX9
echo set CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
echo set DDL_AUTO=update
echo call mvn spring-boot:run -Dspring-boot.run.profiles=default
echo pause
) > "启动后端.bat"

echo ==========================================
echo    部署完成！
echo ==========================================
echo.
echo 请按以下步骤操作：
echo.
echo 【步骤1】启动后端
echo    双击运行：启动后端.bat
echo    等待看到 "Started Application" 字样
echo.
echo 【步骤2】启动前端（二选一）
echo.
if "%FRONTEND_MODE%"=="prod" (
    echo    方案A - 生产模式（推荐）：
    echo    1. 安装Nginx或任何静态服务器
    echo    2. 将 frontend/dist 目录作为根目录
    echo    3. 访问 http://localhost
echo.
    echo    方案B - 开发模式：
    echo    1. 打开新终端
echo    2. cd frontend
echo    3. npm run dev
echo    4. 访问 http://localhost:5173
) else (
    echo    开发模式：
    echo    1. 打开新终端
echo    2. cd frontend
echo    3. npm run dev
echo    4. 访问 http://localhost:5173
)
echo.
echo 默认账号：
echo   用户名：admin
echo   密码：admin123
echo.
echo ==========================================
echo.
pause
