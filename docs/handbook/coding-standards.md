# Coding Standards

This guide outlines styling rules, linters, TypeScript definitions, and React hooks standards for OmniVote.

---

## 1. Backend Standards (Python / FastAPI)

- **Python Version**: Target environment is Python 3.13+.
- **Formatting & Lints**: Enforced via **Ruff**. Configure Ruff rules inside `pyproject.toml` (rules: `E4`, `E7`, `E9`, `F`, `I`, `UP`, `B`, `C4`, `T20`).
- **PEP 8 Guidelines**:
  - Maximum line length: **88 characters**.
  - String format: Double quotes (`"..."`).
  - Import sorting: Enforce deterministic group ordering (standard library, third-party libraries, local app modules).

### FastAPI Patterns
- Use FastAPI dependencies (`Depends`) to resolve database sessions (`get_db_session`), authenticate routes, and load scopes.
- Declare explicit type annotations for route parameters, path arguments, and handler return values:
  ```python
  @router.get("/users/{user_id}", response_model=UserResponse)
  async def get_user_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)) -> UserResponse:
  ```

---

## 2. Frontend Standards (React / TypeScript)

- **Formatting & Lints**: Enforced via **ESLint** and **Prettier**.
- **Indentation**: 2 spaces.
- **Quote Style**: Single quotes (`'...'`) in TypeScript files, double quotes (`"..."`) in JSX attributes.
- **Strict Typing**: TypeScript strict mode is enabled. No `any` type checks are allowed (`@typescript-eslint/no-explicit-any: "error"`).

### Component Standards
- Write functional components with explicit props interfaces:
  ```typescript
  interface CardProps {
    title: string;
    children: React.ReactNode;
  }
  
  export function BaseCard({ title, children }: CardProps) {
    return ( ... );
  }
  ```
- Use `framer-motion` for micro-animations and Tailwind CSS for layouts.
- Decouple view layers from state by mapping states using Zustand stores (`eventStore`, `orgStore`).
