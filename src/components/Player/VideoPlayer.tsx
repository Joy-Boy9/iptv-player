// =============================================
// Video Player Component - YouTube-style fullscreen + improved design
// =============================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiRefreshCw,
  FiHeart,
  FiShare2,
  FiCopy,
  FiMonitor,
} from 'react-icons/fi';
import { MdPictureInPicture } from 'react-icons/md';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';

// ── Fullscreen-aware controls bar ──────────────────────────────────────────
interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  channelName?: string;
  channelGroup?: string;
  channelLogo?: string;
  channelResolution?: string;
  watchTime: number;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (v: number) => void;
  onFullscreen: () => void;
  onPiP: () => void;
  onReload: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  channelName,
  channelGroup,
  channelLogo,
  channelResolution,
  watchTime,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullscreen,
  onPiP,
  onReload,
}) => (
  <div
    className="absolute bottom-0 left-0 right-0 z-20"
    style={{
      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
      paddingTop: '48px',
    }}
  >
    {/* Channel info row (visible in fullscreen) */}
    {isFullscreen && channelName && (
      <div className="flex items-center gap-3 px-5 pb-2">
        {channelLogo && (
          <img
            src={channelLogo}
            alt={channelName}
            className="w-8 h-8 object-contain rounded"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div>
          <p className="text-white font-bold text-base leading-tight">{channelName}</p>
          <p className="text-white/60 text-xs">{channelGroup}</p>
        </div>
        {channelResolution && (
          <span className="ml-2 text-xs bg-white/15 text-white px-2 py-0.5 rounded font-semibold">
            {channelResolution}
          </span>
        )}
        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
          LIVE
        </div>
      </div>
    )}

    {/* Watch time */}
    <div className="px-5 pb-1">
      <p className="text-white/50 text-xs font-mono">{formatTime(watchTime)}</p>
    </div>

    {/* Controls row */}
    <div className="flex items-center gap-3 px-4 pb-4">
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="text-white hover:text-[#6D5DF6] transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying
          ? <FiPause style={{ fontSize: isFullscreen ? '28px' : '22px' }} />
          : <FiPlay style={{ fontSize: isFullscreen ? '28px' : '22px' }} />
        }
      </button>

      {/* Volume section */}
      <div className="flex items-center gap-2 group">
        <button
          onClick={onMuteToggle}
          className="text-white hover:text-[#6D5DF6] transition-colors p-1 rounded-full hover:bg-white/10"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0
            ? <FiVolumeX style={{ fontSize: '20px' }} />
            : <FiVolume2 style={{ fontSize: '20px' }} />
          }
        </button>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ width: '80px' }}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '4px',
              appearance: 'none',
              cursor: 'pointer',
              accentColor: '#6D5DF6',
              background: `linear-gradient(to right, #6D5DF6 ${isMuted ? 0 : volume}%, rgba(255,255,255,0.25) ${isMuted ? 0 : volume}%)`,
            }}
            aria-label="Volume"
          />
        </div>
        <span className="text-white/50 text-xs w-8 font-mono">{isMuted ? 0 : volume}%</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reload */}
      <button
        onClick={onReload}
        className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
        aria-label="Reload stream"
        title="Reload stream"
      >
        <FiRefreshCw style={{ fontSize: '16px' }} />
      </button>

      {/* PiP */}
      <button
        onClick={onPiP}
        className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
        aria-label="Picture in Picture"
        title="Picture in Picture"
      >
        <MdPictureInPicture style={{ fontSize: '18px' }} />
      </button>

      {/* Fullscreen */}
      <button
        onClick={onFullscreen}
        className="text-white hover:text-[#6D5DF6] transition-colors p-1.5 rounded-full hover:bg-white/10"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {isFullscreen
          ? <FiMinimize style={{ fontSize: '20px' }} />
          : <FiMaximize style={{ fontSize: '20px' }} />
        }
      </button>
    </div>
  </div>
);

// ── Main VideoPlayer ────────────────────────────────────────────────────────
export const VideoPlayer: React.FC = () => {
  const {
    currentChannel,
    isPlaying,
    isMuted,
    volume,
    isFullscreen,
    isLoading,
    error,
    retryCount,
    setIsPlaying,
    setIsMuted,
    setVolume,
    setIsFullscreen,
    setIsLoading,
    setError,
    incrementRetry,
    resetRetry,
    toggleMute,
  } = usePlayerStore();

  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isCursorHidden, setIsCursorHidden] = useState(false);

  // ── Load HLS stream ──────────────────────────────────────────────────────
  const loadStream = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 15,
        maxMaxBufferLength: 30,
        maxBufferSize: 20 * 1024 * 1024,
        capLevelToPlayerSize: true,
        capLevelOnFPSDrop: true,
        enableAudioWorklet: true,
        abrEwmaDefaultEstimate: 5000000,
        abrBandWidthFactor: 0.95,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 6,
        levelLoadingMaxRetry: 6,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(`Stream error: ${data.details || 'Unknown error'}`);
          setIsLoading(false);
          setIsPlaying(false);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
      setIsLoading(false);
    } else {
      video.src = url;
      video.play().catch((e) => {
        setError(`Playback not supported: ${e.message}`);
        setIsPlaying(false);
      });
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setIsPlaying]);

  // Channel change → reload stream
  useEffect(() => {
    if (currentChannel) {
      loadStream(currentChannel.url);
      setWatchTime(0);
    }
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [currentChannel?.id, loadStream]);

  // Sync volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Watch timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) setWatchTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Fullscreen change sync
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setIsFullscreen]);

  // Controls auto-hide (YouTube style)
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    setIsCursorHidden(false);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        if (isFullscreen) setIsCursorHidden(true);
      }, 3000);
    }
  }, [isPlaying, isFullscreen]);

  // Pause → always show controls
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      setIsCursorHidden(false);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); }
    else { video.play().catch(() => setIsPlaying(false)); setIsPlaying(true); }
  }, [isPlaying, setIsPlaying]);

  const handleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      // Request fullscreen on the entire document — true F11-style like YouTube
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const handlePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch { /* not supported */ }
  }, []);

  const handleReload = useCallback(() => {
    if (currentChannel) { resetRetry(); loadStream(currentChannel.url); }
  }, [currentChannel, loadStream, resetRetry]);

  const handleRetry = useCallback(() => {
    incrementRetry(); handleReload();
  }, [handleReload, incrementRetry]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  }, [setVolume, isMuted, setIsMuted]);

  const handleCopyUrl = useCallback(() => {
    if (currentChannel) {
      navigator.clipboard.writeText(currentChannel.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [currentChannel]);

  const handleShare = useCallback(() => {
    if (currentChannel && navigator.share) {
      navigator.share({ title: currentChannel.name, text: `Watch ${currentChannel.name}`, url: currentChannel.url });
    }
  }, [currentChannel]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); handlePlayPause(); showControlsTemporarily(); break;
        case 'f': case 'F': e.preventDefault(); handleFullscreen(); break;
        case 'm': case 'M': e.preventDefault(); toggleMute(); showControlsTemporarily(); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(100, volume + 5)); showControlsTemporarily(); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 5)); showControlsTemporarily(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, isFullscreen, volume, handlePlayPause, handleFullscreen, toggleMute, setVolume, showControlsTemporarily]);

  const isFavorite = currentChannel ? favoriteIds.has(currentChannel.id) : false;

  return (
    <div className="flex-1 flex flex-col bg-[#0B1020] overflow-hidden min-w-0">

      {/* ── VIDEO AREA ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative bg-black overflow-hidden flex-shrink-0"
        style={
          isFullscreen
            ? {
                // True YouTube / F11-style fullscreen: fixed overlay covering entire viewport
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                cursor: isCursorHidden ? 'none' : 'default',
              }
            : {
                width: '100%',
                aspectRatio: '16/9',
                cursor: 'default',
              }
        }
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => {
          if (isPlaying) {
            controlsTimerRef.current = setTimeout(() => {
              setShowControls(false);
              if (isFullscreen) setIsCursorHidden(true);
            }, 1000);
          }
        }}
        onClick={handlePlayPause}
      >

        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          style={{
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
          playsInline
          autoPlay
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setError('Playback error. Stream may be unavailable.');
            setIsLoading(false);
            setIsPlaying(false);
          }}
        />

        {/* No Channel placeholder */}
        {!currentChannel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#12192E]">
            <div className="w-20 h-20 rounded-2xl bg-[#1A2140] border border-[#1E2A4A] flex items-center justify-center mb-4">
              <FiMonitor style={{ fontSize: '40px', color: '#4B5563' }} />
            </div>
            <p className="text-white font-semibold text-base">Select a channel to watch</p>
            <p className="text-[#6B7280] text-sm mt-1">Choose from the channel list</p>
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && currentChannel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"
            >
              <div className="flex flex-col items-center gap-3">
                {currentChannel.logo && (
                  <img src={currentChannel.logo} alt="" className="w-12 h-12 object-contain rounded opacity-50 mb-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
                <div
                  className="rounded-full border-4 animate-spin"
                  style={{
                    width: '48px', height: '48px',
                    borderColor: 'rgba(109,93,246,0.25)',
                    borderTopColor: '#6D5DF6',
                  }}
                />
                <p className="text-white text-sm font-medium">{currentChannel.name}</p>
                <p className="text-white/50 text-xs">Loading stream…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {error && currentChannel && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 z-10"
            >
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
                  <span style={{ fontSize: '28px' }}>📡</span>
                </div>
                <p className="text-white font-bold mb-1 text-base">Stream Unavailable</p>
                <p className="text-white/60 text-sm mb-5">{error}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <FiRefreshCw />
                  Retry{retryCount > 0 ? ` (${retryCount})` : ''}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIVE badge (normal mode) */}
        {currentChannel && isPlaying && !error && !isFullscreen && (
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-white text-xs font-bold px-2.5 py-1 rounded"
            style={{ background: '#DC2626' }}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
            LIVE
          </div>
        )}

        {/* YouTube-style controls overlay */}
        <AnimatePresence>
          {(showControls || !isPlaying) && currentChannel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-auto absolute bottom-0 left-0 right-0">
                <PlayerControls
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  volume={volume}
                  isFullscreen={isFullscreen}
                  channelName={currentChannel.name}
                  channelGroup={currentChannel.group}
                  channelLogo={currentChannel.logo}
                  channelResolution={currentChannel.resolution}
                  watchTime={watchTime}
                  onPlayPause={handlePlayPause}
                  onMuteToggle={toggleMute}
                  onVolumeChange={handleVolumeChange}
                  onFullscreen={handleFullscreen}
                  onPiP={handlePiP}
                  onReload={handleReload}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CHANNEL INFO PANEL ─────────────────────────────────────────── */}
      {currentChannel ? (
        <div className="flex-1 overflow-y-auto min-h-0" style={{ background: '#12192E' }}>
          {/* Channel header strip */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: '#1E2A4A' }}
          >
            {/* Logo */}
            {currentChannel.logo && (
              <div
                className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border"
                style={{ background: '#1A2140', borderColor: '#1E2A4A' }}
              >
                <img
                  src={currentChannel.logo}
                  alt={currentChannel.name}
                  className="w-full h-full object-contain"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base leading-tight truncate">
                {currentChannel.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[#6B7280] text-xs">{currentChannel.group}</span>
                {currentChannel.resolution && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: 'rgba(109,93,246,0.2)', color: '#8B7DF8', border: '1px solid rgba(109,93,246,0.3)' }}
                  >
                    {currentChannel.resolution}
                  </span>
                )}
                {isPlaying && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                    style={{ background: 'rgba(220,38,38,0.2)', color: '#F87171', border: '1px solid rgba(220,38,38,0.3)' }}
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" />
                    Live
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => toggleFavorite(currentChannel.id)}
                className="p-2 rounded-lg transition-colors"
                style={isFavorite
                  ? { background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }
                  : { background: '#1A2140', color: '#B8C1EC', border: '1px solid #1E2A4A' }
                }
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart fill={isFavorite ? 'currentColor' : 'none'} style={{ fontSize: '14px' }} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleShare}
                className="p-2 rounded-lg transition-colors"
                style={{ background: '#1A2140', color: '#B8C1EC', border: '1px solid #1E2A4A' }}
                title="Share"
              >
                <FiShare2 style={{ fontSize: '14px' }} />
              </motion.button>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-px border-b"
            style={{ background: '#1E2A4A', borderColor: '#1E2A4A' }}
          >
            {[
              { label: 'Watch Time', value: formatTime(watchTime) },
              {
                label: 'Status',
                value: isPlaying ? '● Live' : error ? '✕ Error' : '⏸ Paused',
                color: isPlaying ? '#4ADE80' : error ? '#F87171' : '#FBBF24',
              },
              { label: 'Channel #', value: `#${currentChannel.number}` },
            ].map((stat) => (
              <div key={stat.label} className="py-2.5 px-3" style={{ background: '#12192E' }}>
                <p className="text-[#6B7280] text-xs mb-0.5">{stat.label}</p>
                <p
                  className="text-sm font-semibold font-mono"
                  style={{ color: stat.color ?? 'white' }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Stream URL */}
          <div className="px-4 py-3 border-b" style={{ borderColor: '#1E2A4A' }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">Stream URL</p>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-xs transition-colors font-medium"
                style={{ color: copied ? '#4ADE80' : '#6D5DF6' }}
              >
                <FiCopy style={{ fontSize: '11px' }} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p
              className="text-xs font-mono truncate rounded px-2 py-1.5"
              style={{ background: '#0B1020', color: '#B8C1EC', border: '1px solid #1E2A4A' }}
            >
              {currentChannel.url}
            </p>
          </div>

          {/* EPG info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: '#1E2A4A' }}>
            <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider mb-2">Programme Guide</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#6D5DF6] text-xs font-semibold w-14">Playing</span>
                <span className="text-[#6B7280] text-xs">No EPG data available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#B8C1EC] text-xs font-semibold w-14">Next</span>
                <span className="text-[#6B7280] text-xs">No information available</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3">
            {[
              { label: 'EPG', emoji: '📅', onClick: () => {}, danger: false },
              { label: 'Record', emoji: '🔴', onClick: () => {}, danger: true },
              { label: 'Refresh', emoji: null, icon: <FiRefreshCw style={{ fontSize: '13px' }} />, onClick: handleReload, danger: false },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={btn.danger
                  ? { background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }
                  : { background: '#1A2140', color: '#B8C1EC', border: '1px solid #1E2A4A' }
                }
              >
                {btn.emoji && <span>{btn.emoji}</span>}
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ background: '#12192E' }}>
          <p className="text-[#6B7280] text-sm">Select a channel to see details</p>
        </div>
      )}
    </div>
  );
};
