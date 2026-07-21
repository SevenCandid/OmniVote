# OmniVote — API Specification & Contracts v1.0
**One System. Every Vote.**
*Powered by VeroSeven*

---

## 1. Standard Response Formats
Every response returned by the OmniVote API must conform to a standardized JSON wrapper format.

### 1.1 Success Response Wrapper
```json
{
  "success": true,
  "message": "Resource retrieved successfully.",
  "data": {},
  "metadata": {
    "timestamp": "2026-07-08T15:15:44Z",
    "request_id": "req-98fa-38db-1029",
    "correlation_id": "corr-87fb-2321"
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "page_size": 20,
    "total_count": 98
  }
}
```

### 1.2 Error Response Wrapper
```json
{
  "success": false,
  "message": "Validation failed on input parameters.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "phone_number",
        "issue": "Invalid format. Expected international E.164 standard."
      }
    ]
  },
  "metadata": {
    "timestamp": "2026-07-08T15:15:44Z",
    "request_id": "req-98fa-38db-1029",
    "correlation_id": "corr-87fb-2321"
  }
}
```

---

## 2. API Security Specifications
* **Authentication Header:** Access tokens are passed via standard Authorization headers:
  `Authorization: Bearer <JWT>`
* **JWT Lifecycle:**
  * Access Token: Valid for 15 minutes, signed using RS256 algorithm.
  * Refresh Token: Valid for 7 days, stored in an HttpOnly, secure, SameSite cookie, and tracked in Redis.
* **Role-Based Access Control (RBAC):** Token payloads contain the `role` property. Middleware verifies the user's role against access requirements before routing requests.
* **CORS Settings:** 
  * Allowed Origins: Locked to organizational subdomains (`*.omnivote.com`).
  * Allowed Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
  * Credentials: Allowed (`true`) to permit refresh token cookie transmission.
* **Idempotency Header:** Mutating POST actions (specifically `/api/v1/payments/initialize`) require an `X-Idempotency-Key: <UUID>` header. The system caches key statuses in Redis for 24 hours.

---

## 3. API Conventions
* **URL Structure:** Lowercase, resource-oriented plural nouns versioned by path prefix: `/api/v1/resources`
* **Field Naming:** JSON keys use standard `snake_case`. Query parameters also use `snake_case`.
* **Date & Time:** Follows ISO 8601 formatting: `YYYY-MM-DDTHH:MM:SSZ` (always forced to UTC).
* **Identifiers:** Every primary key resource ID is a v4 UUID.
* **Pagination Parameters:** 
  * `page` (default: 1)
  * `size` (default: 20, capped at 100)
* **Sorting Syntax:** `sort=column:direction` (e.g., `sort=created_at:desc`).
* **Filtering Syntax:** `filter[field]=value` (e.g., `filter[status]=ACTIVE`).

---

## 4. Endpoints Definition

### 4.1 Authentication Subdomain

#### `POST /api/v1/auth/login`
* **Purpose:** Authenticates users and returns access tokens.
* **Auth Required:** None.
* **Request Body:**
  ```json
  {
    "email": "user@organization.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response:** Status `200 OK`. Sets refresh cookie and returns:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "access_token": "eyJhbG...",
      "expires_in": 900
    }
  }
  ```

#### `POST /api/v1/auth/refresh`
* **Purpose:** Rotates expired access tokens.
* **Auth Required:** None (reads refresh token from Cookie).
* **Success Response:** Status `200 OK`. Returns a new access token.

#### `POST /api/v1/auth/logout`
* **Purpose:** Invalidates active session tokens.
* **Auth Required:** Yes.
* **Success Response:** Status `204 No Content`. Deletes active tokens from Redis.

---

### 4.2 Organizations Subdomain

#### `GET /api/v1/organizations`
* **Purpose:** Retrieve details of all organizations.
* **Auth Required:** Yes (SuperAdmin role required).
* **Success Response:** Status `200 OK`. Paginated list of organizations.

#### `GET /api/v1/organizations/:orgId`
* **Purpose:** Retrieve configuration details for a specific organization.
* **Auth Required:** Yes (OrgAdmin or higher).
* **Success Response:** Status `200 OK`. Returns organization settings.

#### `PATCH /api/v1/organizations/:orgId/branding`
* **Purpose:** Update styling and brand assets.
* **Auth Required:** Yes (OrgAdmin).
* **Request Body:**
  ```json
  {
    "logo_url": "https://storage.omnivote.com/branding/logo.png",
    "primary_color": "#4F46E5"
  }
  ```
* **Success Response:** Status `200 OK`.

---

### 4.3 Events Subdomain

#### `POST /api/v1/events`
* **Purpose:** Initialize a new voting event.
* **Auth Required:** Yes (ElectionOfficer or higher).
* **Request Body:**
  ```json
  {
    "title": "SRC Presidential Elections 2026",
    "module_type": "ELECTION",
    "start_time": "2026-08-01T08:00:00Z",
    "end_time": "2026-08-01T17:00:00Z"
  }
  ```
* **Success Response:** Status `201 Created`.

#### `PATCH /api/v1/events/:eventId/status`
* **Purpose:** Manually transition event lifecycle states (e.g., active, paused).
* **Auth Required:** Yes (ElectionOfficer).
* **Request Body:**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
* **Success Response:** Status `200 OK`.

---

### 4.4 Module A (Standard Elections) Subdomain

#### `POST /api/v1/elections/:eventId/voters/import`
* **Purpose:** Upload a whitelisted voter register.
* **Auth Required:** Yes (ElectionOfficer).
* **Request Body (Multipart Form-Data):** File stream containing CSV metadata.
* **Success Response:** Status `202 Accepted` (enqueues background import task).

#### `POST /api/v1/elections/:eventId/auth/otp-request`
* **Purpose:** Request voter authentication token.
* **Auth Required:** None.
* **Request Body:**
  ```json
  {
    "voter_identifier": "20394821"
  }
  ```
* **Success Response:** Status `200 OK`.

#### `POST /api/v1/elections/:eventId/auth/verify`
* **Purpose:** Validate OTP and return a voter access token.
* **Request Body:**
  ```json
  {
    "voter_identifier": "20394821",
    "otp_code": "483921"
  }
  ```
* **Success Response:** Status `200 OK`. Returns ballot access token valid for 1 hour.

#### `POST /api/v1/elections/:eventId/votes`
* **Purpose:** Submit completed ballot options.
* **Auth Required:** Yes (Voter Ballot Token required).
* **Request Body:**
  ```json
  {
    "selections": [
      {
        "category_id": "c71b-38ba-091a",
        "candidate_id": "f81a-2831-90ca"
      }
    ]
  }
  ```
* **Success Response:** Status `201 Created`. Returns a verification hash receipt:
  ```json
  {
    "success": true,
    "message": "Ballot recorded successfully.",
    "data": {
      "receipt_hash": "sha256-83ab7f29..."
    }
  }
  ```

---

### 4.5 Module B (Paid & Event Voting) Subdomain

#### `POST /api/v1/payments/initialize`
* **Purpose:** Initiate Mobile Money charge processes.
* **Auth Required:** None.
* **Headers:** Requires `X-Idempotency-Key`.
* **Request Body:**
  ```json
  {
    "event_id": "f9a1-09ba-c281",
    "nominee_id": "b8a1-2831-e129",
    "vote_count": 10,
    "phone_number": "+233240000000",
    "provider": "MTN"
  }
  ```
* **Success Response:** Status `200 OK`. Returns initialization state details.

#### `POST /api/v1/payments/callback`
* **Purpose:** Receive transaction callback webhook payloads from payment providers.
* **Auth Required:** Verified gateway IP block and signature validation headers.
* **Request Body:**
  ```json
  {
    "transaction_reference": "ref-8394-0283",
    "status": "SUCCESS",
    "amount": 10.00,
    "phone_number": "+233240000000",
    "idempotency_key": "idem-9218-aba2"
  }
  ```
* **Success Response:** Status `200 OK` (Ack).

---

### 4.6 USSD Subdomain

#### `POST /api/v1/ussd`
* **Purpose:** Telco interaction session router.
* **Auth Required:** Telco credentials check.
* **Request Body:**
  ```json
  {
    "session_id": "ussd_sess_9381023",
    "phone_number": "+233240000000",
    "user_input": "1"
  }
  ```
* **Success Response:** Status `200 OK`. Returns menu string formatted for telco screens:
  ```json
  {
    "action": "CON",
    "menu_text": "Enter Candidate Code:\n(e.g., MG12)"
  }
  ```

---

### 4.7 Audit Subdomain

#### `GET /api/v1/organizations/:orgId/audit-logs`
* **Purpose:** Retrieve administrative activity trails.
* **Auth Required:** Yes (OrgAdmin or higher).
* **Query Parameters:** `page`, `size`, `filter[action]`, `sort`.
* **Success Response:** Status `200 OK`. Paginated list of audit records.

---

### 4.8 Platform Administration Subdomain

#### `GET /api/v1/platform/health`
* **Purpose:** Check platform services status.
* **Auth Required:** None.
* **Success Response:** Status `200 OK`.
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "services": {
        "database": "connected",
        "redis": "connected",
        "celery_broker": "connected"
      }
    }
  }
  ```

### 4.9 Membership & Invitation Subdomain

#### `GET /api/v1/organizations/{organization_id}/members`
* **Purpose:** List members of an organization. Eager loads basic user profile (name, email).
* **Auth Required:** Bearer JWT. Requires `member.view` permission.
* **Success Response:** Status `200 OK`.
  ```json
  {
    "success": true,
    "message": "Members retrieved successfully.",
    "data": [
      {
        "id": "019f7cd3-197a-773e-9e11-ae9eb5c1ad81",
        "user_id": "019f7cce-c80c-76da-929a-e130db9a307e",
        "organization_id": "019f7b17-7dbb-702b-93fd-87d4b6d6b6e6",
        "status": "ACCEPTED",
        "invited_by": "019f7af1-4496-771c-9e33-f3177cba0b31",
        "invited_at": "2026-07-20T20:02:25Z",
        "accepted_at": "2026-07-20T20:09:37Z",
        "user": {
          "email": "candidtech07@gmail.com",
          "first_name": "Test",
          "last_name": "User"
        }
      }
    ]
  }
  ```

#### `POST /api/v1/organizations/{organization_id}/members`
* **Purpose:** Invite a new user to join the organization.
* **Auth Required:** Bearer JWT. Requires `member.invite` permission.
* **Request Body:**
  ```json
  {
    "recipient_email": "newuser@gmail.com",
    "initial_roles": ["Member"]
  }
  ```
* **Success Response:** Status `201 Created`.
  ```json
  {
    "success": true,
    "message": "Invitation created successfully.",
    "data": {
      "id": "019f811f-6240-7e3a-86dd-cc06c5fb0f06",
      "organization_id": "019f7b17-7dbb-702b-93fd-87d4b6d6b6e6",
      "recipient_email": "newuser@gmail.com",
      "status": "PENDING"
    }
  }
  ```

#### `DELETE /api/v1/organizations/{organization_id}/members/{membership_id}`
* **Purpose:** Remove a member from the organization.
* **Auth Required:** Bearer JWT. Requires `member.remove` permission.
* **Success Response:** Status `200 OK`.

#### `POST /api/v1/invitations/{token}/accept`
* **Purpose:** Accept an organization invitation using the single-use token.
* **Auth Required:** Bearer JWT.
* **Success Response:** Status `200 OK`. Creates or reactivates user membership.

#### `POST /api/v1/invitations/{token}/decline`
* **Purpose:** Decline an invitation.
* **Auth Required:** Bearer JWT.
* **Success Response:** Status `200 OK`.

#### `DELETE /api/v1/invitations/{invitation_id}`
* **Purpose:** Revoke/delete an invitation. Cascades and deletes active membership if accepted.
* **Auth Required:** Bearer JWT. Requires `member.invite` permission.
* **Success Response:** Status `200 OK`.

### 4.10 Role-Based Access Control (RBAC) Subdomain

#### `GET /api/v1/organizations/{organization_id}/my-permissions`
* **Purpose:** Fetch permissions resolved for the currently logged in user's membership.
* **Auth Required:** Bearer JWT.
* **Success Response:** Status `200 OK`.
  ```json
  {
    "success": true,
    "data": {
      "permissions": ["organization.view", "election.create"]
    }
  }
  ```

#### `GET /api/v1/organizations/{organization_id}/roles`
* **Purpose:** Get all available roles that can be assigned in this organization.
* **Auth Required:** Bearer JWT. Requires `role.view` permission.
* **Success Response:** Status `200 OK`.

#### `POST /api/v1/organizations/{organization_id}/roles`
* **Purpose:** Create a new custom role.
* **Auth Required:** Bearer JWT. Requires `role.create` permission.
* **Request Body:**
  ```json
  {
    "name": "Audit Viewer",
    "description": "Can only view audit logs"
  }
  ```
* **Success Response:** Status `201 Created`.

#### `PATCH /api/v1/organizations/{organization_id}/roles/{role_id}`
* **Purpose:** Update a custom role's metadata.
* **Auth Required:** Bearer JWT. Requires `role.update` permission.
* **Success Response:** Status `200 OK`.

#### `DELETE /api/v1/organizations/{organization_id}/roles/{role_id}`
* **Purpose:** Delete a custom role.
* **Auth Required:** Bearer JWT. Requires `role.delete` permission.
* **Success Response:** Status `204 No Content`.

#### `PUT /api/v1/organizations/{organization_id}/roles/{role_id}/permissions`
* **Purpose:** Atomically replace all permissions for a custom role.
* **Auth Required:** Bearer JWT. Requires `role.update` permission.
* **Request Body:**
  ```json
  {
    "permission_ids": ["019f7b17-7dbb-702b-93fd-87d4b6d6b6e7"]
  }
  ```
* **Success Response:** Status `200 OK`.

#### `PUT /api/v1/organizations/{organization_id}/memberships/{membership_id}/roles`
* **Purpose:** Atomically replace all roles for a membership. Enforces Last Owner Protection and prevents privilege escalation.
* **Auth Required:** Bearer JWT. Requires `member.update` permission.
* **Request Body:**
  ```json
  {
    "role_ids": ["019f7b17-7dbb-702b-93fd-87d4b6d6b6e7"]
  }
  ```
* **Success Response:** Status `200 OK`.

---

## 5. Webhook Specifications

### 5.1 Callback Security & Signature Verification
Every payload dispatched by OmniVote webhooks contains a custom signature header:
`X-OmniVote-Signature: sha256=<HMAC_Signature>`
The recipient must calculate the HMAC signature of the raw JSON body using their shared webhook secret to verify the payload's origin.

### 5.2 Event Status Transition Webhook
Dispatched to tenant organizations when election states change:
```json
{
  "event": "event.status_changed",
  "organization_id": "org-9381-abcd",
  "data": {
    "event_id": "ev-0921-bcde",
    "previous_status": "READY",
    "current_status": "ACTIVE",
    "timestamp": "2026-07-08T15:15:44Z"
  }
}
```

---

## 6. Real-Time Telemetry Specification

### 6.1 WebSocket Routing
WebSockets push live updates to user interfaces, bypassing HTTP pooling.
* **URI Route:** `wss://omnivote.com/ws/live-turnout?event_id=<UUID>`

### 6.2 Data Transport Payloads
Once connected, clients receive JSON updates when changes occur:

#### Message: Turnout Increment Broadcast (Module A)
```json
{
  "type": "turnout_update",
  "data": {
    "total_votes_cast": 14203,
    "turnout_percentage": 56.81,
    "timestamp": "2026-07-08T15:15:44Z"
  }
}
```

#### Message: Leaderboard Score Broadcast (Module B)
```json
{
  "type": "leaderboard_update",
  "data": {
    "candidates": [
      { "id": "cand-001", "name": "Jane Doe", "votes": 9520 },
      { "id": "cand-002", "name": "John Doe", "votes": 8102 }
    ]
  }
}
```
