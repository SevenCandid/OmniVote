# Engineering Principles

Every line of code written for OmniVote must follow the platform's core quality, security, scalability, and reliability principles.

---

## 1. Code Quality & Clarity
- **Maintainable Code**: Code is read much more often than it is written. Write clear variable and function names, keep methods short, and add comments only to document *why* something is done, not *what* the code does.
- **Prefer Clarity over Cleverness**: Avoid complex one-liners, advanced framework features, or clever tricks that reduce readability. Make code explicit and simple.
- **Minimize Dependencies**: Each third-party dependency increases build size, updates overhead, and security vulnerability surfaces. Evaluate vanilla alternatives first.

---

## 2. Security Default Scopes
- **Secure by Default**: Never store passwords or keys in plain text. Always authenticate routes and authorize user scope checks at the server level.
- **Input Validation**: Never trust client inputs. Validate all payload schemas strictly using Zod (frontend) and Pydantic (backend) before processing.
- **Data Privacy**: Protect user database metrics and personal information. Ensure that logging statements do not print sensitive info (passwords, tokens, personal keys).

---

## 3. Scalability & Event Capacity
- **Decoupled Monorepo**: Keep application logic separated. The backend API handles raw computation and database transactions, while the React client manages user state and views.
- **Multi-Tenant Boundaries**: Ensure all database schemas query against tenant/organization scopes strictly to prevent data leaks.
- **Async Workers**: Outsource heavy calculations, email dispatches, and reports compiling to background workers (`arq` + Redis) to keep API endpoints fast and responsive.

---

## 4. Reliability & Diagnostics
- **Fail Gracefully**: Wrap network requests, database connections, and cache reads in try/except blocks. Provide meaningful error messages to users rather than standard server crashes.
- **Safe Auditing & Logging**: Every request is tagged with traceability headers (`X-Request-ID` and `X-Correlation-ID`) to simplify logs debugging.
- **Test-Driven Mentality**: Verify code via automated tests. Tests are part of the daily active loop of coding.
