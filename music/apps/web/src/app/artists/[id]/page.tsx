"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Play, Heart, Disc, UserCheck, UserPlus, Music, Clock, Edit, Save, X, Upload } from "lucide-react";
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
  const { user, token, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { playTrack } = usePlayerStore();

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function loadArtist() {
      try {
        const res = await api.get(`/catalog/artist/${artistId}`);
        setArtist(res.data);
        setEditName(res.data.name || "");
        setEditBio(res.data.bio || "");
        setEditImage(res.data.imageUrl || "");
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
    playTrack(track, (artist?.tracks as any) || [track]);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/storage/upload/image", formData, {
        Authorization: `Bearer ${token}`,
      });
      if (res.data.url) {
        setEditImage(res.data.url);
        setStatusMsg("Image uploaded to Supabase!");
      }
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(
        `/catalog/artist/${artistId}`,
        { name: editName, bio: editBio, imageUrl: editImage },
        { Authorization: `Bearer ${token}` }
      );
      setArtist((prev) => (prev ? { ...prev, name: editName, bio: editBio, imageUrl: editImage } : null));
      setIsEditing(false);
      setStatusMsg("Artist profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to save artist profile", err);
      setStatusMsg("Failed to save updates.");
    } finally {
      setSaving(false);
    }
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
      {statusMsg && (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg("")} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-gradient-to-b from-card/80 to-background p-6 rounded-2xl border border-border/40 relative">
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
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-accent">Verified Artist</span>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30 flex items-center gap-1 transition"
              >
                <Edit className="w-3 h-3" /> Edit Profile
              </button>
            )}
          </div>
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
                  : "border-border text-secondary hover:text-primary hover:border-primary/40"
              }`}
            >
              {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Artist Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Edit className="w-5 h-5 text-accent" /> Edit Artist Profile
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-secondary uppercase">Artist Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary uppercase">Biography</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary uppercase">Profile Photo</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="text-xs text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                  />
                </div>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://... or uploaded image URL"
                  className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popular Tracks Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Music className="w-5 h-5 text-accent" /> Top Tracks
        </h2>
        {artist.tracks && artist.tracks.length > 0 ? (
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40">
            {artist.tracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-6 text-center text-sm font-bold text-tertiary">{idx + 1}</span>
                  {track.album?.coverUrl ? (
                    <img src={track.album.coverUrl} alt={track.title} className="w-11 h-11 rounded-lg object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-raised flex items-center justify-center text-tertiary">
                      <Music size={20} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">{track.title}</p>
                    <p className="text-xs text-secondary truncate">{track.album?.title || "Single"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-tertiary">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-secondary bg-card border border-border rounded-2xl">
            No tracks published yet for this artist.
          </div>
        )}
      </div>

      {/* Discography Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Disc className="w-5 h-5 text-accent" /> Discography
        </h2>
        {artist.albums && artist.albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 hover:border-primary/50 transition group"
              >
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-raised flex items-center justify-center text-tertiary">
                    <Disc size={40} />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-primary truncate">{album.title}</h4>
                  <p className="text-xs text-secondary">Album</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-secondary bg-card border border-border rounded-2xl">
            No albums created for this artist yet.
          </div>
        )}
      </div>
    </div>
  );
}
