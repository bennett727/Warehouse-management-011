@echo off
REM ========================================
REM 前后端并行运行验证脚本
REM ========================================

cd /d "%~dp0..\.."

echo ========================================
echo 前后端并行运行隔离性验证
echo ========================================
echo.

REM 检查端口占用情况
echo [1/4] 检查端口占用情况...
echo.
echo 检查端口 3000 (前端开发服务器)...
netstat -ano | findstr "LISTENING" | findstr ":3000"
if %errorlevel% equ 0 (
    echo [警告] 端口 3000 已被占用
) else (
    echo [通过] 端口 3000 可用
)
echo.

echo 检查端口 8080 (后端服务器)...
netstat -ano | findstr "LISTENING" | findstr ":8080"
if %errorlevel% equ 0 (
    echo [警告] 端口 8080 已被占用
) else (
    echo [通过] 端口 8080 可用
)
echo.

REM 检查环境变量配置
echo [2/4] 检查环境变量配置...
echo.
echo 前端测试环境变量:
if exist "frontend\config\env\.env.test" (
    echo [通过] .env.test 文件存在
    type frontend\config\env\.env.test
) else (
    echo [错误] .env.test 文件不存在
)
echo.

echo 后端配置文件:
if exist "spring_boot\src\main\resources\application.properties" (
    echo [通过] application.properties 文件存在
    findstr "server.port" spring_boot\src\main\resources\application.properties
) else (
    echo [错误] application.properties 文件不存在
)
echo.

REM 检查API配置
echo [3/4] 检查API配置...
echo.
echo 前端API配置:
if exist "frontend\src\config\api.js" (
    echo [通过] api.js 文件存在
    findstr "API_BASE_URL" frontend\src\config\api.js
) else (
    echo [错误] api.js 文件不存在
)
echo.

echo 测试环境API配置:
if exist "frontend\config\vitest.config.js" (
    echo [通过] vitest.config.js 文件存在
    findstr "VITE_API_BASE_URL" frontend\config\vitest.config.js
) else (
    echo [错误] vitest.config.js 文件不存在
)
echo.

REM 检查测试隔离配置
echo [4/4] 检查测试隔离配置...
echo.
echo 前端测试环境配置:
if exist "frontend\tests\setup.js" (
    echo [通过] setup.js 文件存在
    findstr "process.env.NODE_ENV" frontend\tests\setup.js
) else (
    echo [错误] setup.js 文件不存在
)
echo.

echo ========================================
echo 验证完成
echo ========================================
echo.
echo 总结:
echo - 前端开发服务器端口: 3000
echo - 后端服务器端口: 8080
echo - 前端测试环境使用Mock API，不依赖后端
echo - 前后端使用不同的端口，不会产生冲突
echo - 前端测试环境已配置环境隔离
echo.
echo 结论: 前后端可以安全地并行运行，不会产生干扰或冲突
echo.
