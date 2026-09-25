import React, { useState } from 'react';
import { Info, Search, Copy, Check, Download, Loader2, Code, Layers } from 'lucide-react';
import { api } from '../services/api';
import { VideoMetadata, AppSettings } from '../types/seal';

interface VideoInfoInspectorProps {
  settings: AppSettings;
}

export const VideoInfoInspector: React.FC<VideoInfoInspectorProps> = ({ settings }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<VideoMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'formats' | 'raw'>('summary');
  const [copied, setCopied] = useState(false);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setInfo(null);

    try {
      const data = await api.getVideoInfo(url.trim());
      setInfo(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (!info) return;
    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!info) return;
    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `video-metadata-${info.id || 'info'}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Info className="w-5 h-5 text-indigo-400" />
          <span>Video Metadata Inspector</span>
        </h2>
        <p className="text-xs text-slate-400">
          Inspect raw stream information, codec parameters, formats, and download JSON metadata
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleFetch} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste video URL to inspect metadata..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Inspect</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {info && (
        <div className="space-y-4">
          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'summary' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('formats')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'formats' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Streams ({info.videoFormats?.length || 0} Video / {info.audioFormats?.length || 0} Audio)
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'raw' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw JSON
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center space-x-1 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center space-x-1 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save JSON</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Title</span>
                <p className="text-sm font-semibold text-white">{info.title}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Uploader</span>
                <p className="text-sm font-semibold text-white">{info.uploader || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</span>
                <p className="text-sm font-mono text-white">{info.duration_string || `${info.duration}s`}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Views / Likes</span>
                <p className="text-sm font-mono text-white">{info.view_count?.toLocaleString()} views • {info.like_count?.toLocaleString() || 0} likes</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tags</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {info.tags && info.tags.length > 0 ? (
                    info.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] text-slate-300">
                        #{t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No tags specified</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {info.description || 'No description available'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FORMATS TABLE */}
          {activeTab === 'formats' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Video Streams</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Format ID</th>
                        <th className="p-3">Resolution</th>
                        <th className="p-3">Ext</th>
                        <th className="p-3">FPS</th>
                        <th className="p-3">Video Codec</th>
                        <th className="p-3">Audio Codec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-mono">
                      {(info.videoFormats || []).map((v, i) => (
                        <tr key={i} className="hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-sky-400">{v.format_id}</td>
                          <td className="p-3 text-white">{v.resolution || `${v.height}p`}</td>
                          <td className="p-3 uppercase">{v.ext}</td>
                          <td className="p-3">{v.fps || '-'}</td>
                          <td className="p-3 text-slate-400">{v.vcodec || '-'}</td>
                          <td className="p-3 text-slate-400">{v.acodec || 'none'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Audio Streams</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Format ID</th>
                        <th className="p-3">Ext</th>
                        <th className="p-3">Bitrate (ABR)</th>
                        <th className="p-3">Audio Codec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-mono">
                      {(info.audioFormats || []).map((a, i) => (
                        <tr key={i} className="hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-emerald-400">{a.format_id}</td>
                          <td className="p-3 uppercase">{a.ext}</td>
                          <td className="p-3 text-white">{a.abr ? `${Math.round(a.abr)} kbps` : '-'}</td>
                          <td className="p-3 text-slate-400">{a.acodec || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW JSON */}
          {activeTab === 'raw' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono text-emerald-400 leading-normal">
                {JSON.stringify(info, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
