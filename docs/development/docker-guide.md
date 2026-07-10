# OmniVote Local Docker Development Guide

This guide describes how to manage and run the OmniVote stack locally using Docker and Docker Compose.

---

## Prerequisites
Ensure you have **Docker Desktop** installed and running on your host system.

---

## 1. Startup and Lifecycle Commands

### Start the Stack
To start all services in the background (detached mode) and view their container states:
```bash
docker compose up -d
```
If you wish to view real-time log aggregates in the active terminal:
```bash
docker compose up
```

### Stop the Stack
To stop and clean up containers, networks, and resources without losing volume data:
```bash
docker compose down
```
If you also want to remove all local database volumes to start fresh:
```bash
docker compose down -v
```

### Rebuild Containers
If you add dependency packages (to `requirements.txt` or `package.json`), force-rebuild the containers to refresh cached layer volumes:
```bash
docker compose build --no-cache
```

### Restart a Specific Service
To restart a single container without restarting the entire stack (e.g. backend api):
```bash
docker compose restart omnivote-api
```

---

## 2. Logs and Monitoring

### View Logs
To view aggregate logs from all services:
```bash
docker compose logs -f
```
To view logs for a single service (e.g., frontend):
```bash
docker compose logs -f omnivote-web
```

### Container Statuses
To check the runtime health, uptime, and port mapping configs of all running containers:
```bash
docker compose ps
```

---

## 3. Database Management & Migrations

### Execute Database Migrations
OmniVote uses Alembic for SQLAlchemy database schema versioning. Run migrations inside the API container context:
```bash
docker compose exec omnivote-api alembic upgrade head
```

### Create a New Database Migration
If you make changes to database models, generate a new auto-version migration file:
```bash
docker compose exec omnivote-api alembic revision --autogenerate -m "revision_name"
```

---

## 4. Database Reset Procedures

> [!CAUTION]
> **DESTRUCTIVE COMMAND WARNING**
> The following commands will delete all local PostgreSQL tables, records, volumes, and state. Ensure no critical local configurations exist before execution.

To completely reset the local database and volumes back to initialization states:
```bash
# 1. Spin down all containers and drop named volumes
docker compose down -v

# 2. Restart services to auto-provision fresh clean volumes
docker compose up -d

# 3. Re-execute migrations to build the tables
docker compose exec omnivote-api alembic upgrade head
```
