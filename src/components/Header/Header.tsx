// =============================================
// Header — Clean & Sleek Top Bar
// =============================================

import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiList, FiTv, FiMenu } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { setSettingsOpen, setPlaylistManagerOpen, toggleSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between px-3 md:px-4 h-11 md:h-12 bg-[#12192E] border-b border-[#1E2A4A] flex-shrink-0 z-40 gap-2">
      {/* Left: Sidebar Menu Button (Three Bars) + IPTV PLAYER Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-[#1A2140] text-[#B8C1EC] hover:text-white border border-[#1E2A4A] flex items-center justify-center cursor-pointer"
          title="Toggle Categories Tab"
          aria-label="Toggle Categories"
        >
          <FiMenu className="text-base" />
        </motion.button>

        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#6D5DF6] to-[#8B7DF8] flex items-center justify-center shadow-md shadow-[#6D5DF6]/30">
            <FiTv className="text-white text-sm md:text-base" />
          </div>
          <span className="text-white font-extrabold text-xs md:text-sm tracking-wide">
            IPTV <span className="text-[#6D5DF6]">PLAYER</span>
          </span>
        </div>
      </div>

      {/* Right Side: Action Icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Playlist Manager */}
        <motion.button
          id="playlist-manager-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPlaylistManagerOpen(true)}
          title="Playlist Manager"
          className="p-1.5 h-8 w-8 bg-[#1A2140] border border-[#1E2A4A] rounded-lg text-[#B8C1EC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiList className="text-sm" />
        </motion.button>

        {/* Settings */}
        <motion.button
          id="settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="p-1.5 h-8 w-8 bg-[#1A2140] border border-[#1E2A4A] rounded-lg text-[#B8C1EC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiSettings className="text-sm" />
        </motion.button>
      </div>
    </header>
  );
};
