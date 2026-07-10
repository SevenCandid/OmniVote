# Changelog

All notable changes to the OmniVote platform will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-10

### Added
- **Repository Architecture**: Monorepo layout containing `apps/web` (React 19, TS, Vite) and `apps/api` (FastAPI, Python 3.13, SQLite/PostgreSQL, Redis, Arq background workers).
- **Docker Dev Environment**: Preconfigured Docker Compose orchestrator running databases, Redis caches, object storage, API servers, and frontend hot-reloading configurations.
- **Code Quality Gates**: Registered Ruff lint checks, ESLint, Prettier rules, and pre-commit Git conventional commits validator.
- **Testing Foundation**: Configured Pytest (90% target, XML/HTML outputs), Vitest + React Testing Library (100% component/util coverage), and MSW server handlers.
- **Engineering Handbook & Governance**: Established handbook documents, templates (features, bugs, sprints, releases, ADRs), Git branching guidelines, and roadmap trackers.
