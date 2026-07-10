# Architecture Guidelines

This document details the decoupled monorepo, API-first architecture, database migrations, and background worker paradigms for the OmniVote platform.

---

## 1. Decoupled Monorepo Structure

OmniVote is built as a single repository holding distinct modules under the `apps/` directory:
- **`apps/web/`**: Client application using React, TypeScript, and Vite.
- **`apps/api/`**: Server application using FastAPI, SQLAlchemy Async, and Python 3.13+.

### Why this Monorepo?
- **Shared Schemas**: Future integrations will leverage shared types and config structures inside `packages/` directories to prevent duplicating model schema structures.
- **Isolated Runtimes**: The web client compiles into static assets, while the backend API runs inside Python virtual environment scopes. They connect strictly via HTTP endpoints.

---

## 2. API-First Paradigm
- **Contracts**: Backend endpoints are documented using OpenAPI (Swagger). Ensure that every route is declared with detailed inputs/outputs schema scopes in FastAPI.
- **JSON Envelopes**: All route responses conform to the standard layout:
  ```json
  {
    "success": true,
    "message": "Resource successfully loaded.",
    "data": { ... },
    "metadata": { ... }
  }
  ```
- **Error schemas**: If a validation, database or authorization error occurs, return standard JSON response envelopes rather than internal python stack traces.

---

## 3. Database Migration Standards (Alembic)
- **Automatic Sync**: Never write direct DDL modifications or SQL commands to database tables in production.
- **Migrations**: Always run `alembic revision --autogenerate` from the backend directory to translate SQLAlchemy schema classes into Alembic migration scripts.
- **Upgrades**: Run migration upgrades during pipeline build or app initialization using `alembic upgrade head`.

---

## 4. Async-First Backend Processing
- **SQLAlchemy Async Session**: Use async connection sessions (`async_session_factory`) when reading or writing to database tables to prevent blocking thread execution.
- **Arq Background Processing**: For time-consuming actions (sending verification emails, processing ballot counts, exports compiling), dispatch task jobs to Redis queue. Workers run tasks asynchronously without hanging API threads.
