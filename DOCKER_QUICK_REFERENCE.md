# Docker Testing - Quick Reference

## 📁 Files Created for Local Testing

| File | Purpose |
|------|---------|
| `docker-compose.local.yml` | Local development Docker Compose config (no Traefik) |
| `Dockerfile.backend.dev` | Development backend with hot reload (nodemon) |
| `Dockerfile.frontend.dev` | Development frontend with Vite dev server |
| `DOCKER_LOCAL_TESTING.md` | Comprehensive local testing guide |
| `docker-local-test.bat` | Windows script for easy Docker operations |
| `.env.local.example` | Example environment variables for local testing |
| `.dockerignore` | Optimizes Docker builds by excluding unnecessary files |

## 🚀 Quick Start (3 Steps)

### 1. Setup Environment
```bash
# Copy and configure your .env file
cp .env.local.example .env
# Edit .env with your actual credentials
```

### 2. Start Services

**Option A: Using the batch script (Windows)**
```bash
# Double-click docker-local-test.bat
# Or run in PowerShell:
.\docker-local-test.bat
```

**Option B: Using Docker Compose directly**
```bash
# Build and start
docker-compose -f docker-compose.local.yml up -d --build

# View logs
docker-compose -f docker-compose.local.yml logs -f
```

### 3. Access Your App
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔑 Key Differences: Local vs Production

| Feature | Local (docker-compose.local.yml) | Production (docker-compose.yml) |
|---------|----------------------------------|----------------------------------|
| **Reverse Proxy** | None - Direct access | Traefik |
| **SSL/TLS** | No SSL | Let's Encrypt automatic SSL |
| **Ports** | 5173 (frontend), 5000 (backend) | 80, 443 (via Traefik) |
| **Hot Reload** | ✅ Yes (nodemon + Vite HMR) | ❌ No |
| **Build Type** | Development | Production optimized |
| **Domains** | localhost | Your actual domain |
| **Environment** | NODE_ENV=development | NODE_ENV=production |
| **Dependencies** | All (including dev) | Production only |
| **Image Size** | Larger (includes dev tools) | Smaller (optimized) |

## 🎯 Common Commands Cheat Sheet

### Start/Stop
```bash
# Start services
docker-compose -f docker-compose.local.yml up -d

# Stop services
docker-compose -f docker-compose.local.yml down

# Restart specific service
docker-compose -f docker-compose.local.yml restart backend
```

### Logs
```bash
# All logs
docker-compose -f docker-compose.local.yml logs -f

# Backend only
docker-compose -f docker-compose.local.yml logs -f backend

# Frontend only
docker-compose -f docker-compose.local.yml logs -f frontend
```

### Build/Rebuild
```bash
# Build with cache
docker-compose -f docker-compose.local.yml build

# Build without cache (clean build)
docker-compose -f docker-compose.local.yml build --no-cache

# Rebuild and restart
docker-compose -f docker-compose.local.yml up -d --build
```

### Execute Commands in Container
```bash
# Access backend shell
docker exec -it alwaleed-backend-local sh

# Access frontend shell
docker exec -it alwaleed-frontend-local sh

# Run npm command in backend
docker exec -it alwaleed-backend-local npm install package-name
```

### Cleanup
```bash
# Stop and remove containers
docker-compose -f docker-compose.local.yml down

# Also remove volumes (DELETES DATA!)
docker-compose -f docker-compose.local.yml down -v

# Clean all Docker resources
docker system prune -a
```

## ✅ Testing Checklist

Before moving to production, verify:

- [ ] Both containers start successfully
- [ ] Health check passes: `curl http://localhost:5000/health`
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:5000
- [ ] Hot reload works (edit a file and see changes)
- [ ] Supabase connection works
- [ ] Paylink test mode works
- [ ] File uploads work
- [ ] No errors in logs
- [ ] Containers survive restart

## 🐛 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Port in use | Change ports in `docker-compose.local.yml` or stop conflicting process |
| Can't connect to backend | Check `docker-compose -f docker-compose.local.yml logs backend` |
| Hot reload not working | Rebuild: `docker-compose -f docker-compose.local.yml build --no-cache` |
| Permission denied | Run Docker Desktop as administrator (Windows) |
| Out of disk space | Clean: `docker system prune -a` |
| Supabase errors | Verify credentials in `.env` file |

## 📊 Monitoring

```bash
# Check container status
docker-compose -f docker-compose.local.yml ps

# Real-time resource usage
docker stats

# Check disk usage
docker system df

# Inspect container
docker inspect alwaleed-backend-local
```

## 🔄 Workflow

### Daily Development
1. Start Docker: `docker-compose -f docker-compose.local.yml up -d`
2. Make code changes (auto-reloads)
3. Test at http://localhost:5173
4. Check logs if issues: `docker-compose -f docker-compose.local.yml logs -f`
5. Stop when done: `docker-compose -f docker-compose.local.yml down`

### After Package Changes
```bash
# Rebuild after modifying package.json
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d
```

### Testing Production Build Locally
```bash
# Build production images
docker-compose build

# Test them (requires editing docker-compose.yml temporarily)
# See DOCKER_LOCAL_TESTING.md for details
```

## 🚀 Ready for Production?

Once local testing passes:

1. Read `DOCKER_DEPLOYMENT.md`
2. Update `docker-compose.yml` with your domain
3. Configure Let's Encrypt email
4. Set production environment variables
5. Deploy: `docker-compose up -d`

## 📚 Documentation

- **Local Testing**: `DOCKER_LOCAL_TESTING.md` - Detailed local testing guide
- **Production Deployment**: `DOCKER_DEPLOYMENT.md` - Production deployment guide
- **Quick Reference**: This file - Command cheat sheet

---

**Pro Tip**: Use the `docker-local-test.bat` script for the easiest experience on Windows!
