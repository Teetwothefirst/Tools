# Phase 0: Project Foundation Documentation

## Overview
Phase 0 establishes the core foundation of the music streaming monorepo platform.

## Built & Configured Architecture
- **Monorepo Strategy**: Managed via `pnpm-workspace.yaml`.
- **Apps (`apps/`)**:
  - `web`: Next.js 14/15 (App Router, Tailwind CSS dark theme tokens, TanStack Query, TypeScript).
  - `api`: NestJS API service with Prisma ORM (PostgreSQL), Swagger OpenAPI UI, and JWT Auth Guard scaffolding.
- **Packages (`packages/`)**:
  - `types`: `@music/types` exporting shared interfaces (User, AuthResponse, ApiResponse, UserRole).
  - `shared`: `@music/shared` exporting Zod validation schemas (Login, Register) and application constants.
  - `ui`: `@music/ui` shared UI package component library foundation.

## Environment Variables
- `apps/api/.env`: Sets `PORT=4000`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
- `apps/web/.env.example`: Sets `NEXT_PUBLIC_API_URL`.

## API Endpoints Scaffolded
- `GET /api/health` -> API Service Health check.
- `GET /api/docs` -> Interactive Swagger OpenAPI Documentation.
- `POST /api/auth/register` -> Registration endpoint scaffolding.
- `POST /api/auth/login` -> Login endpoint scaffolding.
- `GET /api/auth/me` -> Protected user profile endpoint.
