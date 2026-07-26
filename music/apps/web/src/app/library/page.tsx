'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Heart, Disc, Music, Trash2, ListMusic, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'tracks' | 'albums' | 'artists';

export default function LibraryPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<Tab>('tracks');

  React.useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: likedTracks = [], isLoading: loadingTracks } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/library', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: isAuthenticated && !!token,
  });

  const { data: favoriteAlbums = [], isLoading: loadingAlbums } = useQuery({
    queryKey: ['library-albums'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/library/albums', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: isAuthenticated && !!token,
  });

  const { data: favoriteArtists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ['library-artists'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/library/artists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: isAuthenticated && !!token,
  });

  const unlikeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await fetch(`http://localhost:4000/api/library/like/${trackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const unfavoriteAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      await fetch(`http://localhost:4000/api/library/albums/${albumId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-albums'] }),
  });

  const unfavoriteArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      await fetch(`http://localhost:4000/api/library/artists/${artistId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-artists'] }),
  });

  const handlePlayClick = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, likedTracks);
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'tracks', label: 'Liked Songs', count: likedTracks.length },
    { key: 'albums', label: 'Albums', count: favoriteAlbums.length },
    { key: 'artists', label: 'Artists', count: favoriteArtists.length },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="text-muted-foreground text-sm">Your saved music, albums, and followed artists.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab: Liked Tracks */}
      {activeTab === 'tracks' && (
        loadingTracks ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : likedTracks.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-xl">
            <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">No liked songs yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse and search for songs to add them to your library.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 bg-card rounded-xl border border-border overflow-hidden">
            {likedTracks.map((track: any) => {
              const active = currentTrack?.id === track.id;
              const playing = active && isPlaying;
              return (
                <div key={track.id} className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handlePlayClick(track)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition flex-shrink-0"
                    >
                      {playing ? <Pause className="w-4 h-4 fill-current text-primary" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${active ? 'text-primary' : 'text-foreground'}`}>{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => unlikeMutation.mutate(track.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Tab: Favorite Albums */}
      {activeTab === 'albums' && (
        loadingAlbums ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : favoriteAlbums.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-xl">
            <Disc className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">No saved albums yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse music to find albums worth saving.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteAlbums.map((album: any) => (
              <div key={album.id} className="p-4 bg-card border border-border rounded-xl flex flex-col gap-3 group hover:scale-[1.02] transition relative">
                {album.coverUrl ? (
                  <img src={album.coverUrl} className="w-full aspect-square rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <Disc className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{album.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{album.artist?.name}</p>
                </div>
                <button
                  onClick={() => unfavoriteAlbumMutation.mutate(album.id)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: Favorite Artists */}
      {activeTab === 'artists' && (
        loadingArtists ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : favoriteArtists.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-xl">
            <User2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">No followed artists yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse and search artists to follow them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteArtists.map((artist: any) => (
              <div key={artist.id} className="p-4 bg-card border border-border rounded-xl flex flex-col items-center gap-3 group hover:scale-[1.02] transition relative">
                {artist.imageUrl ? (
                  <img src={artist.imageUrl} className="w-20 h-20 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm font-semibold text-foreground text-center truncate w-full">{artist.name}</p>
                <button
                  onClick={() => unfavoriteArtistMutation.mutate(artist.id)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
