// =============================================
// Header — Responsive, Premium Design
// =============================================

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiSettings, FiList, FiTv, FiX, FiMenu } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setSettingsOpen, setPlaylistManagerOpen, toggleSidebar } = useUIStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  return (
    <header className="flex items-center justify-between px-3 md:px-4 h-14 bg-[#12192E] border-b border-[#1E2A4A] flex-shrink-0 z-40 gap-2 md:gap-4">
      {/* Left: Sidebar Menu Toggle + Logo */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-[#1A2140] text-[#B8C1EC] hover:text-white border border-[#1E2A4A] flex items-center justify-center"
          title="Categories & Playlists"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="text-lg" />
        </motion.button>

        <motion.div
          className="flex items-center gap-2 cursor-pointer select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-[#6D5DF6] to-[#8B7DF8] flex items-center justify-center shadow-lg shadow-[#6D5DF6]/30">
            <FiTv className="text-white text-base md:text-lg" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-extrabold text-sm md:text-base tracking-wide">
              IPTV <span className="text-[#6D5DF6]">PLAYER</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Search + Action Buttons */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        {/* Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs md:text-sm pointer-events-none" />
          <input
            ref={searchRef}
            id="header-search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-[#1A2140] border border-[#1E2A4A] rounded-xl pl-8 pr-7 py-1.5 text-xs md:text-sm text-white outline-none w-28 sm:w-44 md:w-56 focus:border-[#6D5DF6] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white p-0.5"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>

        {/* Playlist Manager */}
        <motion.button
          id="playlist-manager-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPlaylistManagerOpen(true)}
          title="Playlist Manager"
          className="p-2 bg-[#1A2140] border border-[#1E2A4A] rounded-xl text-[#B8C1EC] hover:text-white flex items-center justify-center transition-colors"
        >
          <FiList className="text-base" />
        </motion.button>

        {/* Settings */}
        <motion.button
          id="settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="p-2 bg-[#1A2140] border border-[#1E2A4A] rounded-xl text-[#B8C1EC] hover:text-white flex items-center justify-center transition-colors"
        >
          <FiSettings className="text-base" />
        </motion.button>
      </div>
    </header>
  );
};
