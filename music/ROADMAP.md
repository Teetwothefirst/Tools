# 🗺️ Master Product Roadmap: Next-Gen Music & Video Platform

> **Target Standard:** Spotify, Apple Music & YouTube Music Level Platform  
> **Source of Truth:** Last Updated: August 2026

---

## 🏆 Vision Statement
To build a production-grade, full-stack music streaming, media creation, and discovery platform that combines the **high-fidelity audio experience of Apple Music**, the **discovery & social features of Spotify**, and the **video/media converter capabilities of YouTube Music**.

---

## 📊 Roadmap Overview & Status Matrix

| Phase | Milestone | Focus Area | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | Foundation & Core Architecture | Monorepo, Next.js 14, NestJS API, PostgreSQL/Prisma, Global Player | ✅ Completed |
| **Phase 2** | Discovery, Playlists & Library | Playlists, Favorites Library, History, Search & Catalog | ✅ Completed |
| **Phase 3** | Supabase Infrastructure & Catalog | Supabase SSL Database, Seeder, Artist & Album Detail Pages | ✅ Completed |
| **Phase 4** | Cloud Storage & Creator Studio | Supabase Storage Buckets, Admin Studio (`/admin`), Edit Artist Profiles | ✅ Completed |
| **Phase 5** | Universal Media Conversion Engine | FFmpeg Engine (`MP4 → MP3, WAV, AAC, FLAC, WEBM`), Bitrate Presets | ✅ Completed |
| **Phase 6** | Synced Lyrics & Immersive Player | Timestamped LRC Parser, Auto-scrolling Synced Lyrics, Fullscreen Modal | ✅ Completed |
| **Phase 7** | Recommendation Engine & Genre Hub | "Made For You" Mixes, Genre Hub (`/browse/genres`), Mood Filters | ✅ Completed |
| **Phase 8** | Social Platform & Collaboration | Collaborative Playlists, Friend Activity Feed, Shareable Widgets | ✅ Completed |
| **Phase 9** | Spotify for Artists Studio | Creator Analytics Dashboard, Listener Demographics, Release Scheduler | ✅ Completed |
| **Phase 10**| YouTube Music Video & PWA Offline | Audio/Video Toggle, HLS Video Player, PWA Offline Audio Caching | ✅ Completed |

---

## 🔍 Detailed Phase Specifications

### ✅ Phase 1: Core Platform & Foundation (Completed)
- [x] Monorepo setup using `pnpm` workspaces (`apps/api`, `apps/web`, `packages/shared`, `packages/types`).
- [x] NestJS Modular Backend with JWT Authentication and Passport strategy.
- [x] Prisma ORM schema connecting to PostgreSQL database.
- [x] Next.js 14 App Router frontend with TailwindCSS, dark theme, and glassmorphism UI.
- [x] Global audio player bar (`MusicPlayer`) with persistent background audio state across route navigation.

### ✅ Phase 2: Discovery, Playlists & User Library (Completed)
- [x] Custom Playlists module (`POST`, `GET`, `PUT`, `DELETE` playlist tracks with manual ordering).
- [x] User Library module (like/unlike tracks, save/remove albums & artists).
- [x] Streaming history tracking (recently played tracks and continue listening endpoints).
- [x] Catalog Search endpoint with real-time text filtering across tracks, albums, and artists.

### ✅ Phase 3: Supabase Cloud Database & Catalog Views (Completed)
- [x] Configured Supabase PostgreSQL database credentials with SSL mode (`pgbouncer=true`).
- [x] Production database seeder script populating demo users, artists, albums, and tracks.
- [x] Created **Artist Detail Page** (`/artists/[id]`) with biography, top tracks, discography, and follow toggle.
- [x] Created **Album Detail Page** (`/albums/[id]`) with cover art, track listing, and save-to-library toggle.

### ✅ Phase 4: Cloud Storage & Admin Creator Studio (Completed)
- [x] Supabase Storage integration for uploading audio streams (`audio-files`) and cover art (`album-covers`).
- [x] Admin Control Panel (`/admin`) with role-based guard (`role: ADMIN`).
- [x] Edit Artist Profile feature (backend `PUT /api/catalog/artist/:id`, admin panel editor, and artist detail modal editor).

### ✅ Phase 5: Universal Media Conversion Engine (Completed)
- [x] Integrated FFmpeg CLI engine (`fluent-ffmpeg` / `ffmpeg-static`) into NestJS (`/api/converter/convert`).
- [x] Converted video & audio formats (`MP4`, `MKV`, `MOV`, `WEBM`, `WAV`) into high-quality audio files (`MP3`, `WAV`, `AAC`, `FLAC`).
- [x] Added Media Converter Studio UI (`/converter`) with bitrate quality options (128k to 320k) and direct "Publish to Catalog" action.
- [x] Updated `.gitignore` to exclude media binaries and conversion temp directories.

---

### 🚀 Phase 6: Synced Lyrics & Immersive Fullscreen Player Modal (Next Target)
- [ ] **Timestamped LRC Lyrics Parser:** Support `.lrc` format (`[00:12.34] Lyrics text`).
- [ ] **Synchronized Auto-Scrolling Lyrics:** Real-time active lyric highlighting synced to `currentTime`.
- [ ] **Immersive Fullscreen Modal:** Expand bottom player bar into a full-screen view with album cover ambient blur backdrop.
- [ ] **Audio Equalizer Presets:** Bass Boost, Vocal Booster, Treble, Acoustic, Electronic.
- [ ] **Queue Manager Inspector:** Drag-and-drop reordering of upcoming queued tracks.

### ⏳ Phase 7: Recommendation Engine & Genre Discovery Hub
- [ ] **Genre Hub (`/browse/genres`):** Dedicated genre cards (*Synthwave, Lofi, EDM, Hip-Hop, Pop, Rock, Classical*).
- [ ] **Mood Tagging System:** Filter tracks by mood (*Chill, Focus, Workout, Party, Sleep*).
- [ ] **Personalized Mixes ("Made For You"):** Daily Mix 1-6 generator based on user listening history.
- [ ] **Smart Auto-Play Radio:** Automatically queue similar songs when the current playlist ends.

### ⏳ Phase 8: Social Platform & Collaborative Playlists
- [ ] **Collaborative Playlists:** Multi-user editing permissions allowing friends to add and reorder tracks.
- [ ] **Public / Private Toggles:** Toggle playlist privacy and generate shareable short-links.
- [ ] **Friend Activity Feed:** Real-time sidebar feed showing what friends are currently listening to.
- [ ] **Web Embed Widget:** Generatable HTML iframe snippet for embedding tracks and playlists on external websites.

### ⏳ Phase 9: Spotify for Artists / Creator Analytics Studio
- [ ] **Analytics Dashboard:** Visual charts showing total track plays, monthly unique listeners, and top geographical regions.
- [ ] **Discography Manager:** Track versioning, stem uploads, and metadata editing.
- [ ] **Release Scheduler:** Set future publication dates for upcoming singles and albums.
- [ ] **Royalty & Earnings Estimator:** Simulated stream payouts and revenue reporting.

### ⏳ Phase 10: YouTube Music Video Integration & PWA Offline Caching
- [ ] **Audio / Video Toggle Switch:** Seamlessly switch between audio track and official music video stream.
- [ ] **HLS Video Player:** Smooth video streaming for live performances and official music videos.
- [ ] **PWA Offline Audio Caching:** Service Worker + IndexedDB caching to enable offline playback without an active internet connection.
- [ ] **Desktop & Mobile PWA Installation:** Native app feel with media key controls (Play, Pause, Skip via keyboard/lockscreen).
