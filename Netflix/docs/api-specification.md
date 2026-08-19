# StreamFlix API Specification (v1)

Base URL: `/api/v1`

## Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register a new account
- `POST /auth/login` — Authenticate and receive JWT session cookies
- `POST /auth/logout` — Revoke active session
- `POST /auth/refresh` — Refresh access token using HTTP-only cookie
- `GET /auth/me` — Return authenticated user & account session status

## Profiles (`/api/v1/profiles`)
- `GET /profiles` — List profiles for logged-in user
- `POST /profiles` — Create new profile
- `GET /profiles/:id` — Get profile preferences
- `PATCH /profiles/:id` — Update profile settings & maturity filters
- `DELETE /profiles/:id` — Remove profile

## Content Catalog (`/api/v1/catalog`)
- `GET /catalog/hero` — Fetch featured hero media banner item
- `GET /catalog/rows` — Fetch categorized content rows (Trending, Popular, New Releases)
- `GET /catalog/movies` — List movies with pagination & genre filter
- `GET /catalog/shows` — List TV series
- `GET /catalog/shows/:id` — Get TV show details with season & episode list
- `GET /catalog/items/:id` — Get content item detailed metadata & recommendations

## Search (`/api/v1/search`)
- `GET /search?q=:query&genre=:genre` — Debounced full-text search across titles, actors, genres

## Playback & Watchlist (`/api/v1/playback`)
- `GET /playback/progress/:contentId` — Fetch saved playback progress for active profile
- `POST /playback/progress` — Save/sync playback timestamp & duration
- `GET /playback/continue-watching` — Fetch continue watching list
- `GET /watchlist` — List My List items
- `POST /watchlist/toggle` — Add/remove item from My List

## Admin & Media Transcoding (`/api/v1/admin`)
- `POST /admin/media/upload` — Upload raw video asset for transcoding
- `GET /admin/media/jobs` — List transcoding queue status
- `POST /admin/media/jobs/:id/retry` — Retry failed video transcode job
- `POST /admin/content` — Create or update Movie/Show metadata
- `GET /admin/analytics` — Platform analytics & metrics
