import React, { useState } from 'react';
import { 
  Download, 
  Video, 
  Music, 
  Settings2, 
  Check, 
  Folder, 
  FolderPlus,
  User, 
  Eye, 
  ThumbsUp, 
  Sparkles, 
  ShieldCheck, 
  X,
  Laptop
} from 'lucide-react';
import { VideoMetadata, AppSettings } from '../types/seal';
import { FolderPickerModal } from './FolderPickerModal';

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
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState<boolean>(false);
  const [folderSaved, setFolderSaved] = useState<boolean>(false);

  // Multi-tier thumbnail fallback
  const initialThumb = metadata.thumbnail || (metadata.id ? `https://i.ytimg.com/vi/${metadata.id}/hqdefault.jpg` : '');
  const [currentThumb, setCurrentThumb] = useState<string>(initialThumb);
  const [thumbErrorCount, setThumbErrorCount] = useState<number>(0);

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

  const handleSelectFolder = (newPath: string) => {
    onUpdateSettings({ downloadDir: newPath });
    setFolderSaved(true);
    setTimeout(() => setFolderSaved(false), 3500);
  };

  const handleStartDownload = () => {
    let finalUrl = metadata.webpage_url;
    if (!finalUrl || !finalUrl.startsWith('http')) {
      finalUrl = metadata.id ? `https://www.youtube.com/watch?v=${metadata.id}` : (metadata.webpage_url || '');
    }
    onDownload({
      url: finalUrl,
      title: metadata.title,
      thumbnail: currentThumb || metadata.thumbnail,
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
          {currentThumb ? (
            <img
              src={currentThumb}
              alt={metadata.title}
              referrerPolicy="no-referrer"
              onError={() => {
                if (thumbErrorCount === 0 && metadata.id) {
                  setThumbErrorCount(1);
                  setCurrentThumb(`https://i.ytimg.com/vi/${metadata.id}/hqdefault.jpg`);
                } else if (thumbErrorCount === 1 && metadata.id) {
                  setThumbErrorCount(2);
                  setCurrentThumb(`https://i.ytimg.com/vi/${metadata.id}/mqdefault.jpg`);
                } else if (thumbErrorCount === 2 && currentThumb) {
                  setThumbErrorCount(3);
                  setCurrentThumb(`/api/thumbnail-proxy?url=${encodeURIComponent(currentThumb)}`);
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
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
              <span className="flex items-center space-x-1 font-medium text-slate-300">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>{metadata.uploader}</span>
              </span>
            )}

            {metadata.view_count !== undefined && (
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{metadata.view_count.toLocaleString()} views</span>
              </span>
            )}

            {metadata.like_count !== undefined && (
              <span className="flex items-center space-x-1">
                <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                <span>{metadata.like_count.toLocaleString()} likes</span>
              </span>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Full Video Ready (আসল ফাইল)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-medium">
              Audio + Video Merged
            </span>
          </div>
        </div>
      </div>

      {/* Quality Selection Section */}
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

      {/* Download Location Setting with Clickable Folder Dialog */}
      <div 
        onClick={() => setIsFolderPickerOpen(true)}
        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 transition-all cursor-pointer group space-y-1.5"
        title="Click to open PC folder selector"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 text-xs min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-200 block flex items-center space-x-1.5">
                <span>Save Location (পিসির ফোল্ডার):</span>
                <span className="text-[10px] text-amber-400 font-normal">(ক্লিক করলেই পিসির ফোল্ডার ওপেন হবে)</span>
              </span>
              <span className="font-mono text-amber-300 font-medium text-[11px] truncate block">
                {settings.downloadDir || 'Downloads'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFolderPickerOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Select Folder (পিসির ফোল্ডার খুলুন)</span>
          </button>
        </div>

        {folderSaved && (
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1 animate-fade-in font-medium pt-1">
            <Check className="w-3.5 h-3.5" />
            <span>ফোল্ডার স্থায়ীভাবে সেভ হয়েছে! পরবর্তী সব ডাউনলোড এই ফোল্ডারেই সেভ হবে।</span>
          </p>
        )}
      </div>

      {/* Bottom Action Buttons: Instant Download & Full Settings */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleStartDownload}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center space-x-2.5 group active:scale-98"
        >
          <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          <span>Download Video Now (ডাউনলোড শুরু করুন)</span>
        </button>

        <button
          type="button"
          onClick={onOpenFullModal}
          className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 shrink-0"
          title="Open advanced settings for subtitles, clipping, and custom formats"
        >
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span>Advanced Settings...</span>
        </button>
      </div>

      {/* Native PC Folder Picker Modal */}
      <FolderPickerModal
        currentPath={settings.downloadDir || 'Downloads'}
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onSelectFolder={handleSelectFolder}
      />

    </div>
  );
};
