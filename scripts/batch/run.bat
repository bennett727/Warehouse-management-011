@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 仓库管理系统 - 启动管理脚本
:: 用于启动、停止、重启和查看应用状态

:: 配置变量
set APP_NAME=spring_boot
set JAR_FILE=target\%APP_NAME%-0.0.1-SNAPSHOT.jar
set LOG_FILE=logs\spring-boot.log
set PORT=8080

:: 检查JAR文件是否存在
if not exist "%JAR_FILE%" (
    echo 错误: 未找到JAR文件: %JAR_FILE%
    echo 请先运行: mvn clean package -DskipTests
    pause
    exit /b 1
)

:: 检查Java环境
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Java运行环境，请确保已安装JDK 17或更高版本
    pause
    exit /b 1
)

:: 创建日志目录
if not exist "logs" mkdir logs

:: 检查命令行参数
if "%1"=="" goto menu
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs

echo 用法: %0 [start|stop|restart|status|logs]
echo.
echo 选项:
echo   start    - 启动应用
echo   stop     - 停止应用
echo   restart  - 重启应用
echo   status   - 查看应用状态
echo   logs     - 查看日志
echo.
echo 不带参数运行将显示菜单
pause
exit /b 0

:menu
cls
echo ========================================
echo 仓库管理系统 - 启动管理
echo ========================================
echo 1. 启动应用
echo 2. 停止应用
echo 3. 重启应用
echo 4. 查看应用状态
echo 5. 查看日志
echo 6. 启动并查看日志（推荐）
echo 0. 退出
echo ========================================
set /p choice=请选择操作 [0-6]: 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto start_with_logs
if "%choice%"=="0" goto exit

echo 无效的选择，请重新输入
timeout /t 2 >nul
goto menu

:start
:: 检查应用是否已在运行
call :check_running
if defined PID (
    echo 警告: 应用已在运行，进程ID: !PID!
    echo 端口: %PORT%
    pause
    goto menu
)

echo 启动应用...
echo JAR文件: %JAR_FILE%
echo 访问地址: http://localhost:%PORT%/api
echo API文档: http://localhost:%PORT%/api/swagger-ui.html
echo 日志文件: %LOG_FILE%
echo.

:: 启动应用（后台运行）
start "%APP_NAME%" java -jar "%JAR_FILE%" >nul 2>&1

:: 等待应用启动
set count=0
set max_count=30
:wait_start
timeout /t 1 >nul
set /a count+=1

call :check_running
if defined PID goto start_success

if %count% lss %max_count% goto wait_start

echo 错误: 应用启动超时
echo 请检查日志文件: %LOG_FILE%
pause
goto menu

:start_success
echo ========================================
echo 应用启动成功！
echo ========================================
echo 进程ID: !PID!
echo 访问地址: http://localhost:%PORT%/api
echo API文档: http://localhost:%PORT%/api/swagger-ui.html
echo 日志文件: %LOG_FILE%
echo ========================================
pause
goto menu

:start_with_logs
:: 检查应用是否已在运行
call :check_running
if defined PID (
    echo 警告: 应用已在运行，进程ID: !PID!
    echo 端口: %PORT%
    echo.
    set /p continue=是否要停止并重新启动？[Y/N]: 
    if /i "!continue!"=="Y" (
        call :stop
        timeout /t 2 >nul
    ) else (
        goto menu
    )
)

echo 启动应用并查看日志...
echo JAR文件: %JAR_FILE%
echo 访问地址: http://localhost:%PORT%/api
echo API文档: http://localhost:%PORT%/api/swagger-ui.html
echo 按 Ctrl+C 可停止查看日志（应用将继续运行）
echo.

:: 启动应用并实时显示日志
java -jar "%JAR_FILE%"

:: 如果应用异常退出
echo.
echo ========================================
echo 应用已停止
echo ========================================
pause
goto menu

:stop
call :check_running
if not defined PID (
    echo 应用未运行
    pause
    goto menu
)

echo 停止应用，进程ID: %PID%...

:: 尝试优雅停止
taskkill /PID %PID% /T >nul 2>&1

:: 等待进程终止
set count=0
set max_count=10
:wait_stop
timeout /t 1 >nul
set /a count+=1

call :check_running
if defined PID (
    if %count% lss %max_count% goto wait_stop
    
    :: 如果进程仍在运行，强制终止
    echo 警告: 应用未正常停止，正在强制终止...
    taskkill /F /PID %PID% >nul 2>&1
    timeout /t 1 >nul
)

echo 应用已停止
pause
goto menu

:restart
echo 正在重启应用...
call :stop
timeout /t 2 >nul
call :start
goto menu

:status
call :check_running
if defined PID (
    echo ========================================
    echo 应用运行状态: 已启动
    echo ========================================
    echo 进程ID: %PID%
    echo 端口: %PORT%
    echo 访问地址: http://localhost:%PORT%/api
    echo API文档: http://localhost:%PORT%/api/swagger-ui.html
    echo 日志文件: %LOG_FILE%
    echo ========================================
) else (
    echo ========================================
    echo 应用运行状态: 已停止
    echo ========================================
    echo 端口: %PORT%
    echo JAR文件: %JAR_FILE%
    echo ========================================
)
pause
goto menu

:logs
cls
echo ========================================
echo 查看日志
echo ========================================
echo 1. 实时查看完整日志
echo 2. 查看最近50行日志
echo 3. 查看错误日志
echo 0. 返回主菜单
echo ========================================
set /p log_choice=请选择 [0-3]: 

if "%log_choice%"=="1" goto watch_logs
if "%log_choice%"=="2" goto tail_logs
if "%log_choice%"=="3" goto error_logs
if "%log_choice%"=="0" goto menu

echo 无效的选择
timeout /t 2 >nul
goto logs

:watch_logs
cls
echo ========================================
echo 实时查看完整日志 (按 Ctrl+C 退出)
echo ========================================
echo.
if exist "%LOG_FILE%" (
    powershell -Command "Get-Content '%LOG_FILE%' -Wait -Tail 50"
) else (
    echo 日志文件不存在: %LOG_FILE%
    timeout /t 3 >nul
)
goto logs

:tail_logs
cls
echo ========================================
echo 最近50行日志
echo ========================================
echo.
if exist "%LOG_FILE%" (
    powershell -Command "Get-Content '%LOG_FILE%' -Tail 50"
) else (
    echo 日志文件不存在: %LOG_FILE%
)
echo.
pause
goto logs

:error_logs
cls
echo ========================================
echo 错误日志
echo ========================================
echo.
if exist "logs\error.log" (
    powershell -Command "Get-Content 'logs\error.log' -Tail 50"
) else (
    echo 错误日志文件不存在: logs\error.log
)
echo.
pause
goto logs

:check_running
:: 查找应用进程ID
set PID=
for /f "tokens=1" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    set PID=%%a
    goto :eof
)
goto :eof

:exit
echo 退出脚本...
endlocal
exit /b 0
