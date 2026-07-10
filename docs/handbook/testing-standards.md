# Testing Standards

This document outlines the testing architecture, fixture usage guidelines, and minimum code coverage targets for OmniVote.

---

## 1. Automated Testing Frameworks

- **Backend API**: Python **Pytest** with `pytest-asyncio` for async endpoint validation.
- **Frontend App**: **Vitest** with JSDOM and React Testing Library (RTL).
- **Mocks**: Mock Service Worker (MSW) intercepts network calls in frontend components testing.

---

## 2. Minimum Coverage Expectations

To prevent code regressions, quality pipelines enforce strict code coverage targets on every commit merge:
- **Backend Coverage Target**: Minimum **90%** statement coverage.
- **Frontend Coverage Target**: Minimum **85%** component/utility coverage.

---

## 3. Test Categories & Scopes

- **Unit Tests**: Test isolated helper functions, decorators, validators, and custom exception handler logic without database or network connections.
- **Integration Tests**: Verify database inserts, Alembic schema tables updates, and Redis caching. Backend integration tests use an in-memory SQLite database (`sqlite+aiosqlite:///:memory:`) to run quickly.
- **API Tests**: Test routes inputs/outputs, response schemas, and header checks using FastAPI's `TestClient` or `AsyncClient`.
- **Component Tests**: Test UI element rendering, props binding, loading indicators, and user click actions using React Testing Library.

---

## 4. Conventions & Best Practices

- **Test Naming**: Name test files following the `test_*.py` (backend) or `*.test.tsx` (frontend) format. Use descriptive method names: `test_health_endpoint_redis_connected`.
- **Mocking side-effects**: Mock external network dependencies (like SMS or Email dispatches) to keep tests fast, offline-capable, and deterministic.
- **Cleanup**: Call cleanup hooks (like React Testing Library's `cleanup()`) after each test to clear test environments and prevent memory leaks.
