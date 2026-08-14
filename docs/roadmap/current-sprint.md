# Current Sprint

**Sprint Name:** Sprint 3.3.0 — Live Results Visibility & Election Integrity
**Status:** Completed ✅

---

## 1. Objective
Implement graceful, animated result visibility states for both the Admin Dashboard and the Public voting interface. Replace 403/500 error states with a beautiful "Live Election in Progress" indicator, and give admins configurable control over what they see during an active election.

---

## 2. Deliverables

### Part 1: Backend
- [x] **`allow_admin_live_results` field**: New boolean column on the `elections` table, added via Alembic migration with `server_default='false'`.
- [x] **Graceful Results API**: `ResultService.get_live_results` now returns `200 OK` with `is_hidden=True` and zeroed statistics instead of `403 Forbidden` when results are not yet visible.
- [x] **Admin Visibility Logic**: Checks `Membership` to determine if the requester is an admin, then respects `allow_admin_live_results` to decide visibility during active elections.
- [x] **Auto-Migration on Deploy**: Added `release_command = 'alembic upgrade head'` to `fly.toml`.

### Part 2: Frontend
- [x] **`LiveElectionIndicator` Component**: Premium animated component with radar-pulse animation, glassmorphism, and status pills displayed when results are hidden.
- [x] **Admin Results Page**: Conditionally renders `LiveElectionIndicator` or the full results dashboard based on `is_hidden`.
- [x] **Public Results Page**: Always shows the indicator when results are hidden; shows full results when visible.
- [x] **Election Create Form**: Added "Allow Admin to View Live Results" toggle (immutable after creation/publishing).

### Part 3: Bug Fixes
- [x] Fixed `ModuleNotFoundError` for `Membership` import crashing the results endpoint.
- [x] Fixed CORS error caused by the 500 crashing before CORS headers were applied.
- [x] Fixed `null` statistics crash in the old frontend bundle.
- [x] Fixed Alembic `NOT NULL` violation for the new column on existing rows.

---

## 3. Up Next
**Sprint 3.4.0 — Results Publication Controls & Scheduled Publishing**
