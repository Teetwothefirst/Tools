# Database Schema & Model Specification

The database is built on PostgreSQL using Prisma ORM.

## Models Overview

- **User**: User account credentials, global role (`USER`, `CONTENT_MANAGER`, `ADMIN`, `SUPER_ADMIN`).
- **AccountSession**: Active session state & refresh token tracking.
- **Profile**: Multi-profile entries tied to a user account (maturity rating, preferences, avatar).
- **ContentItem**: Base entity for Movies and TV Series (title, release year, poster, backdrop, age rating).
- **Movie**: Runtime minutes and media asset link.
- **TVShow**: Season and episode counts.
- **Season**: Season number, title, overview, poster.
- **Episode**: Episode number, title, runtime, intro/outro timestamps, thumbnail, media asset.
- **Genre**: Categorization tags (Action, Drama, Comedy, Sci-Fi, etc.).
- **ContentGenre**: Junction model connecting ContentItem and Genre.
- **MediaAsset**: Transcoding state (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), original file path.
- **VideoVariant**: HLS stream resolution playlist entries (`360p`, `480p`, `720p`, `1080p`).
- **SubtitleTrack**: VTT caption files for multiple languages.
- **AudioTrack**: Dubbed audio options.
- **PlaybackProgress**: User progress position per episode/movie with duration & completion percentage.
- **WatchHistory**: Historical playback log.
- **Watchlist**: My List saved items per profile.
- **ContentRating**: Thumbs up / thumbs down reactions.
- **SubscriptionPlan**: Tier pricing (Basic, Standard, Premium).
- **Subscription**: Current account subscription status (`ACTIVE`, `CANCELLED`, `EXPIRED`).
- **PaymentTransaction**: Billing transaction records.
- **AnalyticsEvent**: Application interaction telemetry.
- **AuditLog**: Admin modification log.
- **ProcessingJob**: Video processing queue status & error tracking.
