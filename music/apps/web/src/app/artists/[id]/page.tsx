"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Heart, Disc, UserCheck, UserPlus, Music, Clock } from "lucide-react";
import Link from "next/link";

interface ArtistDetail {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  albums: Array<{
    id: string;
    title: string;
    coverUrl?: string;
    releaseDate?: string;
  }>;
  tracks: Array<{
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    playCount: number;
    album?: { id: string; title: string; coverUrl?: string };
    artist: { id: string; name: string };
  }>;
}

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = params.id as string;
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    async function loadArtist() {
      try {
        const res = await api.get(`/catalog/artist/${artistId}`);
        setArtist(res.data);
      } catch (e) {
        console.error("Failed to load artist details", e);
      } finally {
        setLoading(false);
      }
    }
    if (artistId) loadArtist();
  }, [artistId]);

  const handlePlayAll = () => {
    if (artist?.tracks && artist.tracks.length > 0) {
      playTrack(artist.tracks[0] as any, artist.tracks as any);
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack(track, artist?.tracks as any || [track]);
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

  if (!artist) {
    return (
      <div className="p-8 text-center text-secondary">
        <h2 className="text-xl font-bold mb-2">Artist Not Found</h2>
        <Link href="/" className="text-accent underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-gradient-to-b from-card/80 to-background p-6 rounded-2xl border border-border/40">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-44 h-44 rounded-full object-cover shadow-2xl border-4 border-primary/20"
          />
        ) : (
          <div className="w-44 h-44 rounded-full bg-raised flex items-center justify-center text-tertiary shadow-xl">
            <Music size={56} />
          </div>
        )}

        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-accent">Verified Artist</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">{artist.name}</h1>
          {artist.bio && <p className="text-sm text-secondary max-w-xl line-clamp-3">{artist.bio}</p>}

          <div className="flex items-center justify-center md:justify-start gap-4 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={!artist.tracks || artist.tracks.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Play size={18} fill="currentColor" /> Play Catalog
            </button>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium border transition-colors ${
                isFollowing
                  ? "bg-accent/20 text-accent border-accent/40"
                  : "bg-raised text-primary border-border hover:bg-card"
              }`}
            >
              {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Play size={20} className="text-accent" /> Popular Tracks
        </h2>
        {artist.tracks.length === 0 ? (
          <p className="text-sm text-tertiary">No tracks uploaded yet.</p>
        ) : (
          <div className="divide-y divide-border/30 bg-card/40 rounded-xl border border-border/40 overflow-hidden">
            {artist.tracks.map((t, idx) => (
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
                    {t.album && <p className="text-xs text-tertiary truncate">{t.album.title}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-tertiary">
                  <span>{t.playCount ? `${t.playCount.toLocaleString()} plays` : ""}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(t.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discography / Albums Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Disc size={20} className="text-accent" /> Discography
        </h2>
        {artist.albums.length === 0 ? (
          <p className="text-sm text-tertiary">No albums released yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((alb) => (
              <Link
                key={alb.id}
                href={`/albums/${alb.id}`}
                className="group bg-card p-4 rounded-xl border border-border/40 hover:border-accent/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                {alb.coverUrl ? (
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-full aspect-square object-cover rounded-lg mb-3 shadow-md group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full aspect-square bg-raised rounded-lg mb-3 flex items-center justify-center text-tertiary">
                    <Disc size={40} />
                  </div>
                )}
                <h3 className="font-semibold text-sm text-primary truncate group-hover:text-accent transition-colors">
                  {alb.title}
                </h3>
                <p className="text-xs text-tertiary">
                  {alb.releaseDate ? new Date(alb.releaseDate).getFullYear() : "Album"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
