// =============================================
// Settings Dialog
// =============================================

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiUpload, FiTrash2 } from 'react-icons/fi';
import { useUIStore } from '../../store/useUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useRecentStore } from '../../store/useRecentStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { storage } from '../../utils/storage';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-white text-sm font-medium">{label}</p>
      {description && <p className="text-text-muted text-xs mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-accent' : 'bg-bg-hover'
      }`}
      style={{ height: '22px', width: '40px' }}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow"
        style={{ width: '18px', height: '18px' }}
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen } = useUIStore();
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettingsStore();
  const { clearRecent } = useRecentStore();
  const { clearFavorites } = useFavoritesStore();

  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iptv-player-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      importSettings(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && setSettingsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="bg-bg-sidebar border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h2 className="text-white font-bold text-lg">Settings</h2>
            <button onClick={() => setSettingsOpen(false)} className="btn-ghost p-1.5 rounded-lg">
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 divide-y divide-border">
            {/* Playback Section */}
            <div className="py-3">
              <h3 className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Playback</h3>
              <Toggle
                checked={settings.autoplay}
                onChange={(v) => updateSetting('autoplay', v)}
                label="Autoplay"
                description="Automatically start playing when a channel is selected"
              />
              <Toggle
                checked={settings.rememberLastChannel}
                onChange={(v) => updateSetting('rememberLastChannel', v)}
                label="Remember Last Channel"
                description="Resume the last watched channel on app start"
              />
              <Toggle
                checked={settings.hardwareAcceleration}
                onChange={(v) => updateSetting('hardwareAcceleration', v)}
                label="Hardware Acceleration"
                description="Use GPU for smoother video playback"
              />
            </div>

            {/* Volume */}
            <div className="py-3">
              <h3 className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">Audio</h3>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium">Default Volume</p>
                  <span className="text-accent font-mono text-sm">{settings.defaultVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.defaultVolume}
                  onChange={(e) => updateSetting('defaultVolume', Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            {/* Data */}
            <div className="py-3">
              <h3 className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">Data</h3>
              <div className="space-y-2">
                <button
                  onClick={clearRecent}
                  className="w-full flex items-center gap-2 py-2.5 px-3 bg-bg-card hover:bg-bg-hover border border-border rounded-lg text-sm text-text-secondary hover:text-white transition-all"
                >
                  <FiTrash2 className="text-sm" />
                  Clear Watch History
                </button>
                <button
                  onClick={clearFavorites}
                  className="w-full flex items-center gap-2 py-2.5 px-3 bg-bg-card hover:bg-bg-hover border border-border rounded-lg text-sm text-text-secondary hover:text-white transition-all"
                >
                  <FiTrash2 className="text-sm" />
                  Clear All Favorites
                </button>
                <button
                  onClick={() => {
                    storage.clear();
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-2 py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:text-red-300 transition-all"
                >
                  <FiTrash2 className="text-sm" />
                  Clear All Data & Reset
                </button>
              </div>
            </div>

            {/* Import/Export */}
            <div className="py-3">
              <h3 className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">Backup</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 py-2.5 bg-bg-card hover:bg-bg-hover border border-border rounded-lg text-sm text-text-secondary hover:text-white transition-all"
                >
                  <FiDownload className="text-sm" />
                  Export
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 bg-bg-card hover:bg-bg-hover border border-border rounded-lg text-sm text-text-secondary hover:text-white transition-all"
                >
                  <FiUpload className="text-sm" />
                  Import
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              </div>
            </div>

            {/* Reset */}
            <div className="py-3">
              <button
                onClick={resetSettings}
                className="w-full py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:text-white transition-all hover:border-accent"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <p className="text-text-muted text-xs text-center">IPTV Player v1.0.0 — 100% Client-side</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
