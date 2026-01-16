# Docker Quick Start Script for Windows PowerShell

Write-Host "🐳 Alwaleed Backend - Docker Quick Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check if Docker is installed and running
if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
    Write-Host "   Required variables:" -ForegroundColor Yellow
    Write-Host "   - APP_DOMAIN" -ForegroundColor Yellow
    Write-Host "   - SSL_EMAIL" -ForegroundColor Yellow
    Write-Host "   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Have you configured .env? (y/n)"
    if ($continue -ne "y") {
        Write-Host "❌ Exiting. Please configure .env and run this script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Create required Docker volumes
Write-Host "📦 Creating Docker volumes..." -ForegroundColor Cyan
$volumes = @("traefik_data", "n8n_data")
foreach ($volume in $volumes) {
    $volumeExists = docker volume inspect $volume 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Volume '$volume' already exists" -ForegroundColor Green
    }
    else {
        docker volume create $volume | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Created volume '$volume'" -ForegroundColor Green
        }
        else {
            Write-Host "  ❌ Failed to create volume '$volume'" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Ask user what to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Build and start production containers" -ForegroundColor White
Write-Host "2. Build and start development container" -ForegroundColor White
Write-Host "3. View running containers" -ForegroundColor White
Write-Host "4. View logs" -ForegroundColor White
Write-Host "5. Stop all containers" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  Building production image..." -ForegroundColor Cyan
        docker compose build app
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
            docker compose up -d
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Containers started successfully" -ForegroundColor Green
                Write-Host ""
                Write-Host "📊 Container Status:" -ForegroundColor Cyan
                docker compose ps
                Write-Host ""
                Write-Host "🌐 Your application should be available at:" -ForegroundColor Green
                Write-Host "   https://$(Get-Content .env | Select-String -Pattern '^APP_DOMAIN=' | ForEach-Object { $_.ToString().Split('=')[1] })" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "📝 View logs with: docker compose logs -f app" -ForegroundColor Yellow
            }
            else {
                Write-Host "❌ Failed to start containers" -ForegroundColor Red
            }
        }
        else {
            Write-Host "❌ Build failed" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "⚠️  Make sure you've uncommented the 'app-dev' service in docker-compose.yml" -ForegroundColor Yellow
        $continue = Read-Host "Continue? (y/n)"
        
        if ($continue -eq "y") {
            Write-Host ""
            Write-Host "🏗️  Building development image..." -ForegroundColor Cyan
            docker compose build app-dev
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Build successful" -ForegroundColor Green
                Write-Host ""
                Write-Host "🚀 Starting development container..." -ForegroundColor Cyan
                docker compose up app-dev
            }
            else {
                Write-Host "❌ Build failed" -ForegroundColor Red
            }
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📊 Running containers:" -ForegroundColor Cyan
        docker compose ps
    }
    
    "4" {
        Write-Host ""
        Write-Host "Which service logs would you like to view?" -ForegroundColor Cyan
        Write-Host "1. app (main application)" -ForegroundColor White
        Write-Host "2. traefik (reverse proxy)" -ForegroundColor White
        Write-Host "3. n8n (workflow automation)" -ForegroundColor White
        Write-Host "4. all services" -ForegroundColor White
        Write-Host ""
        
        $logChoice = Read-Host "Enter your choice (1-4)"
        
        $service = switch ($logChoice) {
            "1" { "app" }
            "2" { "traefik" }
            "3" { "n8n" }
            "4" { "" }
            default { "app" }
        }
        
        Write-Host ""
        Write-Host "📝 Viewing logs (Press Ctrl+C to exit)..." -ForegroundColor Cyan
        if ($service -eq "") {
            docker compose logs -f
        }
        else {
            docker compose logs -f $service
        }
    }
    
    "5" {
        Write-Host ""
        $confirm = Read-Host "Are you sure you want to stop all containers? (y/n)"
        
        if ($confirm -eq "y") {
            Write-Host "🛑 Stopping containers..." -ForegroundColor Cyan
            docker compose down
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Containers stopped successfully" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Failed to stop containers" -ForegroundColor Red
            }
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
