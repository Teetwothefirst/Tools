# 🎵 Music Streaming Platform & Creator Studio

Production-ready, full-stack modular music streaming web application built with **Next.js 14**, **NestJS**, **Prisma ORM**, **PostgreSQL (Supabase)**, and **FFmpeg**.

---

## 🌟 Key Features

### 🎧 Listener Experience
- **Persistent Global Audio Player:** Audio player bar supporting continuous background playback, progress seeking, volume control, and queue navigation.
- **Dynamic Catalog Discovery:** Browse trending tracks, new album releases, and featured artist profiles.
- **Detailed Artist & Album Views:** Explore artist biographies, discographies, top tracks, and save albums to personal library.
- **Custom Playlists:** Create, edit, re-order, and manage personalized streaming playlists.

### 🎬 Universal Media Converter Studio
- **On-the-Fly FFmpeg Engine:** Converts video & audio files (`MP4`, `MKV`, `MOV`, `WEBM`, `WAV`) into high-quality audio streams (`MP3`, `WAV`, `AAC`, `FLAC`).
- **Bitrate Control:** Choose audio quality presets from 128 kbps to 320 kbps studio master quality.
- **Direct Catalog Publishing:** One-click transfer from media converter output straight into catalog creation forms.

### 🛡️ Admin & Creator Control Panel (`/admin`)
- **Direct Supabase Cloud Uploads:** Drag-and-drop `.mp3` audio files and cover art directly into Supabase Storage Buckets (`audio-files`, `album-covers`).
- **Artist Profile Management:** Create new artist profiles or update existing artist names, biographies, and photos in real time.
- **Album & Track Catalog Management:** Link tracks to artists and albums with auto-duration extraction.

---

## 🔒 User Roles & Access Control Matrix

The platform implements Role-Based Access Control (RBAC) to enforce security boundaries across API endpoints and frontend views:

| Role | Access Level | Permissions & Capabilities |
| :--- | :--- | :--- |
| **`ADMIN`** | Full System Access | Upload audio/covers to Supabase, create & edit artist profiles, manage albums/tracks, access `/admin` dashboard & Media Converter. |
| **`USER`** | Listener Access | Stream music, create/manage playlists, like tracks, save albums & artists to personal Library, view streaming history. |

### 🔑 Pre-Configured Seed Accounts

For quick local testing, run `pnpm db:seed` in `apps/api`:

- **Admin Account:**
  - **Email:** `admin@music.com`
  - **Password:** `password123`
  - **Role:** `ADMIN`
- **User Account:**
  - **Email:** `user@music.com`
  - **Password:** `password123`
  - **Role:** `USER`

---

## 🏗️ Architecture & Project Structure

```
music/
├── apps/
│   ├── api/                    # NestJS Modular Backend API
│   │   ├── prisma/             # Database schema & seeder scripts
│   │   └── src/
│   │       ├── auth/           # JWT & Passport Authentication
│   │       ├── catalog/        # Track, Album, Artist endpoints
│   │       ├── converter/      # FFmpeg Media Conversion Engine
│   │       ├── storage/        # Supabase Storage Bucket Client
│   │       ├── library/        # Liked songs & saved albums
│   │       └── playlist/       # User playlist management
│   └── web/                    # Next.js 14 Web Application
│       ├── src/
│       │   ├── app/            # App Router pages (admin, converter, artists, albums)
│       │   ├── components/     # MusicPlayer, Sidebar, UI components
│       │   ├── providers/      # Audio Context Provider
│       │   └── store/          # Zustand State Management (Player & Auth)
└── packages/
    ├── shared/                 # Shared utilities
    └── types/                  # TypeScript interfaces & types
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TailwindCSS, Lucide Icons, Zustand, React Query
- **Backend:** NestJS 10, TypeScript, Passport JWT, Multer
- **Database & Storage:** PostgreSQL, Supabase Cloud Storage, Prisma ORM
- **Media Engine:** FFmpeg CLI & `ffmpeg-static`
- **Documentation:** Swagger OpenAPI (`/api/docs`)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js `v18+`
- `pnpm` package manager (`npm i -g pnpm`)

### 2. Installation
Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/Teetwothefirst/Tools.git
cd Tools/music
pnpm install
```

### 3. Environment Variables

Create `.env` in `apps/api`:
```env
PORT=4000
NODE_ENV=development

# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase Storage Configuration
SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_KEY="your-supabase-key"

# JWT Secret
JWT_SECRET="super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

### 4. Database Push & Seed
```bash
cd apps/api
pnpm db:push
pnpm db:seed
```

### 5. Running the Application
Start backend and frontend dev servers concurrently:
```bash
# Terminal 1 (Backend API):
cd apps/api
pnpm dev

# Terminal 2 (Frontend Web):
cd apps/web
npm run dev
```

- **Frontend Web App:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:4000/api`
- **Swagger Documentation:** `http://localhost:4000/api/docs`
