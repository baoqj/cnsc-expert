# CNSC Expert Deployment & Backend Setup

## Architecture
- Frontend: React + Vite, deployed on Vercel.
- AI/RAG: Dify on Mac mini (Docker), model provider MiniMax.
- Database: Neon managed Postgres (`cnsc-db`, Neon ID `cold-art-40008038`).
- ORM: Prisma.
- API runtime: Vercel Serverless Functions under `api/*`.

## Project Paths
- Working directory: `Code/cnsc-expert`
- Original UI template: `Code/cnsc-expert-ai`

## 1. Install
```bash
cd Code/cnsc-expert
npm install
```

## 2. Provision Neon Postgres
1. In Neon, ensure database `cnsc-db` exists (project ID `cold-art-40008038`).
2. Copy the Neon pooled connection string.
3. Set `DATABASE_URL` locally and in Vercel.

Example:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

## 3. Prisma Setup (Schema, Migrations, Seed)

Files created:
- `prisma/schema.prisma`
- `prisma/migrations/20260220120000_init/migration.sql`
- `prisma/seed.mjs`

Commands:
```bash
cd Code/cnsc-expert
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

For local development (instead of deploy migration):
```bash
npm run prisma:migrate:dev
```

Seed defaults (override via env vars):
- `SEED_ADMIN_EMAIL=admin@cnsc.local`
- `SEED_ADMIN_NAME=CNSC Admin`
- `SEED_ORG_NAME=CNSC Default Organization`
- `SEED_ORG_SLUG=cnsc-default-organization`

## 4. Environment Variables

Use `Code/cnsc-expert/.env.example` as baseline.

Required in Vercel:
- `DATABASE_URL`
- `DIFY_BASE_URL`
- `DIFY_APP_API_KEY`

Optional:
- `DIFY_TIMEOUT_MS` (default `60000`)
- `VITE_API_BASE_URL` (default `/api`)

## 5. RBAC and Request IDs

Server helpers:
- `lib/server/db.ts`: shared Prisma client singleton.
- `lib/server/rbac.ts`: auth context + role/org guard helpers.
- `lib/server/http.ts`: request parsing, request ID, unified API errors.
- `lib/server/audit.ts`: `AuditLog` writer.

RBAC headers expected by APIs:
- `x-user-id`
- `x-user-role` (`ADMIN` or `USER`)
- `x-org-id`

All API responses include `requestId`, and routes write audit records into `AuditLog`.

## 6. API Endpoints (Minimal CRUD)

Projects:
- `GET /api/projects`
- `POST /api/projects` (ADMIN)
- `GET /api/projects/:id`
- `PATCH /api/projects/:id` (ADMIN)
- `DELETE /api/projects/:id` (ADMIN)

Documents:
- `GET /api/documents`
- `POST /api/documents` (ADMIN)
- `GET /api/documents/:id`
- `PATCH /api/documents/:id` (ADMIN)
- `DELETE /api/documents/:id` (ADMIN)

Chat:
- `POST /api/chat`
  - proxies to Dify
  - persists chat session/message
  - writes audit logs with request IDs

## 7. Deploy to Vercel

1. Push repo to GitHub.
2. Import `baoqj/cnsc-expert` in Vercel.
3. Set env vars (`DATABASE_URL`, `DIFY_*`).
4. Deploy.

`vercel.json` is already configured for Vite output + serverless functions.

## 8. Mac mini Dify + MiniMax

On Mac mini:
```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d
```

In Dify:
1. Configure MiniMax under model provider settings.
2. Publish your app and copy `app-...` API key.
3. Put that key into Vercel `DIFY_APP_API_KEY`.
