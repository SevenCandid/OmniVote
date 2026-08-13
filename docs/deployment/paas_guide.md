# PaaS Deployment Guide

This guide details how to deploy OmniVote using managed services (PaaS) to maximize free tiers.

## 1. Neon (PostgreSQL)
1. Sign up at [Neon.tech](https://neon.tech).
2. Create a new project and database named `omnivote`.
3. Copy the Postgres connection string (e.g., `postgresql://...`).
4. Replace `postgresql://` with `postgresql+asyncpg://` to ensure async driver compatibility with our FastAPI backend.

## 2. Upstash (Redis)
1. Sign up at [Upstash.com](https://upstash.com).
2. Create a new Redis database (Global or region closest to your Fly.io region).
3. Copy the Redis URI connection string.

## 3. Fly.io (Backend API & Worker)
1. Install `flyctl` locally and run `fly auth login`.
2. Navigate to `apps/api/` in your terminal.
3. Run `fly launch --no-deploy` (use the existing `fly.toml`).
4. Set the secrets securely via the CLI:
   ```bash
   fly secrets set DATABASE_URL="postgresql+asyncpg://..."
   fly secrets set REDIS_URL="redis://..."
   fly secrets set SECRET_KEY="generate_a_secure_random_string_here"
   ```
5. Deploy both the API and worker processes:
   ```bash
   fly deploy
   ```

## 4. Vercel (Frontend SPA)
1. Push your repository to GitHub.
2. Sign up at [Vercel](https://vercel.com) and create a New Project from your GitHub repo.
3. Set the **Framework Preset** to Vite.
4. Set the **Root Directory** to `apps/web`.
5. Add the Environment Variable:
   - `VITE_API_BASE_URL`: Set this to your Fly.io App URL (e.g., `https://omnivote-api.fly.dev/api/v1`).
6. Deploy! Vercel will automatically run `npm run build` and respect the fallback rules in `vercel.json`.
