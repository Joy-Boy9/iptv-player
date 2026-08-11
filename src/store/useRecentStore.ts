// =============================================
// Recent Channels Store - Tracks watch history
// =============================================

import { create } from 'zustand';
import type { RecentChannel } from '../types';
import { storage } from '../utils/storage';

const MAX_RECENT = 50;

interface RecentStore {
  recentChannels: RecentChannel[];

  // Actions
  addToRecent: (channel: RecentChannel) => void;
  removeFromRecent: (channelId: string) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentStore>((set, get) => ({
  recentChannels: storage.get<RecentChannel[]>('recent', []),

  addToRecent: (channel) => {
    const { recentChannels } = get();

    // Remove existing entry for this channel
    const filtered = recentChannels.filter((r) => r.channelId !== channel.channelId);

    // Add to front
    const updated = [channel, ...filtered].slice(0, MAX_RECENT);

    storage.set('recent', updated);
    set({ recentChannels: updated });
  },

  removeFromRecent: (channelId) => {
    const { recentChannels } = get();
    const updated = recentChannels.filter((r) => r.channelId !== channelId);
    storage.set('recent', updated);
    set({ recentChannels: updated });
  },

  clearRecent: () => {
    storage.set('recent', []);
    set({ recentChannels: [] });
  },
}));
