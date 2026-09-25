/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputCard } from './components/UrlInputCard';
import { FormatDialog } from './components/FormatDialog';
import { ActiveDownloads } from './components/ActiveDownloads';
import { HistoryPage } from './components/HistoryPage';
import { ToolsHub } from './components/ToolsHub';
import { TemplatesPage } from './components/TemplatesPage';
import { CookiesPage } from './components/CookiesPage';
import { SettingsPage } from './components/SettingsPage';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import { LockScreen } from './components/LockScreen';
import { GitHubPushModal } from './components/GitHubPushModal';

import { api } from './services/api';
import { 
  AppSettings, 
  DownloadTaskItem, 
  DownloadHistoryItem, 
  CommandTemplate, 
  CookieProfile, 
  VideoMetadata 
} from './types/seal';
import { 
  Download, 
  FolderDown, 
  Wrench, 
  Terminal, 
  Cookie, 
  Settings as SettingsIcon,
  Github,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>({
    downloadDir: '/app/applet/downloads',
    defaultVideoFormat: 'mp4',
    defaultAudioFormat: 'mp3',
    defaultQuality: '1080',
    maxConcurrentDownloads: 3,
    embedThumbnail: true,
    embedMetadata: true,
    subtitles: false,
    subtitleLangs: 'en',
    theme: 'blue',
    darkMode: 'dark',
    glassEffect: true,
    securityPin: '',
    isPinLocked: false
  });

  const [activeTab, setActiveTab] = useState<string>('downloader');
  const [toolsSubTab, setToolsSubTab] = useState<'thumbnail' | 'comments' | 'inspector' | 'batch'>('thumbnail');

  const [activeTasks, setActiveTasks] = useState<DownloadTaskItem[]>([]);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [templates, setTemplates] = useState<CommandTemplate[]>([]);
  const [cookies, setCookies] = useState<CookieProfile[]>([]);
  
  const [ytdlpVersion, setYtdlpVersion] = useState<string>('');
  const [isUpdatingYtDlp, setIsUpdatingYtDlp] = useState<boolean>(false);

  const [configuringMetadata, setConfiguringMetadata] = useState<VideoMetadata | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);

  const [mediaPlayer, setMediaPlayer] = useState<{ filename: string; title: string } | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isGitHubPushOpen, setIsGitHubPushOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial settings, templates, cookies, history
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [statusData, settingsData, templatesData, cookiesData, historyData] = await Promise.all([
        api.getStatus().catch(() => ({ ytdlpVersion: '' })),
        api.getSettings().catch(() => null),
        api.getTemplates().catch(() => []),
        api.getCookies().catch(() => []),
        api.getHistory().catch(() => [])
      ]);

      if (statusData && 'ytdlpVersion' in statusData) {
        setYtdlpVersion(statusData.ytdlpVersion || '');
      }

      if (settingsData) {
        setSettings(settingsData);
        if (settingsData.isPinLocked && settingsData.securityPin) {
          setIsLocked(true);
        }
      }

      setTemplates(templatesData);
      setCookies(cookiesData);
      setHistory(historyData);
    } catch (e) {
      console.error('Initialization error', e);
    }
  };

  // Polling for active tasks
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const tasks = await api.getActiveTasks();
        setActiveTasks(tasks);

        // Check if any completed, refresh history
        const hasCompleted = tasks.some(t => t.status === 'completed');
        if (hasCompleted) {
          const freshHistory = await api.getHistory();
          setHistory(freshHistory);
        }
      } catch {
        // ignore polling errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await api.saveSettings(newSettings);
      showToast('Settings saved', 'success');
    } catch (e: any) {
      showToast('Failed to save settings: ' + e.message, 'error');
    }
  };

  // Fetch Video Info & Open Format Dialog
  const handleFetchAndConfigure = async (url: string) => {
    setIsFetchingInfo(true);
    try {
      const meta = await api.getVideoInfo(url);
      setConfiguringMetadata(meta);
    } catch (e: any) {
      showToast(e.message || 'Failed to extract video information', 'error');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  // Quick Download (Auto Best)
  const handleQuickDownload = async (url: string, preset?: any) => {
    try {
      showToast('Starting quick download...', 'info');
      const payload: any = {
        url,
        mode: preset?.mode || 'video',
        videoQuality: preset?.videoQuality || settings.defaultQuality || '1080',
        videoFormat: preset?.videoFormat || settings.defaultVideoFormat || 'mp4',
        audioFormat: preset?.audioFormat || settings.defaultAudioFormat || 'mp3',
        audioQuality: preset?.audioQuality || '320',
        embedThumbnail: settings.embedThumbnail,
        embedMetadata: settings.embedMetadata,
        subtitles: preset?.subtitles !== undefined ? preset.subtitles : settings.subtitles,
        subtitleLangs: settings.subtitleLangs
      };

      const res = await api.startDownload(payload);
      if (res.success) {
        showToast('Download added to queue!', 'success');
        // Add to active tasks immediately
        setActiveTasks(prev => [res.task, ...prev.filter(t => t.id !== res.task.id)]);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to start download', 'error');
    }
  };

  // Start download from Format Dialog
  const handleConfirmDownload = async (options: any) => {
    try {
      setConfiguringMetadata(null);
      showToast('Starting download...', 'info');
      const res = await api.startDownload(options);
      if (res.success) {
        showToast('Download enqueued!', 'success');
        setActiveTasks(prev => [res.task, ...prev.filter(t => t.id !== res.task.id)]);
      }
    } catch (e: any) {
      showToast(e.message || 'Download failed to start', 'error');
    }
  };

  // Batch Enqueue
  const handleStartBatch = async (urls: string[], preset: any) => {
    showToast(`Enqueuing ${urls.length} downloads...`, 'info');
    for (const url of urls) {
      try {
        await api.startDownload({
          url,
          mode: preset.mode,
          videoQuality: preset.quality,
          videoFormat: preset.format,
          audioFormat: preset.format,
          audioQuality: '320',
          embedThumbnail: settings.embedThumbnail,
          embedMetadata: settings.embedMetadata
        });
      } catch (e) {
        console.error('Batch error for url:', url, e);
      }
    }
    showToast('Batch download enqueued successfully!', 'success');
    setActiveTab('downloader');
  };

  // Cancel task
  const handleCancelTask = async (id: string) => {
    try {
      await api.cancelTask(id);
      setActiveTasks(prev => prev.filter(t => t.id !== id));
      showToast('Download cancelled', 'info');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Delete history item
  const handleDeleteHistory = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      showToast('Deleted from library', 'info');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Update yt-dlp core
  const handleUpdateYtDlp = async () => {
    setIsUpdatingYtDlp(true);
    try {
      const res = await api.updateYtDlp();
      if (res.success) {
        setYtdlpVersion(res.version || 'Updated');
        showToast('yt-dlp engine updated to latest version!', 'success');
      } else {
        showToast(res.error || 'Update failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsUpdatingYtDlp(false);
    }
  };

  // Dynamic Theme Gradients
  const themeGradients: Record<string, string> = {
    blue: 'from-sky-950/40 via-slate-950 to-slate-950',
    purple: 'from-purple-950/40 via-slate-950 to-slate-950',
    green: 'from-emerald-950/40 via-slate-950 to-slate-950',
    orange: 'from-orange-950/40 via-slate-950 to-slate-950',
    teal: 'from-teal-950/40 via-slate-950 to-slate-950',
    pink: 'from-pink-950/40 via-slate-950 to-slate-950'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeGradients[settings.theme] || themeGradients.blue} text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white`}>
      
      {/* Security PIN Lock Screen if locked */}
      {isLocked && (
        <LockScreen
          correctPin={settings.securityPin}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold backdrop-blur-md animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' :
          toastMessage.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-300' :
          'bg-slate-900/90 border-slate-700 text-white'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        activeTasks={activeTasks}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ytdlpVersion={ytdlpVersion}
        isLocked={isLocked}
        onUnlockRequest={() => setIsLocked(!isLocked)}
        onOpenGitHubPush={() => setIsGitHubPushOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: DOWNLOADER (HOME) */}
        {activeTab === 'downloader' && (
          <div className="space-y-8 animate-fade-in">
            {/* Input Card */}
            <UrlInputCard
              settings={settings}
              onFetchAndConfigure={handleFetchAndConfigure}
              onQuickDownload={handleQuickDownload}
              isLoading={isFetchingInfo}
              onOpenBatch={() => {
                setActiveTab('tools');
                setToolsSubTab('batch');
              }}
            />

            {/* Active Downloads List */}
            <ActiveDownloads
              tasks={activeTasks}
              settings={settings}
              onCancelTask={handleCancelTask}
              onPlayMedia={(fn, title) => setMediaPlayer({ filename: fn, title })}
            />

            {/* Recent Downloads Preview */}
            {history.length > 0 && (
              <div className="w-full max-w-4xl mx-auto pt-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent Library Items
                  </h3>
                  <button
                    onClick={() => setActiveTab('downloads')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    View All ({history.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      onClick={() => setMediaPlayer({ filename: item.filename, title: item.title })}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 cursor-pointer group shadow"
                    >
                      {item.thumbnail ? (
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-sky-400">
                          <FolderDown className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-sky-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 uppercase font-mono">
                          {item.format} • {item.quality}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOWNLOADS LIBRARY */}
        {activeTab === 'downloads' && (
          <div className="animate-fade-in">
            <HistoryPage
              history={history}
              settings={settings}
              onDeleteItem={handleDeleteHistory}
              onPlayMedia={(fn, title) => setMediaPlayer({ filename: fn, title })}
            />
          </div>
        )}

        {/* TAB 3: TOOLS HUB */}
        {activeTab === 'tools' && (
          <div className="animate-fade-in">
            <ToolsHub
              settings={settings}
              onStartBatch={handleStartBatch}
              initialSubTab={toolsSubTab}
            />
          </div>
        )}

        {/* TAB 4: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="animate-fade-in">
            <TemplatesPage
              templates={templates}
              settings={settings}
              onRefreshTemplates={async () => {
                const t = await api.getTemplates();
                setTemplates(t);
              }}
            />
          </div>
        )}

        {/* TAB 5: COOKIES */}
        {activeTab === 'cookies' && (
          <div className="animate-fade-in">
            <CookiesPage
              cookies={cookies}
              settings={settings}
              onRefreshCookies={async () => {
                const c = await api.getCookies();
                setCookies(c);
              }}
            />
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              ytdlpVersion={ytdlpVersion}
              onUpdateYtDlp={handleUpdateYtDlp}
              isUpdatingYtDlp={isUpdatingYtDlp}
            />
          </div>
        )}

      </main>

      {/* Format Dialog Modal */}
      {configuringMetadata && (
        <FormatDialog
          metadata={configuringMetadata}
          settings={settings}
          templates={templates}
          cookies={cookies}
          onClose={() => setConfiguringMetadata(null)}
          onConfirmDownload={handleConfirmDownload}
        />
      )}

      {/* Media Player Modal */}
      {mediaPlayer && (
        <MediaPlayerModal
          filename={mediaPlayer.filename}
          title={mediaPlayer.title}
          onClose={() => setMediaPlayer(null)}
        />
      )}

      {/* GitHub Push Modal */}
      {isGitHubPushOpen && (
        <GitHubPushModal
          onClose={() => setIsGitHubPushOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Seal Plus PC • Built with Material You, React 19, Tailwind CSS & yt-dlp
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGitHubPushOpen(true)}
              className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>xenoxfire / GitHub</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('cookies');
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Cookie Profiles
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
