// =============================================
// Player Store - Manages video playback state
// =============================================

import { create } from 'zustand';
import type { Channel } from '../types';
import { storage } from '../utils/storage';

interface PlayerStore {
  currentChannel: Channel | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  retryCount: number;

  // Actions
  setCurrentChannel: (channel: Channel) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsMuted: (isMuted: boolean) => void;
  setVolume: (volume: number) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  toggleMute: () => void;
  togglePlay: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentChannel: storage.get<Channel | null>('lastChannel', null),
  isPlaying: false,
  isMuted: false,
  volume: storage.get<number>('volume', 80),
  isFullscreen: false,
  isLoading: false,
  error: null,
  retryCount: 0,

  setCurrentChannel: (channel) => {
    storage.set('lastChannel', channel);
    set({ currentChannel: channel, error: null, retryCount: 0, isLoading: true });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setVolume: (volume) => {
    storage.set('volume', volume);
    set({ volume });
  },
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
  resetRetry: () => set({ retryCount: 0 }),

  toggleMute: () => {
    const { isMuted, setIsMuted } = get();
    setIsMuted(!isMuted);
  },

  togglePlay: () => {
    const { isPlaying, setIsPlaying } = get();
    setIsPlaying(!isPlaying);
  },
}));
