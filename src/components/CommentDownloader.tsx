import React, { useState } from 'react';
import { MessageSquare, Search, Download, ThumbsUp, Loader2, FileDown, User } from 'lucide-react';
import { api } from '../services/api';
import { CommentItem, AppSettings } from '../types/seal';

interface CommentDownloaderProps {
  settings: AppSettings;
}

export const CommentDownloader: React.FC<CommentDownloaderProps> = ({ settings }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [filterText, setFilterText] = useState('');

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setComments([]);

    try {
      const data = await api.getComments(url.trim());
      setComments(data.comments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments for this video.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `video-comments-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const exportAsTXT = () => {
    const text = comments.map(c => `[${c.author} | Likes: ${c.like_count} | ${c.time_text || ''}]\n${c.text}\n---\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `video-comments-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const filtered = comments.filter(c => 
    c.text.toLowerCase().includes(filterText.toLowerCase()) || 
    c.author.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span>Comments Downloader & Reader</span>
        </h2>
        <p className="text-xs text-slate-400">
          Scrape and export comments from videos as JSON, CSV, or formatted text
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleFetch} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste video URL to fetch comments..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scraping...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Fetch Comments</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Export Bar */}
      {comments.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">{comments.length} Comments Loaded</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search comments..."
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none"
            />
            <button
              onClick={exportAsJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportAsTXT}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              <span>TXT</span>
            </button>
          </div>
        </div>
      )}

      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {c.author_thumbnail ? (
                    <img src={c.author_thumbnail} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200">{c.author}</span>
                  {c.time_text && (
                    <span className="text-[11px] text-slate-500">• {c.time_text}</span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <ThumbsUp className="w-3 h-3 text-slate-500" />
                  <span>{c.like_count}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
