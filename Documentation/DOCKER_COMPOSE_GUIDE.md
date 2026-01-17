# 🐳 Docker Compose Deployment Guide

## ✅ Setup Complete

Your `docker-compose.yml` is configured to:
- ✅ Read environment variables from `.env` automatically
- ✅ Pass `VITE_*` vars as build arguments (frontend build time)
- ✅ Load backend secrets at runtime (secure)
- ✅ Set NODE_ENV=production automatically
- ✅ Include health checks and proper logging

---

## 🚀 Quick Start

### **1. Ensure .env is configured**

Make sure your `.env` file has:

```env
# Required for production
PORT=3000
NODE_ENV=production

# Frontend (Vite) - used at BUILD time
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend (Runtime) - loaded when container starts
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

CLOUD_PRINTER_KEY=your_key
PAYLINK_SECRET_KEY=your_secret
PAYLINK_APP_ID=your_app_id
PAYLINK_TEST_MODE=false
```

---

### **2. Build and Run**

```bash
# Build and start (first time or after code changes)
docker-compose up --build -d

# Just start (if already built)
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

---

## 📋 Common Commands

### **Build & Run**
```bash
# Build and start in background
docker-compose up --build -d

# Build without starting
docker-compose build

# Force rebuild (no cache)
docker-compose build --no-cache
```

### **Manage Container**
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes/networks
docker-compose down -v

# Restart
docker-compose restart

# View status
docker-compose ps
```

### **Logs & Debugging**
```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Check health
docker-compose ps
docker inspect alwaleed-app --format='{{.State.Health.Status}}'

# Access shell
docker-compose exec alwaleed-app sh
```

---

## 🔍 How It Works

### **Build Time (Frontend)**

```
.env file → docker-compose reads VITE_* vars
              ↓
         Passes as --build-arg to Dockerfile
              ↓
         Vite embeds them into JavaScript bundle
              ↓
         Final JS has Supabase config baked in
```

### **Runtime (Backend)**

```
.env file → docker-compose reads all vars
              ↓
         Sets them as environment variables in container
              ↓
         Backend code uses process.env at runtime
              ↓
         Secrets stay in memory, not in image
```

---

## 🔒 Security

### **What's Safe**

✅ **VITE_* variables** (embedded in client-side JS anyway):
- `VITE_SUPABASE_URL` - Public URL
- `VITE_SUPABASE_ANON_KEY` - Public key (protected by RLS)

✅ **Backend secrets** (runtime only, not in image):
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYLINK_SECRET_KEY`
- `CLOUD_PRINTER_KEY`

### **What's Protected**

- ❌ `.env` is in `.dockerignore` - **never** copied into image
- ✅ Build args used once during build, not stored in layers
- ✅ Runtime secrets loaded fresh on each container start
- ✅ No secrets in image history or layers

---

## 📊 Production Checklist

Before deploying:

- [ ] `.env` has correct production values
- [ ] `NODE_ENV=production` is set
- [ ] `PAYLINK_TEST_MODE=false` for production
- [ ] All required VITE_* variables are present
- [ ] All backend secrets are present
- [ ] Test locally with `docker-compose up --build`
- [ ] Verify health check: `docker inspect alwaleed-app`
- [ ] Check logs: `docker-compose logs`
- [ ] Test the app at http://localhost:3000

---

## 🔄 Update Workflow

When you make code changes:

```bash
# Stop current container
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### **Container won't start**
```bash
# Check logs
docker-compose logs

# Common issues:
# - Missing environment variables
# - Port 3000 already in use
# - Database connection failed
```

### **Blank page / Supabase errors**
```bash
# Check if VITE_* vars were passed during build
docker-compose build --no-cache

# Verify build args
docker history alwaleed-backend:latest
```

### **Port already in use**
```bash
# Windows: Find process using port 3000
netstat -ano | findstr :3000

# Stop the process
taskkill /F /PID <PID>
```

### **Environment variables not working**
```bash
# Make sure .env is in the same directory as docker-compose.yml
# Rebuild to pick up changes
docker-compose down
docker-compose up --build -d
```

---

## 📦 Image Size

Check your image size:
```bash
docker images alwaleed-backend
```

Expected: ~200-300 MB (Alpine-based)

---

## 🎯 Quick Reference

**First time:**
```bash
docker-compose up --build -d
```

**After code changes:**
```bash
docker-compose down && docker-compose up --build -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop:**
```bash
docker-compose down
```

---

## 🌐 Access Your App

- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **API Health:** http://localhost:3000/api/health

---

**Your Docker Compose setup is ready! Simply run `docker-compose up --build -d` to start.** 🚀
