# ADR 0002: HLS Adaptive Bitrate Streaming

## Status
Accepted

## Context
Raw MP4 video delivery suffers from high latency, lack of resolution adaptation during network changes, and security risks. Production video platforms require adaptive streaming.

## Decision
We use HTTP Live Streaming (HLS) with FFmpeg video transcoding into chunked MPEG-TS segments and multi-resolution playlists (`360p`, `480p`, `720p`, `1080p`) tied together with a master `.m3u8` manifest.

## Consequences
- Dynamic video quality scaling according to client bandwidth.
- Efficient CDN caching of small `.ts` video chunks.
- Seamless seeking and fast startup time.
