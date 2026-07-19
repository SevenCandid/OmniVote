# 10. Separate Organization Verification Status

Date: 2026-07-19

## Status

Accepted

## Context

Initially, the Organization domain model overloaded the operational status of an organization (e.g., Active, Suspended, Archived) with its verification status (e.g., Pending Verification).

This led to coupling between two independent states:
1. Whether an organization is usable by its users (Operational Status).
2. Whether the organization has passed compliance/KYC checks (Verification Status).

For example, an organization might be fully operational (ACTIVE) for testing, but still UNVERIFIED. Alternatively, an organization could be suspended (SUSPENDED) for billing issues, while still remaining VERIFIED.

## Decision

We have separated the Organization status into two distinct fields:
- `status` (Operational Status): Enum(`ACTIVE`, `SUSPENDED`, `ARCHIVED`)
- `verification_status` (Verification Status): Enum(`UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`)

New organizations default to `status = ACTIVE` and `verification_status = UNVERIFIED`.

## Consequences

- The database schema now contains two separate PostgreSQL Enums (`organization_status_enum`, `organization_verification_status_enum`).
- The frontend UI displays these states independently using distinct badges, providing better clarity to administrators.
- We have paved the way for building out a dedicated Organization Verification workflow (document uploads, manual review) without blocking initial organization creation and onboarding.
