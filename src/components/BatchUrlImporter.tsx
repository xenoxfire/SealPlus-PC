import React, { useState } from 'react';
import { ListPlus, Play, CheckCircle2, Video, Music, Layers, Trash2 } from 'lucide-react';
import { AppSettings } from '../types/seal';

interface BatchUrlImporterProps {
  settings: AppSettings;
  onStartBatch: (urls: string[], preset: { mode: 'video' | 'audio'; quality: string; format: string }) => void;
}

export const BatchUrlImporter: React.FC<BatchUrlImporterProps> = ({ settings, onStartBatch }) => {
  const [urlsText, setUrlsText] = useState('');
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [quality, setQuality] = useState('1080');
  const [format, setFormat] = useState('mp4');

  const parsedUrls = urlsText
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http://') || u.startsWith('https://'));

  const handleStart = () => {
    if (parsedUrls.length === 0) return;
    onStartBatch(parsedUrls, { mode, quality, format });
  };

  const loadSampleUrls = () => {
    setUrlsText([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=9bZkp7q19f0',
      'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
    ].join('\n'));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ListPlus className="w-5 h-5 text-purple-400" />
          <span>Batch URL Importer</span>
        </h2>
        <p className="text-xs text-slate-400">
          Paste multiple video/audio URLs (one per line) to download all of them sequentially
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Text Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Paste URLs (One URL per line)
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={loadSampleUrls}
                className="text-[11px] text-sky-400 hover:underline font-medium"
              >
                Load Sample Links
              </button>
              {urlsText && (
                <button
                  type="button"
                  onClick={() => setUrlsText('')}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-medium ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={6}
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://instagram.com/p/..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Valid URLs detected: <strong className="text-purple-400 font-bold">{parsedUrls.length}</strong></span>
          </div>
        </div>

        {/* Global Preset Selector */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Batch Download Preset
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Download Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setMode('video'); setFormat('mp4'); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                    mode === 'video' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('audio'); setFormat('mp3'); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                    mode === 'audio' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio Only</span>
                </button>
              </div>
            </div>

            {mode === 'video' ? (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Max Video Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="2160">4K Ultra HD (2160p)</option>
                  <option value="1440">2K Quad HD (1440p)</option>
                  <option value="1080">Full HD (1080p)</option>
                  <option value="720">HD (720p)</option>
                  <option value="best">Best Available (Auto)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Audio Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="mp3">MP3 (320kbps)</option>
                  <option value="m4a">M4A (High AAC)</option>
                  <option value="opus">Opus (High Efficiency)</option>
                  <option value="flac">FLAC (Lossless)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={parsedUrls.length === 0}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Enqueue & Download {parsedUrls.length} Videos</span>
        </button>
      </div>
    </div>
  );
};
