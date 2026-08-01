import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@music/types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  playHistory: Track[];
  
  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setQueue: (queue: Track[]) => void;
  setTrack: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      volume: 0.5,
      playHistory: [],

      playTrack: (track, queue = []) => {
        const activeQueue = queue.length > 0 ? queue : [track];
        const index = activeQueue.findIndex((t) => t.id === track.id);
        
        set((state) => ({
          currentTrack: track,
          queue: activeQueue,
          queueIndex: index !== -1 ? index : 0,
          isPlaying: true,
          playHistory: [track, ...state.playHistory.filter((t) => t.id !== track.id)].slice(0, 50),
        }));
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying && !!state.currentTrack })),
      
      setPlaying: (isPlaying) => set((state) => ({ isPlaying: isPlaying && !!state.currentTrack })),

      nextTrack: () => {
        const { queue, queueIndex } = get();
        if (queue.length === 0 || queueIndex === -1) return;
        
        const nextIndex = queueIndex + 1;
        if (nextIndex < queue.length) {
          set({
            currentTrack: queue[nextIndex],
            queueIndex: nextIndex,
            isPlaying: true,
          });
        } else {
          set({
            currentTrack: queue[0],
            queueIndex: 0,
            isPlaying: true,
          });
        }
      },

      prevTrack: () => {
        const { queue, queueIndex } = get();
        if (queue.length === 0 || queueIndex === -1) return;

        const prevIndex = queueIndex - 1;
        if (prevIndex >= 0) {
          set({
            currentTrack: queue[prevIndex],
            queueIndex: prevIndex,
            isPlaying: true,
          });
        } else {
          const lastIndex = queue.length - 1;
          set({
            currentTrack: queue[lastIndex],
            queueIndex: lastIndex,
            isPlaying: true,
          });
        }
      },

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

      clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null, isPlaying: false }),

      setQueue: (queue) => set({ queue }),

      setTrack: (track) => {
        const { playTrack, queue } = get();
        playTrack(track, queue.length > 0 ? queue : [track]);
      },
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        queueIndex: state.queueIndex,
        volume: state.volume,
        playHistory: state.playHistory,
      }),
    },
  ),
);
