'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AudioContextType {
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, nextTrack, setPlaying } = usePlayerStore();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Instantiate browser Audio object
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      nextTrack();
    };
    const onError = () => {
      setPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [nextTrack, setPlaying]);

  // Handle source changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      audio.src = currentTrack.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setPlaying(false));
      }
    } else {
      audio.src = '';
      setDuration(0);
      setCurrentTime(0);
    }
  }, [currentTrack, setPlaying]);

  // Handle play/pause commands and track progress syncs
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, setPlaying]);

  // Sync playback progress with UserActivity API (Debounced)
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('music-auth-storage');
      let parsedToken = '';
      try {
        if (token) {
          const authData = JSON.parse(token);
          parsedToken = authData.state?.token || '';
        }
      } catch {}

      if (parsedToken && audioRef.current) {
        fetch('http://localhost:4000/api/history/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${parsedToken}`,
          },
          body: JSON.stringify({
            trackId: currentTrack.id,
            progress: Math.floor(audioRef.current.currentTime),
            isCompleted: audioRef.current.currentTime >= audioRef.current.duration - 5,
          }),
        }).catch(() => {});
      }
    }, 10000); // Sync every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Handle volume settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioContext.Provider value={{ duration, currentTime, seek }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
