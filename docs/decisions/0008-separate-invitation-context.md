# 8. Separate Invitation Context & Lifecycle

Date: 2026-07-20

## Status

Approved

## Context

When expanding organizations, adding members requires an onboarding flow. Coupling the invitation state machine directly to active user records leads to multiple issues:
1. It invites a security risk if unverified emails can register directly into active memberships.
2. It blocks inviting people who do not yet have an account on the platform.
3. Deleting invitations after they've been accepted would destroy the history trail or leave orphaned membership entries.

We needed a clean, secure design that separates invitations from active memberships while allowing smooth onboarding for both existing and new users.

## Decision

We decided to model invitations as a separate domain context with its own distinct lifecycle:

1. **Entity Separation**: The `Invitation` is a separate table/entity containing the target organization, recipient email, sender user ID, verification tokens, expiration date, initial roles, and status.
2. **Acceptance Workflow**: Active `Membership` is only created *after* the recipient accepts the invitation.
3. **User Flow Adaptability**:
   - **Existing Users**: If the invited user already exists, they receive the invitation in-app and can accept/decline.
   - **New Users**: If they do not have an account, the invitation contains a signup token. Registration via this token automatically accepts the invitation and creates their membership with the correct organization and initial roles.
4. **Revocation & Cascade**: Owners can revoke invitations. If an invitation has already been accepted, revoking/deleting it from the invitations ledger cascades and removes the active user membership to maintain database integrity.

## Consequences

- **Positive**: Enhanced security. Non-members cannot access tenant data until they explicitly authenticate and accept.
- **Positive**: Seamless signup loop. New users get automatically onboarded into the correct organization upon signing up.
- **Negative**: Extra tables and states to manage in the database.
- **Negative**: Requires synchronization logic between invitations and memberships when revoking or performing actions on already-accepted states.
