# Database Foundation Architecture & Design Decisions

This document outlines the architectural decisions and design strategies adopted for the database foundation of the OmniVote SaaS platform.

---

## 1. Multi-Database Strategy

### Production & Non-Testing Environments: PostgreSQL
PostgreSQL is standardized as the database engine for development, staging, and production environments.
- **Why PostgreSQL**:
  - High concurrency handling and row-level locking for secure transaction processing (crucial for voting integrity).
  - Robust ACID compliance.
  - Native support for advanced types (like UUID) and performant indexing options.
  - Fail-safe constraint enforcement.
- **No Silent Fallback**: To prevent silent data loss or misconfigurations, the backend will fail fast on startup if `DATABASE_URL` is missing or is not a PostgreSQL connection string in any non-testing environment.

### Unit Testing Environment: SQLite (In-Memory)
SQLite is used strictly inside the automated unit test suite.
- **Why SQLite**:
  - Extremely fast, low-overhead database instances built dynamically inside memory (`sqlite+aiosqlite:///:memory:`).
  - Isolation between parallel test processes, preventing test crosstalk.
  - Zero local setup requirement (no need for active PostgreSQL instances to run tests).
  - Configured using a `StaticPool` so that test connections share the same database state securely across transaction boundaries.

---

## 2. Global Timestamp Standardization: UTC Only
All timestamps stored, manipulated, and queried within OmniVote are strictly normalized to Coordinated Universal Time (UTC).
- **Store in UTC**: Datetime fields use the custom `UTCDateTime` SQLAlchemy TypeDecorator, which forces naive datetimes to UTC on write and serializes loaded variables to UTC with explicit offsets.
- **Generate on UTC**: The backend constructs timezone-aware UTC datetime values. Naive datetime calls are forbidden.
- **Format in API**: Time outputs are returned in ISO 8601 format with trailing `Z` offsets.
- **Client Conversion**: The frontend is solely responsible for parsing UTC timestamps and converting them to the user's localized timezone display.

---

## 3. Primary Key Strategy: UUID Version 7
OmniVote standardizes on UUIDv7 for all database entity primary keys.
- **Why UUIDv7**:
  - **Time-Ordered Uniqueness**: UUIDv7 combines a millisecond Unix timestamp with random bits. This means IDs are naturally sorted chronologically, solving the index locality issues of UUIDv4.
  - **PostgreSQL B-Tree Performance**: Inserting time-sorted UUIDv7 keys into standard indexes avoids B-Tree page splits, leading to significantly higher write throughput.
  - **Safe Client Generation**: Prevents ID enumeration attacks (which affect integer PKs) while maintaining excellent database performance.
- **Implementation**: Exposes `generate_uuid7()` utility, leveraging Python 3.14's native `uuid.uuid7()` when available, with a compliant pure-Python fallback for earlier versions.

---

## 4. Metadata Naming Convention Strategy
To ensure database constraints (Foreign Keys, Indexes, Check Bounds) have deterministic, consistent, and recognizable names across migrations, we enforce the following SQLAlchemy naming convention:
- **Primary Keys (`pk`)**: `pk_%(table_name)s`
- **Foreign Keys (`fk`)**: `fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s`
- **Unique Constraints (`uq`)**: `uq_%(table_name)s_%(column_0_name)s`
- **Check Constraints (`ck`)**: `ck_%(table_name)s_%(constraint_name)s`
- **Indexes (`ix`)**: `ix_%(column_0_label)s`

This naming convention ensures Alembic autogenerates predictable schema names during migration compilations.

---

## 5. Centralized Database Exception Handling
To ensure enterprise-grade security and prevent sensitive information leaks:
- **No Leaks to API Consumers**: Database errors (such as `IntegrityError` or connection failures) are captured globally by the `sqlalchemy_exception_handler`. Raw SQL commands, schema details, or credential variables are never returned to callers.
- **Structured Error Return**: Consumers receive a sanitized, standardized JSON error response following the OmniVote API Specification:
  ```json
  {
      "success": false,
      "message": "Database operation failed.",
      "error": {
          "code": "DATABASE_ERROR",
          "details": []
      },
      "metadata": {
          "timestamp": "2026-07-09T12:00:00.000000Z",
          "request_id": "req-...",
          "correlation_id": "corr-..."
      }
  }
  ```
- **Internal Logging**: Complete, raw error statements and stack traces are logged securely using structured logging (`structlog`) for internal auditing and debugging.
