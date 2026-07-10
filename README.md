# OmniVote
> One System. Every Vote.

Powered by **VeroSeven**

[![CI Build Status](https://github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci.yml)
[![Backend Tests Status](https://github.com/{owner}/{repo}/actions/workflows/backend.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/backend.yml)
[![Frontend Tests Status](https://github.com/{owner}/{repo}/actions/workflows/frontend.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/frontend.yml)
[![Code Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

OmniVote is a secure, multi-tenant, cloud-native SaaS voting platform designed to centralize and streamline the management of all forms of voting events. Built to support thousands of concurrent organizations, the platform delivers solutions for strict democratic student and corporate elections (Module A) as well as high-throughput paid public voting contests (Module B).

---

## Technical Core Stack

### Frontend Application
* **Framework:** React with TypeScript (Vite bundler)
* **Styling & UI:** Tailwind CSS & ShadCN UI
* **State Management & Forms:** TanStack Query & React Hook Form
* **Validations:** Zod schema modeling

### Backend API Service
* **Framework:** FastAPI (Python 3.13+)
* **Database & ORM:** PostgreSQL & SQLAlchemy 2.x (with Alembic migrations)
* **Caching & Broker:** Redis
* **Task Queues:** Celery asynchronous workers

### Deployment Infrastructure
* **Containerization:** Docker & Docker Compose
* **Proxy / Load Balancing:** Nginx reverse proxy

---

## Monorepo Directory Organization

The repository follows a clean, decoupled monorepo architecture:

```
omnivote/
├── apps/
│   ├── web/                     # React PWA Client Application
│   └── api/                     # FastAPI Backend API Application
├── packages/
│   ├── shared-types/            # Shared TypeScript type definitions
│   ├── shared-config/           # Shared configurations (linters, tailwind bases)
│   └── shared-utils/            # Shared business utility logic
├── infrastructure/
│   ├── docker/                  # Environment Dockerfiles
│   ├── nginx/                   # Nginx proxy profiles
│   └── deployment/              # Production orchestration scripts
├── scripts/                     # Local management and orchestration scripts
├── docs/                        # Platform engineering specs
│   ├── prd/                     # Product Requirements Document
│   ├── architecture/            # System Architecture Design
│   ├── database/                # Domain Models & DB Architecture
│   ├── design/                  # Design Language Specification
│   ├── api/                     # OpenAPI Specs & Webhook Contracts
│   └── engineering/             # Engineering Handbook
├── tests/                       # Global E2E test suites (Playwright)
└── .github/                     # Workflows and template definitions
```

---

## Platform Core Documentation
The following documents define the specifications of the OmniVote platform:
* **Product Specifications:** [PRD](file:///c:/Users/DELL/omnivote/docs/prd/PRD.md)
* **Architectural Blueprint:** [System Architecture](file:///c:/Users/DELL/omnivote/docs/architecture/architecture.md)
* **Data Layer Design:** [Domain Model & Database Design](file:///c:/Users/DELL/omnivote/docs/database/domain_model_and_db_design.md)
* **UI/UX System Rules:** [Design Language (ODL)](file:///c:/Users/DELL/omnivote/docs/design/design_language.md)
* **Interface Specification:** [API Contracts](file:///c:/Users/DELL/omnivote/docs/api/api_specification.md)
* **Engineering Standards:** [Engineering Handbook](file:///c:/Users/DELL/omnivote/docs/engineering/engineering_handbook.md)

---

## Local Development Setup

### Backend API (`apps/api`)
1. **Python Version**: Python 3.13+ is required (verified against Python 3.14).
2. **Virtual Environment Setup**:
   Create a virtual environment inside the `apps/api` directory:
   ```bash
   cd apps/api
   python -m venv .venv
   .venv\Scripts\activate     # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Copy the `.env.example` file to `.env` and fill in local credentials:
   ```bash
   cp .env.example .env
   ```
5. **Run the API Server**:
   Start the FastAPI development server:
   ```bash
   python -m app.main
   ```
   The API will be available at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/api/v1/docs`.

6. **Verify with Tests**:
   Run the test suite using pytest:
   ```bash
   python -m pytest
   ```


---

## Contributions & Conventions
Refer to the [CONTRIBUTING.md](file:///c:/Users/DELL/omnivote/CONTRIBUTING.md) guidelines for commit messaging formats (Conventional Commits), branching rules, and PR merge requirements.
