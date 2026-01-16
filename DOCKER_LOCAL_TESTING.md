# Docker Local Testing Guide 🧪

This guide will help you test your Docker setup locally before deploying to production.

## 🎯 Overview

The local Docker setup:
- **No Traefik** - Services are exposed directly on localhost
- **Hot Reload** - Code changes automatically reflect in running containers
- **Development Mode** - Uses development dependencies and tools (nodemon, Vite dev server)
- **Easy Debugging** - Direct access to logs and services

## 📋 Prerequisites

- Docker Desktop for Windows (or Docker Engine + Docker Compose)
- Git Bash or PowerShell
- `.env` file configured (see below)

## 🚀 Quick Start

### 1. Configure Environment Variables

Create a `.env` file for local testing (or use your existing one):

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Paylink (Test Mode)
PAYLINK_APP_ID=your-app-id
PAYLINK_SECRET_KEY=your-secret-key
PAYLINK_TEST_MODE=true

# Frontend URL (local)
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
PORT=5000
```

**Important:** Set `PAYLINK_TEST_MODE=true` for local testing!

### 2. Build and Start Services

```powershell
# Build the images
docker-compose -f docker-compose.local.yml build

# Start all services in detached mode
docker-compose -f docker-compose.local.yml up -d

# Or start with logs visible
docker-compose -f docker-compose.local.yml up
```

### 3. Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/health

### 4. Test Hot Reload

Make changes to your code and see them reflected immediately:

**Backend:**
- Edit any file in `./server`
- Nodemon will automatically restart the server
- Check logs: `docker-compose -f docker-compose.local.yml logs -f backend`

**Frontend:**
- Edit any file in `./src`
- Vite will automatically update the browser
- No container restart needed!

## 🔧 Common Commands

### View Logs

```powershell
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
```

### Restart Services

```powershell
# Restart all
docker-compose -f docker-compose.local.yml restart

# Restart specific service
docker-compose -f docker-compose.local.yml restart backend
```

### Stop Services

```powershell
# Stop all services
docker-compose -f docker-compose.local.yml down

# Stop and remove volumes (WARNING: Deletes uploads!)
docker-compose -f docker-compose.local.yml down -v
```

### Rebuild After Dependency Changes

If you modified `package.json`:

```powershell
# Rebuild and restart
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d
```

### Execute Commands Inside Containers

```powershell
# Backend container
docker exec -it alwaleed-backend-local sh

# Frontend container
docker exec -it alwaleed-frontend-local sh

# Install new package in backend
docker exec -it alwaleed-backend-local npm install package-name

# Run npm commands
docker exec -it alwaleed-backend-local npm run test
```

## 🧪 Testing Checklist

Test these features locally before deploying to production:

### Backend Tests
- [ ] Health endpoint responds: `curl http://localhost:5000/health`
- [ ] API endpoints work correctly
- [ ] Supabase connection works
- [ ] File uploads work
- [ ] Paylink test mode works
- [ ] Error handling works properly

### Frontend Tests
- [ ] App loads at http://localhost:5173
- [ ] Can connect to backend API
- [ ] All pages render correctly
- [ ] Authentication works
- [ ] Image upload and editing works
- [ ] Payment flow works (test mode)
- [ ] Responsive design looks good

### Docker-Specific Tests
- [ ] Containers start without errors
- [ ] Health checks pass: `docker-compose -f docker-compose.local.yml ps`
- [ ] Hot reload works for both services
- [ ] Logs are accessible and readable
- [ ] Network communication between containers works
- [ ] Volumes persist data correctly

## 🐛 Troubleshooting

### Containers Won't Start

```powershell
# Check logs for errors
docker-compose -f docker-compose.local.yml logs

# Check if ports are already in use
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# If ports are in use, either:
# 1. Stop the process using the port
# 2. Change ports in docker-compose.local.yml
```

### Frontend Can't Connect to Backend

Check the API URL in your frontend code. Make sure it's pointing to:
- `http://localhost:5000` (when accessing from browser)
- `http://backend:5000` (when accessing from frontend container)

### Hot Reload Not Working

```powershell
# Check if volumes are mounted correctly
docker inspect alwaleed-backend-local | grep -A 5 Mounts
docker inspect alwaleed-frontend-local | grep -A 5 Mounts

# Rebuild containers
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

### Permission Issues (Linux/Mac)

```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or use different user in Dockerfile
```

### Out of Disk Space

```powershell
# Clean up unused Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

## 🔄 Testing Production Configuration Locally

Want to test the production setup without deploying? You can!

### Option 1: Test Production Build Locally

```powershell
# Build production images
docker-compose build

# Run without Traefik (simpler)
docker-compose up backend frontend
```

Access:
- Backend: http://localhost:5000 (not directly exposed, need to modify docker-compose.yml temporarily)
- Frontend: http://localhost:80 (not directly exposed, need to modify docker-compose.yml temporarily)

### Option 2: Full Production Stack with Traefik

1. Edit `docker-compose.yml` and change domain names to:
   - `localhost` instead of `yourdomain.com`
   - `api.localhost` instead of `api.yourdomain.com`

2. Comment out Let's Encrypt configuration:
   ```yaml
   # - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   # - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
   ```

3. Start services:
   ```powershell
   docker-compose up -d
   ```

4. Access:
   - Frontend: http://localhost
   - Backend: http://api.localhost
   - Traefik Dashboard: http://traefik.localhost

**Note:** You'll get SSL warnings since we're not using Let's Encrypt for localhost.

## 📊 Performance Monitoring

### Check Resource Usage

```powershell
# Real-time stats
docker stats

# Container inspect
docker inspect alwaleed-backend-local
docker inspect alwaleed-frontend-local
```

### Check Network

```powershell
# List networks
docker network ls

# Inspect network
docker network inspect alwaleed-backend_alwaleed-network

# Test connectivity between containers
docker exec alwaleed-frontend-local ping backend
```

## 🔐 Security Notes for Local Testing

1. **Never use production credentials** in local testing
2. **Always use `PAYLINK_TEST_MODE=true`** locally
3. **Don't commit `.env` file** to git
4. **Use separate Supabase project** for development/testing if possible

## ✅ Ready for Production?

Once local testing is successful, follow these steps:

1. **Review Production Checklist** in `DOCKER_DEPLOYMENT.md`
2. **Update Environment Variables** for production
3. **Configure Domain Names** in `docker-compose.yml`
4. **Set up SSL/TLS** with Let's Encrypt
5. **Deploy** using `docker-compose.yml` (not the local version!)

## 📚 Next Steps

- Read `DOCKER_DEPLOYMENT.md` for production deployment
- Set up CI/CD pipeline for automated testing
- Configure monitoring and alerting
- Set up automated backups

## 🆘 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in `docker-compose.local.yml` or stop conflicting service |
| Hot reload not working | Check volume mounts, rebuild containers |
| Can't connect to backend | Check backend logs, verify network configuration |
| Supabase errors | Verify credentials in `.env`, check Supabase dashboard |
| Build fails | Clear Docker cache: `docker-compose build --no-cache` |

---

**Happy Testing! 🚀**

Remember: Local testing helps catch issues early. Always test locally before deploying to production!
