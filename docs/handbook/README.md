# OmniVote Engineering Handbook

Welcome to the internal engineering handbook for OmniVote, powered by **VeroSeven**. This document serves as the single source of truth for our development principles, architecture guidelines, coding conventions, testing processes, and deployment workflows.

---

## 1. Engineering Philosophy & Core Principles

Our primary engineering principle is:
> **Build systems people can trust.**

We achieve this by upholding the following development rules across all code written:
- **Clarity over Cleverness**: Maintainable code is readable code. Avoid over-engineering or premature optimization.
- **Secure by Default**: Authenticate all actions, validate all inputs, and redact log credentials.
- **Scalability from Day One**: Structure multi-tenant database keys and caching strategies assuming high-concurrency traffic.
- **Graceful Failure Handling**: Log exceptions safely with traceability headers and return standard JSON error envelopes instead of code leaks.
- **Quality Gates Validation**: Linting, formatting, type checking, and unit testing are part of the active loop of coding, not an afterthought.

---

## 2. Handbook Organization

Navigate our guidelines using the links below:

### Core Standards
- **[Engineering Principles](file:///c:/Users/DELL/omnivote/docs/handbook/engineering-principles.md)**: Details on Quality, Security, Scalability, and Reliability guidelines.
- **[Architecture Blueprints](file:///c:/Users/DELL/omnivote/docs/handbook/architecture-guidelines.md)**: Monorepo decoupled client-server structures, database migrations, and async processing.
- **[Coding Standards](file:///c:/Users/DELL/omnivote/docs/handbook/coding-standards.md)**: Python PEP8 configurations, Ruff setups, React JSX hooks, and Zustand rules.
- **[Security Standards](file:///c:/Users/DELL/omnivote/docs/handbook/security-standards.md)**: Password hashing, input checks, log redactor patterns, and audits.
- **[Testing Guidelines](file:///c:/Users/DELL/omnivote/docs/handbook/testing-standards.md)**: Coverage metrics, Pytest and Vitest checks, Mock Service Worker (MSW) specifications.
- **[Documentation Rules](file:///c:/Users/DELL/omnivote/docs/handbook/documentation-standards.md)**: Keeping stale documentation out, markdown rules, and ADR writing rules.
- **[Release & Versioning](file:///c:/Users/DELL/omnivote/docs/handbook/release-process.md)**: Semantic Versioning rules and release checklists.
