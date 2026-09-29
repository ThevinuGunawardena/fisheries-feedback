@echo off
setlocal EnableDelayedExpansion

title Ministry of Fisheries - Feedback Widget

cd /d "%~dp0"

echo =========================================================
echo    Ministry of Fisheries - Feedback Widget Server
echo =========================================================
echo.

:: 1. Detect PHP executable
set "PHP_BIN="
where php >nul 2>nul
if %errorlevel% equ 0 (
    set "PHP_BIN=php"
) else if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" (
    set "PHP_BIN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
) else if exist "C:\xampp\php\php.exe" (
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
"%PHP_BIN%" -S %HOST%:%PORT% -t public

echo.
pause
