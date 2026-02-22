@echo off
setlocal EnableDelayedExpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if exist .env (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set %%a=%%b
        )
    )
)

if not defined JAVA_HOME (
    echo ERROR: JAVA_HOME is not set in .env file or environment variables
    echo Please set JAVA_HOME in .env file
    pause
    exit /b 1
)

set PATH=%JAVA_HOME%\bin;%PATH%

if not defined MAVEN_OPTS (
    set MAVEN_OPTS=-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8
)

if not defined SPRING_PROFILES_ACTIVE (
    set SPRING_PROFILES_ACTIVE=dev
)

if not defined SERVER_PORT (
    set SERVER_PORT=8080
)

set JAR_FILE=target\spring_boot-0.0.1-SNAPSHOT.jar

if "%1"=="build" (
    echo ========================================
    echo Building Spring Boot application...
    echo ========================================
    echo Java Home: %JAVA_HOME%
    echo Maven Options: %MAVEN_OPTS%
    echo ========================================
    call mvnw.cmd clean package -DskipTests
    if %ERRORLEVEL% NEQ 0 (
        echo Build failed with error code %ERRORLEVEL%
        pause
        exit /b %ERRORLEVEL%
    )
    echo Build successful!
    goto :end
)

if "%1"=="run" (
    if not exist "%JAR_FILE%" (
        echo ERROR: JAR file not found at %JAR_FILE%
        echo Please run 'start.bat build' first
        pause
        exit /b 1
    )
    echo ========================================
    echo Starting Spring Boot application...
    echo ========================================
    echo Java Home: %JAVA_HOME%
    echo Maven Options: %MAVEN_OPTS%
    echo Spring Profile: %SPRING_PROFILES_ACTIVE%
    echo Server Port: %SERVER_PORT%
    echo ========================================
    "%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% -Dspring.profiles.active=%SPRING_PROFILES_ACTIVE% -Dserver.port=%SERVER_PORT% -jar "%JAR_FILE%"
    goto :end
)

if "%1"=="dev" (
    echo ========================================
    echo Running in development mode...
    echo ========================================
    call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=%SPRING_PROFILES_ACTIVE%
    goto :end
)

if "%1"=="clean" (
    echo ========================================
    echo Cleaning build artifacts...
    echo ========================================
    call mvnw.cmd clean
    goto :end
)

echo ========================================
echo Spring Boot Application Launcher
echo ========================================
echo Usage: start.bat [command]
echo.
echo Commands:
echo   build    - Build the application (mvn clean package)
echo   run      - Run the application from JAR file
echo   dev      - Run in development mode (mvn spring-boot:run)
echo   clean    - Clean build artifacts
echo.
echo Environment variables (set in .env):
echo   JAVA_HOME              - Java installation path
echo   MAVEN_OPTS             - Maven JVM options
echo   SPRING_PROFILES_ACTIVE - Spring profile (dev/prod)
echo   SERVER_PORT            - Server port (default: 8080)
echo ========================================

:end
endlocal
