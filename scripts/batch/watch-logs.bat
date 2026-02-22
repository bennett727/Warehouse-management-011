@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 仓库管理系统 - 实时日志监控脚本
:: 用于实时查看应用日志

:menu
cls
echo ========================================
echo 仓库管理系统 - 日志监控
echo ========================================
echo 1. 实时查看完整日志 (spring-boot.log)
echo 2. 实时查看错误日志 (error.log)
echo 3. 实时查看设备日志 (device.log)
echo 4. 实时查看库存日志 (stock.log)
echo 5. 实时查看安全日志 (security.log)
echo 6. 实时查看Tomcat访问日志 (access_log)
echo 7. 查看最近50行完整日志
echo 8. 查看最近50行错误日志
echo 0. 退出
echo ========================================
set /p choice=请选择要查看的日志 [0-8]: 

if "%choice%"=="1" goto watch_all
if "%choice%"=="2" goto watch_error
if "%choice%"=="3" goto watch_device
if "%choice%"=="4" goto watch_stock
if "%choice%"=="5" goto watch_security
if "%choice%"=="6" goto watch_access
if "%choice%"=="7" goto tail_all
if "%choice%"=="8" goto tail_error
if "%choice%"=="0" goto exit

echo 无效的选择，请重新输入
timeout /t 2 >nul
goto menu

:watch_all
cls
echo ========================================
echo 实时查看完整日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-Content 'logs\spring-boot.log' -Wait -Tail 50"
goto menu

:watch_error
cls
echo ========================================
echo 实时查看错误日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-Content 'logs\error.log' -Wait -Tail 50"
goto menu

:watch_device
cls
echo ========================================
echo 实时查看设备日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-Content 'logs\device.log' -Wait -Tail 50"
goto menu

:watch_stock
cls
echo ========================================
echo 实时查看库存日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-Content 'logs\stock.log' -Wait -Tail 50"
goto menu

:watch_security
cls
echo ========================================
echo 实时查看安全日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-Content 'logs\security.log' -Wait -Tail 50"
goto menu

:watch_access
cls
echo ========================================
echo 实时查看Tomcat访问日志 (按 Ctrl+C 退出)
echo ========================================
echo.
powershell -Command "Get-ChildItem 'logs\tomcat\access_log*.log' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content $_.FullName -Wait -Tail 50 }"
goto menu

:tail_all
cls
echo ========================================
echo 最近50行完整日志
echo ========================================
echo.
powershell -Command "Get-Content 'logs\spring-boot.log' -Tail 50"
echo.
pause
goto menu

:tail_error
cls
echo ========================================
echo 最近50行错误日志
echo ========================================
echo.
powershell -Command "Get-Content 'logs\error.log' -Tail 50"
echo.
pause
goto menu

:exit
echo 退出日志监控...
endlocal
exit /b 0
