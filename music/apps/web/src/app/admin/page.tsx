'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, Music, User, Library } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Redirect if not Admin
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Create Artist Form State
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistImg, setArtistImg] = useState('');

  // Create Album Form State
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumArtistId, setAlbumArtistId] = useState('');

  // Create Track Form State
  const [trackTitle, setTrackTitle] = useState('');
  const [trackAudio, setTrackAudio] = useState('');
  const [trackDuration, setTrackDuration] = useState('180');
  const [trackArtistId, setTrackArtistId] = useState('');
  const [trackAlbumId, setTrackAlbumId] = useState('');

  const [notification, setNotification] = useState('');

  // Query Artists and Albums to feed select fields
  const { data: browseData } = useQuery({
    queryKey: ['browse'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/browse');
      return res.json();
    },
  });

  const createArtistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: artistName, bio: artistBio, imageUrl: artistImg }),
      });
      return res.json();
    },
    onSuccess: () => {
      setNotification('Artist added successfully!');
      setArtistName('');
      setArtistBio('');
      setArtistImg('');
      queryClient.invalidateQueries({ queryKey: ['browse'] });
    },
  });

  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/album', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: albumTitle, coverUrl: albumCover, artistId: albumArtistId }),
      });
      return res.json();
    },
    onSuccess: () => {
      setNotification('Album added successfully!');
      setAlbumTitle('');
      setAlbumCover('');
      setAlbumArtistId('');
      queryClient.invalidateQueries({ queryKey: ['browse'] });
    },
  });

  const createTrackMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trackTitle,
          audioUrl: trackAudio,
          duration: parseInt(trackDuration) || 180,
          artistId: trackArtistId,
          albumId: trackAlbumId || undefined,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      setNotification('Track added successfully!');
      setTrackTitle('');
      setTrackAudio('');
      setTrackDuration('180');
      setTrackArtistId('');
      setTrackAlbumId('');
      queryClient.invalidateQueries({ queryKey: ['browse'] });
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Catalog Control</h1>
          <p className="text-muted-foreground text-sm">Upload music tracks, create album records, and add artists metadata.</p>
        </div>
      </div>

      {notification && (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form 1: Create Artist */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
            <User className="w-4 h-4 text-primary" /> Create Artist
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Artist Name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. Daft Punk"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bio Description</label>
              <textarea
                value={artistBio}
                onChange={(e) => setArtistBio(e.target.value)}
                placeholder="Artist summary info..."
                rows={3}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Image URL</label>
              <input
                type="text"
                value={artistImg}
                onChange={(e) => setArtistImg(e.target.value)}
                placeholder="https://image-cdn.com/artist.jpg"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => createArtistMutation.mutate()}
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Artist
            </button>
          </div>
        </div>

        {/* Form 2: Create Album */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
            <Library className="w-4 h-4 text-primary" /> Create Album
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Album Title</label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Discovery"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cover Art URL</label>
              <input
                type="text"
                value={albumCover}
                onChange={(e) => setAlbumCover(e.target.value)}
                placeholder="https://image-cdn.com/album.jpg"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Artist Link</label>
              <select
                value={albumArtistId}
                onChange={(e) => setAlbumArtistId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="">Select Artist</option>
                {browseData?.artists?.map((artist: any) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => createAlbumMutation.mutate()}
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Album
            </button>
          </div>
        </div>

        {/* Form 3: Upload Track */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
            <Music className="w-4 h-4 text-primary" /> Upload/Create Track
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Track Title</label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="e.g. One More Time"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Audio URL (CDN/Direct File)</label>
              <input
                type="text"
                value={trackAudio}
                onChange={(e) => setTrackAudio(e.target.value)}
                placeholder="https://audio-cdn.com/track.mp3"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Duration (Secs)</label>
                <input
                  type="number"
                  value={trackDuration}
                  onChange={(e) => setTrackDuration(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Artist Link</label>
                <select
                  value={trackArtistId}
                  onChange={(e) => setTrackArtistId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Select Artist</option>
                  {browseData?.artists?.map((artist: any) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Album Link (Optional)</label>
              <select
                value={trackAlbumId}
                onChange={(e) => setTrackAlbumId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="">No Album</option>
                {browseData?.newReleases?.map((album: any) => (
                  <option key={album.id} value={album.id}>{album.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => createTrackMutation.mutate()}
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
