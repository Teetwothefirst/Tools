'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Play, Pause, Heart, Disc, Music } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return { tracks: [], albums: [], artists: [] };
      const res = await fetch(`http://localhost:4000/api/catalog/search?q=${encodeURIComponent(searchTerm)}`);
      return res.json();
    },
    enabled: searchTerm.length > 0,
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
      playTrack(track, searchResults?.tracks || []);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground text-sm">Find tracks, albums, and artists in the catalog.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {searchResults && searchTerm && (
        <div className="space-y-8">
          {/* Tracks Section */}
          {searchResults.tracks?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Songs</h2>
              <div className="divide-y divide-border/40 bg-card rounded-xl border border-border overflow-hidden">
                {searchResults.tracks.map((track: any) => {
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
                        {/* Add to Playlist selector */}
                        {isAuthenticated && (
                          <select
                            onChange={async (e) => {
                              const playlistId = e.target.value;
                              if (!playlistId) return;
                              await fetch(`http://localhost:4000/api/playlists/${playlistId}/tracks`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ trackId: track.id }),
                              });
                              e.target.value = ''; // Reset select
                            }}
                            className="bg-card text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 max-w-[120px] focus:outline-none"
                          >
                            <option value="">+ Add to...</option>
                            {queryClient.getQueryData<any[]>(['playlists'])?.map((pl) => (
                              <option key={pl.id} value={pl.id}>{pl.title}</option>
                            ))}
                          </select>
                        )}

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

          {/* Albums & Artists Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {searchResults.albums?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Albums</h2>
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.albums.map((album: any) => (
                    <div key={album.id} className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                      {album.coverUrl ? (
                        <img src={album.coverUrl} className="w-12 h-12 rounded object-cover" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><Disc className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{album.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{album.artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.artists?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Artists</h2>
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.artists.map((artist: any) => (
                    <div key={artist.id} className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Music className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">{artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {searchTerm && searchResults?.tracks?.length === 0 && searchResults?.albums?.length === 0 && searchResults?.artists?.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-base font-semibold">No results found</p>
          <p className="text-muted-foreground text-sm">Make sure you spelled everything correctly or try another term.</p>
        </div>
      )}
    </div>
  );
}
