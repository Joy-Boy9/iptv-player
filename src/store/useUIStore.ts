// =============================================
// UI Store - Manages UI state (sidebar, tabs, search)
// =============================================

import { create } from 'zustand';
import type { ActiveTab, SidebarSection } from '../types';

interface UIStore {
  activeTab: ActiveTab;
  selectedCategory: SidebarSection;
  searchQuery: string;
  isSidebarOpen: boolean;
  isPlaylistManagerOpen: boolean;
  isSettingsOpen: boolean;
  selectedChannelIndex: number;
  selectedPlaylistFilter: string | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCategory: (category: SidebarSection) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPlaylistManagerOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setSelectedChannelIndex: (index: number) => void;
  setSelectedPlaylistFilter: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'live',
  selectedCategory: 'all',
  searchQuery: '',
  isSidebarOpen: true,
  isPlaylistManagerOpen: false,
  isSettingsOpen: false,
  selectedChannelIndex: 0,
  selectedPlaylistFilter: null,

  setActiveTab: (tab) => set({ activeTab: tab, selectedCategory: 'all', searchQuery: '' }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setPlaylistManagerOpen: (open) => set({ isPlaylistManagerOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setSelectedChannelIndex: (index) => set({ selectedChannelIndex: index }),
  setSelectedPlaylistFilter: (id) => set({ selectedPlaylistFilter: id }),
}));
