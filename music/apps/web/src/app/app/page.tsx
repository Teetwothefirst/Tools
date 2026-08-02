'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, Music, Disc, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function StreamingAppDashboard() {
  const { isAuthenticated, token, user } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const { data: browseData } = useQuery({
    queryKey: ['browse'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:4000/api/catalog/browse');
        if (!res.ok) return { newReleases: [], popularTracks: [], artists: [] };
        return res.json();
      } catch (e) {
        return { newReleases: [], popularTracks: [], artists: [] };
      }
    },
  });

  const { data: continueListening = [] } = useQuery({
    queryKey: ['continue-listening'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:4000/api/history/continue-listening', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        return res.json();
      } catch (e) {
        return [];
      }
    },
    enabled: isAuthenticated && !!token,
  });

  const handlePlayClick = (track: any, queue: any[] = []) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queue.length ? queue : [track]);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const popularTracks = browseData?.popularTracks || [];
  const newReleases = browseData?.newReleases || [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
            {isAuthenticated ? `${greeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋` : 'Music App Streaming Catalog'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAuthenticated ? 'Pick up where you left off, or discover something new.' : 'Explore trending music, albums, and featured artist profiles.'}
          </p>
        </div>
        {!isAuthenticated && (
          <Link
            href="/login"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition hidden sm:block flex-shrink-0"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Continue Listening */}
      {isAuthenticated && continueListening.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Continue Listening</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueListening.map(({ track, progress }: { track: any; progress: number }) => {
              if (!track) return null;
              const active = currentTrack?.id === track.id;
              const playing = active && isPlaying;
              const pct = track.duration > 0 ? Math.min((progress / track.duration) * 100, 100) : 0;

              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/40 transition group"
                >
                  {track.album?.coverUrl ? (
                    <img src={track.album.coverUrl} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-foreground">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                    <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayClick(track, [track])}
                    className="p-2.5 rounded-full bg-primary text-primary-foreground hover:scale-105 transition opacity-90 group-hover:opacity-100 flex-shrink-0"
                  >
                    {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular / Trending Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-extrabold tracking-tight">Trending Tracks</h2>
          </div>
          <Link href="/browse" className="text-xs text-primary font-semibold hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularTracks.map((track: any) => {
            const active = currentTrack?.id === track.id;
            const playing = active && isPlaying;

            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-card border border-border/80 rounded-xl hover:bg-muted/40 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {track.album?.coverUrl ? (
                    <img src={track.album.coverUrl} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePlayClick(track, popularTracks)}
                  className="p-2.5 rounded-full bg-primary text-primary-foreground hover:scale-105 transition flex-shrink-0"
                >
                  {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Albums */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-extrabold tracking-tight">New Releases</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {newReleases.map((album: any) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="p-3 bg-card border border-border/70 rounded-2xl hover:border-primary/40 transition space-y-3 group"
            >
              {album.coverUrl ? (
                <img src={album.coverUrl} className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform" alt="" />
              ) : (
                <div className="w-full aspect-square rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Disc className="w-8 h-8" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-foreground truncate">{album.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{album.artist?.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
