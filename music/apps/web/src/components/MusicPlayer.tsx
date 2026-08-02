'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAudio } from '@/providers/audio-provider';
import { FullscreenPlayerModal } from '@/components/FullscreenPlayerModal';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Maximize2, AlignLeft } from 'lucide-react';

export function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, volume, setVolume } = usePlayerStore();
  const { duration, currentTime, seek } = useAudio();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 h-20 bg-card/95 backdrop-blur-md border-t border-border px-3 sm:px-6 flex items-center justify-between z-30 gap-3">
        {/* Left: Track Details & Expand Trigger */}
        <div
          onClick={() => setIsFullscreenOpen(true)}
          className="flex items-center gap-3 w-auto sm:w-1/4 min-w-0 flex-shrink-0 max-w-[200px] sm:max-w-none cursor-pointer group"
        >
          {currentTrack.album?.coverUrl ? (
            <img
              src={currentTrack.album.coverUrl}
              alt={currentTrack.title}
              className="w-11 h-11 rounded-md object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-11 h-11 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 hidden sm:block">
            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
              {currentTrack.title} <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist?.name}</p>
          </div>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-xl min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={prevTrack}
              className="p-1.5 hover:text-foreground text-muted-foreground transition"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 sm:p-2.5 bg-primary text-primary-foreground rounded-full hover:scale-105 transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              className="p-1.5 hover:text-foreground text-muted-foreground transition"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1 group">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek"
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Synced Lyrics Trigger */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/4">
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition flex items-center gap-1"
            title="Open Synced Lyrics & Fullscreen Player"
          >
            <AlignLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Lyrics</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="Toggle mute"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Player & Synced Lyrics Modal */}
      <FullscreenPlayerModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
      />
    </>
  );
}
