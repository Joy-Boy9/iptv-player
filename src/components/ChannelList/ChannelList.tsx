// =============================================
// Channel List — High Performance, Clear & Ultra-Smooth
// =============================================

import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { FiHeart, FiTv, FiSearch, FiX, FiMenu } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useRecentStore } from '../../store/useRecentStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Channel } from '../../types';

// Optimal row height for high density + crystal clear channel names
const CHANNEL_ROW_HEIGHT = 62;

// ── Playing animation ─────────────────────────────────────────────────────
const PlayingBars: React.FC = React.memo(() => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', flexShrink: 0 }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{ width: '3px', background: '#6D5DF6', borderRadius: '2px' }}
        animate={{ height: ['4px', '14px', '4px'] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
));
PlayingBars.displayName = 'PlayingBars';

// ── Channel Logo ──────────────────────────────────────────────────────────
const ChannelLogo: React.FC<{ logo: string; name: string }> = React.memo(({ logo, name }) => {
  const [failed, setFailed] = React.useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
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
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ color: '#8B7DF8', fontSize: '11px', fontWeight: 700 }}>{initials}</span>
      )}
    </div>
  );
});
ChannelLogo.displayName = 'ChannelLogo';

// ── Resolution Badge ──────────────────────────────────────────────────────
const ResolutionBadge: React.FC<{ resolution?: string }> = React.memo(({ resolution }) => {
  if (!resolution) return null;
  const isHD = resolution.includes('1080') || resolution.includes('4K') || resolution.includes('720');
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 700,
        padding: '1px 5px',
        borderRadius: '4px',
        background: isHD ? 'rgba(109,93,246,0.18)' : 'rgba(44,55,102,0.4)',
        color: isHD ? '#8B7DF8' : '#6B7280',
        border: `1px solid ${isHD ? 'rgba(109,93,246,0.3)' : '#1E2A4A'}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {resolution}
    </span>
  );
});
ResolutionBadge.displayName = 'ResolutionBadge';

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
          gap: '9px',
          padding: '6px 10px',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'background 0.12s, border-color 0.12s',
          border: `1px solid ${isActive ? 'rgba(109,93,246,0.5)' : 'transparent'}`,
          background: isActive ? 'rgba(109,93,246,0.18)' : 'transparent',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: isActive ? 'inset 3px 0 0 #6D5DF6' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(44,55,102,0.5)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        {/* Channel Number */}
        <span
          style={{
            color: isActive ? '#FFFFFF' : '#6B7280',
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: isActive ? 700 : 500,
            background: isActive ? '#6D5DF6' : 'rgba(26,33,64,0.8)',
            border: `1px solid ${isActive ? 'rgba(109,93,246,0.6)' : '#1E2A4A'}`,
            borderRadius: '5px',
            padding: '2px 5px',
            minWidth: '28px',
            textAlign: 'center',
            flexShrink: 0,
            lineHeight: '1.2',
          }}
        >
          {channel.number}
        </span>

        {/* Logo */}
        <ChannelLogo logo={channel.logo} name={channel.name} />

        {/* Name + Group — Clear & Prominent */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p
            style={{
              color: isActive ? '#FFFFFF' : '#E2E8F0',
              fontSize: '13.5px',
              fontWeight: isActive ? 700 : 600,
              lineHeight: '1.3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
            title={channel.name}
          >
            {channel.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span
              style={{
                color: '#6B7280',
                fontSize: '10.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {channel.group || 'General'}
            </span>
            <ResolutionBadge resolution={channel.resolution} />
          </div>
        </div>

        {/* Right — Playing Animation + Favorite Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isActive && <PlayingBars />}
          <button
            onClick={(e) => onToggleFavorite(channel.id, e)}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isFavorite ? '#F87171' : '#4B5563',
              transition: 'color 0.12s',
              flexShrink: 0,
              lineHeight: 0,
            }}
            onMouseEnter={(e) => !isFavorite && ((e.currentTarget as HTMLButtonElement).style.color = '#F87171')}
            onMouseLeave={(e) => !isFavorite && ((e.currentTarget as HTMLButtonElement).style.color = '#4B5563')}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart
              style={{ fontSize: '13px' }}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    );
  }
);
ChannelRow.displayName = 'ChannelRow';

// ── Loading Skeleton ──────────────────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div style={{ padding: '8px' }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          marginBottom: '4px',
        }}
      >
        <div className="loading-skeleton" style={{ width: '28px', height: '16px', borderRadius: '4px' }} />
        <div className="loading-skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
        <div style={{ flex: 1 }}>
          <div className="loading-skeleton" style={{ height: '14px', width: '75%', borderRadius: '4px', marginBottom: '6px' }} />
          <div className="loading-skeleton" style={{ height: '10px', width: '45%', borderRadius: '4px' }} />
        </div>
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
  const { recentChannels, addToRecent } = useRecentStore();
  const { currentChannel, setCurrentChannel } = usePlayerStore();

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
      const isFilterEnabled = playlists.some((p) => p.id === selectedPlaylistFilter && p.enabled);
      if (isFilterEnabled) {
        list = list.filter((c) => c.playlistId === selectedPlaylistFilter);
      }
    }

    if (selectedCategory === 'favorites') {
      list = list.filter((c) => favoriteIds.has(c.id));
    } else if (selectedCategory === 'recent') {
      const recentIds = recentChannels.map((r) => r.channelId);
      const map = new Map(list.map((c) => [c.id, c]));
      return recentIds.map((id) => map.get(id)).filter((c): c is Channel => c !== undefined);
    } else if (selectedCategory !== 'all') {
      const groupExists = list.some((c) => c.group === selectedCategory);
      if (groupExists) {
        list = list.filter((c) => c.group === selectedCategory);
      }
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

  // High performance virtualizer with hardware acceleration overscan
  const virtualizer = useVirtualizer({
    count: filteredChannels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CHANNEL_ROW_HEIGHT,
    overscan: 20,
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

  // Scroll to active channel on mount
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

  // Loading state
  if (isLoading && filteredChannels.length === 0) {
    return (
      <div className="w-full md:w-[320px] flex-shrink-0 bg-[#0B1020] border-r border-[#1E2A4A] flex flex-col overflow-hidden h-full">
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="loading-skeleton" style={{ height: '16px', width: '100px', borderRadius: '4px' }} />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full md:w-[320px] flex-shrink-0 bg-[#0B1020] border-b md:border-b-0 md:border-r border-[#1E2A4A] flex flex-col overflow-hidden h-full min-h-0">
      {/* Clean Compact Header Strip with Three-Lines Menu Button */}
      <div
        style={{
          padding: '4px 10px',
          borderBottom: '1px solid #1E2A4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0D1428',
          flexShrink: 0,
          height: '34px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {/* Three Lines Menu Button beside channel count */}
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Hide Categories" : "Show Categories"}
            style={{
              background: '#1A2140',
              border: '1px solid #1E2A4A',
              color: '#B8C1EC',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              flexShrink: 0,
            }}
          >
            <FiMenu style={{ fontSize: '13px', color: '#B8C1EC' }} />
          </button>
          <FiTv style={{ color: '#6D5DF6', fontSize: '13px', flexShrink: 0 }} />
          <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>
            {filteredChannels.length} <span style={{ color: '#6B7280', fontWeight: 400 }}>channels</span>
          </span>
          {selectedCategory !== 'all' && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(109,93,246,0.2)',
                color: '#8B7DF8',
                maxWidth: '90px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedCategory}
            </span>
          )}
        </div>

        {isLoading && (
          <div
            className="animate-spin"
            style={{
              width: '12px',
              height: '12px',
              border: '2px solid rgba(109,93,246,0.3)',
              borderTopColor: '#6D5DF6',
              borderRadius: '50%',
            }}
          />
        )}
      </div>

      {/* Sleek Compact Relocated Search Input */}
      <div style={{ padding: '4px 8px', borderBottom: '1px solid #1E2A4A', background: '#0B1020', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <FiSearch
            style={{
              position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
              color: '#6B7280', fontSize: '11px', pointerEvents: 'none',
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
              borderRadius: '6px',
              paddingLeft: '26px',
              paddingRight: searchQuery ? '24px' : '8px',
              height: '28px',
              fontSize: '11.5px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '2px',
              }}
            >
              <FiX style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
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
              width: '48px', height: '48px', borderRadius: '14px',
              background: '#1A2140', border: '1px solid #1E2A4A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FiHeart style={{ fontSize: '20px', color: '#4B5563' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#B8C1EC', fontSize: '13px', fontWeight: 600 }}>No channels found</p>
            <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '3px' }}>
              {searchQuery ? 'Try a different search query' : 'Select another category'}
            </p>
          </div>
        </div>
      ) : (
        /* Ultra-Smooth Virtualized Channel List */
        <div
          ref={parentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '3px 5px',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            contain: 'content',
            willChange: 'transform',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
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
                    transform: `translate3d(0, ${virtualItem.start}px, 0)`,
                    willChange: 'transform',
                    padding: '2px 0',
                    boxSizing: 'border-box',
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
