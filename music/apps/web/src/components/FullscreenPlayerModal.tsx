'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAudio } from '@/providers/audio-provider';
import { parseLrc, getActiveLyricIndex, LyricLine } from '@/lib/lrcParser';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, X, Maximize2, ListMusic, AlignLeft, Sparkles, Shuffle, Repeat, Video } from 'lucide-react';

interface FullscreenPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenPlayerModal({ isOpen, onClose }: FullscreenPlayerModalProps) {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, volume, setVolume, queue, queueIndex, playTrack, isVideoMode, toggleVideoMode } = usePlayerStore();
  const { duration, currentTime, seek } = useAudio();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const lyricsRef = useRef<HTMLDivElement>(null);
  const lyricLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  if (!isOpen || !currentTrack) return null;

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const id = match ? match[1] : url;
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0`;
    }
    return url;
  };

  const videoEmbedUrl = currentTrack.videoUrl ? getVideoEmbedUrl(currentTrack.videoUrl) : null;

  // Sample default timestamped lyrics if track lyrics field is empty for demonstration
  const defaultSampleLrc = `
[00:02.00] ✨ ${currentTrack.title}
[00:06.00] Performed by ${currentTrack.artist?.name || 'Artist'}
[00:12.00] High above the city lights
[00:18.50] We're chasing dreams into the night
[00:25.10] Sound waves echoing through the air
[00:31.80] Feel the rhythm everywhere
[00:38.20] Lost inside the melody
[00:44.90] This is where we're meant to be
[00:51.50] Turn the volume up real high
[00:58.00] Stars are dancing in the sky
  `.trim();

  const rawLyrics = currentTrack.lyrics || defaultSampleLrc;
  const parsedLyrics: LyricLine[] = parseLrc(rawLyrics, duration || 180);
  const activeLyricIdx = getActiveLyricIndex(parsedLyrics, currentTime);

  // Auto-scroll lyrics container to keep active lyric line centered
  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricIdx !== -1 && lyricLineRefs.current[activeLyricIdx]) {
      lyricLineRefs.current[activeLyricIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIdx, activeTab]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300 overflow-hidden text-foreground">
      {/* Background Ambient Blur Backdrop */}
      {currentTrack.album?.coverUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 pointer-events-none scale-125"
          style={{ backgroundImage: `url(${currentTrack.album.coverUrl})` }}
        />
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'lyrics' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" /> Synced Lyrics
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" /> Queue ({queue.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentTrack.videoUrl && (
            <button
              onClick={toggleVideoMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isVideoMode ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {isVideoMode ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              {isVideoMode ? 'Music Video Mode' : 'Audio Mode'}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 my-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden z-10">
        {/* Left Column: Media Player (Video Player OR Large Album Art) */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {isVideoMode && videoEmbedUrl ? (
            <div className="w-full max-w-md h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/30 bg-black">
              {videoEmbedUrl.includes('youtube.com') ? (
                <iframe
                  src={videoEmbedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoEmbedUrl} controls autoPlay className="w-full h-full object-cover" />
              )}
            </div>
          ) : currentTrack.album?.coverUrl ? (
            <img
              src={currentTrack.album.coverUrl}
              alt={currentTrack.title}
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border-4 border-primary/20 hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-muted/60 flex items-center justify-center shadow-2xl border-4 border-border">
              <Music className="w-24 h-24 text-muted-foreground/60" />
            </div>
          )}

          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{currentTrack.title}</h2>
            <p className="text-base text-primary font-semibold">{currentTrack.artist?.name || 'Unknown Artist'}</p>
            {currentTrack.album?.title && <p className="text-xs text-muted-foreground">{currentTrack.album.title}</p>}
          </div>
        </div>

        {/* Right Column: Synced Lyrics or Queue Inspector */}
        <div className="h-[340px] sm:h-[420px] bg-card/60 border border-border/60 rounded-3xl p-6 overflow-hidden relative shadow-2xl flex flex-col">
          {activeTab === 'lyrics' ? (
            <div ref={lyricsRef} className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-2 py-8">
              {parsedLyrics.length > 0 ? (
                parsedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIdx;
                  return (
                    <p
                      key={line.id}
                      ref={(el) => {
                        lyricLineRefs.current[idx] = el;
                      }}
                      onClick={() => {
                        if (line.time >= 0) seek(line.time);
                      }}
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'text-2xl sm:text-3xl font-black text-primary scale-105 drop-shadow-md translate-x-2'
                          : 'text-base sm:text-lg font-medium text-muted-foreground/70 hover:text-foreground hover:scale-102'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  <p className="font-semibold text-sm">No lyrics attached to this track.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Up Next in Queue</h4>
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                      isCurrent ? 'bg-primary/15 border border-primary/30 text-primary font-bold' : 'hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold w-5 text-center text-muted-foreground">{idx + 1}</span>
                      {track.album?.coverUrl ? (
                        <img src={track.album.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Music className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm truncate font-semibold">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
                      </div>
                    </div>
                    {isCurrent && <Sparkles className="w-4 h-4 text-primary animate-spin" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-4xl mx-auto space-y-4 z-10 pt-2 border-t border-border/40">
        {/* Progress Slider */}
        <div className="space-y-1">
          <div className="relative flex items-center h-3 group cursor-pointer">
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-xl transition ${isShuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-xl transition ${isRepeat ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={prevTrack} className="p-2 hover:text-primary transition" title="Previous Track">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="p-4 bg-primary text-primary-foreground rounded-full hover:scale-105 transition shadow-lg shadow-primary/20"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-2 hover:text-primary transition" title="Next Track">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-32">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)} className="text-muted-foreground hover:text-foreground">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-muted rounded-full accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
