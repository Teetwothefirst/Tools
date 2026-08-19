# ADR 0003: PostgreSQL with Prisma ORM

## Status
Accepted

## Context
A Netflix clone requires reliable relational data modeling (users, multi-profiles, media assets, watch history, subscriptions, ratings) with strict referential integrity, indexes, and full-text search capability.

## Decision
We select PostgreSQL as our primary database engine and Prisma ORM for type-safe database queries, schema migrations, and relational seeding.

## Consequences
- End-to-end type safety between database models and TypeScript API logic.
- Declarative schema migrations ensuring reproducible database state across environments.
- High performance relational queries with explicit indexing strategies.
