# OmniVote — Engineering Handbook & Development Standards v1.0
**One System. Every Vote.**
*Powered by VeroSeven*

---

## 1. Engineering Principles
* **Build for Maintainability:** Write clean, readable code with explicit type annotations. Code is read far more often than it is written.
* **Simplicity over Cleverness:** Avoid premature optimizations or over-engineering. Write straightforward code that is easy to debug and test.
* **Mobile-First Standard:** User interfaces must be optimized for mobile screens first and progressively enhanced for larger displays.
* **Security by Default:** Encrypt personally identifiable information (PII), use parameterized queries to prevent SQL injections, and validate all inputs at the API boundary.
* **Test Before Merge:** Every feature must include automated test coverage before being merged into the main codebase.
* **Documentation is Code:** Keep READMEs, API specifications, and Architecture Decision Records (ADRs) synchronized with implementation changes.

---

## 2. Repository Structure
OmniVote uses a monorepo structure containing frontend, backend, and deployment components:

```
omnivote/
├── backend/                  # FastAPI Application Source
│   ├── app/                  # Main source package
│   ├── migrations/           # Alembic database migrations
│   ├── tests/                # Pytest unit & integration suites
│   ├── Dockerfile.backend
│   └── pyproject.toml
├── frontend/                 # React TypeScript PWA Source
│   ├── src/                  # Components, hooks, routes, features
│   ├── tests/                # Vitest & Playwright E2E suites
│   ├── Dockerfile.frontend
│   └── package.json
├── docker-compose.yml        # Orchestration configs
├── Nginx.conf                # Nginx reverse proxy configs
└── README.md
```

---

## 3. Branching Strategy
OmniVote follows a structured Git branching model to manage development and releases:

```
[main]          ──────────────────────────────● (Release Tag v1.0)
                                             ▲
[release/*]     ─────────────────●───────────┘
                                ▲
[develop]       ────────●───────┴────────●
                       ▲                ▲
[feature/*]     ───────┴────────────────┘
```

* **`main`:** Contains production-ready code. Commits are pushed here only from verified release branches.
* **`develop`:** The main integration branch. Feature and bugfix branches merge here.
* **`feature/*`:** Isolated branches for new features (e.g., `feature/voter-import`).
* **`bugfix/*`:** Isolated branches for fixing issues in develop.
* **`hotfix/*`:** Urgent bug fixes merged directly into `main` and then back-ported to `develop`.
* **`release/*`:** Preparing a production build from `develop`. Only bug fixes are allowed here.

---

## 4. Git Workflow
1. **Branch Creation:** Create branches from `develop`:
   `git checkout -b feature/voter-import`
2. **Rebasing:** Keep feature branches updated by rebasing against `develop` instead of merging:
   `git pull origin develop --rebase`
3. **Squashing:** Squash multiple commits on feature branches into a single clean commit before merging.
4. **Merging:** Merges into `develop` and `main` are executed via Pull Requests with fast-forward configurations.

---

## 5. Commit Message Standard
Commit messages must follow the **Conventional Commits** specification:
`<type>(<scope>): <description>`

### Types
* `feat`: New user features (e.g., `feat(events): add scheduling parameters`).
* `fix`: Bug fixes (e.g., `fix(auth): resolve JWT expiration time`).
* `docs`: Documentation updates (e.g., `docs(api): update transaction webhook specification`).
* `style`: Code style changes (formatting, missing semi-colons, no logic change).
* `refactor`: Code changes that neither fix a bug nor add a feature.
* `test`: Adding missing tests or correcting existing tests.
* `chore`: Maintenance tasks, package upgrades, or build configs.

---

## 6. Pull Request Guidelines
* **Create Small PRs:** Keep PRs under 400 lines of code changes to facilitate code reviews.
* **Requirements:**
  * Branch must build successfully.
  * All unit and integration tests must pass.
  * The PR description must link to its corresponding task or issue.
* **Checklist Template:**
  - [ ] Code follows project standards and guidelines.
  - [ ] Automated tests cover new code changes.
  - [ ] Mobile responsive layout verified.
  - [ ] Documentation updated (if applicable).
  - [ ] CI pipeline builds successfully.

---

## 7. Code Review Standards
Reviewers check code submissions against the following criteria:
* **Correctness:** Does the code satisfy the acceptance criteria?
* **Security:** Are inputs validated at the boundary? Is personal data protected?
* **Performance:** Are database queries optimized? Are indexes used correctly?
* **Accessibility:** Does the user interface comply with WCAG 2.2 AA guidelines?
* **Design System Consistency:** Does the visual layout adhere to the design system?
* **Testing:** Does test coverage meet or exceed the project's target?

---

## 8. Python Coding Standards (PEP-8)
* **Formatting:** Enforced by **Black** (100-character line limit) and **Ruff** for linting.
* **Type Hinting:** Mandatory for all function parameters and return values:
  ```python
  async def verify_voter_eligibility(voter_id: str, event_id: UUID) -> bool:
  ```
* **Imports:** Ordered alphabetically and grouped: standard library, third-party libraries, and internal imports.
* **Error Handling:** Avoid catching general exceptions. Catch specific exceptions and log details using structured variables.
* **Asynchronous Rules:** I/O operations (database, cache, external integrations) must use `async`/`await`. Block-level CPU operations should be offloaded to background threads.

---

## 9. TypeScript Standards
* **Conventions:** Explicit typing is required; the `any` type is prohibited.
* **Interfaces vs. Types:**
  * Use `interface` for defining components props and object models:
    ```typescript
    interface CandidateProps {
      id: string;
      name: string;
      voteCount: number;
    }
    ```
  * Use `type` for unions, intersections, and configurations.
* **Enums:** Enums are prohibited; use const assertions instead to avoid lookup overhead:
  ```typescript
  export const EventStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED'
  } as const;
  ```

---

## 10. React Development Standards
* **Component Structures:** Use functional components and custom hooks. Avoid keeping API logic inside UI components.
* **Hooks Customization:** Complex UI state or async data fetching must be encapsulated within custom hooks (e.g., `useElectionData.ts`).
* **Performance Optimizations:**
  * Use `React.memo` to prevent redundant re-renders of list items.
  * Use `useCallback` and `useMemo` when passing values down dependency trees.
* **Aesthetic Consistency:** Use standard Tailwind utility classes and ShadCN components; ad-hoc style values are prohibited.

### RBAC UI Conventions
* **`useMyPermissions`:** Always use this hook to fetch and cache effective permissions for the current user.
* **`<RequirePermission>`:** Use this wrapper component to conditionally render UI elements (like Create/Edit buttons) based on effective permissions. This prevents unauthorized users from attempting actions that will fail on the backend.
* **Bulk Assignments:** When assigning roles or permissions, always use the bulk `replace` API endpoints instead of making iterative granular requests.

---

## 11. FastAPI Development Standards
* **Decoupled Architecture:** Enforce strict separation of concerns:
  `Routers (endpoints) ──► Services (business logic) ──► CRUD (database interactions)`
* **Data Validation:** Validate all inputs using Pydantic models.
* **Dependencies Injection:** Use FastAPI `Depends` to manage database connections, authentication contexts, and rate limiting rules.
* **Structured Errors:** Raise HTTPExceptions with structured error objects mapping details clearly.

---

## 12. Database Design & Migration Standards
* **Naming Conventions:** Table names and column names must use `snake_case`. Table names must be pluralized (e.g., `users`, `categories`).
* **Migrations:** Database migrations must be managed using Alembic.
  * Autogenerated migrations must be manually reviewed before being committed.
  * Migration files must contain rollback scripts (`downgrade()` function).
* **Cascade Configurations:** Configure child table deletions using `ON DELETE CASCADE`. Ledger and audit records must use `ON DELETE RESTRICT`.

---

## 13. API Standards
* **Endpoints:** Versioned under `/api/v1/`. Use plural nouns for resources.
* **REST HTTP Verbs:**
  * `GET`: Safe, idempotent read operations.
  * `POST`: Create operations or non-idempotent triggers.
  * `PUT`: Complete resource replacement.
  * `PATCH`: Partial resource updates.
  * `DELETE`: Deletion operations.
* **Error Coding:** Include descriptive error codes in responses (e.g., `OTP_EXPIRED`, `INSUFFICIENT_FUNDS`).

---

## 14. Testing Standards
* **Coverage Requirements:** 
  * Backend business logic: Minimum 80% line coverage.
  * Frontend components: Minimum 70% line coverage.
* **Test Levels:**
  * **Unit Tests:** Verify helper functions, validation schemas, and state reducers in isolation.
  * **Integration Tests:** Verify endpoint flows, database queries, and background queues.
  * **End-to-End Tests:** Verify critical user journeys (e.g., ballot submission, payment authorization) using Playwright.
* **Fixtures and Mocks:** Use factories to generate database records. External services (SMS, email, payment gateways) must be mocked in test runs.

---

## 15. Documentation Standards
* **Inline Comments:** Document the "why" of complex logic, not the "what".
* **Architecture Decision Records (ADRs):** Create ADRs when introducing architectural shifts or adopting new dependencies.
* **Readability:** Format documentation files using markdown lint guidelines.

---

## 16. Security Standards
* **Credentials Management:** Credentials, API keys, and database passwords must be loaded from environment variables (`.env` files are excluded from git).
* **Hashing Standards:** Administrative user passwords must be hashed using `Argon2id`.
* **Cross-Site Protection:** Enable CORS configurations with restricted domains. Write-actions require validation of access tokens.

---

## 17. Performance Standards
* **Database Access:** Configure query limits and implement pagination on list endpoints. N+1 query situations are checked via integration tests.
* **Redis Caching:** Cache database objects with short-lived TTL configurations (e.g., 2 seconds for live turnout metrics, 1 hour for tenant configurations).
* **Bundle Optimizations:** Use code-splitting to load sections of the web application lazily.

---

## 18. Accessibility Standards
* **WCAG 2.2 Compliance:** Applications must meet level AA requirements.
* **Focus Visibility:** Focused elements must display a high-contrast ring outline.
* **Aria Rules:** Custom interactive components must include ARIA descriptors.

---

## 19. Logging Standards
* **Structured Format:** Output logs in JSON format to stdout.
* **Levels:**
  * `DEBUG`: Detailed diagnostic messages during development.
  * `INFO`: General operational events (e.g., successful login, transaction started).
  * `WARNING`: Non-critical errors (e.g., API response delay, OTP retry limits).
  * `ERROR`: System errors requiring attention (e.g., database connection loss).
* **Traceability:** Propagate `request_id` and `correlation_id` header parameters to trace operations across components.

---

## 20. Monitoring & Observability
* **Health Endpoint:** Expose a public `/health` endpoint to monitor services status.
* **System Telemetry:** Export execution metrics to Prometheus/Grafana dashboards.
* **Background Tasks:** Monitor Celery worker execution times and queue sizes.

---

## 21. Deployment Standards
* **Containerization:** All system components run in containerized environments configured via Docker and Docker Compose.
* **State Management:** Containers are stateless. Files, backups, and reports are written to MinIO object storage.
* **Backups:** Implement automated daily snapshot backups for PostgreSQL.
* **Rollbacks:** Ensure blue-green deployments to roll back version updates if post-deployment checks fail.

---

## 22. Definition of Ready (DoR)
A task is ready for development when:
1. Requirements are defined and documented.
2. User stories and acceptance criteria are specified.
3. Design layouts and assets are available (if the task involves front-end changes).
4. External dependencies are resolved.

---

## 23. Definition of Done (DoD)
A feature is considered done when:
1. Code compiles successfully without warnings.
2. Automated test suite validation passes.
3. Linter and formatting checks run successfully.
4. Mobile-responsive layout is verified.
5. Peer review is completed and approved.
6. Documentation is updated.

---

## 24. Quality Gates

```
[Code Push] ──► [Linter/Formatter Checks] ──► [Test Validation (80%+)] ──► [Build Checks] ──► [Merge Approval]
```

These checks are automated in the CI/CD pipeline and block pull request merges if validation fails.

---

## 25. Architecture Decision Records (ADRs)
* **Purpose:** Document design decisions, including the context and alternatives considered.
* **Location:** Save ADRs in `/docs/adr/` using conventional file naming patterns (e.g., `0001-use-celery-for-payment-buffering.md`).
* **Format:** Define Status, Context, Decision, and Consequences.

---

## 26. Engineering Culture
* **Shared Ownership:** The team shares responsibility for code quality and documentation.
* **Constructive Code Reviews:** Review code to verify quality, not to criticize authors.
* **Continuous Learning:** Document mistakes and lessons learned to help the team improve.
