@echo off
REM Quick start script for local Docker testing
REM Two-stage approach: Build first, then run

echo ===================================
echo Alwaleed Studio - Local Docker Test
echo ===================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Please create a .env file with your configuration.
    echo See DOCKER_LOCAL_TESTING.md for details.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

echo What would you like to do?
echo.
echo 1. Build and start services (recommended)
echo 2. Build only (no start)
echo 3. Start services (skip build)
echo 4. View logs
echo 5. Stop services
echo 6. Rebuild from scratch
echo 7. Clean up everything
echo 8. Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto build_and_start
if "%choice%"=="2" goto build_only
if "%choice%"=="3" goto start_only
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto stop
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto end

echo Invalid choice!
pause
exit /b 1

:build_and_start
echo.
echo ===================================
echo STAGE 1: Building Docker Images
echo ===================================
echo This may take a few minutes...
echo.

REM Build images first
docker-compose -f docker-compose.local.yml build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build completed!
echo.
echo ===================================
echo STAGE 2: Starting Services
echo ===================================
echo.

REM Now start the services
docker-compose -f docker-compose.local.yml up -d
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Services started!
echo.
call :show_urls
echo.
echo Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak >nul
echo.
echo Showing logs (Press Ctrl+C to exit)...
echo.
docker-compose -f docker-compose.local.yml logs -f
goto end

:build_only
echo.
echo Building Docker images...
echo This may take a few minutes.
echo.
docker-compose -f docker-compose.local.yml build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.
echo [SUCCESS] Build completed!
echo You can now start services with option 3.
pause
goto end

:start_only
echo.
echo Starting services (skipping build)...
echo.
docker-compose -f docker-compose.local.yml up -d
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services!
    echo Try building first (option 2 or 6).
    pause
    exit /b 1
)
echo.
echo [SUCCESS] Services started!
call :show_urls
pause
goto end

:logs
echo.
echo Showing logs (Press Ctrl+C to exit)...
echo.
docker-compose -f docker-compose.local.yml logs -f
goto end

:stop
echo.
echo Stopping services...
docker-compose -f docker-compose.local.yml down
if errorlevel 1 (
    echo [ERROR] Failed to stop services!
    pause
    exit /b 1
)
echo.
echo [SUCCESS] Services stopped!
pause
goto end

:rebuild
echo.
echo ===================================
echo Rebuilding from scratch...
echo ===================================
echo.

echo Step 1/3: Stopping services...
docker-compose -f docker-compose.local.yml down

echo.
echo Step 2/3: Cleaning build cache...
docker-compose -f docker-compose.local.yml build --no-cache
if errorlevel 1 (
    echo.
    echo [ERROR] Rebuild failed!
    pause
    exit /b 1
)

echo.
echo Step 3/3: Starting services...
docker-compose -f docker-compose.local.yml up -d
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Rebuild complete!
call :show_urls
pause
goto end

:cleanup
echo.
echo [WARNING] This will remove:
echo - All containers
echo - All volumes (DELETES uploads and dependencies!)
echo - Unused images
echo.
set /p confirm="Are you sure? Type YES to confirm: "
if /i not "%confirm%"=="YES" (
    echo Cleanup cancelled.
    pause
    goto end
)
echo.
echo Cleaning up...
docker-compose -f docker-compose.local.yml down -v
docker system prune -f
echo.
echo [SUCCESS] Cleanup complete!
pause
goto end

:show_urls
echo ===================================
echo Services are now running!
echo ===================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo Health:   http://localhost:5000/health
echo.
echo To view logs: docker-compose -f docker-compose.local.yml logs -f
echo To stop:      docker-compose -f docker-compose.local.yml down
goto :eof

:end
exit /b 0
