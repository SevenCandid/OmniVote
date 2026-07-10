# Git Workflow & Commit Guidelines

This guide details branching models, pull request protocols, and commit conventions used across the OmniVote repository.

---

## 1. Branching Strategy

OmniVote uses a Git Flow-inspired branching strategy:

```
main (Production)
 │
 └── develop (Development Integration)
      │
      ├── feature/login-endpoint  (Short-lived features)
      │
      ├── bugfix/prevent-dupe-vote (Bug fixes)
      │
      └── hotfix/security-patch   (Direct emergency fixes to main)
```

### Branch Rules
- **`main`**: Production-ready branch. Direct push commits are blocked. Changes are integrated strictly via merged Pull Requests from `develop` or emergency `hotfix/*` branches.
- **`develop`**: Development staging integration branch. Features compile and merge here after approval.
- **`feature/*`**: Short-lived branches created from `develop` to build specific milestones. Name branches using lowercase: `feature/auth-endpoint`.
- **`bugfix/*` / `hotfix/*`**: Branches created to address issues.

---

## 2. Commit Message Conventions (Conventional Commits)

Commit headers must follow the Conventional Commits specification. This formatting schema is validated locally by Git commit-msg hooks.

```
<type>(<scope>): <description>
```

### Allowed types:
- `feat`: A new feature for the user.
- `fix`: A bug fix.
- `docs`: Documentation updates.
- `style`: Formatting, semicolon cleanups, no logic changes.
- `refactor`: Rewriting code without modifying logic.
- `test`: Adding or correcting tests.
- `chore`: Modifying build processes, project settings, or package configurations.
- `perf`: Logic changes aimed at improving runtime performance.
- `ci`: CI pipeline config updates (GitHub actions).
- `build`: Dockerfile configurations updates.

### Examples:
- **Valid**: `feat(auth): add login flow`
- **Valid**: `fix(votes): prevent duplicate voter ballot`
- **Invalid**: `fixed the voting issue` (missing conventional commit structure)
- **Invalid**: `refactor: clean models` (missing scope parentheses)

---

## 3. Pull Request Guidelines

Before submitting a PR to merge code into `develop` or `main`:
1. Ensure all local tests and lints pass cleanly.
2. Link the PR to the relevant issue or sprint milestone.
3. Write description summaries using [pull-request.md](file:///c:/Users/DELL/omnivote/docs/templates/pull-request.md).
4. Request reviews from at least one core VeroSeven team developer.
5. Merging requires all CI checks (Quality, Backend, Frontend) to pass cleanly.
