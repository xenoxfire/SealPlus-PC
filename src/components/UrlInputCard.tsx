import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Settings2, 
  Clipboard, 
  X, 
  Sparkles, 
  Music, 
  Video, 
  Subtitles, 
  Zap, 
  Loader2,
  CheckCircle2,
  ListPlus,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppSettings } from '../types/seal';

interface UrlInputCardProps {
  settings: AppSettings;
  onFetchAndConfigure: (url: string) => void;
  onQuickDownload: (url: string, preset?: any) => void;
  isLoading: boolean;
  onOpenBatch: () => void;
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
  settings,
  onFetchAndConfigure,
  onQuickDownload,
  isLoading,
  onOpenBatch
}) => {
  const [url, setUrl] = useState('');
  const [autoPasteEnabled, setAutoPasteEnabled] = useState(true);
  const [pasteNotification, setPasteNotification] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to test if string is a web URL
  const isValidUrl = (text: string) => {
    try {
      const trimmed = text.trim();
      return trimmed.startsWith('http://') || trimmed.startsWith('https://');
    } catch {
      return false;
    }
  };

  // Auto-detect and paste clipboard content
  const checkClipboardAndAutoPaste = async () => {
    if (!autoPasteEnabled) return;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && isValidUrl(clipText) && clipText.trim() !== url.trim()) {
          setUrl(clipText.trim());
          setPasteNotification('Link auto-detected & pasted from PC clipboard!');
          setTimeout(() => setPasteNotification(null), 3000);
        }
      }
    } catch {
      // Browser might block background clipboard reading without user gesture
    }
  };

  // Listen for window focus, visibility change, and global Ctrl+V
  useEffect(() => {
    const handleFocus = () => {
      checkClipboardAndAutoPaste();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkClipboardAndAutoPaste();
      }
    };

    const handleGlobalPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && isValidUrl(text)) {
        setUrl(text.trim());
        setPasteNotification('Link auto-pasted via Ctrl+V!');
        setTimeout(() => setPasteNotification(null), 3000);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('paste', handleGlobalPaste);

    // Initial check on mount
    checkClipboardAndAutoPaste();

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [autoPasteEnabled, url]);

  const handleManualPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setPasteNotification('Pasted from clipboard!');
          setTimeout(() => setPasteNotification(null), 2500);
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard readText failed, prompting user', err);
    }

    // Fallback: prompt or focus input
    const manualPrompt = window.prompt('Paste your video or audio link here:');
    if (manualPrompt && manualPrompt.trim()) {
      setUrl(manualPrompt.trim());
      setPasteNotification('Link added!');
      setTimeout(() => setPasteNotification(null), 2500);
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onFetchAndConfigure(url.trim());
  };

  const handleQuick = (preset?: any) => {
    if (!url.trim()) return;
    onQuickDownload(url.trim(), preset);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 transition-all ${
      settings.glassEffect 
        ? 'bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-sky-950/30' 
        : 'bg-slate-900 border border-slate-800 shadow-xl'
    }`}>
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Real Media Downloader
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>MP4 / MP3 Video & Audio (No HTML)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Auto-paste toggle */}
          <button
            type="button"
            onClick={() => setAutoPasteEnabled(!autoPasteEnabled)}
            className={`text-xs px-2.5 py-1 rounded-xl transition-all border flex items-center space-x-1 ${
              autoPasteEnabled 
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto-detect and paste links from PC clipboard on focus"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoPasteEnabled ? 'bg-sky-400' : 'bg-slate-500'}`} />
            <span>Auto-Paste: {autoPasteEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatch}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1.5 font-medium py-1 px-2.5 rounded-lg hover:bg-purple-500/10"
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Batch URLs</span>
          </button>
        </div>
      </div>

      {/* Auto Paste Toast Notification */}
      {pasteNotification && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs flex items-center space-x-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{pasteNotification}</span>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            id="seal-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video/audio URL here or press Ctrl+V anywhere..."
            className="w-full pl-5 pr-28 py-4 sm:py-5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 text-white placeholder-slate-500 text-sm sm:text-base font-normal outline-none transition-all shadow-inner"
            disabled={isLoading}
          />

          <div className="absolute right-2 sm:right-3 flex items-center space-x-1.5">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Clear link"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleManualPaste}
              className="px-3.5 py-2 text-xs font-semibold text-white rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all flex items-center space-x-1.5 shadow-md shadow-sky-500/20"
              title="Paste URL from Clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Main Action: Configure & Download */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Video Formats...</span>
              </>
            ) : (
              <>
                <Settings2 className="w-4 h-4" />
                <span>Configure & Format...</span>
              </>
            )}
          </button>

          {/* Quick Download with Defaults */}
          <button
            type="button"
            onClick={() => handleQuick()}
            disabled={!url.trim() || isLoading}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center space-x-2 border border-slate-700/80 transition-all active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Quick Download (Best Video MP4)</span>
          </button>
        </div>
      </form>

      {/* Preset Chips */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Instant Presets:</span>
          </span>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: '1080', videoFormat: 'mp4' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Video className="w-3 h-3 text-sky-400" />
            <span>1080p MP4</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: '2160', videoFormat: 'mp4' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Video className="w-3 h-3 text-purple-400" />
            <span>4K UHD MP4</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'audio', audioFormat: 'mp3', audioQuality: '320' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Music className="w-3 h-3 text-emerald-400" />
            <span>MP3 (320k Audio)</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'audio', audioFormat: 'm4a', audioQuality: '256' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Music className="w-3 h-3 text-amber-400" />
            <span>M4A AAC</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: 'best', subtitles: true })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Subtitles className="w-3 h-3 text-pink-400" />
            <span>With Subtitles</span>
          </button>
        </div>
      </div>

      {/* Confirmation of Real Video/Audio */}
      <div className="mt-3.5 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Downloads real playable video files (<code className="text-sky-300 font-mono">.mp4</code>, <code className="text-emerald-300 font-mono">.mp3</code>, etc.), never HTML or text.</span>
        </span>
        <span className="hidden sm:inline text-slate-500 font-mono">Auto-saved to Downloads folder</span>
      </div>
    </div>
  );
};
