import React, { useState } from 'react';
import { 
  Download, 
  Video, 
  Music, 
  Settings2, 
  Check, 
  Folder, 
  Edit3, 
  User, 
  Eye, 
  Clock, 
  ThumbsUp, 
  Sparkles, 
  ShieldCheck, 
  X,
  Play
} from 'lucide-react';
import { VideoMetadata, AppSettings } from '../types/seal';

interface LiveVideoCardProps {
  metadata: VideoMetadata;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onDownload: (options: any) => void;
  onOpenFullModal: () => void;
  onClear: () => void;
}

export const LiveVideoCard: React.FC<LiveVideoCardProps> = ({
  metadata,
  settings,
  onUpdateSettings,
  onDownload,
  onOpenFullModal,
  onClear
}) => {
  const [selectedType, setSelectedType] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState<string>('1080');
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>('mp3');
  const [isEditingFolder, setIsEditingFolder] = useState<boolean>(false);
  const [folderPathInput, setFolderPathInput] = useState<string>(settings.downloadDir || '/app/applet/downloads');
  const [folderSaved, setFolderSaved] = useState<boolean>(false);

  // Quick video resolution options
  const videoQualities = [
    { label: '4K Ultra HD', value: '2160', badge: '4K' },
    { label: '1080p Full HD', value: '1080', badge: '1080p' },
    { label: '720p HD', value: '720', badge: '720p' },
    { label: '480p SD', value: '480', badge: '480p' },
    { label: 'Best Quality', value: 'best', badge: 'Auto' },
  ];

  // Quick audio options
  const audioOptions = [
    { label: 'MP3 (320kbps High Quality)', format: 'mp3', quality: '320' },
    { label: 'M4A (AAC Audio)', format: 'm4a', quality: '256' },
    { label: 'FLAC (Lossless)', format: 'flac', quality: '0' },
    { label: 'Opus (High Efficiency)', format: 'opus', quality: '160' },
  ];

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPathInput.trim()) return;
    onUpdateSettings({ downloadDir: folderPathInput.trim() });
    setIsEditingFolder(false);
    setFolderSaved(true);
    setTimeout(() => setFolderSaved(false), 2500);
  };

  const handleStartDownload = () => {
    let finalUrl = metadata.webpage_url;
    if (!finalUrl || !finalUrl.startsWith('http')) {
      finalUrl = metadata.id ? `https://www.youtube.com/watch?v=${metadata.id}` : (metadata.webpage_url || '');
    }
    onDownload({
      url: finalUrl,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      mode: selectedType,
      videoQuality: selectedQuality,
      videoFormat: settings.defaultVideoFormat || 'mp4',
      audioFormat: selectedAudioFormat,
      audioQuality: '320',
      embedThumbnail: settings.embedThumbnail,
      embedMetadata: settings.embedMetadata,
      downloadDir: settings.downloadDir
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl p-5 sm:p-7 bg-slate-900 border border-slate-700/80 shadow-2xl shadow-sky-950/40 space-y-5 animate-fade-in relative overflow-hidden">
      
      {/* Glow decorative banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500" />

      {/* Top Bar: Title & Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Video Ready to Download (ভিডিও প্রস্তুত)
          </span>
        </div>

        <button
          onClick={onClear}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Preview: Big Thumbnail + Metadata */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Large Thumbnail Preview ("tamable ta show kore") */}
        <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg shrink-0 group">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Video className="w-10 h-10" />
            </div>
          )}

          {metadata.duration_string && (
            <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10 shadow">
              {metadata.duration_string}
            </span>
          )}

          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-sky-500/90 text-[10px] font-bold text-white uppercase tracking-wider shadow">
            HD Preview
          </div>
        </div>

        {/* Video Info Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
            {metadata.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {metadata.uploader && (
              <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>{metadata.uploader}</span>
              </span>
            )}

            {metadata.view_count !== undefined && (
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{metadata.view_count.toLocaleString()} views</span>
              </span>
            )}

            {metadata.like_count !== undefined && (
              <span className="flex items-center space-x-1">
                <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                <span>{metadata.like_count.toLocaleString()} likes</span>
              </span>
            )}
          </div>

          <div className="pt-1 flex flex-wrap gap-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
              100% Real Video / Audio Media File
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              High Speed yt-dlp Engine
            </span>
          </div>
        </div>
      </div>

      {/* Quality Selection Section ("Trpr nise jano vdo quality oi system gulo ase") */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Media Quality (কোয়ালিটি নির্বাচন করুন)</span>
          </label>

          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                selectedType === 'video' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video (MP4)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('audio')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                selectedType === 'audio' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio Only</span>
            </button>
          </div>
        </div>

        {/* Video Qualities */}
        {selectedType === 'video' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {videoQualities.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => setSelectedQuality(q.value)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  selectedQuality === q.value
                    ? 'bg-sky-500/20 border-sky-400 text-white ring-1 ring-sky-500 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{q.label}</span>
                <span className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded font-mono ${
                  selectedQuality === q.value ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {q.badge}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Audio Qualities */}
        {selectedType === 'audio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {audioOptions.map((a) => (
              <button
                key={a.format}
                type="button"
                onClick={() => setSelectedAudioFormat(a.format)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedAudioFormat === a.format
                    ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-500 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{a.label}</div>
                <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold bg-slate-800 text-slate-300">
                  {a.format}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download Location Setting ("download location ta jano customis kora jai r ak br korle br br kora jano na lage") */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-300">Save Location (পিসিতে সেভ করার লোকেশন):</span>
            {!isEditingFolder && (
              <span className="font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] truncate max-w-xs sm:max-w-md">
                {settings.downloadDir || '/app/applet/downloads'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsEditingFolder(!isEditingFolder)}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingFolder ? 'Cancel' : 'Change Folder (ফোল্ডার পরিবর্তন)'}</span>
          </button>
        </div>

        {/* Change Folder Input Form */}
        {isEditingFolder && (
          <form onSubmit={handleSaveFolder} className="pt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={folderPathInput}
              onChange={(e) => setFolderPathInput(e.target.value)}
              placeholder="e.g. C:\Users\YourName\Downloads\Videos or /downloads"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none focus:border-sky-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0"
            >
              Save Folder (স্থায়ীভাবে সেভ করুন)
            </button>
          </form>
        )}

        {folderSaved && (
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Download location saved permanently! You won't need to configure it again.</span>
          </p>
        )}
      </div>

      {/* Main Action Bar ("trpr download option a chilik korlei jano download suru hoye jai") */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenFullModal}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors font-medium py-1 px-2 rounded-lg hover:bg-slate-800"
        >
          <Settings2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Advanced Trimming, Subtitles & Custom Args...</span>
        </button>

        <button
          type="button"
          onClick={handleStartDownload}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-sky-500/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Video Now (ডাউনলোড শুরু করুন)</span>
        </button>
      </div>

    </div>
  );
};
