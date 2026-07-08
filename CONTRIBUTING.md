# Contributing to OmniVote
Thank you for contributing to OmniVote. To maintain code quality and repo hygiene, every engineer must follow these standards.

---

## 1. Branch Naming Conventions
Always branch from `develop`. Use the following prefixes:
* **Feature Branches:** `feature/your-feature-name` (e.g., `feature/voter-csv-import`)
* **Bug Fixes:** `bugfix/issue-description` (e.g., `bugfix/payment-timeout`)
* **Hot Fixes:** `hotfix/urgent-patch` (e.g., `hotfix/otp-rate-limit-bypass`)
* **Release Tracks:** `release/vX.Y.Z` (e.g., `release/v1.0.0`)

---

## 2. Commit Message Convention
OmniVote follows the **Conventional Commits** standard. 

### Structure
`<type>(<scope>): <description>`

### Valid Types
* `feat`: Adding a new user feature.
* `fix`: Resolving a bug.
* `docs`: Editing documentation.
* `style`: Styling adjustments, formatting, lint fixes.
* `refactor`: Restructuring code (no feature addition or bug fix).
* `test`: Adding or updating tests.
* `chore`: Package management, local configuration shifts.

### Examples
* `feat(events): support scheduled auto-starting`
* `fix(auth): correct voter jwt session validation`
* `docs(api): update webhook callback structure`

---

## 3. Pull Request Guidelines
Before submitting a Pull Request, ensure that:
1. All lint and formatter checks pass without warning.
2. The project builds successfully locally.
3. Unit and integration tests cover the new code.
4. The PR links to a tracking task or bug report.

---

## 4. Code Review Expectations
PRs require approval from at least one reviewer before they can be merged. Reviewers focus on:
* **Security Check:** Parameters are parameterized, inputs validated, PII protected.
* **Performance Check:** DB queries optimized, N+1 patterns avoided.
* **Accessibility Check:** Keyboard focus visible, ARIA parameters included.
* **Design Consistency:** Conformance to the Design Language system.
* **Test Verification:** Coverage requirements are met (80% backend / 70% frontend).
