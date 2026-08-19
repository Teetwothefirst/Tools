# ADR 0001: Monorepo Workspace Structure

## Status
Accepted

## Context
Building a scalable streaming platform requires frontend presentation code, backend API domain logic, database ORM models, and shared TypeScript type contracts to remain strictly synchronized.

## Decision
We adopt a monorepo workspace containing `apps/web` (Next.js 15), `apps/api` (NestJS), `packages/database` (Prisma ORM), and `packages/shared-types`.

## Consequences
- Single source of truth for database schema and shared DTOs.
- Reduced build overhead and simplified continuous integration.
- Independent deployability of frontend and backend applications.
