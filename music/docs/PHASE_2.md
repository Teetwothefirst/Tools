# Phase 2: Playlists, Library Personalization & Queue Persistence

## What Was Built

### 1. Database Schema Additions
- **`Playlist`** & **`PlaylistTrack`**: User-owned playlists with ordered track relations.
- **`UserActivity`**: Tracks playback history, progress, and completion state per user.
- **`FavoriteAlbum`** & **`FavoriteArtist`**: Composite-key bookmarks linking users to their saved albums and artists.

### 2. Backend API Modules

#### Playlist Module (`apps/api/src/playlist`)
- `POST /api/playlists` → Create playlist
- `GET /api/playlists` → Get all user playlists
- `GET /api/playlists/:id` → Get playlist with ordered tracks
- `PUT /api/playlists/:id` → Edit playlist metadata
- `DELETE /api/playlists/:id` → Delete playlist
- `POST /api/playlists/:id/tracks` → Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` → Remove track from playlist
- `PUT /api/playlists/:id/tracks/order` → Reorder tracks via trackIds array

#### History Module (`apps/api/src/history`)
- `POST /api/history/activity` → Update playback progress (upsert)
- `GET /api/history/recently-played` → Last 12 played tracks
- `GET /api/history/continue-listening` → Incomplete tracks with progress

#### Library Module Extensions (`apps/api/src/library`)
- `GET /api/library/albums` → Favorite albums
- `POST /api/library/albums/:albumId` → Save album
- `DELETE /api/library/albums/:albumId` → Unsave album
- `GET /api/library/artists` → Favorite artists
- `POST /api/library/artists/:artistId` → Follow artist
- `DELETE /api/library/artists/:artistId` → Unfollow artist

### 3. Frontend Pages & Components

#### New Views
- **`/playlists`** → Playlist grid with create/delete actions
- **`/playlists/[id]`** → Playlist detail with track list, edit, and reordering (up/down arrows)

#### Updated Views
- **`/` (Home)** → Personalized greeting, Continue Listening, Recently Played, Popular Tracks, New Releases
- **`/library`** → Tabbed layout: Liked Songs / Albums / Artists
- **Search** → Added "Add to playlist" inline selector on track rows

#### Component Updates
- **`Sidebar`** → Responsive: fixed desktop sidebar + mobile slide-in drawer with hamburger
- **`MusicPlayer`** → Fully responsive with custom progress bar, mute toggle, mobile-optimized layout
- **`RootLayout`** → Adjusted padding for mobile top bar and desktop sidebar

### 4. Queue Persistence
- `usePlayerStore` now uses Zustand `persist` middleware writing to `localStorage` under key `music-player-storage`
- Persisted fields: `currentTrack`, `queue`, `queueIndex`, `volume`, `playHistory`
- `isPlaying` intentionally NOT persisted (audio doesn't autoplay on refresh)

### 5. Playback History Sync
- `AudioProvider` sends progress to `/api/history/activity` every 10 seconds while playing
- Marks track as `isCompleted` when within 5 seconds of end

## Remaining for Phase 3
- Recommendation engine (trending, discovery)
- Genre-based exploration
- Artist & Album detail pages
- Collaborative playlists (Phase 4)
