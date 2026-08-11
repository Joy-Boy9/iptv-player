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

const DEFAULT_PLAYLIST: Playlist = {
  id: 'default-all',
  name: 'All Channels (13,000+)',
  url: 'https://iptv-org.github.io/iptv/index.m3u',
  type: 'url',
  enabled: true,
  color: '#6D5DF6',
  icon: '🌍',
  lastUpdated: 0,
  channelCount: 0,
};


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
  playlists: storage.get<Playlist[]>('playlists', [DEFAULT_PLAYLIST]),
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
    const { playlists, channels, refreshPlaylist } = get();

    // Migrate old default-tel to new default-all
    const oldDefault = playlists.find((p) => p.id === 'default-tel');
    if (oldDefault) {
      const updatedPlaylists = playlists.map((p) =>
        p.id === 'default-tel' ? { ...DEFAULT_PLAYLIST } : p
      );
      const updatedChannels = channels.filter((c) => c.playlistId !== 'default-tel');
      storage.set('playlists', updatedPlaylists);
      storage.set('channels', updatedChannels);
      set({ playlists: updatedPlaylists, channels: updatedChannels });
      await get().refreshPlaylist('default-all');
      return;
    }

    const defaultPlaylist = playlists.find((p) => p.id === 'default-all');
    if (!defaultPlaylist) {
      // Fresh install — add default playlist
      set((state) => ({
        playlists: [DEFAULT_PLAYLIST, ...state.playlists],
      }));
      await get().refreshPlaylist('default-all');
    } else if (channels.filter((c) => c.playlistId === 'default-all').length === 0) {
      // Channels not loaded yet, fetch them
      await refreshPlaylist('default-all');
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
