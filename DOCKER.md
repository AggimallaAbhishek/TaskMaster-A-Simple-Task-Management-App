# Docker Setup Guide - TaskMaster

## Overview

This project includes a complete Docker setup with:
- **Frontend**: React/Vite app served by Nginx
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL 16 for data persistence
- **Network**: All services connected via Docker network for easy communication

## Prerequisites

- Docker Desktop installed and running
- Docker Compose 2.0+

## Quick Start

### 1. Build Images
```bash
docker-compose build
```

### 2. Start Services
```bash
docker-compose up
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5433

### 3. Stop Services
```bash
docker-compose down
```

### 4. Clean Up Everything (including volumes)
```bash
docker-compose down -v
```

## Services

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Port**: 5433 (mapped from 5432)
- **User**: aggimallaabhishek
- **Password**: taskmaster_dev_password
- **Database**: taskmaster
- **Volume**: postgres_data (persistent storage)
- **Health Check**: Enabled, auto-restart on failure

### Backend Service
- **Image**: Node.js 18-alpine
- **Port**: 5000
- **Build**: ./backend/Dockerfile
- **Volumes**: Code synced with container for live reload
- **Environment**: All configured for Docker networking
- **Dependencies**: Waits for PostgreSQL health check

### Frontend Service
- **Image**: Nginx-alpine (multi-stage build)
- **Port**: 3000 (mapped to 80 in container)
- **Build**: ./frontend/Dockerfile with build arguments
- **Build Args**: VITE_API_URL=http://localhost:5000
- **Dependencies**: Waits for backend

## Environment Variables

### Backend (.env)
These are auto-created in Docker build:
```
NODE_ENV=development
PORT=5000
DB_HOST=postgres          # Service name (Docker DNS)
DB_PORT=5432
DB_USER=aggimallaabhishek
DB_PASSWORD=taskmaster_dev_password
DB_NAME=taskmaster
SESSION_SECRET=docker-dev-secret-key-change-in-production
LOG_LEVEL=debug
LOG_FORMAT=json
```

### Frontend (.env)
Used during build:
```
VITE_API_URL=http://localhost:5000  # From build args
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Specific Service
```bash
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Access Database Shell
```bash
docker-compose exec postgres psql -U aggimallaabhishek -d taskmaster
```

### Execute Commands in Container
```bash
# Backend
docker-compose exec backend npm run build

# Frontend
docker-compose exec frontend npm run build
```

### Restart Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Troubleshooting

### "Cannot connect to Docker daemon"
- Ensure Docker Desktop is running
- On Mac/Windows: Launch Docker Desktop application

### Frontend not connecting to backend
- Check if backend service is running: `docker-compose logs backend`
- Verify API_URL is correct: `http://localhost:5000` for local, `http://backend:5000` for Docker
- Check CORS settings in backend

### Database connection failed
- Verify PostgreSQL is healthy: `docker-compose logs postgres`
- Check port not already in use: `lsof -i :5433`
- Ensure DB_HOST=postgres (service name) in backend env

### Port Already in Use
```bash
# Find process on port
lsof -i :5000      # Backend
lsof -i :3000      # Frontend
lsof -i :5433      # Database

# Kill process
kill -9 <PID>
```

### Changes Not Reflecting in Frontend
- Frontend rebuilds only on `docker-compose build`
- Nginx serves built files, not live code
- For live reload: Run `npm run dev` locally instead of Docker

### Database Data Persists
- Data stored in `postgres_data` volume
- Survives `docker-compose down`
- Remove with `docker-compose down -v`

## Development Workflow

### Option 1: Full Docker (Recommended for Testing)
```bash
docker-compose up
```
All services run in containers, fully isolated.

### Option 2: Hybrid (Recommended for Development)
```bash
# Terminal 1: Database only
docker-compose up postgres

# Terminal 2: Backend locally
cd backend
npm install
npm start

# Terminal 3: Frontend locally
cd frontend
npm install
npm run dev
```
Better for live reload and faster iteration.

### Option 3: Local Only (No Docker)
```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
cd frontend && npm run dev
```

## Performance Tips

1. **Use volume mounts** for code (already configured)
2. **Build images locally** once, then reuse: `docker-compose build --no-cache`
3. **Exclude unnecessary files**: Check `.dockerignore` files
4. **Use Alpine images**: Smaller, faster (already using)
5. **Multi-stage build**: Frontend uses builder pattern for smaller image

## Production Differences

For production deployment (Render, Vercel, AWS, etc.):

1. **Use different .env** with real credentials
2. **Set GOOGLE_CLIENT_ID**, GOOGLE_CLIENT_SECRET
3. **Use HTTPS_ONLY** in all URLs
4. **Scale database**: Larger instance, backups
5. **Add reverse proxy**: nginx-ingress or load balancer
6. **Use managed databases**: RDS, CloudSQL instead of container

## Dockerfile Details

### Frontend
- **Node 18 Builder**: Compiles React/Vite app
- **Nginx Server**: Serves static files
- **Multi-stage**: Smaller final image (~50MB)
- **Build Args**: VITE_API_URL for different environments

### Backend
- **Node 18 Alpine**: Lightweight runtime
- **Single stage**: Simpler, no build step
- **Auto .env**: Creates default env vars
- **npm ci**: Reproducible installs

## Docker Hub Deployment

Push to Docker Hub (optional):
```bash
# Build with tags
docker build -t yourusername/taskmaster-backend:latest ./backend
docker build -t yourusername/taskmaster-frontend:latest ./frontend

# Push
docker push yourusername/taskmaster-backend:latest
docker push yourusername/taskmaster-frontend:latest

# Pull in production
docker pull yourusername/taskmaster-backend:latest
```

## Network Architecture

```
┌─────────────────────────────────────────┐
│       taskmaster-network (bridge)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │Frontend  │  │ Backend  │  │Postgres│ │
│  │:3000/80  │  │:5000     │  │:5432  │ │
│  └────┬─────┘  └────┬─────┘  └───┬───┘ │
│       │             │            │     │
│       └─────────────┼────────────┘     │
│                     │                  │
│       Internal DNS: backend.taskmaster │
│       hostname resolution works!       │
│                                         │
└─────────────────────────────────────────┘
```

Services can communicate using service names:
- Backend connects to `postgres` instead of `localhost`
- Frontend can reach `http://backend:5000`

## Security Notes

- **Development Only**: Default credentials are not secure
- **Do Not Push**: .env files in production
- **Rotate Secrets**: Change SESSION_SECRET for production
- **Use Secrets Manager**: AWS Secrets, Vault, etc. for production
- **Network Policy**: Restrict access to database in production

## Next Steps

1. ✅ Dockerfiles configured
2. ✅ docker-compose setup complete
3. ⏭️ Build and test: `docker-compose build && docker-compose up`
4. ⏭️ Deploy to cloud: Render, Vercel, AWS, GCP, etc.

---

**All Docker issues fixed!** 🐳
