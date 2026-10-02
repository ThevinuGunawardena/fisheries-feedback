@echo off
setlocal EnableDelayedExpansion

title Ministry of Fisheries - Feedback Widget

cd /d "%~dp0"

:: Ensure Windows System32 utilities (find, findstr, tasklist, where, timeout, ping) are in PATH
if not defined SystemRoot set "SystemRoot=C:\Windows"
set "PATH=%SystemRoot%\System32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SystemRoot%\System32\WindowsPowerShell\v1.0\;%PATH%"

echo =========================================================
echo    Ministry of Fisheries - Feedback Widget Server

echo =========================================================
echo.

:: 1. Detect PHP executable
set "PHP_BIN="
for /f "delims=" %%I in ('where php 2^>nul') do if not defined PHP_BIN set "PHP_BIN=%%I"
if not defined PHP_BIN if exist "C:\xampp\php\php.exe" set "PHP_BIN=C:\xampp\php\php.exe"
if not defined PHP_BIN if exist "D:\xampp\php\php.exe" set "PHP_BIN=D:\xampp\php\php.exe"
if not defined PHP_BIN if exist "E:\xampp\php\php.exe" set "PHP_BIN=E:\xampp\php\php.exe"
if not defined PHP_BIN if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" (
    set "PHP_BIN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
)
if not defined PHP_BIN if exist "C:\php\php.exe" set "PHP_BIN=C:\php\php.exe"
if not defined PHP_BIN if exist "C:\tools\php\php.exe" set "PHP_BIN=C:\tools\php\php.exe"

if "%PHP_BIN%"=="" (
    echo [ERROR] PHP was not found on your system!
    echo Please ensure PHP 8.1+ or XAMPP is installed.
    echo You can download XAMPP from: https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Using PHP: %PHP_BIN%

for %%I in ("%PHP_BIN%") do set "PHP_DIR=%%~dpI"

:: Add PHP and MySQL bin directories to PATH if found
if exist "!PHP_DIR!" set "PATH=!PHP_DIR!;!PATH!"
if exist "!PHP_DIR!..\mysql\bin" set "PATH=!PHP_DIR!..\mysql\bin;!PATH!"

:: If php.ini does not exist in the PHP directory, but exists in XAMPP root (e.g. C:\xampp\php.ini), copy it over
if not exist "!PHP_DIR!php.ini" (
    if exist "!PHP_DIR!..\php.ini" (
        copy /y "!PHP_DIR!..\php.ini" "!PHP_DIR!php.ini" >nul 2>nul
        echo [INFO] Configured php.ini from !PHP_DIR!..\php.ini
    )
)

:: 1a. Verify extensions required by the application
set "PHP_EXTENSION_ARGS="
set "MISSING_EXTENSIONS="

:: Check mbstring
"!PHP_BIN!" -r "exit(extension_loaded('mbstring') ? 0 : 1);" >nul 2>nul
if errorlevel 1 (
    if exist "!PHP_DIR!ext\php_mbstring.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=mbstring"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! mbstring"
    )
)

:: Check pdo_mysql
"!PHP_BIN!" -r "exit(extension_loaded('pdo_mysql') ? 0 : 1);" >nul 2>nul
if errorlevel 1 (
    if exist "!PHP_DIR!ext\php_pdo_mysql.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=pdo_mysql"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! pdo_mysql"
    )
)

:: Check openssl
"!PHP_BIN!" -r "exit(extension_loaded('openssl') ? 0 : 1);" >nul 2>nul
if errorlevel 1 (
    if exist "!PHP_DIR!ext\php_openssl.dll" (
        set "PHP_EXTENSION_ARGS=!PHP_EXTENSION_ARGS! -d extension=openssl"
    ) else (
        set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! openssl"
    )
)

:: If dynamic extension flags are needed, prepend extension_dir and verify
if defined PHP_EXTENSION_ARGS (
    set "PHP_EXTENSION_ARGS=-d extension_dir=""!PHP_DIR!ext"" !PHP_EXTENSION_ARGS!"
    "!PHP_BIN!" !PHP_EXTENSION_ARGS! -r "exit(extension_loaded('mbstring') ? 0 : 1);" >nul 2>nul
    if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! mbstring"
    "!PHP_BIN!" !PHP_EXTENSION_ARGS! -r "exit(extension_loaded('pdo_mysql') ? 0 : 1);" >nul 2>nul
    if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! pdo_mysql"
    "!PHP_BIN!" !PHP_EXTENSION_ARGS! -r "exit(extension_loaded('openssl') ? 0 : 1);" >nul 2>nul
    if errorlevel 1 set "MISSING_EXTENSIONS=!MISSING_EXTENSIONS! openssl"
)

if defined MISSING_EXTENSIONS (
    echo [ERROR] PHP is missing required extensions:%MISSING_EXTENSIONS%
    echo The API requires mbstring, pdo_mysql, and openssl.
    echo PHP configuration currently in use:
    "!PHP_BIN!" --ini
    echo Enable the missing extensions in that php.ini, then run this file again.
    echo.
    pause
    exit /b 1
)

echo [OK] PHP extensions verified: mbstring, pdo_mysql, openssl

:: 2. Check if MySQL is running
tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul
if errorlevel 1 (
    echo [INFO] MySQL is not currently running. Attempting to start MySQL...
    if exist "!PHP_DIR!..\mysql_start.bat" (
        start "" /b "!PHP_DIR!..\mysql_start.bat"
        timeout /t 3 >nul
    ) else if exist "C:\xampp\mysql_start.bat" (
        start "" /b "C:\xampp\mysql_start.bat"
        timeout /t 3 >nul
    ) else if exist "D:\xampp\mysql_start.bat" (
        start "" /b "D:\xampp\mysql_start.bat"
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
) else (
    echo [OK] Configuration file found: app\config.php
)

:: 3b. Verify database connection and initialize schema if needed
"!PHP_BIN!" !PHP_EXTENSION_ARGS! -r "require 'app/bootstrap.php'; try { db(); exit(0); } catch (Throwable $e) { exit(1); }" >nul 2>nul
if errorlevel 1 (
    echo [INFO] Database connection not ready. Checking if schema needs to be imported...
    set "MYSQL_BIN="
    if exist "!PHP_DIR!..\mysql\bin\mysql.exe" set "MYSQL_BIN=!PHP_DIR!..\mysql\bin\mysql.exe"
    if not defined MYSQL_BIN for /f "delims=" %%I in ('where mysql 2^>nul') do if not defined MYSQL_BIN set "MYSQL_BIN=%%I"
    if defined MYSQL_BIN if exist "database\schema.sql" (
        echo [INFO] Initializing database using database\schema.sql...
        "!MYSQL_BIN!" -u root < "database\schema.sql" 2>nul
        "!PHP_BIN!" !PHP_EXTENSION_ARGS! -r "require 'app/bootstrap.php'; try { db(); exit(0); } catch (Throwable $e) { exit(1); }" >nul 2>nul
        if not errorlevel 1 (
            echo [OK] Database schema initialized successfully.
        ) else (
            echo [WARNING] Could not connect to database automatically. Please verify database\schema.sql and app\config.php.
        )
    ) else (
        echo [WARNING] Please import database\schema.sql into MySQL.
    )
) else (
    echo [OK] Database connection verified.
)

:: 4. Start browser and server
set "HOST=127.0.0.1"
set "PORT=8000"

:: Check if port 8000 is actively listening, fall back to 8080 if needed
netstat -ano 2>nul | findstr /r /c:":8000 .*LISTENING" >nul
if not errorlevel 1 (
    echo [WARNING] Port 8000 is currently in use. Switching to port 8080...
    set "PORT=8080"
)

set "URL=http://localhost:%PORT%/"

echo.
echo =========================================================
echo  Application is running at: %URL%
echo  Press Ctrl+C in this window to stop the server.
echo =========================================================
echo.

:: Launch default browser with brief delay to let PHP server bind socket
start "" /b cmd /c "ping 127.0.0.1 -n 2 >nul & start %URL%"

:: Run PHP built-in server serving public directory
"!PHP_BIN!" !PHP_EXTENSION_ARGS! -S %HOST%:%PORT% -t public

echo.
pause
