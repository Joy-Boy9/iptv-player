// =============================================
// LocalStorage Utility
// =============================================

const PREFIX = 'iptv_player_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};
