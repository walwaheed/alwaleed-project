# 🚀 Production Docker Deployment Guide

## ✅ Dockerfile Status: READY FOR PRODUCTION

Your Dockerfile is production-ready with:
- ✅ Multi-stage build (optimized image size)
- ✅ Node.js 20 Alpine (small, secure base)
- ✅ Non-root user (security best practice)
- ✅ Health checks (monitoring & auto-restart)
- ✅ Production-only dependencies
- ✅ Proper signal handling (dumb-init)

---

## 📋 Step-by-Step: Build & Run Locally

### **Step 1: Create `.env.production` File**

Create a `.env.production` file with your production environment variables:

```bash
# Copy from example
cp .env.production.example .env.production
```

Then edit `.env.production` with your actual production values:

```env
PORT=3000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://sfraqqkmzzdtcynyyebj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Cloud_Printer API key
CLOUD_PRINTER_KEY=your_cloudprinter_key_here

# Paylink API Production
PAYLINK_SECRET_KEY=your_paylink_secret_key
PAYLINK_APP_ID=your_paylink_app_id
PAYLINK_TEST_MODE=false
```

---

### **Step 2: Build the Docker Image**

```powershell
docker build -t alwaleed-backend:latest .
```

**Expected output:**
- Building frontend...
- Installing dependencies...
- Creating production image...
- ✅ Successfully tagged alwaleed-backend:latest

**Build time:** ~3-5 minutes (first time)

---

### **Step 3: Run the Container**

```powershell
docker run -d `
  --name alwaleed-app `
  -p 3000:3000 `
  --env-file .env.production `
  --restart unless-stopped `
  alwaleed-backend:latest
```

**Explanation:**
- `-d` = Run in background (detached mode)
- `--name alwaleed-app` = Container name
- `-p 3000:3000` = Map port 3000 (host:container)
- `--env-file .env.production` = Load environment variables
- `--restart unless-stopped` = Auto-restart on crash
- `alwaleed-backend:latest` = The image we just built

---

### **Step 4: Verify It's Running**

Check container status:
```powershell
docker ps
```

You should see:
```
CONTAINER ID   IMAGE                      STATUS         PORTS
abc123...      alwaleed-backend:latest    Up 10 seconds  0.0.0.0:3000->3000/tcp
```

Check health:
```powershell
docker inspect --format='{{.State.Health.Status}}' alwaleed-app
```

Should show: `healthy`

---

### **Step 5: Test the Application**

Open your browser:
- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **API Health:** http://localhost:3000/api/health

---

## 📊 Useful Docker Commands

### **View Logs**
```powershell
# Follow logs in real-time
docker logs -f alwaleed-app

# Last 100 lines
docker logs --tail 100 alwaleed-app
```

### **Stop Container**
```powershell
docker stop alwaleed-app
```

### **Start Container**
```powershell
docker start alwaleed-app
```

### **Restart Container**
```powershell
docker restart alwaleed-app
```

### **Remove Container**
```powershell
docker stop alwaleed-app
docker rm alwaleed-app
```

### **View Resource Usage**
```powershell
docker stats alwaleed-app
```

### **Access Container Shell**
```powershell
docker exec -it alwaleed-app sh
```

---

## 🔄 Updating Your Application

When you make code changes:

**Step 1: Stop and remove old container**
```powershell
docker stop alwaleed-app
docker rm alwaleed-app
```

**Step 2: Rebuild image**
```powershell
docker build -t alwaleed-backend:latest .
```

**Step 3: Run new container**
```powershell
docker run -d `
  --name alwaleed-app `
  -p 3000:3000 `
  --env-file .env.production `
  --restart unless-stopped `
  alwaleed-backend:latest
```

---

## 🐳 Image Information

### **Check Image Size**
```powershell
docker images alwaleed-backend
```

Expected size: ~200-300 MB (Alpine is small!)

### **View Image Layers**
```powershell
docker history alwaleed-backend:latest
```

---

## 🔍 Troubleshooting

### **Container Won't Start**
```powershell
# Check logs
docker logs alwaleed-app

# Common issues:
# - Missing environment variables
# - Port 3000 already in use
# - Database connection failed
```

### **Port Already in Use**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual)
taskkill /F /PID <PID>
```

### **Health Check Failing**
```powershell
# Check health status
docker inspect alwaleed-app | findstr Health

# Check if app is responding
curl http://localhost:3000/health
```

---

## 📦 Docker Compose (Optional)

If you want to use docker-compose, you already have a `docker-compose.yml` file!

```powershell
# Start with docker-compose
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] `.env.production` has correct values
- [ ] `NODE_ENV=production` is set
- [ ] `PAYLINK_TEST_MODE=false` for production
- [ ] Database is accessible from production server
- [ ] All API keys are production keys (not test)
- [ ] CORS is configured for production domain
- [ ] SSL/TLS certificates are configured
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Tested locally with Docker first

---

## 🎯 What Happens in Production Build

1. **Multi-stage build:**
   - Stage 1: Builds frontend (Vite) → `dist/` folder
   - Stage 2: Installs backend dependencies
   - Stage 3: Combines everything in minimal image

2. **Security:**
   - Runs as non-root user (`nodejs` user)
   - Only production dependencies
   - Helmet security headers enabled
   - CSP disabled (as configured)

3. **How it works:**
   - Express serves both API (`/api/*`) and frontend (static files)
   - Everything runs on port 3000
   - Health checks every 30 seconds
   - Auto-restarts on failure

---

## ⚡ Quick Reference

**Build:**
```powershell
docker build -t alwaleed-backend:latest .
```

**Run:**
```powershell
docker run -d --name alwaleed-app -p 3000:3000 --env-file .env.production alwaleed-backend:latest
```

**Logs:**
```powershell
docker logs -f alwaleed-app
```

**Stop:**
```powershell
docker stop alwaleed-app
```

---

**Your Dockerfile is production-ready! Follow these steps to build and test locally before deploying.** 🎉
