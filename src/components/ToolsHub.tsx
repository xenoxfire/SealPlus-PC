import React, { useState } from 'react';
import { Wrench, Image, MessageSquare, Info, ListPlus } from 'lucide-react';
import { ThumbnailDownloader } from './ThumbnailDownloader';
import { CommentDownloader } from './CommentDownloader';
import { VideoInfoInspector } from './VideoInfoInspector';
import { BatchUrlImporter } from './BatchUrlImporter';
import { AppSettings } from '../types/seal';

interface ToolsHubProps {
  settings: AppSettings;
  onStartBatch: (urls: string[], preset: any) => void;
  initialSubTab?: 'thumbnail' | 'comments' | 'inspector' | 'batch';
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ settings, onStartBatch, initialSubTab = 'thumbnail' }) => {
  const [currentTool, setCurrentTool] = useState<'thumbnail' | 'comments' | 'inspector' | 'batch'>(initialSubTab);

  const tools = [
    { id: 'thumbnail', label: 'Thumbnails', icon: Image, color: 'text-sky-400', desc: 'Download Full Res Covers' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, color: 'text-emerald-400', desc: 'Scrape & Export Comments' },
    { id: 'inspector', label: 'Metadata', icon: Info, color: 'text-indigo-400', desc: 'Inspect Stream Codecs' },
    { id: 'batch', label: 'Batch Importer', icon: ListPlus, color: 'text-purple-400', desc: 'Multi-URL Enqueue' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tool Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map(t => {
          const Icon = t.icon;
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTool(t.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive 
                  ? 'bg-slate-800 border-sky-500 shadow-lg ring-1 ring-sky-500/50' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${t.color} mb-2`} />
              <p className="text-xs sm:text-sm font-bold text-white">{t.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Render Current Tool */}
      <div className="pt-2">
        {currentTool === 'thumbnail' && <ThumbnailDownloader settings={settings} />}
        {currentTool === 'comments' && <CommentDownloader settings={settings} />}
        {currentTool === 'inspector' && <VideoInfoInspector settings={settings} />}
        {currentTool === 'batch' && <BatchUrlImporter settings={settings} onStartBatch={onStartBatch} />}
      </div>
    </div>
  );
};
