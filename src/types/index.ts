// =============================================
// Core Types for IPTV Application
// =============================================

export interface Channel {
  id: string;
  number: number;
  name: string;
  url: string;
  logo: string;
  group: string;
  tvgId: string;
  tvgName: string;
  resolution: string;
  playlistId: string;
  isFavorite?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  url: string;
  type: 'url' | 'local';
  enabled: boolean;
  color: string;
  icon: string;
  lastUpdated: number;
  channelCount: number;
}

export interface Category {
  name: string;
  channelCount: number;
  icon: string;
}

export interface PlayerState {
  currentChannel: Channel | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  quality: string;
  duration: number;
  currentTime: number;
}

export interface AppSettings {
  autoplay: boolean;
  rememberLastChannel: boolean;
  hardwareAcceleration: boolean;
  theme: 'dark' | 'light';
  defaultVolume: number;
  lastChannelId: string | null;
  lastPlaylistId: string | null;
}

export interface RecentChannel {
  channelId: string;
  channelName: string;
  channelLogo: string;
  channelGroup: string;
  timestamp: number;
  url: string;
  playlistId: string;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
}

export type ActiveTab = 'live' | 'movies' | 'series' | 'favorites';
export type SidebarSection = 'all' | 'favorites' | 'recent' | string;
