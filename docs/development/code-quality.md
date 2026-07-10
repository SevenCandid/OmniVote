# OmniVote Code Quality & Development Standards

To maintain clean, robust, and enterprise-grade code, OmniVote enforces strict automated quality checks across both the frontend and backend.

---

## 1. Coding & Formatting Standards

### Backend (FastAPI / Python)
- **Tool**: **Ruff** (replaces Flake8, Black, and isort).
- **Line Length**: Capped at 88 characters.
- **Python Version**: Target environment is Python 3.13+.
- **Import Ordering**: Configured deterministically using isort standards built directly into Ruff.
- **Core Rules**:
  - No print statements allowed in non-script code (enforced via Ruff `T20` check).
  - Explicit type annotations are strongly encouraged for all route handlers, database schemas, and helper functions.

### Frontend (React / TypeScript)
- **Tools**: **ESLint** & **Prettier**.
- **Indentation**: 2 spaces.
- **Quote Style**: Single quotes (unless JSX attributes, which use double quotes).
- **Strict Mode**: TypeScript strict flags are enabled. `noImplicitAny: true` and `@typescript-eslint/no-explicit-any: "error"` are strictly enforced.

---

## 2. Commit Message Conventions (Conventional Commits)

OmniVote uses the Conventional Commits specification to organize release notes and enforce log readability. Commit messages must match this pattern:

```
<type>(<scope>): <description>
```

### Allowed types:
- `feat`: A new feature for the user (e.g., `feat(auth): add login endpoint`)
- `fix`: A bug fix (e.g., `fix(votes): prevent duplicate submissions`)
- `docs`: Documentation updates (e.g., `docs(api): update API documentation`)
- `style`: Code style changes (formatting, missing semi-colons, no logic change)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Maintenance tasks, package upgrades, or build configs
- `perf`: Code changes that improve performance
- `ci`: CI pipeline updates (e.g., GitHub Actions settings)
- `build`: Build system changes or dependencies updates (e.g., docker file revisions)

### Valid Examples:
- `feat(auth): add login endpoint`
- `fix(votes): prevent duplicate submissions`
- `docs(api): update API documentation`

### Invalid Examples (will be rejected by Git hooks):
- `update`
- `changes`
- `test`
- `refactor: format code` (missing scope or colon structure)

---

## 3. Pre-commit Git Hooks

OmniVote uses the `pre-commit` framework to run checks automatically on your local machine before any commit is finalized.

### Hook Setup Instructions
1. Install `pre-commit` locally:
   ```bash
   pip install pre-commit
   ```
2. Register the Git hooks in your local `.git` directory:
   ```bash
   pre-commit install --hook-type pre-commit --hook-type commit-msg
   ```

Now, every time you run `git commit`, Ruff, ESLint, Prettier, TypeScript, and the Conventional Commit message validator will execute automatically on the staged files.

---

## 4. Running Checks Manually

If you want to run checks manually outside the commit flow, use the following commands:

### Backend Commands (from `apps/api`)
- **Lint check**: `ruff check .`
- **Lint auto-fix**: `ruff check . --fix`
- **Format code**: `ruff format .`
- **Run tests**: `pytest`

### Frontend Commands (from `apps/web`)
- **Lint check**: `npm run lint`
- **Format check**: `npm run format:check`
- **Format fix**: `npm run format`
- **TypeScript compile check**: `npm run type-check`

---

## 5. Troubleshooting & common Errors

### 1. Hook fails due to missing executable
If the frontend hook fails stating `npm: not found` or similar, make sure **Node.js** is installed on your local host development machine. Since local hooks run in the host context, node utilities must be accessible globally.

### 2. Bypass hooks for quick draft commits
If you need to commit a draft or work-in-progress commit locally and intentionally bypass validation (not recommended for final PRs):
```bash
git commit -m "chore: temporary draft" --no-verify
```
