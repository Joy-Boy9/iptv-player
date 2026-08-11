// =============================================
// Sidebar — improved design, full category names
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
  FiSettings,
  FiList,
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
  const { selectedCategory, setSelectedCategory, selectedPlaylistFilter, setSelectedPlaylistFilter, setSettingsOpen, setPlaylistManagerOpen } = useUIStore();
  const { playlists, channels, togglePlaylist, refreshPlaylist, isLoading, loadingPlaylistId } = usePlaylistStore();
  const { favoriteIds } = useFavoritesStore();
  const { recentChannels } = useRecentStore();

  const [categorySearch, setCategorySearch] = useState('');
  const [showPlaylists, setShowPlaylists] = useState(true);

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

  return (
    <aside
      style={{
        width: '185px',
        flexShrink: 0,
        background: '#12192E',
        borderRight: '1px solid #1E2A4A',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Category Search + Quick Actions */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1E2A4A', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch
            style={{
              position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
              color: '#6B7280', fontSize: '11px', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Category..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            style={{
              width: '100%',
              background: '#1A2140',
              border: '1px solid #1E2A4A',
              borderRadius: '8px',
              paddingLeft: '22px',
              paddingRight: '6px',
              paddingTop: '5px',
              paddingBottom: '5px',
              fontSize: '11.5px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6D5DF6')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2A4A')}
          />
        </div>

        {/* Playlist Manager */}
        <button
          onClick={() => setPlaylistManagerOpen(true)}
          title="Playlist Manager"
          style={{
            background: '#1A2140',
            border: '1px solid #1E2A4A',
            borderRadius: '8px',
            padding: '5px',
            color: '#B8C1EC',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2C3766'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1A2140'; e.currentTarget.style.color = '#B8C1EC'; }}
        >
          <FiList style={{ fontSize: '13px' }} />
        </button>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          style={{
            background: '#1A2140',
            border: '1px solid #1E2A4A',
            borderRadius: '8px',
            padding: '5px',
            color: '#B8C1EC',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2C3766'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1A2140'; e.currentTarget.style.color = '#B8C1EC'; }}
        >
          <FiSettings style={{ fontSize: '13px' }} />
        </button>
      </div>

      {/* Scrollable Category List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {/* Main sections */}
        {sectionItems.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 8px',
                borderRadius: '7px',
                cursor: 'pointer',
                border: 'none',
                background: active ? 'rgba(109,93,246,0.18)' : 'transparent',
                color: active ? '#FFFFFF' : '#B8C1EC',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => !active && ((e.currentTarget as HTMLButtonElement).style.background = '#2C3766')}
              onMouseLeave={(e) => !active && ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              <span style={{ fontSize: '13px', flexShrink: 0, color: active ? '#6D5DF6' : 'inherit' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: active ? 600 : 400, flex: 1, textAlign: 'left' }}>
                {item.label}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: active ? 'rgba(109,93,246,0.3)' : '#1A2140',
                  color: active ? '#8B7DF8' : '#6B7280',
                  flexShrink: 0,
                }}
              >
                {item.count}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: '#1E2A4A', margin: '6px 4px' }} />

        {/* Dynamic categories */}
        {filteredCategories.map((cat) => {
          const iconKey = getCategoryIcon(cat.name);
          const icon = CATEGORY_ICONS[iconKey] || <FiGrid />;
          const active = isActive(cat.name);

          return (
            <motion.button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              whileHover={{ x: active ? 0 : 2 }}
              transition={{ duration: 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '4px 8px',
                borderRadius: '7px',
                cursor: 'pointer',
                border: 'none',
                background: active ? 'rgba(109,93,246,0.18)' : 'transparent',
                color: active ? '#FFFFFF' : '#B8C1EC',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => !active && ((e.currentTarget as HTMLButtonElement).style.background = '#2C3766')}
              onMouseLeave={(e) => !active && ((e.currentTarget as HTMLButtonElement).style.background = active ? 'rgba(109,93,246,0.18)' : 'transparent')}
            >
              <span style={{ fontSize: '13px', flexShrink: 0, color: active ? '#6D5DF6' : '#6B7280' }}>
                {icon}
              </span>
              {/* Full category name — no truncation */}
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: active ? 600 : 400,
                  flex: 1,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {cat.name}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: active ? 'rgba(109,93,246,0.3)' : '#1A2140',
                  color: active ? '#8B7DF8' : '#6B7280',
                  flexShrink: 0,
                }}
              >
                {cat.count}
              </span>
            </motion.button>
          );
        })}

        {filteredCategories.length === 0 && categorySearch && (
          <p style={{ color: '#6B7280', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
            No categories found
          </p>
        )}
      </div>

      {/* Bottom — Playlists */}
      <div style={{ borderTop: '1px solid #1E2A4A' }}>
        <button
          onClick={() => setShowPlaylists(!showPlaylists)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#B8C1EC',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Playlists
          </span>
          {showPlaylists
            ? <FiChevronDown style={{ fontSize: '13px' }} />
            : <FiChevronRight style={{ fontSize: '13px' }} />
          }
        </button>

        <AnimatePresence>
          {showPlaylists && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '2px 8px 6px', maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() =>
                      setSelectedPlaylistFilter(selectedPlaylistFilter === pl.id ? null : pl.id)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '5px 6px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      background: selectedPlaylistFilter === pl.id ? 'rgba(109,93,246,0.15)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => selectedPlaylistFilter !== pl.id && ((e.currentTarget as HTMLDivElement).style.background = '#1A2140')}
                    onMouseLeave={(e) => selectedPlaylistFilter !== pl.id && ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePlaylist(pl.id); }}
                      style={{
                        width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0,
                        border: pl.enabled ? '2px solid #6D5DF6' : '2px solid #4B5563',
                        background: pl.enabled ? '#6D5DF6' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {pl.enabled && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span style={{ fontSize: '11px', color: '#B8C1EC', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pl.name}
                    </span>
                    {isLoading && loadingPlaylistId === pl.id ? (
                      <FiRefreshCw style={{ fontSize: '11px', color: '#6D5DF6', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                    ) : pl.type === 'url' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); refreshPlaylist(pl.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '0', flexShrink: 0 }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#B8C1EC')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#4B5563')}
                      >
                        <FiRefreshCw style={{ fontSize: '11px' }} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Add / Import */}
              <div style={{ display: 'flex', gap: '6px', padding: '4px 8px 8px' }}>
                {[
                  { label: 'Add', icon: <FiPlusCircle style={{ fontSize: '11px' }} />, onClick: onAddPlaylist },
                  { label: 'Import', icon: <FiUpload style={{ fontSize: '11px' }} />, onClick: onImportFile },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      padding: '5px 0',
                      background: '#1A2140', border: '1px solid #1E2A4A', borderRadius: '7px',
                      color: '#B8C1EC', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2C3766'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1A2140'; (e.currentTarget as HTMLButtonElement).style.color = '#B8C1EC'; }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Total channels footer */}
      <div style={{ padding: '6px 12px 8px', borderTop: '1px solid #1E2A4A' }}>
        <p style={{ color: '#6B7280', fontSize: '11px' }}>
          Total: <span style={{ color: '#6D5DF6', fontWeight: 700 }}>{allChannels.length}</span> channels
        </p>
      </div>
    </aside>
  );
};
