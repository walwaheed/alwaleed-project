# Health Check Script for Docker Deployment
# This script verifies that all services are running correctly

Write-Host "🏥 Docker Health Check" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
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

# Check Docker
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Yellow
if (Test-DockerRunning) {
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
}
else {
    Write-Host "   ❌ Docker is not running" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if containers are running
Write-Host "2️⃣  Checking containers..." -ForegroundColor Yellow
$containers = docker compose ps --format json | ConvertFrom-Json

if ($null -eq $containers) {
    Write-Host "   ⚠️  No containers are running" -ForegroundColor Yellow
    Write-Host "   Run 'docker compose up -d' to start containers" -ForegroundColor Yellow
    exit 1
}

foreach ($container in $containers) {
    $name = $container.Service
    $state = $container.State
    
    if ($state -eq "running") {
        Write-Host "   ✅ $name is running" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $name is $state" -ForegroundColor Red
    }
}
Write-Host ""

# Check backend health endpoint
Write-Host "3️⃣  Checking backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
        Write-Host "      Status: $($content.status)" -ForegroundColor Cyan
        Write-Host "      Timestamp: $($content.timestamp)" -ForegroundColor Cyan
    }
    else {
        Write-Host "   ⚠️  Backend returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Cannot reach backend health endpoint" -ForegroundColor Red
    Write-Host "      Make sure the 'app' container is running and port 3000 is exposed" -ForegroundColor Yellow
}
Write-Host ""

# Check Traefik
Write-Host "4️⃣  Checking Traefik..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/overview" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Traefik API is accessible" -ForegroundColor Green
        Write-Host "      Dashboard: http://localhost:8080" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "   ⚠️  Traefik API not accessible (this is normal if not exposed)" -ForegroundColor Yellow
}
Write-Host ""

# Check volumes
Write-Host "5️⃣  Checking Docker volumes..." -ForegroundColor Yellow
$requiredVolumes = @("traefik_data", "n8n_data")
foreach ($volumeName in $requiredVolumes) {
    $volume = docker volume inspect $volumeName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Volume '$volumeName' exists" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Volume '$volumeName' not found" -ForegroundColor Red
        Write-Host "      Run: docker volume create $volumeName" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check environment file
Write-Host "6️⃣  Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    
    # Check critical variables
    $envContent = Get-Content ".env" -Raw
    $criticalVars = @("APP_DOMAIN", "SSL_EMAIL", "SUPABASE_URL")
    
    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=") {
            $value = ($envContent | Select-String -Pattern "$var=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
            if ($value -match "your|example|localhost" -or [string]::IsNullOrWhiteSpace($value)) {
                Write-Host "      ⚠️  $var might need configuration" -ForegroundColor Yellow
            }
            else {
                Write-Host "      ✅ $var is set" -ForegroundColor Green
            }
        }
        else {
            Write-Host "      ❌ $var is missing" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    Write-Host "      Run: cp .env.example .env" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Container stats
Write-Host "Container Status:" -ForegroundColor Yellow
docker compose ps
Write-Host ""

# Useful commands
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:     docker compose logs -f app" -ForegroundColor White
Write-Host "   Restart:       docker compose restart app" -ForegroundColor White
Write-Host "   Stop all:      docker compose down" -ForegroundColor White
Write-Host "   Rebuild:       docker compose up -d --build app" -ForegroundColor White
Write-Host ""

Write-Host "✨ Health check complete!" -ForegroundColor Green
