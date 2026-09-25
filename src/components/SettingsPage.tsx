import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Sliders, 
  Shield, 
  Terminal, 
  HardDrive, 
  RefreshCw, 
  Check, 
  Lock, 
  FileDown, 
  FileUp, 
  Layers, 
  Moon, 
  Sun,
  Laptop
} from 'lucide-react';
import { AppSettings } from '../types/seal';
import { api } from '../services/api';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  ytdlpVersion: string;
  onUpdateYtDlp: () => Promise<void>;
  isUpdatingYtDlp: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  ytdlpVersion,
  onUpdateYtDlp,
  isUpdatingYtDlp
}) => {
  const [pinInput, setPinInput] = useState(settings.securityPin || '');
  const [pinSavedMsg, setPinSavedMsg] = useState(false);

  const themes: Array<{ id: AppSettings['theme']; label: string; bg: string }> = [
    { id: 'blue', label: 'Ocean Blue', bg: 'bg-blue-500' },
    { id: 'purple', label: 'Monet Purple', bg: 'bg-purple-500' },
    { id: 'green', label: 'Emerald Green', bg: 'bg-emerald-500' },
    { id: 'orange', label: 'Sunset Orange', bg: 'bg-orange-500' },
    { id: 'teal', label: 'Cyber Teal', bg: 'bg-teal-500' },
    { id: 'pink', label: 'Rose Pink', bg: 'bg-pink-500' }
  ];

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      securityPin: pinInput.trim(),
      isPinLocked: pinInput.trim().length > 0
    });
    setPinSavedMsg(true);
    setTimeout(() => setPinSavedMsg(false), 2000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importBackup(json);
        alert('Backup successfully imported! Reloading...');
        window.location.reload();
      } catch (err: any) {
        alert('Invalid backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-sky-400" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Personalize themes, default download qualities, engine settings, and security
        </p>
      </div>

      {/* 1. APPEARANCE & THEMING */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Palette className="w-4 h-4 text-sky-400" />
          <span>Appearance & Material You Theming</span>
        </h3>

        {/* Accent Color Palette */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Accent Theme Color</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: t.id })}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  settings.theme === t.id 
                    ? 'border-white bg-slate-800 ring-2 ring-sky-500 shadow-md' 
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <span className={`w-6 h-6 rounded-full ${t.bg} shadow-sm`} />
                <span className="text-[11px] font-semibold text-slate-200">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode & Glass Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Frosted Glass Effect</p>
              <p className="text-[11px] text-slate-400">Backdrop-blur glassmorphism cards</p>
            </div>
            <input
              type="checkbox"
              checked={settings.glassEffect}
              onChange={(e) => onUpdateSettings({ glassEffect: e.target.checked })}
              className="w-5 h-5 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Color Mode</p>
              <p className="text-[11px] text-slate-400">Current: Dark / AMOLED Mode</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-xs text-sky-400 font-bold border border-slate-700">
              Dark
            </span>
          </div>
        </div>
      </div>

      {/* 2. DEFAULT DOWNLOAD PREFERENCES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Default Download Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Quality</label>
            <select
              value={settings.defaultQuality}
              onChange={(e) => onUpdateSettings({ defaultQuality: e.target.value })}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option value="2160">2160p (4K UHD)</option>
              <option value="1440">1440p (2K QHD)</option>
              <option value="1080">1080p (Full HD)</option>
              <option value="720">720p (HD)</option>
              <option value="best">Best Available</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Video Format</label>
            <select
              value={settings.defaultVideoFormat}
              onChange={(e) => onUpdateSettings({ defaultVideoFormat: e.target.value as any })}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option value="mp4">MP4 (Recommended)</option>
              <option value="mkv">MKV</option>
              <option value="webm">WebM</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Audio Format</label>
            <select
              value={settings.defaultAudioFormat}
              onChange={(e) => onUpdateSettings({ defaultAudioFormat: e.target.value as any })}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option value="mp3">MP3 (320 kbps)</option>
              <option value="m4a">M4A (AAC)</option>
              <option value="opus">Opus</option>
              <option value="flac">FLAC (Lossless)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Embed Thumbnail</p>
              <p className="text-[11px] text-slate-400">Embed high-res video cover art into media</p>
            </div>
            <input
              type="checkbox"
              checked={settings.embedThumbnail}
              onChange={(e) => onUpdateSettings({ embedThumbnail: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Embed Metadata Tags</p>
              <p className="text-[11px] text-slate-400">Attach artist, title, genre, year ID3 tags</p>
            </div>
            <input
              type="checkbox"
              checked={settings.embedMetadata}
              onChange={(e) => onUpdateSettings({ embedMetadata: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* 3. SECURITY & PIN LOCK */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-rose-400" />
          <span>Security & Privacy Lock</span>
        </h3>

        <form onSubmit={handleSavePin} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Set Security PIN (Leave blank to disable lock)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 4-6 digit PIN..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
              >
                Save PIN
              </button>
            </div>
            {pinSavedMsg && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Security PIN updated successfully!</span>
              </p>
            )}
          </div>
        </form>
      </div>

      {/* 4. YT-DLP CORE ENGINE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <span>Engine & Environment</span>
        </h3>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-white">yt-dlp Core Binary</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {ytdlpVersion || 'Installed'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Download engine executes natively on your PC with full extractor and post-processing support.
            </p>
          </div>

          <button
            type="button"
            onClick={onUpdateYtDlp}
            disabled={isUpdatingYtDlp}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 border border-slate-700 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isUpdatingYtDlp ? 'animate-spin' : ''}`} />
            <span>{isUpdatingYtDlp ? 'Updating...' : 'Update Engine'}</span>
          </button>
        </div>
      </div>

      {/* 5. BACKUP & RESTORE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Backup & Migration</span>
        </h3>

        <p className="text-xs text-slate-400">
          Save all your download history, cookie profiles, custom command templates, and settings as a JSON backup file to migrate to another PC or device.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => api.exportBackup()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 border border-slate-700 transition-all"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span>Export Backup File (JSON)</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 border border-slate-700 transition-all cursor-pointer">
            <FileUp className="w-4 h-4 text-purple-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
