// =============================================
// Main App Component
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
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-bg-primary z-[100] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/40">
            <span className="text-3xl">📺</span>
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-2xl">IPTV Player</h1>
            <p className="text-text-secondary text-sm mt-1">Loading your playlists...</p>
          </div>
          <div className="w-48 h-1 bg-bg-card rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-accent rounded-full"
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
  const { setPlaylistManagerOpen, isSidebarOpen } = useUIStore();
  const [appInitialized, setAppInitialized] = React.useState(false);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await initializeDefaultPlaylist();
      setAppInitialized(true);
    };
    init();
  }, []);

  // Handle keyboard shortcut Ctrl+F for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('header-search') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const showLoading = !appInitialized;

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <LoadingOverlay isLoading={showLoading} />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            onAddPlaylist={() => setPlaylistManagerOpen(true)}
            onImportFile={() => setPlaylistManagerOpen(true)}
          />
        )}

        {/* Channel List (Center) */}
        <ChannelList />

        {/* Video Player (Right) */}
        <VideoPlayer />
      </main>

      {/* Modals */}
      <PlaylistManager />
      <Settings />
    </div>
  );
}

export default App;
