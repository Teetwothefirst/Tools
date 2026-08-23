'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  SkipForward,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface HlsPlayerProps {
  streamUrl: string;
  title: string;
  subtitle?: string;
  contentId: string;
  episodeId?: string;
  profileId?: string;
  introStartSec?: number;
  introEndSec?: number;
  onNextEpisode?: () => void;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  streamUrl,
  title,
  subtitle,
  contentId,
  episodeId,
  profileId = 'demo-profile-1',
  introStartSec = 15,
  introEndSec = 75,
  onNextEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState<{ id: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to safely invoke play() and catch AbortError / NotAllowedError
  const safePlay = (video: HTMLVideoElement) => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          setIsPlaying(false);
          // Suppress AbortError & NotAllowedError (autoplay browser restrictions)
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.warn('Playback notice:', error.message);
          }
        });
    }
  };

  // Initialize HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, idx) => ({
          id: idx,
          label: `${level.height}p`,
        }));
        setQualities([{ id: -1, label: 'Auto' }, ...levels]);
        safePlay(video);
      });

      setHlsInstance(hls);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      safePlay(video);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  // Video Progress & Throttled Sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Sync progress to backend every 10 seconds
    const syncInterval = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        apiClient
          .post('/playback/progress', {
            profileId,
            contentId,
            episodeId,
            progressSeconds: video.currentTime,
            durationSeconds: video.duration,
          })
          .catch(() => {});
      }
    }, 10000);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      clearInterval(syncInterval);
    };
  }, [contentId, episodeId, profileId]);

  // Controls Visibility Timeout
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'ArrowRight') {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      } else if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      safePlay(video);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (qualityId: number) => {
    if (hlsInstance) {
      hlsInstance.currentLevel = qualityId;
      setCurrentQuality(qualityId);
      setIsSettingsOpen(false);
    }
  };

  const skipIntro = () => {
    const video = videoRef.current;
    if (video && introEndSec) {
      video.currentTime = introEndSec;
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isIntroActive = currentTime >= introStartSec && currentTime <= introEndSec;

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-black overflow-hidden select-none flex items-center justify-center cursor-default"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header Overlay (Back Button + Titles) */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:text-netflix-red transition-transform hover:scale-110"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-gray-400 font-medium">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Skip Intro Button */}
      {isIntroActive && (
        <button
          onClick={skipIntro}
          className="absolute bottom-24 right-8 z-50 flex items-center gap-2 bg-white/90 hover:bg-white text-black px-6 py-3 rounded-md font-bold text-sm shadow-2xl backdrop-blur-md transition-all hover:scale-105"
        >
          <SkipForward className="w-5 h-5 fill-black" />
          Skip Intro
        </button>
      )}

      {/* Settings Quality Menu Overlay */}
      {isSettingsOpen && (
        <div className="absolute bottom-24 right-16 z-50 w-48 bg-black/90 border border-white/20 rounded-lg p-2 shadow-2xl backdrop-blur-md">
          <p className="text-xs font-bold text-gray-400 px-3 py-1 border-b border-white/10">Video Quality</p>
          <div className="py-1">
            {qualities.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQualityChange(q.id)}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  currentQuality === q.id ? 'bg-netflix-red text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-3 z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Seek Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-mono text-gray-300 w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-netflix-red"
          />
          <span className="text-xs font-mono text-gray-300 w-12">{formatTime(duration)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-netflix-red transition-transform hover:scale-110">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-gray-300 hover:text-white transition-colors"
              title="Quality Settings"
            >
              <Settings className="w-6 h-6" />
            </button>

            <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
