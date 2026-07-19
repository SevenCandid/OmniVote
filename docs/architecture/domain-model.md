# OmniVote Domain Model

## 1. Product Domain Overview
**OmniVote** is an enterprise-grade, multi-tenant SaaS voting platform. It is designed to be a singular, event-driven engine capable of powering a diverse array of voting scenarios—from strict democratic corporate elections to high-throughput, revenue-generating reality show contests.

**The Problem:** Organizations typically use fragmented tools—one for employee surveys, another for board elections, and custom agencies for public paid voting. OmniVote centralizes this, providing a unified, auditable, and secure platform.

**Primary Users:**
*   **Platform Admins:** VeroSeven staff managing billing and global infrastructure.
*   **Organization Members:** Election officers, HR managers, or marketing teams configuring events.
*   **Voters:** Employees, students, or the general public casting votes.

## 4. Core Business Entities

### Organization
*   **Purpose**: The primary tenant boundary.
*   **Responsibilities**: Owns all data, configurations, and billing. Does *not* own Users.
*   **Lifecycle**: Created upon signup, exists indefinitely unless explicitly hard-deleted.
*   **Statuses**:
    *   **Operational Status**: Determines whether the organization can operate (`Active`, `Suspended`, `Archived`). Defaults to `Active` upon creation.
    *   **Verification Status**: Determines the trust and verification level of the organization (`Unverified`, `Pending Verification`, `Verified`, `Rejected`). Independent of operational status. Defaults to `Unverified`.
*   **Important Rules**: Strict data isolation. Every organization must always have at least one Membership with the Owner role.

### Membership
*   **Purpose**: Represents the explicit relationship between a platform User and an Organization. It is strictly relational metadata. It is the *only* entity that connects a User to an Organization.
*   **Responsibilities**: Manages the lifecycle of a user's organizational participation (e.g., Pending, Accepted). 
*   **Relationships**: Bridges exactly one User and one Organization. Ownership and Permissions are resolved entirely through this entity.

### Member
*   **Purpose**: Represents an active participant within an Organization (built upon a valid `Membership`).
*   **Responsibilities**: Manages events, views results based on Roles.
*   **Relationships**: Relies on a valid `Membership`, possesses many Roles.

### Permission (RBAC)
*   **Purpose**: Represents a single platform capability (e.g., `organization.view`, `event.create`).
*   **Scope**: Defines what can be done, mapped independently of users or organizations.

### Role (RBAC)
*   **Purpose**: Represents a named collection of permissions (e.g., Administrator, Election Manager).
*   **Scope**: Typically owned by an Organization, but can be a global System Role.

### RolePermission (RBAC)
*   **Purpose**: Many-to-many association mapping a `Role` to its granted `Permissions`.

### MembershipRole (RBAC)
*   **Purpose**: Many-to-many association mapping a `Membership` to its assigned `Roles`.

### Event
*   **Purpose**: A specific voting instance.
*   **Lifecycle**: Draft -> Scheduled -> Live -> Closed -> Archived.
*   **Ownership**: Owned by an Organization.
*   **Important Rules**: Dictated by its `Event Type` blueprint.

### Category
*   **Purpose**: A specific race (e.g., "President").
*   **Relationships**: Belongs to exactly one Event. Owns many Candidates.

### Candidate
*   **Purpose**: The entity receiving votes.
*   **Relationships**: Belongs to exactly one Category.

### Vote
*   **Purpose**: The record of a Voter's choice.
*   **Responsibilities**: Must remain completely immutable.
*   **Relationships**: Belongs to an Event, a Category, and a Candidate.

## 5. Ownership Model
Ownership is **not** a property of either the User or the Organization. Ownership is represented strictly by assigning the reserved **Owner** role to a `Membership`. 
- **Users always own their own accounts**.
- **Organizations never own users**.
- **Platform Invariant**: Every Organization must always have at least one Owner at all times.

## 6. Entity Relationships (Conceptual)

```mermaid
erDiagram
    ORGANIZATION ||--o{ WORKSPACE : contains
    ORGANIZATION ||--o{ MEMBERSHIP : "issues"
    USER ||--o{ MEMBERSHIP : "accepts"
    MEMBERSHIP ||--o{ MEMBERSHIP_ROLE : "holds"
    MEMBERSHIP_ROLE }o--|| ROLE : "assigned"
    ROLE ||--o{ ROLE_PERMISSION : "contains"
    ROLE_PERMISSION }o--|| PERMISSION : "grants"
    ORGANIZATION ||--o{ EVENT : hosts
    EVENT }|--|| EVENT_TYPE : adheres_to
    EVENT ||--|{ CATEGORY : divides_into
    CATEGORY ||--|{ CANDIDATE : features
    EVENT ||--o{ BALLOT : receives
    BALLOT ||--|{ VOTE : contains
    VOTE }|--|| CANDIDATE : selects
    VOTE }o--o| PAYMENT : backed_by
```

## 9. Multi-Tenant Architecture
OmniVote utilizes a logical multi-tenancy model. A single database instance serves all tenants, separated strictly by an `organization_id` foreign key on all root tables.
*   **Security Boundary**: API endpoints extract the tenant ID from the authenticated user's token and automatically append it to all database queries via middleware, preventing cross-tenant data leaks.
*   **Future White-Label**: Organizations will be able to map custom domains (e.g., `vote.company.com`) which the system will resolve to their tenant context seamlessly.

## 10. Roles & Permissions Philosophy
OmniVote implements a highly granular Role-Based Access Control (RBAC) system bound strictly to the `Membership` domain.
*   **Principle of Least Privilege**: Users default to zero access.
*   **Strict Membership Binding**: Permissions are never granted to `Users` directly. They are granted to a `Membership` acting within an `Organization`.
*   **System Roles vs. Custom Roles**: The system provides immutable defaults (e.g., `Administrator`, `Election Manager`, `Auditor`), but architecture supports Organizations composing custom roles from atomic permissions (e.g., `event.create`, `results.view`).

## 16. Risks & Mitigation
*   **Duplicate Voting**: *Mitigation*: Strong idempotency keys on Ballot submission. Database-level unique constraints on `(event_id, voter_identity)` for strict elections.
*   **Result Manipulation**: *Mitigation*: Results are never stored as static modifiable fields; they are always materialized views or cached projections derived dynamically from the immutable `Vote` table.
*   **Payment Inconsistencies**: *Mitigation*: Votes associated with payments are held in a `pending` state until cryptographically verified webhooks from the payment gateway confirm settlement.

## 18. Architecture Decisions

### Decision 1: Single Event Engine vs. Dedicated Modules
*   **Decision**: Use a single, configurable Event Engine.
*   **Reason**: Prevents codebase fragmentation. Maintaining separate codebases for "Elections" and "Paid Contests" leads to duplicated effort (e.g., both need basic validation, time windows, and result calculation).
*   **Trade-off**: The configuration model is more complex upfront.

### Decision 2: Soft Deletes vs. Hard Deletes
*   **Decision**: Use Soft Deletes (`deleted_at` timestamp) for all core domain entities.
*   **Reason**: Regulatory compliance and auditability. We must retain historical data for election audits.

## 19. Additional Mermaid Diagrams

### Aggregate Relationships
```mermaid
graph TD
    subgraph Organization Aggregate
        Org[Organization] --> OrgSettings[Organization Settings]
        Org --> Workspace[Workspace]
    end

    subgraph Event Aggregate
        Evt[Event] --> Cat[Category]
        Cat --> Cand[Candidate]
        Evt --> Rule[Eligibility Rule]
    end

    subgraph Ballot Aggregate
        Bal[Ballot] --> V[Vote]
    end
    
    Org -. owns .-> Evt
    Bal -. references .-> Cand
```

### Organization Ownership Hierarchy
```mermaid
graph TD
    User[User] -->|accepts| Mem[Membership]
    Mem -->|holds| Role[Role: Owner]
    Mem -->|belongs to| OrgA[Organization A]
    
    Root[VeroSeven Platform] --> OrgA
    Root --> OrgB[Organization B]
    
    OrgA --> W1[Workspace: Engineering]
    OrgA --> W2[Workspace: Marketing]
    
    W1 --> E1[Event: Tech Lead Election]
    W2 --> E2[Event: Logo Poll]
```

### Membership & Permission Relationships
```mermaid
graph LR
    Membership((Membership)) -->|holds| MR[MembershipRole]
    MR -->|assigned| Role[Role: Election Manager]
    Role -->|contains| RP1[RolePermission]
    Role -->|contains| RP2[RolePermission]
    Role -->|contains| RP3[RolePermission]
    RP1 -->|grants| P1[Permission: event.create]
    RP2 -->|grants| P2[Permission: event.update]
    RP3 -->|grants| P3[Permission: results.view]
```
