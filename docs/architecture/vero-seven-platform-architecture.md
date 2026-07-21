# VeroSeven Platform Architecture Book
**Version:** v0.2.4-alpha

This book serves as the canonical index and guide to the architecture of the VeroSeven platform. It links directly to our Architecture Decision Records (ADRs) and domain models, ensuring a single source of truth without duplicating documentation.

## Platform Foundations

The VeroSeven platform is built on a strict dependency chain designed for multi-tenant isolation and robust authorization.

### 1. Identity & Authentication
- **[Identity Platform Architecture](identity-platform.md)**: Describes the user model, JWT-based authentication, and session handling.
- *Core Principle*: Users exist globally. They do not belong to an organization at the identity layer.

### 2. Organizations & Memberships
- **[Domain Model: Organizations & Memberships](organizations-and-memberships.md)**: Details the separation between global Users and tenant-scoped Memberships.
- *Core Principle*: An organization is an isolated boundary. Users cross this boundary by accepting an `Invitation`, which creates a `Membership`.

### 3. Role-Based Access Control (RBAC)
- **[RBAC Architecture](rbac-platform.md)**: Explains the authorization engine, effective permissions, and the system vs custom role taxonomy.
- *Core Principle*: Permissions are immutable values defined in code. Authorization is always resolved through: `User -> Membership -> Assigned Role(s) -> Permissions`.
- **System Invariants**:
  - Reserved roles (`Owner`, `Admin`, `Member`) cannot be modified or deleted.
  - An organization must always have at least one active user with the `Owner` role (Last-Owner Protection).
  - Users cannot assign or revoke roles granting permissions they do not themselves possess (Privilege Escalation Protection).

### 4. Platform Administration vs Organization Administration
- **[Support & Platform Roles](support-sessions.md)** *(Draft/Upcoming)*
- *Core Principle*: Platform administration (e.g., Customer Support) and Organization administration are strictly separated. Platform Administrators gain temporary access to customer organizations by initiating explicitly logged **Support Sessions**, which grant temporary `Platform Support` roles rather than mutating customer memberships.

## Engineering Standards

- **[Value Objects & Domain Integrity](value-objects.md)**: Guidelines on using Pydantic, SQLAlchemy, and bounded contexts.
- **[Frontend Architecture](../handbook/engineering-standards.md)**: Guidelines on React component structure, state management, and type-safety.

## Modules

The platform supports modular business capabilities.
- **Election Engine** *(Sprint 2.1.0 - Upcoming)*
