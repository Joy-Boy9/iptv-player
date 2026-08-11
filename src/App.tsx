// =============================================
// Main App Component — Maximum Viewport Layout
// =============================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChannelList } from './components/ChannelList/ChannelList';
import { VideoPlayer } from './components/Player/VideoPlayer';
import { PlaylistManager } from './components/PlaylistManager/PlaylistManager';
import { Settings } from './components/Settings/Settings';
import { usePlaylistStore } from './store/usePlaylistStore';
import { useUIStore } from './store/useUIStore';

// Loading Overlay
const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 bg-[#0B1020] z-[100] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#6D5DF6] flex items-center justify-center shadow-2xl shadow-[#6D5DF6]/40">
            <span className="text-3xl">📺</span>
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-2xl tracking-wide">IPTV Player</h1>
            <p className="text-[#B8C1EC] text-sm mt-1">Loading channels & playlists...</p>
          </div>
          <div className="w-48 h-1 bg-[#1A2140] rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-[#6D5DF6] rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

function App() {
  const { initializeDefaultPlaylist } = usePlaylistStore();
  const { setPlaylistManagerOpen, setSidebarOpen } = useUIStore();
  const [appInitialized, setAppInitialized] = React.useState(false);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await initializeDefaultPlaylist();
      setAppInitialized(true);

      // On mobile screens, start with sidebar drawer closed
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    init();
  }, []);

  const showLoading = !appInitialized;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B1020] overflow-hidden select-none">
      <LoadingOverlay isLoading={showLoading} />

      {/* Main Content Area (No top header bar) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Sidebar / Mobile Drawer */}
        <Sidebar
          onAddPlaylist={() => setPlaylistManagerOpen(true)}
          onImportFile={() => setPlaylistManagerOpen(true)}
        />

        {/* Mobile View: VideoPlayer on top, ChannelList on bottom */}
        {/* Desktop View: ChannelList left (320px), VideoPlayer right (flex-1) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 min-w-0">
          <div className="order-2 md:order-1 w-full md:w-[320px] md:flex-shrink-0 flex flex-col flex-1 md:flex-initial min-h-0 overflow-hidden">
            <ChannelList />
          </div>

          <div className="order-1 md:order-2 flex-shrink-0 md:flex-shrink md:flex-1 w-full flex flex-col min-h-0 min-w-0 overflow-hidden">
            <VideoPlayer />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PlaylistManager />
      <Settings />
    </div>
  );
}

export default App;
