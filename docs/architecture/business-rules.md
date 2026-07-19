# Business Rules

This document outlines the fundamental, invariant business rules that govern the OmniVote platform. These rules must be enforced by the domain layer and cannot be bypassed by any interface.

## Foundational Rules
1. **Tenant Isolation**: Data belonging to one Organization must never be accessible or mutable by another Organization.
2. **Immutability of Votes**: Once a Vote is successfully cast and committed to the Voting Engine, it cannot be altered or deleted. It can only be logically voided if fraud is proven, preserving the audit trail.
3. **Deterministic Results**: Results must always be a pure function of the aggregated valid Votes. Manual manipulation of Results is strictly forbidden.

## Organization & Access Rules
4. **Event Ownership**: Every Event belongs to exactly one Organization.
5. **Organization Ownership**: Users never belong to an organization's account; they establish relationships through Memberships. Ownership of an organization is represented by assigning the reserved "Owner" role to a Membership. Every organization must always have at least one Owner.
5. **Role Assignment**: A Member can possess multiple Roles within an Organization. Their effective permissions are the union of all permissions granted by their Roles.
6. **Platform Administration**: System Administrators cannot view identifying Voter data for strict democratic elections without an explicit, audited override (e.g., court order).

## Event & Lifecycle Rules
7. **Event Timeline**: An Event can only accept Votes if the current time falls within its strictly defined Start and End time windows.
8. **Configuration Lock**: Critical Event configurations (e.g., Eligibility Rules, Event Type) cannot be modified once an Event transitions to the 'Live' state.
9. **Category Hierarchy**: Every Category belongs to exactly one Event. Every Candidate belongs to exactly one Category.

## Voting & Eligibility Rules
10. **Ballot Integrity**: A Ballot must only contain selections for Categories that exist within the target Event.
11. **Eligibility Enforcement**: A Voter can only cast a Vote if they satisfy all active Eligibility Rules defined by the Event (e.g., Email domain whitelist, geographical restriction, unspent paid credits).
12. **Vote Weighting**: By default, one Vote equals one point. In Paid Voting Event Types, the weight of a Vote is proportional to the financial transaction value.

## Financial Rules (Paid Events)
13. **Payment Prerequisite**: A Paid Vote is only considered valid and added to the Result tally after the Payment Context confirms the Transaction is 'Settled'.
14. **Refund Impact**: If a Payment is refunded or charged back, the corresponding Votes must be automatically deducted from the Results.
