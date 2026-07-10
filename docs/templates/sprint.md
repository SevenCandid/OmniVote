# Sprint Template

**Sprint Version/Name:** *Sprint X.Y.Z*
**Duration:** *Start Date* to *End Date*
**Sprint Lead:** *Name*

---

## 1. Sprint Objective
*Describe the high-level objective and value delivered in this sprint.*

---

## 2. Scope & Target Backlog Items
- [ ] **Item 1**: *Description / Link to issue*
- [ ] **Item 2**: *Description / Link to issue*
- [ ] **Item 3**: *Description / Link to issue*

---

## 3. Testing Requirements
- **Unit Tests**: *Areas requiring test coverage expansion.*
- **Integration Tests**: *Database or Redis integration tests required.*
- **Manual QA**: *End-to-end user scenario checks.*

---

## 4. Definition of Done (DoD) Checklist
Every sprint backlog item is considered complete only when:
- [ ] Code is formatted and passes Ruff, ESLint, and Prettier checks.
- [ ] Backend coverage meets the 90% target, frontend meets the 85% target.
- [ ] Core database schemas have Alembic migrations generated.
- [ ] API routes match OpenAPI contracts.
- [ ] Peer code review is completed and approved.
- [ ] Commits follow Conventional Commit conventions.
- [ ] Code is merged to `develop` and verified in staging.
