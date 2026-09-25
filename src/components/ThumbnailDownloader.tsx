import React, { useState } from 'react';
import { Image, Search, Download, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { AppSettings } from '../types/seal';

interface ThumbnailDownloaderProps {
  settings: AppSettings;
}

export const ThumbnailDownloader: React.FC<ThumbnailDownloaderProps> = ({ settings }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<{ title: string; thumbnails: any[] } | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setData(null);

    try {
      const info = await api.getVideoInfo(url.trim());
      
      // Collect thumbnails
      let thumbs = info.thumbnails || [];
      if (thumbs.length === 0 && info.thumbnail) {
        thumbs = [{ url: info.thumbnail, width: 1920, height: 1080, resolution: '1920x1080' }];
      }

      // Sort by resolution descending
      const sortedThumbs = [...thumbs].sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
      
      // Deduplicate by URL
      const unique = sortedThumbs.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

      setData({
        title: info.title,
        thumbnails: unique
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch thumbnails for this URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Image className="w-5 h-5 text-sky-400" />
          <span>Thumbnail Downloader</span>
        </h2>
        <p className="text-xs text-slate-400">
          Extract and download full-resolution video thumbnails (MaxRes 4K/1080p, HD, SD)
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleFetch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video URL to extract thumbnails..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Extract</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-semibold text-white truncate">{data.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{data.thumbnails.length} thumbnail resolutions found</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.thumbnails.map((thumb, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-md"
              >
                <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                  <img
                    src={thumb.url}
                    alt={data.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {(thumb.resolution || (thumb.width && thumb.height)) && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono font-bold text-white border border-white/10">
                      {thumb.resolution || `${thumb.width}x${thumb.height}`}
                    </span>
                  )}
                </div>

                <div className="p-4 flex items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/90">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200">
                      {idx === 0 ? 'Maximum Quality' : idx === 1 ? 'High Resolution' : 'Standard'}
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      {thumb.width && thumb.height ? `${thumb.width} × ${thumb.height} px` : 'Web Quality'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <a
                      href={thumb.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Open full size"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`/api/thumbnail-download?url=${encodeURIComponent(thumb.url)}&title=${encodeURIComponent(data.title)}`}
                      className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
