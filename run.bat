@echo off
setlocal EnableDelayedExpansion

title Ministry of Fisheries - Feedback Widget

cd /d "%~dp0"
set "PATH=%SystemRoot%\System32;%PATH%"

echo =========================================================
echo    Ministry of Fisheries - Feedback Widget Server
echo =========================================================
echo.

:: 1. Detect PHP executable
set "PHP_BIN="
for /f "delims=" %%I in ('where php 2^>nul') do if not defined PHP_BIN set "PHP_BIN=%%I"
if not defined PHP_BIN if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" (
    set "PHP_BIN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
) else if not defined PHP_BIN if exist "C:\xampp\php\php.exe" (
    set "PHP_BIN=C:\xampp\php\php.exe"
)

if "%PHP_BIN%"=="" (
    echo [ERROR] PHP was not found on your system!
    echo Please ensure PHP 8.1+ or XAMPP is installed.
    echo.
    pause
    exit /b 1
)

echo [OK] Using PHP: %PHP_BIN%

:: 1a. Verify the extensions required by the API
for %%I in ("%PHP_BIN%") do set "PHP_DIR=%%~dpI"
set "PHP_EXTENSION_ARGS="
set "MISSING_EXTENSIONS="
"%PHP_BIN%" -m | findstr /i /x "mbstring" >nul
if errorlevel 1 (
    if exist "%PHP_DIR%ext\php_mbstring.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=mbstring"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! mbstring"
    )
)
"%PHP_BIN%" -m | findstr /i /x "pdo_mysql" >nul
if errorlevel 1 (
    if exist "%PHP_DIR%ext\php_pdo_mysql.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=pdo_mysql"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! pdo_mysql"
    )
)
"%PHP_BIN%" -m | findstr /i /x "openssl" >nul
if errorlevel 1 (
    if exist "%PHP_DIR%ext\php_openssl.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=openssl"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! openssl"
    )
)
if defined PHP_EXTENSION_ARGS set "PHP_EXTENSION_ARGS=-d ""extension_dir=%PHP_DIR%ext"" !PHP_EXTENSION_ARGS!"
"%PHP_BIN%" %PHP_EXTENSION_ARGS% -m | findstr /i /x "mbstring" >nul
if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! mbstring"
"%PHP_BIN%" %PHP_EXTENSION_ARGS% -m | findstr /i /x "pdo_mysql" >nul
if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! pdo_mysql"
"%PHP_BIN%" %PHP_EXTENSION_ARGS% -m | findstr /i /x "openssl" >nul
if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! openssl"
if defined MISSING_EXTENSIONS (
    echo [ERROR] PHP is missing required extensions:%MISSING_EXTENSIONS%
    echo The API requires mbstring, pdo_mysql, and openssl.
    echo PHP configuration currently in use:
    "%PHP_BIN%" --ini
    echo Enable the missing extensions in that php.ini, then run this file again.
    echo.
    pause
    exit /b 1
)

:: 2. Check if MySQL is running
tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo [INFO] MySQL is not currently running. Attempting to start XAMPP MySQL...
    if exist "C:\xampp\mysql_start.bat" (
        start "" /b "C:\xampp\mysql_start.bat"
        timeout /t 3 >nul
    ) else (
        echo [WARNING] Please ensure MySQL/MariaDB service is running.
    )
) else (
    echo [OK] MySQL is running.
)

:: 3. Check configuration file
if not exist "app\config.php" (
    echo [INFO] app\config.php not found. Copying from config.sample.php...
    copy "app\config.sample.php" "app\config.php" >nul
    echo [WARNING] Please review app\config.php to verify your database settings!
)

:: 4. Start browser and server
set "HOST=127.0.0.1"
set "PORT=8000"
set "URL=http://localhost:%PORT%/"

echo.
echo =========================================================
echo  Application is running at: %URL%
echo  Press Ctrl+C in this window to stop the server.
echo =========================================================
echo.

:: Launch default browser
start "" "%URL%"

:: Run PHP built-in server serving public directory
"%PHP_BIN%" %PHP_EXTENSION_ARGS% -S %HOST%:%PORT% -t public

echo.
pause
