# ADR-007: Ownership Model via Membership Roles

## Status
Approved

## Date
2026-07-19

## Context
The platform requires a clear definition of "Ownership". Previously, the concept of an Organization Owner was implicitly defined or ambiguous, sometimes thought to be a property of the Organization or the User themselves. Furthermore, as we introduced Role-Based Access Control (RBAC), we needed to formally resolve how Ownership interacts with roles and memberships. A critical requirement is that Users always own their own platform accounts, and an Organization should never "own" a user.

## Decision
We decided to model Organization Ownership strictly as an RBAC role (`Owner`) assigned to a `Membership` entity.

1. **User Autonomy**: Users own their own accounts. They establish relationships with Organizations exclusively through `Membership` records.
2. **Owner Role**: Ownership is represented by the reserved system role `Owner` assigned to a Membership.
3. **Organization Creation**: When a user creates an Organization, the platform automatically creates a Membership linking them to the Organization and assigns that Membership the `Owner` role.
4. **Invitations**: Inviting a user creates a pending `Membership`. It never transfers ownership of their account. Users can be invited with specific roles, defaulting to "Member".
5. **Platform Invariant**: Every Organization must always have at least one Membership with the `Owner` role. This invariant must be enforced across all operations (Ownership transfer, role removal, leaving an organization, deleting an organization).
6. **Ownership Transfer**: Transferring ownership is a dedicated, atomic Organization domain operation (`POST /organizations/{id}/transfer-ownership`) that assigns the `Owner` role to a target active membership and removes it from the current owner, ensuring the "minimum one owner" invariant is maintained throughout.

## Consequences
- **Positive**: Strict data isolation and autonomy. A user can belong to multiple organizations with different roles without any cross-contamination.
- **Positive**: Clear, unified authorization path: `User -> Membership -> Role(s) -> Permission(s)`.
- **Negative**: Increased complexity in backend validations. Methods like removing a role or leaving an organization must perform count checks to guarantee an organization is never orphaned.
- **Negative**: "Ownership Transfer" becomes a distinct, higher-level workflow rather than a simple role assignment.
