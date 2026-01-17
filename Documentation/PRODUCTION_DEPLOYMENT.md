# 🚀 Production Deployment Guide

## ✅ Complete Production Stack

Your docker-compose setup includes:

| Service | Purpose | URL |
|---------|---------|-----|
| **Traefik** | Reverse proxy + Auto SSL | Dashboard: :8080 |
| **alwaleed-app** | Your main application | https://alwaleed.pro |
| **n8n** | Workflow automation | https://n8n.alwaleed.pro |

---

## 📋 Pre-Deployment Checklist

### **1. Domain Setup**

- [ ] Domain purchased and configured
- [ ] DNS A record pointing to your server IP:
  - `alwaleed.pro` → Your Server IP
  - `n8n.alwaleed.pro` → Your Server IP
- [ ] Wait for DNS propagation (can take up to 48 hours)

### **2. Server Requirements**

- [ ] VPS/Server running (DigitalOcean, AWS, Hetzner, etc.)
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Ports open: 80, 443
- [ ] SSH access configured

### **3. Environment Variables**

- [ ] Create `.env` file from `.env.production.template`
- [ ] Update `DOMAIN_NAME` with your actual domain
- [ ] Set `SSL_EMAIL` for Let's Encrypt notifications
- [ ] Add all Supabase credentials
- [ ] Add Paylink production keys
- [ ] Add CloudPrinter API key

---

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Environment File**

```bash
# Copy template
cp .env.production.template .env

# Edit with your values
nano .env
```

**Required variables:**
```env
DOMAIN_NAME=alwaleed.pro
SUBDOMAIN=n8n
SSL_EMAIL=your-email@example.com

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key

SUPABASE_SERVICE_ROLE_KEY=your_key
PAYLINK_SECRET_KEY=your_production_key
PAYLINK_APP_ID=your_production_app_id
CLOUD_PRINTER_KEY=your_key
```

---

### **Step 2: Upload Files to Server**

```bash
# From your local machine
scp -r /path/to/alwaleed-backend user@your-server-ip:/app

# Or use git
ssh user@your-server-ip
cd /app
git clone your-repo-url .
```

---

### **Step 3: First Time Setup**

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to app directory
cd /app

# Start services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

---

### **Step 4: Verify SSL Certificates**

After starting, Traefik will automatically request SSL certificates from Let's Encrypt.

```bash
# Check Traefik logs
docker-compose logs traefik

# You should see:
# ✅ "acme: Trying to solve TLS-ALPN-01 challenge"
# ✅ "Certificate obtained"
```

**Note:** First SSL request may take 1-2 minutes.

---

### **Step 5: Access Your Services**

- **Main App:** https://alwaleed.pro
- **n8n Webhooks:** https://n8n.alwaleed.pro
- **Traefik Dashboard:** http://your-server-ip:8080

---

## 🔍 Verification Steps

### **Check All Services Running**

```bash
docker-compose ps
```

Should show:
```
NAME           STATUS      PORTS
traefik        Up          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
alwaleed-app   Up (healthy) 
n8n            Up
```

### **Test Health Checks**

```bash
# Main app health
curl https://alwaleed.pro/health

# Expected: {"status":"healthy",...}
```

### **Check SSL**

```bash
# Test SSL certificate
curl -I https://alwaleed.pro

# Should show:
# HTTP/2 200
# strict-transport-security: max-age=315360000
```

---

## 🔄 Update & Maintenance

### **Deploy New Code**

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Or with zero downtime:
docker-compose up -d --build --force-recreate
```

### **View Logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f alwaleed-app
docker-compose logs -f traefik
docker-compose logs -f n8n

# Last 100 lines
docker-compose logs --tail=100 alwaleed-app
```

### **Restart Services**

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart alwaleed-app
```

---

## 🛡️ Security Features

Your setup includes:

✅ **Automatic HTTPS** - Let's Encrypt SSL certificates  
✅ **HTTP → HTTPS redirect** - All traffic forced to HTTPS  
✅ **HSTS Headers** - Strict Transport Security enabled  
✅ **Security Headers** - XSS protection, clickjacking prevention  
✅ **Docker Socket Protection** - Read-only access  
✅ **No root containers** - Non-root users in Dockerfile  

---

## 📊 Monitoring

### **Container Health**

```bash
# Check health status
docker inspect alwaleed-app --format='{{.State.Health.Status}}'

# Should return: healthy
```

### **Resource Usage**

```bash
# View resource usage
docker stats

# Shows CPU, memory, network usage
```

### **Logs Analysis**

```bash
# Search for errors
docker-compose logs | grep -i error

# Check Paylink requests
docker-compose logs | grep -i paylink
```

---

## 🐛 Troubleshooting

### **Issue: SSL Certificate Not Generated**

**Symptoms:** HTTPS not working, certificate errors

**Solutions:**
```bash
# 1. Check DNS is correct
nslookup alwaleed.pro

# 2. Check Traefik logs
docker-compose logs traefik | grep acme

# 3. Verify email in .env
cat .env | grep SSL_EMAIL

# 4. Restart Traefik
docker-compose restart traefik
```

### **Issue: Container Won't Start**

```bash
# Check logs
docker-compose logs alwaleed-app

# Common causes:
# - Missing environment variables
# - Port conflicts
# - Database connection issues

# Verify environment
docker-compose config
```

### **Issue: 502 Bad Gateway**

**Cause:** Backend container not healthy

```bash
# Check health
docker-compose ps

# Check backend logs
docker-compose logs alwaleed-app

# Restart if needed
docker-compose restart alwaleed-app
```

### **Issue: n8n Webhooks Not Working**

```bash
# Verify n8n is running
docker-compose ps n8n

# Check n8n logs
docker-compose logs n8n

# Test webhook URL
curl https://n8n.alwaleed.pro/webhook/test
```

---

## 🔐 Production .env Template

```env
# Domain Configuration
DOMAIN_NAME=alwaleed.pro
SUBDOMAIN=n8n
SSL_EMAIL=admin@alwaleed.pro

# Application
PORT=3000
NODE_ENV=production
GENERIC_TIMEZONE=Asia/Riyadh

# Frontend Build Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://alwaleed.pro

# Backend Runtime Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

CLOUD_PRINTER_KEY=your_key
PAYLINK_SECRET_KEY=your_production_key
PAYLINK_APP_ID=your_production_app_id
PAYLINK_TEST_MODE=false
```

---

## 📝 Important Notes

1. **First Deployment Takes Longer** - SSL cert generation adds 1-2 minutes
2. **DNS Must Be Configured** - Domain must point to your server before SSL works
3. **Volumes Are Persistent** - Data survives container restarts
4. **Use External Volumes in Production** - For traefik_data and n8n_data
5. **Monitor Logs Initially** - Watch for any errors during first deployment

---

## 🎯 Quick Commands Reference

```bash
# Deploy
docker-compose up -d --build

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Update
git pull && docker-compose up -d --build

# Status
docker-compose ps

# Health
docker inspect alwaleed-app --format='{{.State.Health.Status}}'
```

---

## ✅ Post-Deployment Checklist

- [ ] HTTPS working on main domain
- [ ] HTTPS working on n8n subdomain
- [ ] Health check returns healthy
- [ ] Can login to application
- [ ] Payments work (test with Paylink test mode first)
- [ ] n8n webhooks accessible
- [ ] Traefik dashboard accessible
- [ ] Logs show no critical errors
- [ ] SSL certificates auto-renew (check in 2 months)

---

**Your production setup is complete and ready to deploy! 🚀**

For questions or issues, check the troubleshooting section above.
