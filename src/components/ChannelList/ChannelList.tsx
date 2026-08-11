// =============================================
// Channel List — Virtualized, full names, improved design
// =============================================

import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { FiHeart, FiTv, FiMoreVertical, FiSearch } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useRecentStore } from '../../store/useRecentStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Channel } from '../../types';

// Slightly taller rows so names fit comfortably
const CHANNEL_ROW_HEIGHT = 58;




// ── Playing animation ─────────────────────────────────────────────────────
const PlayingBars: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', flexShrink: 0 }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{ width: '3px', background: '#6D5DF6', borderRadius: '2px' }}
        animate={{ height: ['4px', '14px', '4px'] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── Channel Logo ──────────────────────────────────────────────────────────
const ChannelLogo: React.FC<{ logo: string; name: string }> = React.memo(({ logo, name }) => {
  const [failed, setFailed] = React.useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        flexShrink: 0,
        borderRadius: '8px',
        background: '#1A2140',
        border: '1px solid #1E2A4A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {logo && !failed ? (
        <img
          src={logo}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ color: '#6B7280', fontSize: '10px', fontWeight: 700 }}>{initials}</span>
      )}
    </div>
  );
});
ChannelLogo.displayName = 'ChannelLogo';

// ── Channel Row ───────────────────────────────────────────────────────────
interface ChannelRowProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string, e: React.MouseEvent) => void;
}

const ChannelRow: React.FC<ChannelRowProps> = React.memo(
  ({ channel, isActive, isFavorite, onSelect, onToggleFavorite }) => {
    return (
      <div
        onClick={() => onSelect(channel)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(channel)}
        aria-label={`Play ${channel.name}`}
        aria-pressed={isActive}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 8px',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'background 0.12s, border-color 0.12s',
          border: `1px solid ${isActive ? 'rgba(109,93,246,0.5)' : 'transparent'}`,
          background: isActive ? 'rgba(109,93,246,0.15)' : 'transparent',
          outline: 'none',
          width: '100%',
          textAlign: 'left',
          // Active left accent bar
          boxShadow: isActive ? 'inset 3px 0 0 #6D5DF6' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(44,55,102,0.6)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        {/* Number — styled badge */}
        <div
          style={{
            width: '34px',
            minWidth: '34px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: isActive ? '#FFFFFF' : '#6B7280',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: isActive ? 700 : 500,
              background: isActive ? '#6D5DF6' : 'rgba(30,42,74,0.8)',
              border: `1px solid ${isActive ? 'rgba(109,93,246,0.6)' : '#1E2A4A'}`,
              borderRadius: '5px',
              padding: '2px 5px',
              minWidth: '26px',
              textAlign: 'center',
              display: 'inline-block',
              lineHeight: '1.4',
            }}
          >
            {channel.number}
          </span>
        </div>

        {/* Logo */}
        <ChannelLogo logo={channel.logo} name={channel.name} />

        {/* Name — full width, prominently displayed */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p
            style={{
              color: isActive ? '#FFFFFF' : '#D1D5DB',
              fontSize: '13.5px',
              fontWeight: isActive ? 700 : 500,
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: isActive ? '-0.01em' : 'normal',
            }}
          >
            {channel.name}
          </p>
          {channel.resolution && (
            <p
              style={{
                color: '#4B5563',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              {channel.resolution}
            </p>
          )}
        </div>

        {/* Right — playing indicator + fav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isActive && <PlayingBars />}
          <button
            onClick={(e) => onToggleFavorite(channel.id, e)}
            style={{
              padding: '3px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isFavorite ? '#F87171' : '#374151',
              transition: 'color 0.12s',
              flexShrink: 0,
              lineHeight: 0,
            }}
            onMouseEnter={(e) => !isFavorite && ((e.currentTarget as HTMLButtonElement).style.color = '#F87171')}
            onMouseLeave={(e) => !isFavorite && ((e.currentTarget as HTMLButtonElement).style.color = '#374151')}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart
              style={{ fontSize: '12px' }}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    );
  }
);
ChannelRow.displayName = 'ChannelRow';

// ── Loading skeleton ──────────────────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div style={{ padding: '8px' }}>
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          marginBottom: '2px',
        }}
      >
        <div className="loading-skeleton" style={{ width: '26px', height: '12px', borderRadius: '4px' }} />
        <div className="loading-skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
        <div style={{ flex: 1 }}>
          <div className="loading-skeleton" style={{ height: '13px', width: '70%', borderRadius: '4px', marginBottom: '5px' }} />
          <div className="loading-skeleton" style={{ height: '11px', width: '40%', borderRadius: '4px' }} />
        </div>
        <div className="loading-skeleton" style={{ width: '36px', height: '18px', borderRadius: '3px' }} />
      </div>
    ))}
  </div>
);

// ── Main ChannelList ──────────────────────────────────────────────────────
export const ChannelList: React.FC = () => {
  const {
    selectedCategory,
    searchQuery,
    setSearchQuery,
    selectedPlaylistFilter,
    setSelectedChannelIndex,
    selectedChannelIndex,
    isSidebarOpen,
    toggleSidebar,
  } = useUIStore();
  const { channels, playlists, isLoading } = usePlaylistStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { recentChannels } = useRecentStore();
  const { currentChannel, setCurrentChannel } = usePlayerStore();
  const { addToRecent } = useRecentStore();

  const parentRef = useRef<HTMLDivElement>(null);

  // All channels from enabled playlists
  const allEnabledChannels = useMemo(() => {
    const enabledIds = new Set(playlists.filter((p) => p.enabled).map((p) => p.id));
    return channels.filter((c) => enabledIds.has(c.playlistId));
  }, [channels, playlists]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    let list = allEnabledChannels;

    if (selectedPlaylistFilter) {
      list = list.filter((c) => c.playlistId === selectedPlaylistFilter);
    }

    if (selectedCategory === 'favorites') {
      list = list.filter((c) => favoriteIds.has(c.id));
    } else if (selectedCategory === 'recent') {
      const recentIds = recentChannels.map((r) => r.channelId);
      const map = new Map(list.map((c) => [c.id, c]));
      return recentIds.map((id) => map.get(id)).filter((c): c is Channel => c !== undefined);
    } else if (selectedCategory !== 'all') {
      list = list.filter((c) => c.group === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.tvgName?.toLowerCase().includes(q) ?? false)
      );
    }

    return list;
  }, [allEnabledChannels, selectedCategory, searchQuery, favoriteIds, recentChannels, selectedPlaylistFilter]);

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: filteredChannels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CHANNEL_ROW_HEIGHT,
    overscan: 12,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(selectedChannelIndex + 1, filteredChannels.length - 1);
        setSelectedChannelIndex(next);
        virtualizer.scrollToIndex(next, { align: 'auto' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(selectedChannelIndex - 1, 0);
        setSelectedChannelIndex(prev);
        virtualizer.scrollToIndex(prev, { align: 'auto' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const ch = filteredChannels[selectedChannelIndex];
        if (ch) handleSelectChannel(ch);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChannelIndex, filteredChannels, virtualizer, setSelectedChannelIndex]);

  // Scroll to active on mount
  useEffect(() => {
    if (currentChannel) {
      const idx = filteredChannels.findIndex((c) => c.id === currentChannel.id);
      if (idx >= 0) {
        setSelectedChannelIndex(idx);
        virtualizer.scrollToIndex(idx, { align: 'center' });
      }
    }
  }, []);

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setCurrentChannel(channel);
      const idx = filteredChannels.findIndex((c) => c.id === channel.id);
      if (idx >= 0) setSelectedChannelIndex(idx);
      addToRecent({
        channelId: channel.id,
        channelName: channel.name,
        channelLogo: channel.logo,
        channelGroup: channel.group,
        timestamp: Date.now(),
        url: channel.url,
        playlistId: channel.playlistId,
      });
    },
    [filteredChannels, setCurrentChannel, setSelectedChannelIndex, addToRecent]
  );

  const handleToggleFavorite = useCallback(
    (channelId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(channelId);
    },
    [toggleFavorite]
  );

  // Loading skeleton
  if (isLoading && filteredChannels.length === 0) {
    return (
      <div className="w-full md:w-[310px] flex-shrink-0 bg-[#0B1020] border-r border-[#1E2A4A] flex flex-col overflow-hidden">
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #1E2A4A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div className="loading-skeleton" style={{ height: '16px', width: '100px', borderRadius: '4px' }} />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full md:w-[310px] flex-shrink-0 bg-[#0B1020] border-b md:border-b-0 md:border-r border-[#1E2A4A] flex flex-col overflow-hidden flex-1 md:flex-initial min-h-0">
      {/* List header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #1E2A4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#B8C1EC',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginLeft: '-4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1A2140')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FiMoreVertical style={{ fontSize: '15px' }} />
          </button>
          <FiTv style={{ color: '#6D5DF6', fontSize: '14px' }} />
          <span style={{ color: '#B8C1EC', fontSize: '12px', fontWeight: 500 }}>
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6D5DF6]/20 text-[#8B7DF8] truncate max-w-[100px]">
              {selectedCategory}
            </span>
          )}
        </div>
        {isLoading && (
          <div
            className="animate-spin"
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(109,93,246,0.3)',
              borderTopColor: '#6D5DF6',
              borderRadius: '50%',
            }}
          />
        )}
      </div>

      {/* Channel Search Input */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1E2A4A' }}>
        <div style={{ position: 'relative' }}>
          <FiSearch
            style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: '#6B7280', fontSize: '12px', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#1A2140',
              border: '1px solid #1E2A4A',
              borderRadius: '8px',
              paddingLeft: '28px',
              paddingRight: '10px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontSize: '12px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6D5DF6')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2A4A')}
          />
        </div>
      </div>

      {/* Empty state */}
      {filteredChannels.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: '#1A2140', border: '1px solid #1E2A4A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FiHeart style={{ fontSize: '24px', color: '#374151' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#B8C1EC', fontSize: '14px', fontWeight: 500 }}>No channels found</p>
            <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
              {searchQuery ? 'Try a different search term' : 'Select a different category'}
            </p>
          </div>
        </div>
      ) : (
        /* Virtualized channel list */
        <div
          ref={parentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '4px 6px',
            contain: 'strict',
            // Buttery smooth momentum scrolling
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
              willChange: 'transform',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const channel = filteredChannels[virtualItem.index];
              if (!channel) return null;
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    padding: '2px 0',
                  }}
                >
                  <ChannelRow
                    channel={channel}
                    isActive={currentChannel?.id === channel.id}
                    isFavorite={favoriteIds.has(channel.id)}
                    onSelect={handleSelectChannel}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
