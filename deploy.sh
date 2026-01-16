#!/bin/bash

# Alwaleed Studio - Docker Deployment Script
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Alwaleed Studio - Docker Deployment"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    echo ""
    echo "Would you like to create one from the template? (y/n)"
    read -r create_env
    if [ "$create_env" = "y" ]; then
        cp .env.production.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual values before continuing!"
        exit 0
    else
        print_error "Cannot proceed without .env file"
        exit 1
    fi
fi

print_success ".env file found"

# Main menu
echo ""
echo "What would you like to do?"
echo "1) Build and start all services"
echo "2) Stop all services"
echo "3) Restart all services"
echo "4) View logs"
echo "5) Check service status"
echo "6) Update and restart"
echo "7) Backup volumes"
echo "8) Clean up (remove all containers and volumes)"
echo "9) Exit"
echo ""
echo -n "Enter your choice [1-9]: "
read -r choice

case $choice in
    1)
        echo ""
        print_warning "Building and starting services..."
        docker-compose build
        docker-compose up -d
        print_success "Services started successfully!"
        echo ""
        echo "Access your application at:"
        echo "  Frontend: https://yourdomain.com"
        echo "  Backend API: https://api.yourdomain.com"
        echo "  Traefik Dashboard: https://traefik.yourdomain.com"
        echo ""
        echo "Check status with: docker-compose ps"
        echo "View logs with: docker-compose logs -f"
        ;;
    2)
        echo ""
        print_warning "Stopping all services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    3)
        echo ""
        print_warning "Restarting all services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    4)
        echo ""
        echo "Which service logs would you like to view?"
        echo "1) All services"
        echo "2) Frontend"
        echo "3) Backend"
        echo "4) Traefik"
        echo -n "Enter your choice [1-4]: "
        read -r log_choice
        case $log_choice in
            1) docker-compose logs -f ;;
            2) docker-compose logs -f frontend ;;
            3) docker-compose logs -f backend ;;
            4) docker-compose logs -f traefik ;;
            *) print_error "Invalid choice" ;;
        esac
        ;;
    5)
        echo ""
        docker-compose ps
        echo ""
        echo "Detailed health status:"
        docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $(docker-compose ps -q) 2>/dev/null || echo "Health checks not available"
        ;;
    6)
        echo ""
        print_warning "Pulling latest changes and rebuilding..."
        git pull origin main
        docker-compose build
        docker-compose up -d
        print_success "Services updated and restarted"
        ;;
    7)
        echo ""
        print_warning "Creating backups..."
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        docker run --rm -v alwaleed-backend_backend-uploads:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz /data
        docker run --rm -v alwaleed-backend_traefik-certificates:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/certificates.tar.gz /data
        
        print_success "Backups created in $BACKUP_DIR"
        ;;
    8)
        echo ""
        print_error "WARNING: This will remove all containers and volumes!"
        echo "Are you sure you want to continue? (type 'yes' to confirm)"
        read -r confirm
        if [ "$confirm" = "yes" ]; then
            print_warning "Cleaning up..."
            docker-compose down -v
            docker system prune -f
            print_success "Cleanup complete"
        else
            print_warning "Cleanup cancelled"
        fi
        ;;
    9)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac
