# Phase 1 Documentation

## What Was Built
Phase 1 delivers the core authentication modules, music catalog engine, browse/search layouts, interactive audio playback services, and user libraries.

### Features
1. **Secure JWT Authentication**:
   - Integrated `bcryptjs` password hashing and verification in API endpoints.
   - Access Token issuance via `@nestjs/jwt`.
   - Client persistence and auth state management via a custom Zustand store `useAuthStore`.
2. **Music Catalog**:
   - Expanded Prisma models: `Artist`, `Album`, `Track`, and `Like`.
   - Setup relations ensuring data integrity with cascade delete strategies.
3. **Browse & Search Engine**:
   - `/api/catalog/search` supporting text search on Track, Album, Artist.
   - `/api/catalog/browse` querying popular releases, trending hits, and artists.
   - Search page viewport with search-as-you-type and play options.
4. **Interactive Web Audio Player**:
   - Zustand store tracking player state, queue index, play history, and volume.
   - Custom React Context `AudioProvider` wraps HTMLAudioElement.
   - Bottom bar persistent controller rendering metadata, skip controls, progress bar scrub, and volume slider.
5. **User Library**:
   - API endpoints (`GET/POST/DELETE` on `/api/library`) linked to User Likes.
   - Library dashboard displaying user's favorite tracks.
6. **Settings**:
   - Configurable preferences form for editing user profile (Name, Avatar URL).
7. **Admin Catalog Upload**:
   - Custom Admin Dashboard view enabling creators to save Artists, Albums, and upload new Tracks with audio source URLs.

## Database Schema Changes
The database now contains tables for `users`, `artists`, `albums`, `tracks`, and `likes`.

## API Endpoints Added
- `POST /api/auth/register` -> User sign up
- `POST /api/auth/login` -> User sign in
- `GET /api/auth/me` -> Profile retrieval
- `GET /api/catalog/browse` -> Fetch home feed
- `GET /api/catalog/search?q=` -> Catalog text search
- `POST /api/catalog/artist` -> Create Artist (Admin)
- `POST /api/catalog/album` -> Create Album (Admin)
- `POST /api/catalog/track` -> Create Track (Admin)
- `GET /api/library` -> Get saved tracks
- `POST /api/library/like/:trackId` -> Add track to library
- `DELETE /api/library/like/:trackId` -> Remove track from library

---

## Remaining Tasks for Phase 2
- Playlists creation and modification endpoints.
- User collections, album views, and artist profiles.
- Queue persistence across browser restarts.
