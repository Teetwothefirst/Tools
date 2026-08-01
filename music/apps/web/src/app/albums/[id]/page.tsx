"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Heart, Disc, Music, Clock, User } from "lucide-react";
import Link from "next/link";

interface AlbumDetail {
  id: string;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  artist: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  tracks: Array<{
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    playCount: number;
    artist: { id: string; name: string };
  }>;
}

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params.id as string;
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { playTrack, setTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    async function loadAlbum() {
      try {
        const res = await api.get(`/catalog/album/${albumId}`);
        setAlbum(res.data);
      } catch (e) {
        console.error("Failed to load album details", e);
      } finally {
        setLoading(false);
      }
    }
    if (albumId) loadAlbum();
  }, [albumId]);

  const handlePlayAlbum = () => {
    if (album?.tracks && album.tracks.length > 0) {
      playTrack(album.tracks[0] as any, album.tracks as any);
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack(track, album?.tracks as any || [track]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-8 text-center text-secondary">
        <h2 className="text-xl font-bold mb-2">Album Not Found</h2>
        <Link href="/" className="text-accent underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-gradient-to-b from-card/90 to-background p-6 rounded-2xl border border-border/40">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-48 h-48 rounded-xl object-cover shadow-2xl border border-border/50"
          />
        ) : (
          <div className="w-48 h-48 rounded-xl bg-raised flex items-center justify-center text-tertiary shadow-xl">
            <Disc size={64} />
          </div>
        )}

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-accent">Album</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">{album.title}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-secondary">
            <Link
              href={`/artists/${album.artist.id}`}
              className="font-medium text-primary hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <User size={14} /> {album.artist.name}
            </Link>
            <span>•</span>
            <span>{album.releaseDate ? new Date(album.releaseDate).getFullYear() : "Release"}</span>
            <span>•</span>
            <span>{album.tracks.length} track{album.tracks.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-3">
            <button
              onClick={handlePlayAlbum}
              disabled={!album.tracks || album.tracks.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Play size={18} fill="currentColor" /> Play Album
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-3 rounded-full border transition-colors ${
                isSaved
                  ? "bg-accent/20 text-accent border-accent/40"
                  : "bg-raised text-primary border-border hover:bg-card"
              }`}
              title={isSaved ? "Saved to Library" : "Save Album"}
            >
              <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Album Track List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">Track List</h2>
        {album.tracks.length === 0 ? (
          <p className="text-sm text-tertiary">No tracks in this album.</p>
        ) : (
          <div className="divide-y divide-border/30 bg-card/40 rounded-xl border border-border/40 overflow-hidden">
            {album.tracks.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => handlePlayTrack(t)}
                className="flex items-center justify-between p-3.5 hover:bg-raised/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-6 text-center text-xs font-semibold text-tertiary group-hover:hidden">
                    {idx + 1}
                  </span>
                  <Play size={14} className="hidden group-hover:block text-accent" fill="currentColor" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-primary truncate group-hover:text-accent transition-colors">
                      {t.title}
                    </p>
                    <p className="text-xs text-tertiary truncate">{album.artist.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-tertiary">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(t.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
