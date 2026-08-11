// =============================================
// Settings Store - App settings with persistence
// =============================================

import { create } from 'zustand';
import type { AppSettings } from '../types';
import { storage } from '../utils/storage';

const DEFAULT_SETTINGS: AppSettings = {
  autoplay: true,
  rememberLastChannel: true,
  hardwareAcceleration: true,
  theme: 'dark',
  defaultVolume: 80,
  lastChannelId: null,
  lastPlaylistId: null,
};

interface SettingsStore {
  settings: AppSettings;

  // Actions
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: storage.get<AppSettings>('settings', DEFAULT_SETTINGS),

  updateSetting: (key, value) => {
    set((state) => {
      const updated = { ...state.settings, [key]: value };
      storage.set('settings', updated);
      return { settings: updated };
    });
  },

  resetSettings: () => {
    storage.set('settings', DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },

  exportSettings: () => {
    const { settings } = get();
    return JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2);
  },

  importSettings: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.settings && typeof parsed.settings === 'object') {
        const merged = { ...DEFAULT_SETTINGS, ...parsed.settings };
        storage.set('settings', merged);
        set({ settings: merged });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
