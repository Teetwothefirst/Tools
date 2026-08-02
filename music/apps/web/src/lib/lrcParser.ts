export interface LyricLine {
  id: number;
  time: number; // In seconds
  text: string;
}

/**
 * Parses timestamped LRC format lyrics string into sorted LyricLine array.
 * Example LRC format:
 * [00:12.34] High above the city lights
 * [00:18.50] We're chasing dreams into the night
 */
export function parseLrc(lrcText?: string | null, totalDurationSeconds: number = 180): LyricLine[] {
  if (!lrcText || !lrcText.trim()) {
    return [];
  }

  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timestampRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  let lineCounter = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Reset regex index
    timestampRegex.lastIndex = 0;
    const matches = Array.from(trimmed.matchAll(timestampRegex));

    if (matches.length > 0) {
      // Extract text content without timestamp tags
      const text = trimmed.replace(timestampRegex, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const milliseconds = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;

        if (text) {
          result.push({
            id: lineCounter++,
            time: timeInSeconds,
            text,
          });
        }
      }
    } else {
      // Handle non-timestamped plain text fallback
      result.push({
        id: lineCounter++,
        time: -1, // Unsynced
        text: trimmed,
      });
    }
  }

  // If unsynced lines exist, distribute evenly across duration
  const hasSyncedLines = result.some((line) => line.time >= 0);
  if (!hasSyncedLines && result.length > 0) {
    const interval = totalDurationSeconds / result.length;
    return result.map((line, idx) => ({
      ...line,
      time: Math.round(idx * interval * 10) / 10,
    }));
  }

  // Sort synced lines chronologically
  return result.sort((a, b) => a.time - b.time);
}

/**
 * Finds current active lyric index for playback time.
 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1;
  let activeIndex = -1;

  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return activeIndex;
}
