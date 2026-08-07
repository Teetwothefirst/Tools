import { Track } from '@music/types';

const OFFLINE_CACHE_NAME = 'music-offline-tracks-v1';
const INDEX_STORAGE_KEY = 'music_offline_track_metadata';

export async function saveTrackOffline(track: Track): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cache = await window.caches.open(OFFLINE_CACHE_NAME);
    const response = await fetch(track.audioUrl);

    if (!response.ok) throw new Error('Audio download failed');

    await cache.put(track.audioUrl, response.clone());

    // Save metadata
    const existing = getStoredTrackMetadata();
    const updated = [track, ...existing.filter((t) => t.id !== track.id)];
    localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(updated));

    return true;
  } catch (err) {
    console.error('Failed to save track offline:', err);
    return false;
  }
}

export async function removeTrackOffline(trackId: string, audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cache = await window.caches.open(OFFLINE_CACHE_NAME);
    await cache.delete(audioUrl);

    const existing = getStoredTrackMetadata();
    const updated = existing.filter((t) => t.id !== trackId);
    localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(updated));

    return true;
  } catch (err) {
    console.error('Failed to remove offline track:', err);
    return false;
  }
}

export function getStoredTrackMetadata(): Track[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(INDEX_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function isTrackCachedOffline(audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await window.caches.open(OFFLINE_CACHE_NAME);
    const match = await cache.match(audioUrl);
    return !!match;
  } catch {
    return false;
  }
}
