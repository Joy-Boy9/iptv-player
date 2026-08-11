// =============================================
// Playlist Manager Dialog
// =============================================

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiUpload, FiTrash2, FiRefreshCw, FiEdit2, FiCheck, FiLink } from 'react-icons/fi';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useUIStore } from '../../store/useUIStore';

type Tab = 'add' | 'manage';

export const PlaylistManager: React.FC = () => {
  const { isPlaylistManagerOpen, setPlaylistManagerOpen } = useUIStore();
  const { playlists, addPlaylist, addPlaylistFromFile, removePlaylist, togglePlaylist, refreshPlaylist, isLoading, loadingPlaylistId } = usePlaylistStore();

  const [tab, setTab] = useState<Tab>('add');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = useCallback(async () => {
    if (!name.trim()) { setError('Playlist name is required'); return; }
    if (!url.trim()) { setError('URL is required'); return; }

    setError('');
    try {
      await addPlaylist({
        name: name.trim(),
        url: url.trim(),
        type: 'url',
        enabled: true,
        color: '#6D5DF6',
        icon: '📺',
      });
      setSuccess(`Playlist "${name}" added successfully!`);
      setName('');
      setUrl('');
      setTimeout(() => { setSuccess(''); setTab('manage'); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add playlist');
    }
  }, [name, url, addPlaylist]);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      const fileName = file.name.replace('.m3u', '').replace('.m3u8', '');
      const playlistName = name.trim() || fileName;

      try {
        await addPlaylistFromFile(playlistName, content);
        setSuccess(`File "${playlistName}" imported!`);
        setTimeout(() => { setSuccess(''); setTab('manage'); }, 1500);
      } catch (err) {
        setError('Failed to parse M3U file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [name, addPlaylistFromFile]);

  const handleClose = () => {
    setPlaylistManagerOpen(false);
    setError('');
    setSuccess('');
    setName('');
    setUrl('');
  };

  if (!isPlaylistManagerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="bg-bg-sidebar border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-white font-bold text-lg">Playlist Manager</h2>
            <button onClick={handleClose} className="btn-ghost p-1.5 rounded-lg">
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-5 gap-4">
            {(['add', 'manage'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  tab === t
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
              >
                {t === 'add' ? '+ Add Playlist' : `Manage (${playlists.length})`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-5">
            {tab === 'add' ? (
              <div className="space-y-4">
                {/* Messages */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3">
                    {success}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Playlist Name</label>
                  <input
                    type="text"
                    placeholder="My Playlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">M3U URL</label>
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input
                      type="url"
                      placeholder="https://example.com/playlist.m3u"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="input-field w-full text-sm pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddUrl}
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Import from URL
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-text-muted text-xs">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 border border-dashed border-border hover:border-accent text-text-secondary hover:text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <FiUpload />
                  Import M3U File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-8">No playlists added yet</p>
                ) : (
                  playlists.map((pl) => (
                    <div
                      key={pl.id}
                      className="flex items-center gap-3 p-3 bg-bg-card rounded-lg border border-border"
                    >
                      {/* Enable toggle */}
                      <button
                        onClick={() => togglePlaylist(pl.id)}
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          pl.enabled ? 'bg-accent border-accent' : 'border-text-muted'
                        }`}
                      >
                        {pl.enabled && <FiCheck className="text-white text-xs" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {editingId === pl.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                usePlaylistStore.getState().renamePlaylist(pl.id, editName);
                                setEditingId(null);
                              }
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="bg-bg-primary border border-accent rounded px-2 py-0.5 text-sm text-white w-full"
                            autoFocus
                          />
                        ) : (
                          <p className="text-white text-sm font-medium truncate">{pl.name}</p>
                        )}
                        <p className="text-text-muted text-xs truncate">
                          {pl.channelCount} channels • {pl.type === 'local' ? 'Local file' : 'URL'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(pl.id); setEditName(pl.name); }}
                          className="p-1.5 text-text-muted hover:text-white rounded transition-colors"
                          title="Rename"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                        {pl.type === 'url' && (
                          <button
                            onClick={() => refreshPlaylist(pl.id)}
                            disabled={isLoading && loadingPlaylistId === pl.id}
                            className="p-1.5 text-text-muted hover:text-accent rounded transition-colors"
                            title="Refresh"
                          >
                            <FiRefreshCw className={`text-xs ${isLoading && loadingPlaylistId === pl.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => removePlaylist(pl.id)}
                          className="p-1.5 text-text-muted hover:text-red-400 rounded transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
