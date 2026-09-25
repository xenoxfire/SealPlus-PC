import React, { useState } from 'react';
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
  Play
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
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch (e) {
      // Clipboard access fallback
      const input = document.getElementById('seal-url-input') as HTMLInputElement;
      if (input) input.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
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

  const sampleUrls = [
    { title: 'YouTube Test', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { title: 'SoundCloud Test', url: 'https://soundcloud.com' },
    { title: 'TikTok / X / FB', url: 'https://twitter.com' }
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 transition-all ${
      settings.glassEffect 
        ? 'bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-sky-950/30' 
        : 'bg-slate-900 border border-slate-800 shadow-xl'
    }`}>
      {/* Badge & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Smart Media Downloader
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
            yt-dlp v2026.08
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenBatch}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center space-x-1.5 font-medium py-1 px-2.5 rounded-lg hover:bg-sky-500/10"
        >
          <ListPlus className="w-3.5 h-3.5" />
          <span>Batch Download URLs</span>
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <input
            id="seal-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video or audio link here (YouTube, FB, Insta, TikTok, X, etc.)..."
            className="w-full pl-5 pr-28 py-4 sm:py-5 rounded-2xl bg-slate-950/70 border border-slate-800 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 text-white placeholder-slate-500 text-sm sm:text-base font-normal outline-none transition-all shadow-inner"
            disabled={isLoading}
          />

          <div className="absolute right-2 sm:right-3 flex items-center space-x-1">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="px-3 py-2 text-xs font-semibold text-sky-400 hover:text-sky-300 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 transition-all flex items-center space-x-1 border border-sky-500/20"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* Main Action: Configure & Download */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Formats & Info...</span>
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
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center space-x-2 border border-slate-700/80 transition-all active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Quick Download (Best)</span>
          </button>
        </div>
      </form>

      {/* Preset Chips */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Instant Presets:</span>
          </span>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: '1080', videoFormat: 'mp4' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Video className="w-3 h-3 text-sky-400" />
            <span>1080p MP4</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: '2160', videoFormat: 'mp4' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Video className="w-3 h-3 text-purple-400" />
            <span>4K / 2160p</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'audio', audioFormat: 'mp3', audioQuality: '320' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Music className="w-3 h-3 text-emerald-400" />
            <span>MP3 320k Audio</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'audio', audioFormat: 'm4a', audioQuality: '256' })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Music className="w-3 h-3 text-amber-400" />
            <span>M4A Lossless</span>
          </button>

          <button
            onClick={() => handleQuick({ mode: 'video', videoQuality: 'best', subtitles: true })}
            disabled={!url.trim() || isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Subtitles className="w-3 h-3 text-pink-400" />
            <span>With Subtitles</span>
          </button>
        </div>
      </div>

      {/* Supported Platforms ticker */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
        <span>Supports:</span>
        {['YouTube', 'Facebook', 'Instagram', 'Twitter / X', 'TikTok', 'Reddit', 'Twitch', 'SoundCloud', 'Vimeo', 'Bilibili', '1000+ sites'].map((site, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800/60 text-slate-400">
            {site}
          </span>
        ))}
      </div>
    </div>
  );
};
