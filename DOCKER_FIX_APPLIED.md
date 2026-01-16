# Docker Local Testing - Fix Applied

## 🔧 Issue Fixed: Rollup Alpine Linux Compatibility

### Problem
The original Docker setup used **Alpine Linux** (`node:20-alpine`), which uses the **musl** C library instead of **glibc**. Rollup's native bindings require the `@rollup/rollup-linux-x64-musl` package for Alpine, but npm has a known bug with optional dependencies that prevents it from installing correctly.

**Error encountered:**
```
Error: Cannot find module @rollup/rollup-linux-x64-musl
```

### Solution Applied
Switched from **Alpine Linux** to **Debian-based** Node images (`node:20-slim`):

| File | Changed From | Changed To |
|------|--------------|------------|
| `Dockerfile.frontend.dev` | `FROM node:20-alpine` | `FROM node:20-slim` |
| `Dockerfile.backend.dev` | `FROM node:20-alpine` | `FROM node:20-slim` |

### Benefits of Debian-slim
✅ **Full glibc support** - No musl compatibility issues  
✅ **Better npm compatibility** - Handles optional dependencies correctly  
✅ **Rollup native modules work** - No special installation needed  
✅ **Still lightweight** - `slim` variant is only slightly larger than Alpine  
✅ **More compatible** - Works with more npm packages out of the box  

### Image Size Comparison
- **Alpine**: ~120MB (but broken compatibility)
- **Debian-slim**: ~180MB (fully working)
- **Trade-off**: +60MB for guaranteed compatibility ✅

---

## 📋 Current Docker Setup

### Development Dockerfiles

**`Dockerfile.backend.dev`** (Debian-based)
```dockerfile
FROM node:20-slim
- Installs wget for health checks
- Installs nodemon for hot reload
- Development-ready setup
```

**`Dockerfile.frontend.dev`** (Debian-based)
```dockerfile
FROM node:20-slim
- No musl issues with Rollup
- Vite dev server with HMR
- Development-ready setup
```

### Docker Compose Configuration

**`docker-compose.local.yml`**
- Backend on port 5000 (direct access)
- Frontend on port 5173 (direct access)
- Named volumes for `node_modules` (avoids Windows/Linux conflicts)
- Hot reload enabled for both services

### Helper Script

**`docker-local-test.bat`** (Windows)
- Two-stage build & run process
- Better error handling
- Multiple options (build, start, logs, rebuild, cleanup)
- User-friendly interface

---

## 🚀 How to Use

### Quick Start

```bash
# Option 1: Use the helper script (recommended)
.\docker-local-test.bat

# Select option 1: Build and start services

# Option 2: Manual commands
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d
```

### Access Your App
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### View Logs
```bash
docker-compose -f docker-compose.local.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker-compose.local.yml down
```

---

## ✅ Testing Checklist

After starting services, verify:

1. **Containers running**
   ```bash
   docker-compose -f docker-compose.local.yml ps
   ```
   Both should show "Up" status

2. **Backend health**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

3. **Frontend accessible**
   - Open http://localhost:5173 in browser
   - Should see your app loading

4. **Hot reload works**
   - Edit a file in `./src` or `./server`
   - Changes should reflect automatically

5. **No Rollup errors**
   - Check logs: `docker-compose -f docker-compose.local.yml logs frontend`
   - Should NOT see: `Cannot find module @rollup/rollup-linux-x64-musl`

---

## 🐛 Troubleshooting

### If containers keep restarting

**Check logs:**
```bash
docker-compose -f docker-compose.local.yml logs
```

**Common issues:**
- Missing `.env` file → Create from `.env.local.example`
- Wrong environment variables → Verify Supabase & Paylink credentials
- Port conflicts → Change ports in `docker-compose.local.yml`

### If build fails

**Clean rebuild:**
```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

### If hot reload doesn't work

**Check volume mounts:**
```bash
docker inspect alwaleed-frontend-local | grep -A 10 Mounts
```

Volume mounts should show:
- `./src` → `/app/src`
- `./server` → `/app/server`

---

## 📊 Performance Notes

### First Build
- Takes 3-5 minutes
- Downloads Node.js Debian image (~180MB)
- Installs all npm dependencies
- **One-time cost**

### Subsequent Builds
- Takes 30-60 seconds
- Uses Docker cache
- Only rebuilds changed layers

### Running Containers
- Backend: ~150MB RAM
- Frontend: ~200MB RAM
- Total: ~350MB RAM usage

---

## 🎯 What Changed Summary

| File | Status | Change |
|------|--------|--------|
| `Dockerfile.frontend.dev` | ✅ Fixed | Alpine → Debian-slim |
| `Dockerfile.backend.dev` | ✅ Fixed | Alpine → Debian-slim, added wget |
| `docker-compose.local.yml` | ✅ Working | No changes needed |
| `docker-local-test.bat` | ✅ Recreated | Two-stage, better UX |

---

## 🎊 Ready to Test!

Your Docker local testing environment is now fixed and ready to use!

**Start testing:**
```bash
.\docker-local-test.bat
```

Select option **1** to build and start services.

**After successful start, you'll see:**
```
===================================
Services are now running!
===================================

Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
```

Happy developing! 🚀
