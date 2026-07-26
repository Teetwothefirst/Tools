'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ListMusic, Trash2, Edit2, Play, ChevronRight, Music } from 'lucide-react';
import Link from 'next/link';

export default function PlaylistsPage() {
  const { token } = useAuthStore();
  const { playTrack } = usePlayerStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:4000/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description: desc, coverUrl }),
      });
      return res.json();
    },
    onSuccess: () => {
      setTitle('');
      setDesc('');
      setCoverUrl('');
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`http://localhost:4000/api/playlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
            <p className="text-muted-foreground text-sm">Create, manage, and curate your custom music collections.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Playlist
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-xl p-6 max-w-lg space-y-4">
          <h3 className="font-semibold text-lg">Create Playlist</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome playlist"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description (Optional)</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="A collection of classic soundtracks..."
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cover Art URL (Optional)</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://image-cdn.com/cover.jpg"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => createPlaylistMutation.mutate()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border border-dashed rounded-xl space-y-3">
          <ListMusic className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No playlists created</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Get started by creating your first playlist and adding songs to it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist: any) => (
            <div
              key={playlist.id}
              className="p-4 bg-card border border-border rounded-xl hover:scale-[1.02] transition flex flex-col group relative"
            >
              <Link href={`/playlists/${playlist.id}`} className="absolute inset-0 z-10" />

              {playlist.coverUrl ? (
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full aspect-square rounded-lg object-cover mb-3"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-3">
                  <ListMusic className="w-10 h-10 text-muted-foreground" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate text-foreground">{playlist.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{playlist.description || 'No description'}</p>
              </div>

              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition z-20">
                <button
                  onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                  className="p-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
