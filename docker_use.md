# Docker Deployment

## Quick Start

From project root:

```bash
docker-compose up --build
```

**Access:**
- Frontend: http://localhost
- Backend: http://localhost:5000

## Common Commands

```bash
docker-compose up          # Start containers
docker-compose up -d       # Start in background
docker-compose down        # Stop containers
docker-compose logs -f     # View logs
docker-compose logs -f backend  # Backend logs only
```

## Files Overview

- `docker-compose.yml` - Orchestrates backend & frontend containers
- `backend/Dockerfile` - Flask app with Gunicorn
- `frontend/Dockerfile` - React with nginx (multi-stage build)
- `frontend/nginx.conf` - Proxies API requests & WebSocket to backend
- `.dockerignore` - Excludes unnecessary files from build

## Environment Configuration

Edit `docker-compose.yml` to change:
- `REACT_APP_API_URL` - Backend URL (default: `http://backend:5000`)
- `FLASK_ENV` - Flask environment (default: production)

## Troubleshooting

**Frontend won't load:**
```bash
docker-compose logs frontend
```

**Backend won't start:**
```bash
docker-compose logs backend
```

**Rebuild after code changes:**
```bash
docker-compose down
docker-compose up --build
```

## Production

1. SSH into Ubuntu server
2. Install: `sudo apt install docker.io docker-compose`
3. Clone repo: `git clone <repo-url>`
4. Run: `docker-compose up -d`
5. Access: `http://your-server-ip`

## Architecture

Frontend (nginx) ←→ Backend (Flask/Gunicorn) connected via Docker network.
Both services share internal network and communicate by container name.
