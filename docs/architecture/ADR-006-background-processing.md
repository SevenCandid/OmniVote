# ADR-006: Redis & Background Task Processing Foundation

* **Status**: Approved
* **Date**: 2026-07-09

---

## 1. Context and Problem Statement
OmniVote requires a scalable, asynchronous background processing system. Future features such as ballot/vote processing, payment verification, reminder notifications, SMS sending, PDF report exports, and system maintenance tasks must run outside the critical path of HTTP request-response lifecycles. 

To support these background jobs, the system also needs a high-performance in-memory data store for caching, rate limiting, temporary validation tokens, and distributed locking.

---

## 2. Decision
1. Standardize on **Redis** as the shared in-memory key-value database.
2. Standardize on **Arq** as the Redis-backed asynchronous job queue worker.
3. Configure **separate queue namespaces** mapped to specific operational priority levels.

---

## 3. Rationale

### Why Redis?
- **High Throughput**: Capable of handling tens of thousands of read/write operations per second.
- **Versatility**: Serves as both the background job broker (for Arq) and the caching/rate-limiting/locking tier.
- **Connection Pooling**: Supported natively by `redis-py` via async connection pools.

### Why Arq (and why not Celery or RQ)?
- **Async-First Architecture**: Arq is designed from the ground up for Python's `asyncio` loop. It integrates natively with our async FastAPI endpoints and async SQLAlchemy database connections.
- **Lightweight Structure**: Unlike Celery (which requires complex configuration, external serialization libraries, and heavyweight dependency graphs), Arq has a minimal footprint and depends directly on `redis-py` and `msgpack`.
- **Lower Code Complexity**: Job registration is configured via a standard Python class (`WorkerSettings`) and function decorators, matching our developer guidelines.

---

## 4. Alternatives Considered

### Alternative 1: Celery
- **Pros**: Mature, rich ecosystem, support for multiple brokers.
- **Cons**: Extremely complex to configure for async-native codebases. Celery runs jobs inside synchronous process pools by default, making async/await database operations complex to orchestrate without custom event loop bridges (like `asgiref`). It also adds significant package dependency overhead.

### Alternative 2: RQ (Redis Queue)
- **Pros**: Very lightweight and simple.
- **Cons**: RQ is strictly synchronous/blocking. It relies on process forks (`os.fork()`) which are not supported on Windows (violating our dev environment requirements) and does not support Python `asyncio` natively.

---

## 5. Consequences

### Positive
- **Non-Blocking APIs**: Heavy tasks are offloaded instantly, ensuring the API responds to voters within sub-100ms ranges.
- **Horizontal Scalability**: Background workers can be scaled horizontally by launching multiple Arq worker daemons bound to the same Redis instance.
- **Queue Separation**: Isolates critical tasks (like vote processing) on high-priority queues, preventing report generations or notifications from slowing down voting throughput.
- **Reliable Retries**: Custom exponential backoffs prevent external service outages (e.g. SMS provider offline) from failing the task permanently.

### Negative
- **Operational Complexity**: Requires managing Redis instances and active worker processes alongside the FastAPI web process.
