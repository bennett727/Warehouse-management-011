@echo off
chcp 65001 >nul
echo ==========================================
echo    仓库管理系统 - 生产环境启动脚本
echo ==========================================
echo.

REM 设置Java环境
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

REM 加载环境变量
if exist .env (
    echo [1/3] 正在加载环境变量...
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set %%a=%%b
        )
    )
) else (
    echo [错误] 未找到 .env 文件
    pause
    exit /b 1
)

echo [2/3] 环境变量加载完成
echo.
echo 配置信息：
echo   数据库: %DB_URL%
echo   用户名: %DB_USERNAME%
echo   激活配置: %SPRING_PROFILES_ACTIVE%
echo.

echo [3/3] 正在启动Spring Boot应用...
echo ==========================================
.
mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=prod"

pause
