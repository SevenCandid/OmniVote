# Security Standards

This document establishes baseline security configurations, secrets management rules, and data encryption guidelines for the OmniVote platform.

---

## 1. Secrets Management
- **Environment Variables**: Sensitive configurations (API keys, DB connection urls, JWT hashes, password seeds) are loaded via `.env` files and must **never** be committed to Git.
- **Gitignore Rules**: Ensure that `.env` files are ignored in the repository's root `.gitignore`.
- **Placeholder values**: Commit only generic template files like `.env.example`.

---

## 2. Authentication & Authorization
- **Passwords Hashing**: Passwords must be hashed using Argon2 (`argon2-cffi`) before saving to database rows. Never verify plain text passwords.
- **Access tokens**: Use JSON Web Tokens (JWT) signed with a strong HS256 secret key. Set short expiration periods (e.g. 15-30 minutes) on active tokens.
- **Multi-Tenant Boundaries**: Every database query must filter by `organization_id` to prevent data leaks between different tenants.

---

## 3. Data Protection & Audits
- **Input Sanitization**: Validate all payloads strictly against Zod schemas on the web client, and Pydantic models on the backend. Redact unsafe HTML tags before committing strings.
- **Traceability Logs**: Include request correlation IDs (`X-Request-ID`, `X-Correlation-ID`) in all log print statements to help trace bugs across request lifecycles.
- **Log redaction**: Ensure that logging frameworks filter and redact sensitive data fields (like `password`, `token`, `access_key`) from standard system logs.

---

## 4. Dependencies Audits
- Run weekly dependency audits in the repository pipeline to catch security vulnerabilities in package files:
  ```bash
  # Python requirements scan
  pip-audit -r requirements.txt
  
  # Node packages scan
  npm audit --audit-level=moderate
  ```

## Secret Management

- **Never** store third-party integration secrets in plaintext within the database.
- Utilize the `SecretManager` service for symmetric encryption (Fernet) of secrets before storage.
- Provide secrets via securely injected environment variables (e.g., `SECRET_MANAGER_KEY`) rather than hardcoded configuration files.
- The Platform Settings UI must implement write-only inputs for secrets, obscuring existing values.

