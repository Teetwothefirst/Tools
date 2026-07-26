'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Trash2, ArrowUp, ArrowDown, ListMusic, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlaylistDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const queryClient = useQueryClient();

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', params.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/playlists/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:4000/api/playlists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
      return res.json();
    },
    onSuccess: () => {
      setShowEdit(false);
      queryClient.invalidateQueries({ queryKey: ['playlist', params.id] });
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await fetch(`http://localhost:4000/api/playlists/${params.id}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', params.id] });
    },
  });

  const reorderTracksMutation = useMutation({
    mutationFn: async (trackIds: string[]) => {
      await fetch(`http://localhost:4000/api/playlists/${params.id}/tracks/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackIds }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', params.id] });
    },
  });

  const handlePlayClick = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, playlist?.tracks || []);
    }
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    if (!playlist?.tracks) return;
    const tracks = [...playlist.tracks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    // Swap elements
    const temp = tracks[index];
    tracks[index] = tracks[targetIndex];
    tracks[targetIndex] = temp;

    reorderTracksMutation.mutate(tracks.map((t: any) => t.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!playlist) return <div className="p-8 text-center">Playlist not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border">
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} className="w-48 h-48 rounded-xl object-cover shadow-2xl" alt="" />
        ) : (
          <div className="w-48 h-48 rounded-xl bg-card border border-border flex items-center justify-center shadow-xl">
            <ListMusic className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Playlist Collection</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight truncate text-foreground">{playlist.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{playlist.description || 'No description'}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => {
                setEditTitle(playlist.title);
                setEditDesc(playlist.description || '');
                setShowEdit(true);
              }}
              className="px-4 py-1.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-xs font-semibold transition"
            >
              Edit Metadata
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="bg-card border border-border rounded-xl p-6 max-w-lg space-y-4">
          <h3 className="font-semibold text-lg">Edit Playlist</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowEdit(false)} className="px-3 py-1.5 bg-muted text-sm rounded-lg">Cancel</button>
              <button onClick={() => updatePlaylistMutation.mutate()} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tracklist table */}
      {playlist.tracks?.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 border border-border border-dashed rounded-xl">
          <Music className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <h4 className="font-medium text-sm">No tracks in playlist</h4>
          <p className="text-xs text-muted-foreground mt-1">Use Search to find songs and add them here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40 bg-card rounded-xl border border-border overflow-hidden">
          {playlist.tracks.map((track: any, index: number) => {
            const active = currentTrack?.id === track.id;
            const playing = active && isPlaying;

            return (
              <div key={track.id} className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground w-4 text-center group-hover:hidden">{index + 1}</span>
                  <button
                    onClick={() => handlePlayClick(track)}
                    className="w-10 h-10 rounded bg-muted flex items-center justify-center group-hover:flex transition"
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

                <div className="flex items-center gap-2">
                  {/* Up / Down Reorder */}
                  <button
                    onClick={() => moveTrack(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition opacity-0 group-hover:opacity-100"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveTrack(index, 'down')}
                    disabled={index === playlist.tracks.length - 1}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition opacity-0 group-hover:opacity-100"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeTrackMutation.mutate(track.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
