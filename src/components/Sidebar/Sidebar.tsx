// =============================================
// Sidebar — Responsive Sidebar & Category Drawer
// =============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiHeart,
  FiClock,
  FiGrid,
  FiRefreshCw,
  FiPlusCircle,
  FiUpload,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiTv,
  FiSettings,
} from 'react-icons/fi';
import {
  MdLiveTv,
  MdMovieFilter,
  MdChildFriendly,
  MdSportsSoccer,
  MdMusicNote,
  MdChurch,
  MdSpa,
  MdVideoLibrary,
} from 'react-icons/md';
import { BiNews } from 'react-icons/bi';
import { useUIStore } from '../../store/useUIStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useRecentStore } from '../../store/useRecentStore';
import { getCategoryIcon } from '../../utils/m3uParser';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  news: <BiNews />,
  sports: <MdSportsSoccer />,
  movies: <MdMovieFilter />,
  entertainment: <MdLiveTv />,
  kids: <MdChildFriendly />,
  music: <MdMusicNote />,
  religious: <MdChurch />,
  lifestyle: <MdSpa />,
  documentary: <MdVideoLibrary />,
  general: <FiGrid />,
  series: <MdVideoLibrary />,
};

interface SidebarProps {
  onAddPlaylist?: () => void;
  onImportFile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddPlaylist, onImportFile }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedPlaylistFilter,
    isSidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
  } = useUIStore();

  const { playlists, channels, togglePlaylist, refreshPlaylist, isLoading, loadingPlaylistId } = usePlaylistStore();
  const { favoriteIds } = useFavoritesStore();
  const { recentChannels } = useRecentStore();

  const [categorySearch, setCategorySearch] = useState('');
  const [showPlaylists, setShowPlaylists] = useState(true);

  // Close mobile drawer when an option is selected on small screens
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Reactive channel counts
  const allChannels = useMemo(() => {
    const enabledIds = new Set(playlists.filter((p) => p.enabled).map((p) => p.id));
    let list = channels.filter((c) => enabledIds.has(c.playlistId));
    if (selectedPlaylistFilter) {
      list = list.filter((c) => c.playlistId === selectedPlaylistFilter);
    }
    return list;
  }, [channels, playlists, selectedPlaylistFilter]);

  const categories = useMemo(() => {
    const groupMap = new Map<string, number>();
    for (const ch of allChannels) {
      const group = ch.group || 'General';
      groupMap.set(group, (groupMap.get(group) || 0) + 1);
    }
    return Array.from(groupMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allChannels]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const sectionItems = [
    { id: 'all' as const, label: 'All Channels', icon: <FiGrid />, count: allChannels.length },
    { id: 'favorites' as const, label: 'Favorites', icon: <FiHeart />, count: favoriteIds.size },
    { id: 'recent' as const, label: 'Recently Viewed', icon: <FiClock />, count: recentChannels.length },
  ];

  const isActive = (id: string) => selectedCategory === id;

  const sidebarContent = (
    <aside className="w-[260px] md:w-[220px] bg-[#12192E] border-r border-[#1E2A4A] flex flex-col h-full overflow-hidden flex-shrink-0 z-50">
      {/* Brand Header inside Sidebar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E2A4A] bg-[#0D1428]">
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D5DF6] to-[#8B7DF8] flex items-center justify-center shadow-md shadow-[#6D5DF6]/30">
            <FiTv className="text-white text-xs" />
          </div>
          <span className="text-white font-extrabold text-xs tracking-wide">
            IPTV <span className="text-[#6D5DF6]">PLAYER</span>
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 text-[#B8C1EC] hover:text-white rounded-lg bg-[#1A2140]"
        >
          <FiX className="text-sm" />
        </button>
      </div>

      {/* Category Search */}
      <div className="p-2 border-b border-[#1E2A4A] flex gap-1.5 items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Category..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full bg-[#1A2140] border border-[#1E2A4A] rounded-lg pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:border-[#6D5DF6]"
          />
        </div>
      </div>

      {/* Scrollable Category List */}
      <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
        {/* Main sections */}
        {sectionItems.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleSelectCategory(item.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors w-full text-left ${
                active ? 'bg-[#6D5DF6]/20 text-white font-semibold' : 'text-[#B8C1EC] hover:bg-[#2C3766] hover:text-white'
              }`}
            >
              <span className={`text-base flex-shrink-0 ${active ? 'text-[#6D5DF6]' : 'text-inherit'}`}>
                {item.icon}
              </span>
              <span className="text-xs flex-1 truncate">{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex-shrink-0 ${
                active ? 'bg-[#6D5DF6]/30 text-[#8B7DF8]' : 'bg-[#1A2140] text-[#6B7280]'
              }`}>
                {item.count}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-[#1E2A4A] my-1.5 mx-1" />

        {/* Dynamic categories */}
        {filteredCategories.map((cat) => {
          const iconKey = getCategoryIcon(cat.name);
          const icon = CATEGORY_ICONS[iconKey] || <FiGrid />;
          const active = isActive(cat.name);

          return (
            <button
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors w-full text-left ${
                active ? 'bg-[#6D5DF6]/20 text-white font-semibold' : 'text-[#B8C1EC] hover:bg-[#2C3766] hover:text-white'
              }`}
            >
              <span className={`text-sm flex-shrink-0 ${active ? 'text-[#6D5DF6]' : 'text-[#6B7280]'}`}>
                {icon}
              </span>
              <span className="text-xs flex-1 truncate">{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex-shrink-0 ${
                active ? 'bg-[#6D5DF6]/30 text-[#8B7DF8]' : 'bg-[#1A2140] text-[#6B7280]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}

        {filteredCategories.length === 0 && categorySearch && (
          <p className="text-[#6B7280] text-xs text-center py-4">
            No categories found
          </p>
        )}
      </div>

      {/* Bottom — Playlists & Action Buttons */}
      <div className="border-t border-[#1E2A4A]">
        <button
          onClick={() => setShowPlaylists(!showPlaylists)}
          className="flex items-center justify-between w-full p-2 text-[#B8C1EC] hover:text-white text-left"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">Playlists</span>
          {showPlaylists ? <FiChevronDown className="text-xs" /> : <FiChevronRight className="text-xs" />}
        </button>

        <AnimatePresence>
          {showPlaylists && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-1.5 max-h-32 overflow-y-auto flex flex-col gap-0.5">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => togglePlaylist(pl.id)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                      pl.enabled ? 'bg-[#6D5DF6]/15 text-white' : 'hover:bg-[#1A2140] text-[#B8C1EC]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                        pl.enabled ? 'bg-[#6D5DF6] border-[#6D5DF6]' : 'border-[#4B5563] bg-transparent'
                      }`}
                    >
                      {pl.enabled && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs flex-1 truncate">{pl.name}</span>
                    {isLoading && loadingPlaylistId === pl.id ? (
                      <FiRefreshCw className="text-xs text-[#6D5DF6] animate-spin flex-shrink-0" />
                    ) : pl.type === 'url' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); refreshPlaylist(pl.id); }}
                        className="text-[#4B5563] hover:text-[#B8C1EC] p-0.5 flex-shrink-0"
                        title="Refresh playlist"
                      >
                        <FiRefreshCw className="text-xs" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Clean 3-Button Action Row: Add, Import, Settings */}
              <div className="flex gap-1.5 p-2 pt-1">
                <button
                  onClick={onAddPlaylist}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#1A2140] hover:bg-[#2C3766] border border-[#1E2A4A] rounded-lg text-[#B8C1EC] hover:text-white text-xs transition-colors"
                >
                  <FiPlusCircle className="text-xs" /> Add
                </button>
                <button
                  onClick={onImportFile}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#1A2140] hover:bg-[#2C3766] border border-[#1E2A4A] rounded-lg text-[#B8C1EC] hover:text-white text-xs transition-colors"
                >
                  <FiUpload className="text-xs" /> Import
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#1A2140] hover:bg-[#2C3766] border border-[#1E2A4A] rounded-lg text-[#B8C1EC] hover:text-white text-xs transition-colors"
                >
                  <FiSettings className="text-xs" /> Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Total channels footer */}
      <div className="p-2 border-t border-[#1E2A4A]">
        <p className="text-[#6B7280] text-[11px]">
          Total: <span className="text-[#6D5DF6] font-bold">{allChannels.length}</span> channels
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar — responds to isSidebarOpen state */}
      {isSidebarOpen && (
        <div className="hidden md:flex h-full flex-shrink-0">
          {sidebarContent}
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
