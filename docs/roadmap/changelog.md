# Changelog

All notable changes to the OmniVote platform will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.2.4-alpha] - 2026-07-20

### Added
- **RBAC Foundation**: Database models, services, permission seeding, and route-level authorization guards on the backend (`RequirePermission`).
- **Organization & Member Security**: Locked down organization update/delete routes, built page-level permission checks, and restricted sensitive role lists for regular members.
- **Improved UX & Modals**: Built a custom React `ConfirmDialog` component, replacing all native browser pop-ups (`window.confirm`/`alert()`) on the memberships and roles pages with toasts.
- **Invitation Cascade**: Modified the invitation revocation service to cascade deletion to active memberships for accepted invitations, allowing complete deletion.
- **Eager Loading Emails**: Integrated SQL eager loading (`selectinload`) to prevent N+1 query loops when listing memberships with nested user names and email fields.
- **Dashboard Scrolling & Isolated Panels**: Fixed full-viewport scrolling isolation so only the main page content panel scrolls, keeping the sidebar and footer branding static.

---

## [0.2.3-alpha] - 2026-07-18

### Added
- **Membership Platform**: Introduced the foundational module for linking Users to Organizations.
- **Membership Lifecycle**: Support for creating invitations, accepting/declining them, and suspending/removing members.
- **Frontend Membership Management**: Added UI pages for managing organization members and pending user invitations.
- **Platform Separation**: Maintained strict architectural boundaries between Identity, Organization, and Membership contexts.
- **Automated Tests**: Completed comprehensive API testing and testing fixtures for membership workflows.

---

## [0.2.2-alpha] - 2026-07-18

### Added
- **Identity Platform**: Reusable bounded context providing User Management, Authentication, Sessions, and Security Audit logs.
- **Authentication Flows**: E2E workflows for User Registration, Email Verification, Login, Logout, and Password Resets.
- **Security Hardening**: Argon2 password hashing, SHA-256 for short-lived link tokens, secure JWT tokens.
- **Session Management**: Persistent refresh tokens, device tracking, and session revocation support.
- **Audit Ledger**: Automatic logging of critical security events (login success, failures, verification, password resets).

---

## [0.2.1-alpha] - 2026-07-15

### Added
- **Documentation**: Integrated OmniVote product history into engineering onboarding documentation.
- **Product History**: Created the official `docs/roadmap/product-history.md` outlining the evolution of OmniVote from concept to an enterprise-grade platform.
- **Domain Architecture**: Completed extensive Domain-Driven Design (DDD) documents defining bounded contexts, events, aggregates, and business rules (`docs/architecture/`).
- **Organization Management**: Implemented backend models, schemas, and endpoints for tenant `Organization` entities along with their 1:1 settings, branding, and subscriptions (`apps/api/`).
- **Organization UI**: Added TanStack Query client, Zod validation schemas, and React views for creating, listing, and managing organization profiles (`apps/web/`).

### Fixed
- **Organization UI Routing**: Fixed a routing bug where `/dashboard/organizations/new` incorrectly evaluated `isNew` to false due to parameter matching, causing the save button to fail silently.
- **API Error Parsing**: Enhanced the frontend API service to properly parse and display detailed `422 Unprocessable Content` validation errors from FastAPI.
- **Payload Sanitization**: Implemented form data sanitization to strip empty strings for optional fields, ensuring strict compatibility with backend Pydantic schemas (e.g. `EmailStr`, `HttpUrl`).

---

## [1.0.0] - 2026-07-10

### Added
- **Repository Architecture**: Monorepo layout containing `apps/web` (React 19, TS, Vite) and `apps/api` (FastAPI, Python 3.13, SQLite/PostgreSQL, Redis, Arq background workers).
- **Docker Dev Environment**: Preconfigured Docker Compose orchestrator running databases, Redis caches, object storage, API servers, and frontend hot-reloading configurations.
- **Code Quality Gates**: Registered Ruff lint checks, ESLint, Prettier rules, and pre-commit Git conventional commits validator.
- **Testing Foundation**: Configured Pytest (90% target, XML/HTML outputs), Vitest + React Testing Library (100% component/util coverage), and MSW server handlers.
- **Engineering Handbook & Governance**: Established handbook documents, templates (features, bugs, sprints, releases, ADRs), Git branching guidelines, and roadmap trackers.
