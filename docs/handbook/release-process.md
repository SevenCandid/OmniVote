# Release Process

This document defines the versioning strategy, pre-release checklists, and deployment protocols for OmniVote.

---

## 1. Versioning Strategy (Semantic Versioning)

OmniVote uses Semantic Versioning 2.0.0. Releases are tagged in the format `vMAJOR.MINOR.PATCH`:
- **`MAJOR`**: Significant platform upgrades or breaking API changes (e.g. `v1.0.0` -> `v2.0.0`).
- **`MINOR`**: Adding feature sets in a backwards-compatible manner (e.g. `v1.0.0` -> `v1.1.0`).
- **`PATCH`**: Backwards-compatible bug fixes and style tweaks (e.g. `v1.0.0` -> `v1.0.1`).

---

## 2. Feature Development Lifecycle

Every feature goes through the following stages:

```
Idea ──> Requirement ──> Design ──> Architecture Review ──> Implementation ──> Testing ──> Review ──> Release
```

---

## 3. Pre-Release Checklist

Before tagging and publishing a new release, developers must complete this checklist:

### 1. Code Validation
- Ensure all quality checks (Ruff, ESLint, Prettier, TypeScript compile) pass cleanly:
  ```bash
  # Inside backend
  ruff check . && ruff format --check .
  
  # Inside frontend
  npm run lint && npm run format:check && npm run type-check
  ```
- Verify all automated test suites pass and satisfy coverage minimums (90% backend, 85% frontend):
  ```bash
  # Inside backend
  pytest --cov=app
  
  # Inside frontend
  npm run coverage
  ```

### 2. Documentation Updates
- Update the changelog in `docs/roadmap/changelog.md` with the new version, date, and changes list.
- If database models changed, verify that the corresponding Alembic migrations are compiled and tested:
  ```bash
  alembic history
  ```

### 3. Tagging & Publishing
- Create a new release tag in Git:
  ```bash
  git tag -a v1.0.0 -m "Release version 1.0.0"
  git push origin v1.0.0
  ```
- Write release notes using the release notes template.
- Push the Docker production build compilation files and deploy them to the staging environment.
