'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Sparkles, Play, Pause, Music, Disc, Compass, Layers, Coffee, Zap, Mic, Radio, Flame, Brain, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface GenreCategory {
  name: string;
  color: string;
  icon: string;
  description: string;
  trackCount: number;
}

export default function GenreDiscoveryPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const moods = ['All', 'Chill', 'Focus', 'Workout', 'Party', 'Sleep'];

  // Fetch all genres
  const { data: genres = [], isLoading: loadingGenres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/catalog/genres');
      return res.data as GenreCategory[];
    },
  });

  // Fetch tracks for selected genre
  const { data: genreDetail, isLoading: loadingGenreDetail } = useQuery({
    queryKey: ['genre-detail', selectedGenre],
    queryFn: async () => {
      if (!selectedGenre) return null;
      const res = await api.get(`/catalog/genre/${encodeURIComponent(selectedGenre)}`);
      return res.data;
    },
    enabled: !!selectedGenre,
  });

  const getGenreIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-7 h-7" />;
      case 'Coffee': return <Coffee className="w-7 h-7" />;
      case 'Zap': return <Zap className="w-7 h-7" />;
      case 'Mic': return <Mic className="w-7 h-7" />;
      case 'Radio': return <Radio className="w-7 h-7" />;
      case 'Flame': return <Flame className="w-7 h-7" />;
      case 'Brain': return <Brain className="w-7 h-7" />;
      default: return <Music className="w-7 h-7" />;
    }
  };

  const handlePlayTrack = (track: any, queue: any[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredTracks = genreDetail?.tracks?.filter((t: any) => {
    if (selectedMood === 'All') return true;
    return t.mood?.toLowerCase() === selectedMood.toLowerCase() || t.title?.toLowerCase().includes(selectedMood.toLowerCase());
  }) || [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <Compass className="w-4 h-4" /> Discovery Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Explore Genres & Moods
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover music tailored to your vibe, activity, and favorite sounds.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <Link
            href="/browse"
            className="px-4 py-2 bg-card border border-border text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground transition"
          >
            All Catalog
          </Link>
          <Link
            href="/browse/genres"
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm"
          >
            Genre Hub
          </Link>
        </div>
      </div>

      {/* Mood Filters Pill Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by Mood</label>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedMood === m
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {m === 'All' ? '✨ All Moods' : `# ${m}`}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Genre Detail View */}
      {selectedGenre ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setSelectedGenre(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Genres
          </button>

          <div className="p-8 rounded-3xl bg-gradient-to-r from-card via-background to-primary/10 border border-primary/20 space-y-3">
            <h2 className="text-3xl font-black text-foreground">{selectedGenre} Collection</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Showing top tracks and releases curated for {selectedGenre}.
            </p>
          </div>

          {/* Genre Track Results */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-foreground">Top Tracks</h3>
            {loadingGenreDetail ? (
              <div className="p-12 text-center text-muted-foreground">Loading tracks...</div>
            ) : filteredTracks.length > 0 ? (
              <div className="bg-card border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/40 shadow-lg">
                {filteredTracks.map((track: any, idx: number) => {
                  const active = currentTrack?.id === track.id;
                  const playing = active && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(track, filteredTracks)}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-6 text-center text-sm font-bold text-muted-foreground">{idx + 1}</span>
                        {track.album?.coverUrl ? (
                          <img src={track.album.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Music className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist?.name || 'Artist'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="hidden sm:inline px-3 py-1 bg-muted/60 rounded-full font-medium">
                          {track.genre || selectedGenre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {formatDuration(track.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayTrack(track, filteredTracks);
                          }}
                          className="p-2.5 rounded-full bg-primary text-primary-foreground hover:scale-105 transition"
                        >
                          {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
                No tracks found matching mood "{selectedMood}" under {selectedGenre}.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Genre Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {genres.map((genre) => (
            <div
              key={genre.name}
              onClick={() => setSelectedGenre(genre.name)}
              className={`p-6 rounded-3xl bg-gradient-to-br ${genre.color} text-white cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-56`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                  {getGenreIcon(genre.icon)}
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">
                  {genre.trackCount} Tracks
                </span>
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="text-2xl font-black tracking-tight">{genre.name}</h3>
                <p className="text-xs opacity-85 line-clamp-2 leading-relaxed">{genre.description}</p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Genre <Play className="w-3 h-3 fill-current ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
