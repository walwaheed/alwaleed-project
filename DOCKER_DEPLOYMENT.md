# Docker Deployment Guide

This guide explains how to deploy the Alwaleed application using Docker and Docker Compose with Traefik as a reverse proxy.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Docker Commands](#docker-commands)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker** (v20.10+): [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+): [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Domain Name**: A registered domain with DNS configured
- **SSL Email**: Valid email for Let's Encrypt SSL certificates

## Architecture

The application consists of the following services:

```
┌─────────────────────────────────────────────────────────┐
│                      Traefik                             │
│         (Reverse Proxy + SSL/TLS Manager)                │
└─────────────────┬───────────────┬──────────────────────┘
                  │               │
         ┌────────▼─────┐  ┌─────▼──────┐
         │     app      │  │    n8n     │
         │  (Frontend + │  │ (Workflow  │
         │   Backend)   │  │ Automation)│
         └──────────────┘  └────────────┘
```

### Services

1. **Traefik**: Reverse proxy with automatic SSL/TLS certificate management
2. **app**: Your main application (React frontend + Express backend)
3. **n8n**: Workflow automation service (if needed)

## Quick Start

### 1. Clone and Setup

```bash
cd e:\alwaleed-backend

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Create Required Docker Volumes

```bash
# Create external volumes for persistent data
docker volume create traefik_data
docker volume create n8n_data
```

### 3. Configure Environment Variables

Edit `.env` file with your actual values:

```bash
# Production app domain
APP_DOMAIN=app.yourdomain.com

# SSL email for Let's Encrypt
SSL_EMAIL=your-email@example.com

# n8n Configuration (if using)
SUBDOMAIN=n8n
DOMAIN_NAME=yourdomain.com
GENERIC_TIMEZONE=Asia/Riyadh

# Your other app-specific variables...
```

### 4. Build and Deploy

```bash
# Build the production image
docker compose build app

# Start all services
docker compose up -d

# View logs
docker compose logs -f app
```

## Environment Configuration

### Production Environment (.env)

```bash
# ================================
# Docker & Traefik Configuration
# ================================
APP_DOMAIN=app.yourdomain.com
SSL_EMAIL=your-email@example.com

# n8n Configuration
SUBDOMAIN=n8n
DOMAIN_NAME=yourdomain.com
GENERIC_TIMEZONE=Asia/Riyadh

# ================================
# Application Configuration
# ================================
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# CloudPrinter
CLOUD_PRINTER_KEY=your-api-key

# Other configurations...
PAYLINK_TEST_MODE=false
```

### Development Environment (.env.local)

```bash
# ================================
# Docker & Traefik Configuration
# ================================
APP_DEV_DOMAIN=localhost

# ================================
# Application Configuration
# ================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Same as production for other services...
```

## Production Deployment

### Step 1: Configure DNS

Point your domain to your server's IP address:

```
A Record: app.yourdomain.com → YOUR_SERVER_IP
A Record: n8n.yourdomain.com → YOUR_SERVER_IP
```

### Step 2: Build Production Image

```bash
docker compose build app
```

### Step 3: Start Services

```bash
# Start all services in detached mode
docker compose up -d

# Or start specific service
docker compose up -d app
```

### Step 4: Verify Deployment

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f app

# Check health status
curl https://app.yourdomain.com/api/health
```

### Step 5: SSL Certificate

Traefik automatically requests and manages SSL certificates from Let's Encrypt. Check the logs:

```bash
docker compose logs traefik | grep -i certificate
```

## Development Setup

For local development with hot-reload:

### Step 1: Uncomment Development Service

Edit `docker-compose.yml` and uncomment the `app-dev` service section.

### Step 2: Update Environment

Create `.env.local`:

```bash
cp .env.example .env.local
# Edit with development settings
```

### Step 3: Start Development Container

```bash
# Build and start development container
docker compose up app-dev

# Or run in detached mode
docker compose up -d app-dev
```

### Step 4: Access Development Environment

- **Frontend**: http://localhost:5173 (Vite with HMR)
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Docker Commands

### Container Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a specific service
docker compose restart app

# View running containers
docker compose ps

# View logs
docker compose logs -f app
docker compose logs -f traefik
docker compose logs -f n8n
```

### Building and Updating

```bash
# Build/rebuild images
docker compose build app

# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build app
```

### Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove unused images
docker image prune -a

# Complete cleanup (careful!)
docker system prune -a --volumes
```

### Debugging

```bash
# Execute commands in running container
docker compose exec app sh
docker compose exec app npm list
docker compose exec app cat /app/package.json

# View container resource usage
docker stats

# Inspect container details
docker compose exec app env
```

## Troubleshooting

### Issue: Container won't start

**Solution:**
```bash
# Check logs
docker compose logs app

# Check if port is already in use
netstat -tulpn | grep :3000

# Restart the service
docker compose restart app
```

### Issue: SSL Certificate not working

**Solution:**
```bash
# Check Traefik logs
docker compose logs traefik

# Verify DNS is pointing to your server
nslookup app.yourdomain.com

# Check Let's Encrypt rate limits
# Ensure SSL_EMAIL is set correctly in .env
```

### Issue: Health check failing

**Solution:**
```bash
# Check if backend is running
docker compose exec app curl http://localhost:3000/api/health

# View backend logs
docker compose logs app

# Check environment variables
docker compose exec app env | grep NODE_ENV
```

### Issue: Frontend not loading

**Solution:**
```bash
# Verify build completed successfully
docker compose exec app ls -la /app/dist

# Check if files are served
docker compose exec app ls -la /app/dist/index.html

# Rebuild the image
docker compose build --no-cache app
docker compose up -d app
```

### Issue: Volume permission errors

**Solution:**
```bash
# Check volume ownership
docker volume inspect traefik_data
docker volume inspect n8n_data

# Recreate volumes if needed
docker volume rm traefik_data
docker volume create traefik_data
```

### Issue: Out of memory

**Solution:**
```bash
# Check Docker resource limits
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Or add to docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Production Best Practices

### 1. Security

- ✅ Use HTTPS only (enforced by Traefik configuration)
- ✅ Keep secrets in environment variables, not in code
- ✅ Regularly update Docker images
- ✅ Use non-root user in containers (already implemented)
- ✅ Enable security headers (already configured in Traefik)

### 2. Monitoring

```bash
# Set up monitoring for container health
docker compose ps
docker stats

# Monitor logs
docker compose logs -f --tail=100
```

### 3. Backups

```bash
# Backup Docker volumes
docker run --rm -v traefik_data:/data -v $(pwd):/backup alpine tar czf /backup/traefik-backup.tar.gz /data

# Backup database (if using local DB)
# Adjust based on your database type
```

### 4. Updates

```bash
# Pull latest changes
git pull

# Rebuild and deploy
docker compose build app
docker compose up -d app

# Check health
curl https://app.yourdomain.com/api/health
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For issues related to:
- **Docker**: Check [Docker Forums](https://forums.docker.com/)
- **Traefik**: Check [Traefik Community](https://community.traefik.io/)
- **Application**: Check application logs and [project documentation](./README.md)
