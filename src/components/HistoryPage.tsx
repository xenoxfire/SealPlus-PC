import React, { useState } from 'react';
import { 
  FolderDown, 
  Search, 
  Trash2, 
  Play, 
  HardDriveDownload, 
  Video, 
  Music, 
  Calendar, 
  Film, 
  ExternalLink 
} from 'lucide-react';
import { DownloadHistoryItem, AppSettings } from '../types/seal';

interface HistoryPageProps {
  history: DownloadHistoryItem[];
  settings: AppSettings;
  onDeleteItem: (id: string) => void;
  onPlayMedia: (filename: string, title: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  settings,
  onDeleteItem,
  onPlayMedia
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio'>('all');

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + ' GB';
    }
    return mb.toFixed(1) + ' MB';
  };

  const filtered = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.filename && item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FolderDown className="w-5 h-5 text-sky-400" />
            <span>Download Library</span>
          </h2>
          <p className="text-xs text-slate-400">
            Saved media on your PC ({history.length} items)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search downloads..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'video' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'audio' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audio
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
            <FolderDown className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">No Downloads Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'No media matches your search term.' : 'Downloaded videos and audio will appear here with an embedded player and direct file access.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                settings.glassEffect 
                  ? 'bg-slate-900/70 backdrop-blur-xl border-slate-800/80 shadow-md hover:border-slate-700' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Media item preview & details */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                {item.thumbnail ? (
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-sm relative group cursor-pointer" onClick={() => onPlayMedia(item.filename, item.title)}>
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-sky-400 border border-slate-700/60">
                    {item.type === 'audio' ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate" title={item.title}>
                    {item.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-sky-400 border border-slate-700/60 font-semibold uppercase">
                      {item.format || 'Media'}
                    </span>

                    {item.quality && (
                      <span className="text-[11px] text-slate-300 font-medium">
                        {item.quality}
                      </span>
                    )}

                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">{formatSize(item.size)}</span>

                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onPlayMedia(item.filename, item.title)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold flex items-center space-x-1.5 border border-sky-500/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>

                <a
                  href={`/api/downloads/file/${encodeURIComponent(item.filename)}?download=true`}
                  download={item.filename}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all"
                  title="Save directly to PC hard drive"
                >
                  <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save</span>
                </a>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete from history & disk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
