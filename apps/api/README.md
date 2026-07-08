# OmniVote Backend API Service

One System. Every Vote. Powered by VeroSeven.

This directory houses the FastAPI backend application for the OmniVote SaaS platform.

## Architecture Foundation
The service is structured according to clean architecture, decoupled modules, and async-first design patterns:

* **`app/core/`**: Environment configurations using `pydantic-settings`, structured logging with `structlog`, and security placeholders.
* **`app/middleware/`**: Base HTTP request logging and request-tracing middleware (X-Request-ID / X-Correlation-ID propagation).
* **`app/exceptions/`**: Custom base and standard application exception classes, along with custom handlers formatting error responses in the standard OmniVote JSON wrapper.
* **`app/api/v1/`**: Routing architecture version 1 with endpoints versioning.
* **`app/factory.py`**: FastAPI instantiation factory registering all routes, configurations, exceptions, and middlewares.
* **`app/tests/`**: Automated pytest testing suites.

## Local Development Setup

### Prerequisite
* Python 3.13+ (tested on 3.14+)

### 1. Initialize Virtual Environment
Create and activate your local Python virtual environment:
```bash
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate
```

### 2. Install Packages
Install dependencies from the standard file:
```bash
pip install -r requirements.txt
```

### 3. Environment Config
Copy `.env.example` into a local `.env` file:
```bash
cp .env.example .env
```

### 4. Running the Service
Run the development runner:
```bash
python -m app.main
```
The server will boot on `http://localhost:8000`. You can visit Swagger docs at `/api/v1/docs`.

### 5. Running Tests
Run pytest to verify the foundation:
```bash
python -m pytest
```
