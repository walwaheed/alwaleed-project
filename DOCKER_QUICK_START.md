# 🐳 Docker Deployment - Quick Reference

## 📁 Created Files

1. **Dockerfile.backend** - Backend production container configuration
2. **Dockerfile.frontend** - Frontend production container with nginx
3. **docker-compose.yml** - Orchestration with Traefik reverse proxy
4. **.dockerignore** - Files to exclude from Docker builds
5. **.env.production.example** - Production environment template
6. **DOCKER_DEPLOYMENT.md** - Complete deployment guide
7. **deploy.sh** - Interactive deployment script

## ⚡ Quick Start Commands

### First Time Setup

```bash
# 1. Create production environment file
cp .env.production.example .env
nano .env  # Edit with your values

# 2. Update domain names in docker-compose.yml
# Replace: yourdomain.com, api.yourdomain.com, traefik.yourdomain.com

# 3. Generate Traefik password
echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g

# 4. Build and start
docker-compose build
docker-compose up -d
```

### Daily Operations

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Update application
git pull
docker-compose build
docker-compose up -d
```

## 🌐 Access URLs

After deployment, access your services:

- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://api.yourdomain.com`
- **Traefik Dashboard**: `https://traefik.yourdomain.com`

## 📋 Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `PAYLINK_TEST_MODE=false`
- [ ] Replace all `yourdomain.com` in docker-compose.yml
- [ ] Set email for Let's Encrypt
- [ ] Generate strong Traefik password
- [ ] Ensure DNS points to your server
- [ ] Open ports 80 and 443 on firewall
- [ ] Test locally before deploying

## 🔧 Configuration Required

### 1. Environment Variables (.env)

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PAYLINK_APP_ID=your-app-id
PAYLINK_SECRET_KEY=your-secret
PAYLINK_TEST_MODE=false
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=5000
```

### 2. Domain Names (docker-compose.yml)

Find and replace these placeholders:

```yaml
# Backend
Host(`api.yourdomain.com`)

# Frontend
Host(`yourdomain.com`) || Host(`www.yourdomain.com`)

# Traefik Dashboard
Host(`traefik.yourdomain.com`)

# Let's Encrypt email
acme.email=your-email@example.com

# Traefik password (generated)
basicauth.users=admin:$$apr1$$...
```

## 🏥 Health Checks

All services include health checks:

- **Backend**: `GET /health`
- **Frontend**: `GET /health`
- **Auto-healing**: Docker restarts unhealthy containers

## 🔒 Security Features

✅ **SSL/TLS**: Automatic Let's Encrypt certificates
✅ **HTTPS Redirect**: Automatic HTTP to HTTPS
✅ **Security Headers**: HSTS, X-Frame-Options, CSP
✅ **Non-root Users**: Containers run as unprivileged users
✅ **Network Isolation**: Private Docker network
✅ **Basic Auth**: Traefik dashboard protection

## 📊 Monitoring

```bash
# Container stats
docker stats

# Service health
docker-compose ps

# Detailed health
docker inspect --format='{{.State.Health.Status}}' alwaleed-backend

# View Traefik dashboard
https://traefik.yourdomain.com
```

## 🔄 Backup & Restore

### Backup

```bash
# Using deploy script
./deploy.sh  # Select option 7

# Manual backup
docker run --rm -v alwaleed-backend_backend-uploads:/data \
  -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz /data
```

### Restore

```bash
docker run --rm -v alwaleed-backend_backend-uploads:/data \
  -v $(pwd):/backup alpine tar xzf /backup/uploads.tar.gz -C /
```

## 🐛 Troubleshooting

### Containers won't start
```bash
docker-compose logs
docker-compose ps
```

### SSL issues
```bash
# Check DNS
dig yourdomain.com

# View Traefik logs
docker-compose logs traefik

# For testing, use Let's Encrypt staging
```

### 502 Bad Gateway
```bash
# Check backend health
docker exec alwaleed-backend wget -O- http://localhost:5000/health

# Restart backend
docker-compose restart backend
```

## 📚 Documentation

- **Full Guide**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **Docker**: https://docs.docker.com/
- **Traefik**: https://doc.traefik.io/traefik/
- **Let's Encrypt**: https://letsencrypt.org/docs/

## 🎯 Architecture

```
                    ┌─────────────┐
                    │   Internet  │
                    └──────┬──────┘
                           │
                  ┌────────▼─────────┐
                  │     Traefik      │ :80, :443
                  │  (Reverse Proxy) │
                  └────┬────────┬────┘
                       │        │
            ┌──────────▼─┐  ┌──▼──────────┐
            │  Frontend  │  │   Backend   │
            │   (nginx)  │  │  (Node.js)  │
            │    :80     │  │    :5000    │
            └────────────┘  └─────────────┘
                                  │
                            ┌─────▼──────┐
                            │  Supabase  │
                            │  (Cloud)   │
                            └────────────┘
```

## 📞 Support

For detailed help, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

**Ready to deploy?** Run `./deploy.sh` for interactive deployment!
