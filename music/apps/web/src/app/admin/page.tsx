'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, Music, User, Library, FileAudio, Image as ImageIcon } from 'lucide-react';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAudioUrl = searchParams.get('audioUrl') || '';
  const { user, token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
  const [trackAudio, setTrackAudio] = useState(initialAudioUrl);
  const [trackDuration, setTrackDuration] = useState('180');
  const [trackArtistId, setTrackArtistId] = useState('');
  const [trackAlbumId, setTrackAlbumId] = useState('');

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState('');

  // Query Artists and Albums to feed select fields
  const { data: browseData } = useQuery({
    queryKey: ['browse'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/catalog/browse');
      return res.json();
    },
  });

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:4000/api/storage/upload/audio', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setTrackAudio(data.url);
        if (!trackTitle) setTrackTitle(file.name.replace(/\.[^/.]+$/, ""));
        setNotification('Audio uploaded to Supabase Storage!');
      }
    } catch (err) {
      console.error('Audio upload error', err);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:4000/api/storage/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        targetSetter(data.url);
        setNotification('Cover image uploaded to Supabase Storage!');
      }
    } catch (err) {
      console.error('Image upload error', err);
    } finally {
      setUploadingImage(false);
    }
  };

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
    onSuccess: (data: any) => {
      setNotification(`Track "${data.title || 'song'}" added successfully! It is now live on Home, Search, and Browse.`);
      setTrackTitle('');
      setTrackAudio('');
      setTrackDuration('180');
      setTrackArtistId('');
      setTrackAlbumId('');
      queryClient.invalidateQueries();
    },
  });

  if (!mounted) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading Admin Studio...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-card border border-border rounded-2xl text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Admin Studio Access Required</h2>
        <p className="text-sm text-muted-foreground">
          You must be signed in with an Administrator account (`role: ADMIN`) to access music uploads and catalog control.
        </p>
        <div className="p-3 bg-muted/40 rounded-lg text-xs text-left space-y-1 border border-border">
          <p className="font-semibold text-foreground">Seed Admin Credentials:</p>
          <p>Email: <code className="text-primary font-mono font-bold">admin@music.com</code></p>
          <p>Password: <code className="text-primary font-mono font-bold">password123</code></p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition shadow-md"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Catalog & Supabase Uploads</h1>
          <p className="text-muted-foreground text-sm">Upload music tracks, cover images, and set up catalog records.</p>
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
              <label className="text-xs text-muted-foreground">Artist Photo (File or URL)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileUpload(e, setArtistImg)}
                className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90"
              />
              <input
                type="text"
                value={artistImg}
                onChange={(e) => setArtistImg(e.target.value)}
                placeholder="https://... or uploaded image URL"
                className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none"
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
              <label className="text-xs text-muted-foreground">Cover Art (File Upload or URL)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileUpload(e, setAlbumCover)}
                className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90"
              />
              <input
                type="text"
                value={albumCover}
                onChange={(e) => setAlbumCover(e.target.value)}
                placeholder="https://... or uploaded cover URL"
                className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none"
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

        {/* Form 3: Create Track */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
            <Music className="w-4 h-4 text-primary" /> Create Track
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
              <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1 text-primary">
                <FileAudio className="w-3.5 h-3.5" /> Upload Audio File (.mp3, .wav)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="w-full mt-1 text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90"
              />
              {uploadingAudio && <p className="text-xs text-primary animate-pulse mt-1">Uploading audio file to Supabase Storage...</p>}
              <input
                type="text"
                value={trackAudio}
                onChange={(e) => setTrackAudio(e.target.value)}
                placeholder="Audio URL (auto-filled on file upload)"
                className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none"
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
              onClick={() => {
                if (!trackTitle.trim()) {
                  setNotification('Please enter a track title.');
                  return;
                }
                if (!trackAudio.trim()) {
                  setNotification('Please upload an audio file or enter an Audio URL first.');
                  return;
                }
                if (!trackArtistId) {
                  setNotification('Please select an Artist for this track (or create an Artist first).');
                  return;
                }
                createTrackMutation.mutate();
              }}
              disabled={createTrackMutation.isPending}
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {createTrackMutation.isPending ? 'Saving Track...' : 'Save Track'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading Admin Studio...</div>}>
      <AdminContent />
    </Suspense>
  );
}
