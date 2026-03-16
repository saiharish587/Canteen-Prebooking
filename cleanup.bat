@echo off
echo.
echo ========================================
echo BVRIT Canteen - Cleanup Script
echo ========================================
echo.

cd /d C:\xamppp\htdocs

REM Backend cleanup
echo [1] Removing backend vendor directory...
if exist canteen-api\vendor rmdir /s /q canteen-api\vendor
echo [✓] vendor directory removed

echo [2] Removing backend log files...
if exist canteen-api\storage\logs\*.log del /q canteen-api\storage\logs\*.log
echo [✓] Log files removed

echo [3] Removing .env file (keeping .env.example)...
if exist canteen-api\.env del /q canteen-api\.env
echo [✓] .env file removed

echo [4] Removing development test files...
if exist canteen-api\api-tests.php del /q canteen-api\api-tests.php
if exist canteen-api\check-email.php del /q canteen-api\check-email.php
if exist canteen-api\check-users-direct.php del /q canteen-api\check-users-direct.php
if exist canteen-api\delete-users.php del /q canteen-api\delete-users.php
if exist canteen-api\db-diagnostics.php del /q canteen-api\db-diagnostics.php
if exist canteen-api\check-orders.php del /q canteen-api\check-orders.php
if exist canteen-api\generate-admin-token.php del /q canteen-api\generate-admin-token.php
if exist canteen-api\setup-utilities.php del /q canteen-api\setup-utilities.php
if exist canteen-api\test-register.php del /q canteen-api\test-register.php
echo [✓] Development test files removed

REM Frontend cleanup
echo [5] Removing frontend system files...
if exist canteen\images\desktop.ini del /q canteen\images\desktop.ini
echo [✓] desktop.ini removed

echo [6] Checking for node_modules...
if exist canteen\node_modules (
    rmdir /s /q canteen\node_modules
    echo [✓] node_modules removed
) else (
    echo [✓] No node_modules found
)

echo [7] Removing cache files...
if exist canteen-api\bootstrap\cache\*.php del /q canteen-api\bootstrap\cache\*.php 2>nul
echo [✓] Cache files removed

echo.
echo ========================================
echo [✓] Cleanup Complete!
echo ========================================
echo.
echo Removed:
echo - Backend vendor directory
echo - Log files
echo - .env configuration
echo - Development test PHP files
echo - System files (desktop.ini)
echo - Cache files
echo.
pause
