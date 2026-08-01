'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, Music, Disc, RotateCcw, Sparkles, ListMusic } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
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

  const { data: recentTracks = [] } = useQuery({
    queryKey: ['recently-played'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:4000/api/history/recently-played', {
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
            {isAuthenticated ? `${greeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋` : 'Welcome to MusicPlatform'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAuthenticated ? 'Pick up where you left off, or discover something new.' : 'Sign in to unlock your personal library.'}
          </p>
        </div>
        {!isAuthenticated && (
          <Link
            href="/login"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition hidden sm:block flex-shrink-0"
          >
            Get Started
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
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? 'text-primary' : 'text-foreground'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                    {/* Progress bar */}
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayClick(track)}
                    className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition flex-shrink-0"
                  >
                    {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {isAuthenticated && recentTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Recently Played</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {recentTracks.slice(0, 6).map((track: any) => {
              if (!track) return null;
              const active = currentTrack?.id === track.id;
              const playing = active && isPlaying;
              return (
                <button
                  key={track.id}
                  onClick={() => handlePlayClick(track, recentTracks)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:scale-[1.03] transition group text-left"
                >
                  {track.album?.coverUrl ? (
                    <img src={track.album.coverUrl} className="w-full aspect-square rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <Music className={`w-6 h-6 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  )}
                  <p className={`text-xs font-medium text-center truncate w-full ${active ? 'text-primary' : 'text-foreground'}`}>
                    {track.title}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular Tracks */}
      {popularTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Popular Tracks</h2>
          </div>
          <div className="divide-y divide-border/40 bg-card rounded-xl border border-border overflow-hidden">
            {popularTracks.slice(0, 8).map((track: any, i: number) => {
              const active = currentTrack?.id === track.id;
              const playing = active && isPlaying;
              return (
                <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-muted/40 transition group">
                  <span className="text-xs text-muted-foreground w-5 text-center group-hover:hidden">{i + 1}</span>
                  <button
                    onClick={() => handlePlayClick(track, popularTracks)}
                    className="w-9 h-9 rounded bg-muted flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition flex-shrink-0"
                  >
                    {playing ? <Pause className="w-4 h-4 fill-current text-primary" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${active ? 'text-primary' : 'text-foreground'}`}>{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newReleases.map((album: any) => (
              <Link key={album.id} href={`/albums/${album.id}`} className="p-3 rounded-xl bg-card border border-border hover:scale-[1.02] transition flex flex-col gap-2 group">
                {album.coverUrl ? (
                  <img src={album.coverUrl} className="w-full aspect-square rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <Disc className="w-7 h-7 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">{album.title}</p>
                  {album.artist && (
                    <span className="text-xs text-muted-foreground hover:underline truncate block">
                      {album.artist.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state for first-time users */}
      {!isAuthenticated && popularTracks.length === 0 && newReleases.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Start Exploring Music</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Browse our growing catalog, search for your favorite artists, and build your personal library.
          </p>
          <Link
            href="/browse"
            className="inline-block mt-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition"
          >
            Explore Music
          </Link>
        </div>
      )}
    </div>
  );
}
