# Aggregate Roots

In Domain-Driven Design, an Aggregate is a cluster of domain objects that can be treated as a single unit. The Aggregate Root is the only entity in the aggregate that outside objects are allowed to hold references to. It ensures the consistency of changes being made within the aggregate boundary.

## 1. Organization
*   **Boundary**: Encompasses the Organization itself, its Workspaces, Organization Settings, and Organization Branding.
*   **Responsibility**: Enforces tenant-level invariants. For example, a Workspace cannot exist without a parent Organization. All billing and tier checks happen against the Organization.
*   **Transaction**: Changes to Organization settings (like toggling a feature) must be committed atomically.

## 2. Event
*   **Boundary**: Includes the Event, Categories, Candidates, Event Timeline, and specific Eligibility Rules.
*   **Responsibility**: Enforces structural invariants of the voting process. For instance, you cannot add a Candidate to a Category that doesn't belong to the Event. The Event guarantees that its timeline (Start/End) governs all underlying Categories.
*   **Transaction**: Creating an Event along with its initial Categories must be an atomic operation.

## 3. Ballot
*   **Boundary**: The Voter's submission, containing one or more Votes across different Categories within a single Event.
*   **Responsibility**: Enforces voting rules. A Ballot ensures a voter doesn't vote for two candidates in a Category where only one choice is allowed.
*   **Transaction**: A Ballot and all its constituent Votes must be saved atomically. It is an all-or-nothing operation to prevent partial voting states.

## 4. Payment
*   **Boundary**: The Payment intent, the Transaction ledger, and the receipt.
*   **Responsibility**: Ensures that the financial state is consistent. A Payment cannot be marked as 'Settled' unless a corresponding successful Transaction exists from the gateway.

## Why Not 'Candidate' or 'Category'?
Candidates and Categories are entities, but they do not make sense outside the context of an Event. Their lifecycles are entirely bound to the Event. Therefore, they are internal to the Event aggregate. External contexts should reference them via the Event.
