# Technology Stack Decisions

This document summarizes the core technical stack choices made for the OmniVote platform and their primary engineering justifications.

---

## 1. Frontend Decisions

- **React 19**: Chosen to leverage the latest state-rendering optimizations, built-in action hooks (simplifying form state tracking), and concurrent loading models.
- **TypeScript**: Standardized across the frontend codebase to enable strict compiling checks, prevent runtime type exceptions, and provide IDE code completions.
- **Vite**: Replaces legacy Webpack setups. Vite provides fast hot module replacements (HMR) and fast build packaging.
- **Tailwind CSS**: Utility-first CSS compiling approach that allows rapid UI adjustments without bloating static stylesheet downloads.

---

## 2. Backend Decisions

- **Python 3.13+**: Provides significant runtime performance improvements, enhanced error reporting structures, and a modern standard library.
- **FastAPI**: Exceptionally fast ASGI web framework. FastAPI generates OpenAPI documentations dynamically and supports async route operations.
- **SQLAlchemy Async**: Allows clean database object-relational mapping (ORM) while running completely inside Python's asynchronous event loop, preventing database connections from blocking other worker threads.

---

## 3. Infrastructure & Background Task Decisions

- **PostgreSQL**: Standard enterprise-grade relational database. PostgreSQL supports transactional integrity (ACID), robust index searches, and isolated multi-tenant mapping bounds.
- **Redis**: High-performance in-memory caching layer that serves as the event broker for task queues, rate-limiter, and secure state caches.
- **Arq**: Redis-backed async task runner that registers and processes tasks inside the asyncio loop, avoiding the complexity and heavy footprint of Celery.
- **Docker & Docker Compose**: Restricts host dependency conflicts, standardizes container ports mapping, and ensures developers run exactly the same stack locally.
