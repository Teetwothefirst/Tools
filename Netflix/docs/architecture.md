# StreamFlix Architecture Overview

StreamFlix is a production-grade, Netflix-inspired video streaming platform designed for high availability, adaptive video playback, secure multi-tenant user profile state management, background media transcoding, and subscription workflows.

## System Topology

```
                  ┌─────────────────────────────────────┐
                  │          Client Browser             │
                  │   Next.js 15 SSR/Client App         │
                  └──────────────────┬──────────────────┘
                                     │
                   HTTP/HTTPS REST & HLS Manifest Fetch
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │           Backend API               │
                  │       NestJS Framework (Node/TS)    │
                  └──────┬───────────┬───────────┬──────┘
                         │           │           │
       SQL Connection    │           │ Cache     │ Storage
                         ▼           ▼           ▼
                  ┌────────────┐┌─────────┐┌───────────┐
                  │ PostgreSQL ││  Redis  ││ Media /   │
                  │  Prisma    ││ Store   ││ Object    │
                  │ Database   ││         ││ Storage   │
                  └────────────┘└─────────┘└───────────┘
                                     ▲
                                     │ Transcoded HLS Assets
                         ┌───────────┴───────────┐
                         │   FFmpeg Transcoder   │
                         │ Background Worker Job │
                         └───────────────────────┘
```

## Key Architectural Principles

1. **Strict Monorepo Structure**: Shared types (`packages/shared-types`) and Prisma database schema (`packages/database`) isolate data logic from presentation apps.
2. **Adaptive Bitrate Streaming (HLS)**: Videos are never exposed as raw MP4 downloads. All video uploads pass through an asynchronous FFmpeg worker pipeline generating HLS `.m3u8` master and resolution manifests (`360p`, `480p`, `720p`, `1080p`) with chunked TS segments.
3. **Stateless JWT Auth + Multi-Profile Context**: Authentication uses HTTP-Only cookies with access tokens and refresh rotation. Profile selection is validated server-side for every request.
4. **Optimistic UI with Authoritative Server State**: Watchlist and playback interactions update client state instantaneously while syncing back to API endpoints with debounced progress handlers.
