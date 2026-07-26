'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Heart, Disc, Music, Compass } from 'lucide-react';

export default function BrowsePage() {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: browseData, isLoading } = useQuery({
    queryKey: ['browse'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/browse');
      return res.json();
    },
  });

  const { data: likedTracks = [] } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/library', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: isAuthenticated && !!token,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ trackId, isLiked }: { trackId: string; isLiked: boolean }) => {
      const url = `http://localhost:4000/api/library/like/${trackId}`;
      const method = isLiked ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const isLiked = (trackId: string) => likedTracks.some((t: any) => t.id === trackId);

  const handlePlayClick = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, browseData?.popularTracks || []);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse</h1>
          <p className="text-muted-foreground text-sm">Discover trending hits, new albums, and rising artists.</p>
        </div>
      </div>

      {/* Featured Tracks */}
      {browseData?.popularTracks?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Popular Tracks</h2>
          <div className="divide-y divide-border/40 bg-card rounded-xl border border-border overflow-hidden">
            {browseData.popularTracks.map((track: any) => {
              const active = currentTrack?.id === track.id;
              const playing = active && isPlaying;
              const liked = isLiked(track.id);

              return (
                <div key={track.id} className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handlePlayClick(track)}
                      className="w-10 h-10 rounded bg-muted flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition"
                    >
                      {playing ? <Pause className="w-4 h-4 fill-current text-primary" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${active ? 'text-primary' : 'text-foreground'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isAuthenticated && (
                      <button
                        onClick={() => toggleLikeMutation.mutate({ trackId: track.id, isLiked: liked })}
                        className={`p-1 rounded-full transition ${liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100'}`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Releases Grid */}
      {browseData?.newReleases?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">New Album Releases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {browseData.newReleases.map((album: any) => (
              <div key={album.id} className="p-4 rounded-xl bg-card border border-border flex flex-col space-y-3 hover:scale-[1.02] transition">
                {album.coverUrl ? (
                  <img src={album.coverUrl} className="w-full aspect-square rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center"><Disc className="w-8 h-8 text-muted-foreground" /></div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{album.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{album.artist.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
