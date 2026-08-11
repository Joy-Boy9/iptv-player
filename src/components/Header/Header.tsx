// =============================================
// Header — improved premium design
// =============================================

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiSettings, FiList, FiTv, FiX } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setSettingsOpen, setPlaylistManagerOpen } = useUIStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '56px',
        background: '#12192E',
        borderBottom: '1px solid #1E2A4A',
        flexShrink: 0,
        zIndex: 50,
        gap: '16px',
      }}
    >
      {/* Logo */}
      <motion.div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6D5DF6, #8B7DF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(109,93,246,0.4)',
          }}
        >
          <FiTv style={{ color: 'white', fontSize: '16px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '14px', letterSpacing: '0.04em' }}>
            IPTV <span style={{ color: '#6D5DF6' }}>PLAYER</span>
          </span>
        </div>
      </motion.div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <FiSearch
            style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: '#6B7280', fontSize: '13px', pointerEvents: 'none',
            }}
          />
          <input
            ref={searchRef}
            id="header-search"
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              background: '#1A2140',
              border: '1px solid #1E2A4A',
              borderRadius: '10px',
              paddingLeft: '32px',
              paddingRight: searchQuery ? '30px' : '14px',
              paddingTop: '7px',
              paddingBottom: '7px',
              fontSize: '13px',
              color: 'white',
              outline: 'none',
              width: '180px',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6D5DF6';
              e.target.style.width = '240px';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1E2A4A';
              if (!searchQuery) e.target.style.width = '180px';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '2px',
              }}
            >
              <FiX style={{ fontSize: '13px' }} />
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
          style={{
            background: '#1A2140', border: '1px solid #1E2A4A', borderRadius: '10px',
            padding: '7px', cursor: 'pointer', color: '#B8C1EC', display: 'flex', alignItems: 'center',
            transition: 'all 0.2s',
          }}

        >
          <FiList style={{ fontSize: '16px' }} />
        </motion.button>

        {/* Settings */}
        <motion.button
          id="settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          style={{
            background: '#1A2140', border: '1px solid #1E2A4A', borderRadius: '10px',
            padding: '7px', cursor: 'pointer', color: '#B8C1EC', display: 'flex', alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          <FiSettings style={{ fontSize: '16px' }} />
        </motion.button>
      </div>
    </header>
  );
};
