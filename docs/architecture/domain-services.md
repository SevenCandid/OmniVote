# Domain Services

Domain Services encapsulate business logic that doesn't naturally fit within a single Entity or Value Object, often because it requires coordinating multiple aggregates or reaching out to external systems (via abstractions).

## 1. Eligibility Service
*   **Responsibility**: Determines if a specific Voter is permitted to cast a Ballot in a specific Event.
*   **Interaction**: Orchestrates data from the Voter (Identity, Location), the Event (Eligibility Rules, Time Window), and potentially external systems (e.g., checking an external database for membership status).

## 2. Result Calculation Service
*   **Responsibility**: Computes the current standings, leaderboards, and final winners for an Event.
*   **Interaction**: Reads from the Event (to understand Category structures and weighting rules) and the Voting Engine (to aggregate Votes). It handles complex logic like ranked-choice transfers or weighted summations that are too complex for the Event aggregate itself.

## 3. Ballot Validation Service
*   **Responsibility**: Ensures a submitted Ballot adheres to all constraints before hitting the database.
*   **Interaction**: Checks Ballot selections against the Event's Voting Rules (e.g., max votes per category) and ensures the referenced Candidates are actually valid and active.

## 4. Payment Verification Service
*   **Responsibility**: Acts as a bridge between the Payment Context and external gateways (Stripe, Paystack).
*   **Interaction**: Handles webhook validation, translates gateway statuses into internal Domain Events (e.g., converting a Stripe `charge.succeeded` into a `PaymentConfirmed` domain event).

## 5. Audit Service
*   **Responsibility**: Centralizes the secure recording of immutable audit logs.
*   **Interaction**: Listens to Domain Events across all contexts and translates them into standardized, tamper-evident audit records.

## 6. Membership Service
*   **Responsibility**: Manages the lifecycle of user relationships with Organizations.
*   **Interaction**: Validates invitations, handles accept/decline workflows, suspends/removes members, and ensures audit trails are generated for all membership actions. Boundaries strictly isolated from Identity (Auth) and Roles (Permissions).

## 7. RBAC Service
*   **Responsibility**: Manages the platform's Roles, Permissions, and their assignments to Memberships.
*   **Interaction**: Computes the active permissions for a given Membership context during API requests to guard secured endpoints. Responsible only for "Authorization", heavily isolated from "Authentication" and the "Membership Lifecycle".
