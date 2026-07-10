# Local Development Guide

This guide describes how to configure, run, and develop the OmniVote application on your local machine.

---

## 1. Prerequisites
Ensure you have the following installed locally:
- **Git** (version 2.40+)
- **Docker** & **Docker Compose**
- **Node.js** (LTS version 22)
- **Python** (version 3.13+)

---

## 2. Containerized Stack Startup (Recommended)

The easiest way to start the entire OmniVote development environment is using Docker Compose.

```bash
# Clone the repository
git clone https://github.com/SevenCandid/OmniVote.git
cd omnivote

# Copy environment template
cp .env.example .env

# Build and start all services (web, api, database, redis, arq worker)
docker compose up -d --build
```

### Services Mapping
Once the containers are started, the services are mapped as follows:
- **React Frontend**: `http://localhost:5173`
- **FastAPI Backend API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/api/v1/docs`
- **PostgreSQL Database**: `localhost:5432` (user: `postgres`, password: `securepassword`, database: `omnivote`)
- **Redis Cache**: `localhost:6379`
- **MinIO Object Storage Console**: `http://localhost:9001` (user: `minioadmin`, password: `minioadminpassword`)

---

## 3. Local Non-Containerized Setup

If you prefer to run the services directly on your host environment (e.g. for step-by-step debugging):

### 1. Database & Cache Services (Keep Docker running them)
Run only the storage, cache, and database tiers inside Docker to avoid manual installs:
```bash
docker compose up -d omnivote-postgres omnivote-redis omnivote-storage
```

### 2. Backend Server Setup
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m app.main
```

### 3. Frontend Client Setup
```bash
cd apps/web
npm install --legacy-peer-deps
npm run dev
```

### 4. Background Worker Setup
```bash
cd apps/api
source .venv/bin/activate
arq app.workers.worker.WorkerSettings
```
