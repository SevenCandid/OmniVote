# ==============================================================================
# OmniVote Monorepo Root Dockerfile (Production/Builder Template)
# ==============================================================================

# --- Base Stage ---
FROM node:22-alpine AS base
WORKDIR /workspace

# --- Frontend Build Stage ---
FROM base AS web-builder
COPY packages/shared-types /workspace/packages/shared-types
COPY apps/web/package.json apps/web/package-lock.json* /workspace/apps/web/
RUN cd /workspace/apps/web && npm install --legacy-peer-deps
COPY apps/web /workspace/apps/web
RUN cd /workspace/apps/web && npm run build

# --- Backend Base Stage ---
FROM python:3.13-slim AS api-base
WORKDIR /workspace/api
COPY apps/api/requirements.txt /workspace/api/
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/api /workspace/api

# --- Final Production Image Example ---
FROM api-base AS production
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
