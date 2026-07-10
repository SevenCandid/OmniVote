# OmniVote Testing Architecture & Guidelines

This guide defines the automated testing architecture, directories, mocks, and fixtures for the OmniVote platform.

---

## 1. Testing Technology Stack

### Backend (Python / FastAPI)
- **Framework**: [Pytest](https://docs.pytest.org/)
- **Async Environment**: `pytest-asyncio`
- **HTTP Client**: `httpx` AsyncClient
- **Factories**: `factory-boy` & `faker`
- **Coverage**: `pytest-cov` (target: **90%** minimum)

### Frontend (TypeScript / React)
- **Runner**: [Vitest](https://vitest.dev/)
- **Utility**: React Testing Library (RTL)
- **DOM Mock**: `jsdom`
- **API Mocks**: Mock Service Worker (MSW)
- **Coverage**: `@vitest/coverage-v8` (target: **85%** minimum)

---

## 2. Directory Layouts

### Backend Test Layout
Backend tests are organized under [apps/api/tests](file:///c:/Users/DELL/omnivote/apps/api/tests/):
```text
tests/
├── unit/         # Isolated logic tests (math, validations, helpers)
├── integration/  # Database, transaction, caching tests
├── api/          # Route endpoint inputs/outputs and response schema validation
├── fixtures/     # Reusable pytest fixtures (test_user, test_organization)
├── factories/    # Factory Boy generator classes
├── mocks/        # External services mock setups
├── data/         # Offline mock binary files / static JSON sets
├── utils/        # Internal testing helper modules
└── conftest.py   # Global fixtures and database lifespan hooks
```

### Frontend Test Layout
Frontend tests are organized under [apps/web/src/tests](file:///c:/Users/DELL/omnivote/apps/web/src/tests/):
```text
src/tests/
├── components/   # Component layouts, props, loading indicators
├── pages/        # Router bindings and container pages
├── hooks/        # React hook state tracking
├── services/     # MSW endpoints and client handlers
├── utils/        # Test-only render utilities
├── mocks/        # MSW node client/server structures
├── fixtures/     # Sample entity data (userFixture, orgFixture)
└── setup.ts      # Global Vitest lifecycle configurations
```

---

## 3. Backend Test Configuration

### Pytest Configuration
Configured in `pyproject.toml`:
- SQLite in-memory is used for fast test runs: `sqlite+aiosqlite:///:memory:`
- Coverage files output to HTML (`htmlcov/`) and XML (`coverage.xml`) format.

### Database Factories (Factory Boy & Faker)
Model mock records are generated dynamically in [apps/api/tests/factories/factories.py](file:///c:/Users/DELL/omnivote/apps/api/tests/factories/factories.py):
```python
class UserFactory(factory.DictFactory):
    id = factory.LazyFunction(fake.uuid4)
    email = factory.LazyAttribute(lambda o: fake.email())
```

### Mocking Strategy (Backend)
- **Redis Connection**: Mocked globally using `unittest.mock.AsyncMock` in `conftest.py` to prevent local connection failures during local pytest runs.
- **External Services**: Mock third-party APIs (like email templates or sms clients) inside `tests/mocks/` before execution.

---

## 4. Frontend Test Configuration

### MSW API Mocking
API routes are intercepted using Mock Service Worker (MSW) in [apps/web/src/tests/mocks/handlers.ts](file:///c:/Users/DELL/omnivote/apps/web/src/tests/mocks/handlers.ts):
```typescript
http.get('*/api/v1/health', () => {
  return HttpResponse.json({ status: 'healthy' });
})
```

### Reusable Custom Render
The custom `render` wrapper located in [apps/web/src/tests/utils/custom-render.tsx](file:///c:/Users/DELL/omnivote/apps/web/src/tests/utils/custom-render.tsx) automatically injects:
1. `QueryClientProvider` (TanStack Query)
2. `BrowserRouter` (React Router)
3. `ThemeProvider` (Visual settings)

Use this inside test files:
```typescript
import { render, screen } from '../utils/custom-render';
```

---

## 5. Developer CLI Commands

### Backend Commands (from `apps/api`)
- **Run all tests**: `pytest`
- **Run isolated test file**: `pytest tests/api/test_health.py`
- **Run with coverage**: `pytest --cov=app`
- **Generate coverage reports**: `pytest --cov-report=html --cov-report=xml`
- **Docker validation**: `docker compose exec omnivote-api pytest`

### Frontend Commands (from `apps/web`)
- **Run all tests (single pass)**: `npm run test`
- **Interactive watch mode**: `npm run test:watch`
- **Generate coverage report**: `npm run coverage`
- **Docker validation**: `docker compose exec omnivote-web npm run test`

---

## 6. Known Limitations

1. **SQLite In-Memory vs PostgreSQL**: SQLite in-memory doesn't support PostgreSQL-specific features like `JSONB` properties or native multi-tenant schema locks. For integration tests relying on native JSON actions, run testing suites using PostgreSQL bounds.
2. **Network sandbox**: Running tests inside Docker compose executes within a closed environment network. External service integrations must be fully mocked to avoid timeout hangs.
