@echo off
chcp 65001 >nul
echo ==========================================
echo    仓库管理系统 - 一键部署脚本
echo ==========================================
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/4] 正在构建前端...
cd "%~dp0frontend"
call npm ci
if errorlevel 1 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

echo [2/4] 正在停止旧服务...
cd "%~dp0"
docker-compose down 2>nul

echo [3/4] 正在构建并启动服务...
docker-compose up --build -d
if errorlevel 1 (
    echo [错误] Docker构建失败
    pause
    exit /b 1
)

echo [4/4] 等待服务启动...
timeout /t 30 /nobreak >nul

echo.
echo ==========================================
echo    部署完成！
echo ==========================================
echo.
echo 访问地址: http://localhost
echo.
echo 默认账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 常用命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo.
pause
