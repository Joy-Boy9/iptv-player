// =============================================
// Playlist Store - Manages playlists & channels
// =============================================

import { create } from 'zustand';
import type { Channel, Playlist } from '../types';
import { storage } from '../utils/storage';
import { parseM3U, fetchAndParseM3U } from '../utils/m3uParser';

// Simple UUID fallback since we can't import uuid easily
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Three built-in playlists — Telugu enabled by default, others off
const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'default-tel',
    name: 'Telugu',
    url: 'https://iptv-org.github.io/iptv/languages/tel.m3u',
    type: 'url',
    enabled: true,       // ← ON by default
    color: '#F59E0B',
    icon: '🇮🇳',
    lastUpdated: 0,
    channelCount: 0,
  },
  {
    id: 'default-hin',
    name: 'Hindi',
    url: 'https://iptv-org.github.io/iptv/languages/hin.m3u',
    type: 'url',
    enabled: false,      // ← OFF — user can enable
    color: '#10B981',
    icon: '🇮🇳',
    lastUpdated: 0,
    channelCount: 0,
  },
  {
    id: 'default-all',
    name: 'All Channels (13,000+)',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    type: 'url',
    enabled: false,      // ← OFF — user can enable
    color: '#6D5DF6',
    icon: '🌍',
    lastUpdated: 0,
    channelCount: 0,
  },
];

interface PlaylistStore {
  playlists: Playlist[];
  channels: Channel[];
  isLoading: boolean;
  loadingPlaylistId: string | null;
  error: string | null;

  // Actions
  addPlaylist: (playlist: Omit<Playlist, 'id' | 'lastUpdated' | 'channelCount'>) => Promise<void>;
  addPlaylistFromFile: (name: string, content: string) => Promise<void>;
  removePlaylist: (id: string) => void;
  togglePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  refreshPlaylist: (id: string) => Promise<void>;
  refreshAllPlaylists: () => Promise<void>;
  reorderPlaylists: (playlists: Playlist[]) => void;
  initializeDefaultPlaylist: () => Promise<void>;
  getAllChannels: () => Channel[];
  getChannelsByPlaylist: (playlistId: string) => Channel[];
  getCategories: () => Array<{ name: string; count: number }>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: storage.get<Playlist[]>('playlists', DEFAULT_PLAYLISTS),
  channels: storage.get<Channel[]>('channels', []),
  isLoading: false,
  loadingPlaylistId: null,
  error: null,

  addPlaylist: async (playlistData) => {
    const playlist: Playlist = {
      ...playlistData,
      id: generateId(),
      lastUpdated: 0,
      channelCount: 0,
    };

    set((state) => ({
      playlists: [...state.playlists, playlist],
      isLoading: true,
      loadingPlaylistId: playlist.id,
      error: null,
    }));

    try {
      const newChannels = await fetchAndParseM3U(playlist);
      playlist.channelCount = newChannels.length;
      playlist.lastUpdated = Date.now();

      set((state) => {
        const updatedPlaylists = state.playlists.map((p) =>
          p.id === playlist.id ? playlist : p
        );
        const filteredChannels = state.channels.filter((c) => c.playlistId !== playlist.id);
        const allChannels = [...filteredChannels, ...newChannels];

        storage.set('playlists', updatedPlaylists);
        storage.set('channels', allChannels);

        return {
          playlists: updatedPlaylists,
          channels: allChannels,
          isLoading: false,
          loadingPlaylistId: null,
        };
      });
    } catch (err) {
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlist.id),
        isLoading: false,
        loadingPlaylistId: null,
        error: err instanceof Error ? err.message : 'Failed to load playlist',
      }));
      throw err;
    }
  },

  addPlaylistFromFile: async (name, content) => {
    const playlist: Playlist = {
      id: generateId(),
      name,
      url: '',
      type: 'local',
      enabled: true,
      color: '#6D5DF6',
      icon: '📁',
      lastUpdated: Date.now(),
      channelCount: 0,
    };

    const newChannels = parseM3U(content, playlist);
    playlist.channelCount = newChannels.length;

    set((state) => {
      const updatedPlaylists = [...state.playlists, playlist];
      const filteredChannels = state.channels.filter((c) => c.playlistId !== playlist.id);
      const allChannels = [...filteredChannels, ...newChannels];

      storage.set('playlists', updatedPlaylists);
      storage.set('channels', allChannels);

      return {
        playlists: updatedPlaylists,
        channels: allChannels,
      };
    });
  },

  removePlaylist: (id) => {
    set((state) => {
      const updatedPlaylists = state.playlists.filter((p) => p.id !== id);
      const updatedChannels = state.channels.filter((c) => c.playlistId !== id);

      storage.set('playlists', updatedPlaylists);
      storage.set('channels', updatedChannels);

      return {
        playlists: updatedPlaylists,
        channels: updatedChannels,
      };
    });
  },

  togglePlaylist: (id) => {
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      );
      storage.set('playlists', updatedPlaylists);
      return { playlists: updatedPlaylists };
    });
  },

  renamePlaylist: (id, name) => {
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) =>
        p.id === id ? { ...p, name } : p
      );
      storage.set('playlists', updatedPlaylists);
      return { playlists: updatedPlaylists };
    });
  },

  refreshPlaylist: async (id) => {
    const { playlists } = get();
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist || playlist.type === 'local') return;

    set({ isLoading: true, loadingPlaylistId: id, error: null });

    try {
      const newChannels = await fetchAndParseM3U(playlist);

      set((state) => {
        const updatedPlaylists = state.playlists.map((p) =>
          p.id === id
            ? { ...p, lastUpdated: Date.now(), channelCount: newChannels.length }
            : p
        );
        const filteredChannels = state.channels.filter((c) => c.playlistId !== id);
        const allChannels = [...filteredChannels, ...newChannels];

        storage.set('playlists', updatedPlaylists);
        storage.set('channels', allChannels);

        return {
          playlists: updatedPlaylists,
          channels: allChannels,
          isLoading: false,
          loadingPlaylistId: null,
        };
      });
    } catch (err) {
      set({
        isLoading: false,
        loadingPlaylistId: null,
        error: err instanceof Error ? err.message : 'Failed to refresh playlist',
      });
      throw err;
    }
  },

  refreshAllPlaylists: async () => {
    const { playlists, refreshPlaylist } = get();
    const urlPlaylists = playlists.filter((p) => p.type === 'url' && p.enabled);
    for (const playlist of urlPlaylists) {
      await refreshPlaylist(playlist.id);
    }
  },

  reorderPlaylists: (playlists) => {
    storage.set('playlists', playlists);
    set({ playlists });
  },

  initializeDefaultPlaylist: async () => {
    const { playlists, channels } = get();
    const existingIds = new Set(playlists.map((p) => p.id));

    // ── Migration: fix old state where default-all was the only enabled default ──
    // If user had the previous version (default-all ON, no default-tel),
    // reset everything to the correct 3-playlist defaults.
    const hasTel = existingIds.has('default-tel');
    const hasAll = existingIds.has('default-all');
    const allEnabled = playlists.find((p) => p.id === 'default-all')?.enabled;

    if (!hasTel && hasAll && allEnabled) {
      // Old state detected → reset to clean DEFAULT_PLAYLISTS
      // Keep any user-added playlists, replace only the defaults
      const userPlaylists = playlists.filter(
        (p) => !['default-tel', 'default-hin', 'default-all'].includes(p.id)
      );
      const resetChannels = channels.filter(
        (c) => !['default-tel', 'default-hin', 'default-all'].includes(c.playlistId)
      );
      const merged = [...DEFAULT_PLAYLISTS, ...userPlaylists];
      storage.set('playlists', merged);
      storage.set('channels', resetChannels);
      set({ playlists: merged, channels: resetChannels });
      // Only fetch Telugu (the only enabled one)
      await get().refreshPlaylist('default-tel');
      return;
    }

    // ── Ensure all 3 default playlists exist (add any missing ones) ──
    const missing = DEFAULT_PLAYLISTS.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      const merged = [...playlists, ...missing];
      storage.set('playlists', merged);
      set({ playlists: merged });
    }

    // ── Only fetch channels for ENABLED playlists that have no channels yet ──
    const currentPlaylists = get().playlists;
    for (const pl of currentPlaylists) {
      if (pl.enabled && channels.filter((c) => c.playlistId === pl.id).length === 0) {
        await get().refreshPlaylist(pl.id);
      }
    }
  },



  getAllChannels: () => {
    const { channels, playlists } = get();
    const enabledPlaylistIds = new Set(
      playlists.filter((p) => p.enabled).map((p) => p.id)
    );
    return channels.filter((c) => enabledPlaylistIds.has(c.playlistId));
  },

  getChannelsByPlaylist: (playlistId) => {
    const { channels } = get();
    return channels.filter((c) => c.playlistId === playlistId);
  },

  getCategories: () => {
    const channels = get().getAllChannels();
    const groupMap = new Map<string, number>();

    for (const ch of channels) {
      const group = ch.group || 'General';
      groupMap.set(group, (groupMap.get(group) || 0) + 1);
    }

    return Array.from(groupMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
}));
