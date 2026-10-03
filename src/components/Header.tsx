import React from 'react';
import { 
  Download, 
  Terminal, 
  Settings as SettingsIcon, 
  FolderDown, 
  Wrench, 
  Github, 
  Sun, 
  Moon, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { AppSettings, DownloadTaskItem } from '../types/seal';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  activeTasks: DownloadTaskItem[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  ytdlpVersion: string;
  isLocked: boolean;
  onUnlockRequest: () => void;
  onOpenGitHubPush: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  activeTasks,
  activeTab,
  onSelectTab,
  ytdlpVersion,
  isLocked,
  onUnlockRequest,
  onOpenGitHubPush
}) => {
  const activeCount = activeTasks.filter(t => t.status === 'downloading' || t.status === 'pending' || t.status === 'processing').length;

  const themes: Array<{ id: AppSettings['theme']; label: string; color: string }> = [
    { id: 'blue', label: 'Ocean Blue', color: 'bg-blue-500' },
    { id: 'purple', label: 'Monet Purple', color: 'bg-purple-500' },
    { id: 'green', label: 'Emerald Green', color: 'bg-emerald-500' },
    { id: 'orange', label: 'Sunset Orange', color: 'bg-orange-500' },
    { id: 'teal', label: 'Cyber Teal', color: 'bg-teal-500' },
    { id: 'pink', label: 'Rose Pink', color: 'bg-pink-500' }
  ];

  return (
    <header className={`sticky top-0 z-30 transition-colors border-b ${
      settings.glassEffect 
        ? 'bg-slate-900/80 backdrop-blur-md border-slate-800/80 text-white' 
        : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onSelectTab('downloader')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Seal Plus
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                PC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              yt-dlp Desktop & Web Edition
            </p>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => onSelectTab('downloader')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'downloader' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloader</span>
          </button>

          <button
            onClick={() => onSelectTab('downloads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 relative ${
              activeTab === 'downloads' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Downloads</span>
            {activeCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold animate-pulse">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'tools' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>More Tools</span>
          </button>

          <button
            onClick={() => onSelectTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'templates' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'settings' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* yt-dlp version indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono font-medium">yt-dlp {ytdlpVersion || 'ready'}</span>
          </div>

          {/* Theme Palette Chooser dropdown */}
          <div className="relative group">
            <button 
              title="Change Material You Color Scheme"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
            </button>
            <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
              <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Accent Theme</p>
              <div className="grid grid-cols-3 gap-1.5 p-1">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105 ${t.color} ${
                      settings.theme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80'
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Glass effect toggle */}
          <button
            onClick={() => onUpdateSettings({ glassEffect: !settings.glassEffect })}
            title={settings.glassEffect ? "Frosted Glass: ON" : "Frosted Glass: OFF"}
            className={`p-2 rounded-xl transition-colors border border-slate-700/50 ${
              settings.glassEffect ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* PIN Lock status / button */}
          {settings.securityPin && (
            <button
              onClick={onUnlockRequest}
              title={isLocked ? "Application is Locked" : "Click to Lock App"}
              className={`p-2 rounded-xl transition-colors border border-slate-700/50 ${
                isLocked ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4" />}
            </button>
          )}

          {/* GitHub Push / Sync Modal Trigger */}
          <button
            onClick={onOpenGitHubPush}
            title="Push to GitHub repository"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-xs font-semibold text-white flex items-center space-x-1.5 border border-slate-600/50 transition-all shadow-sm hover:shadow"
          >
            <Github className="w-4 h-4 text-slate-200" />
            <span className="hidden sm:inline">GitHub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
