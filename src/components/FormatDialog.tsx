import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Video, 
  Music, 
  Terminal, 
  Sliders, 
  Check, 
  Clock, 
  Eye, 
  ThumbsUp, 
  User, 
  Scissors, 
  Subtitles, 
  Image, 
  FileText, 
  Cookie, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VideoMetadata, CommandTemplate, CookieProfile, AppSettings } from '../types/seal';

interface FormatDialogProps {
  metadata: VideoMetadata;
  settings: AppSettings;
  templates: CommandTemplate[];
  cookies: CookieProfile[];
  onClose: () => void;
  onConfirmDownload: (options: {
    url: string;
    title: string;
    thumbnail?: string;
    mode: 'video' | 'audio' | 'custom';
    videoQuality?: string;
    videoFormat?: string;
    audioFormat?: string;
    audioQuality?: string;
    embedThumbnail?: boolean;
    embedMetadata?: boolean;
    subtitles?: boolean;
    subtitleLangs?: string;
    startTime?: string;
    endTime?: string;
    customCommand?: string;
    cookieProfileId?: string;
  }) => void;
}

export const FormatDialog: React.FC<FormatDialogProps> = ({
  metadata,
  settings,
  templates,
  cookies,
  onClose,
  onConfirmDownload
}) => {
  const [mode, setMode] = useState<'video' | 'audio' | 'custom'>('video');
  const [videoQuality, setVideoQuality] = useState<string>('1080');
  const [videoFormat, setVideoFormat] = useState<string>('mp4');
  
  const [audioFormat, setAudioFormat] = useState<string>('mp3');
  const [audioQuality, setAudioQuality] = useState<string>('320');
  
  const [embedThumbnail, setEmbedThumbnail] = useState<boolean>(true);
  const [embedMetadata, setEmbedMetadata] = useState<boolean>(true);
  
  const [subtitles, setSubtitles] = useState<boolean>(false);
  const [subtitleLangs, setSubtitleLangs] = useState<string>('en');
  
  const [enableClip, setEnableClip] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('00:00:00');
  const [endTime, setEndTime] = useState<string>('');
  
  const [customCommand, setCustomCommand] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedCookieProfileId, setSelectedCookieProfileId] = useState<string>('');
  
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Available video resolutions from metadata
  const standardResolutions = [
    { label: '2160p (4K UHD)', value: '2160', badge: 'Ultra HD' },
    { label: '1440p (2K QHD)', value: '1440', badge: '2K' },
    { label: '1080p (Full HD)', value: '1080', badge: 'FHD' },
    { label: '720p (HD)', value: '720', badge: 'HD' },
    { label: '480p (SD)', value: '480', badge: 'SD' },
    { label: '360p (Data Saver)', value: '360', badge: 'Low' },
    { label: 'Best Available', value: 'best', badge: 'Auto' },
  ];

  const audioCodecs = [
    { label: 'MP3 (Universal)', value: 'mp3', desc: 'Highest compatibility across all devices' },
    { label: 'M4A / AAC', value: 'm4a', desc: 'Apple & high quality native AAC' },
    { label: 'Opus (Modern)', value: 'opus', desc: 'Best compression & efficiency' },
    { label: 'FLAC (Lossless)', value: 'flac', desc: 'Uncompressed studio audio fidelity' },
    { label: 'WAV (Raw PCM)', value: 'wav', desc: 'Uncompressed audio waveform' },
  ];

  const audioBitrates = [
    { label: '320 kbps (High Quality)', value: '320' },
    { label: '256 kbps (Standard)', value: '256' },
    { label: '192 kbps (Medium)', value: '192' },
    { label: '128 kbps (Compact)', value: '128' },
  ];

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      setCustomCommand(tmpl.command);
      setMode('custom');
    }
  };

  const handleStart = () => {
    onConfirmDownload({
      url: metadata.webpage_url || metadata.id,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      mode,
      videoQuality,
      videoFormat,
      audioFormat,
      audioQuality,
      embedThumbnail,
      embedMetadata,
      subtitles,
      subtitleLangs,
      startTime: enableClip ? startTime : undefined,
      endTime: enableClip ? endTime : undefined,
      customCommand,
      cookieProfileId: selectedCookieProfileId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden my-6 transition-all">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configure Download</h3>
              <p className="text-xs text-slate-400">Select formats, streams, and options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Card */}
        <div className="p-4 sm:p-6 bg-slate-950/40 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {metadata.thumbnail && (
              <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow">
                <img
                  src={metadata.thumbnail}
                  alt={metadata.title}
                  className="w-full h-full object-cover"
                />
                {metadata.duration_string && (
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-medium text-white backdrop-blur-sm">
                    {metadata.duration_string}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-2 leading-snug">
                {metadata.title}
              </h4>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {metadata.uploader && (
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-300">{metadata.uploader}</span>
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
                    <span>{metadata.like_count.toLocaleString()}</span>
                  </span>
                )}
              </div>

              {metadata.uniqueResolutions && metadata.uniqueResolutions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">Available:</span>
                  {metadata.uniqueResolutions.slice(0, 5).map(res => (
                    <span key={res} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700/60">
                      {res}p
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950/70 border border-slate-800">
            <button
              onClick={() => setMode('video')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'video' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video + Audio</span>
            </button>

            <button
              onClick={() => setMode('audio')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'audio' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio Only</span>
            </button>

            <button
              onClick={() => setMode('custom')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'custom' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Custom Args</span>
            </button>
          </div>
        </div>

        {/* Tab Specific Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          
          {/* VIDEO MODE */}
          {mode === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Resolution
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {standardResolutions.map(res => (
                    <button
                      key={res.value}
                      type="button"
                      onClick={() => setVideoQuality(res.value)}
                      className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        videoQuality === res.value 
                          ? 'bg-sky-500/15 border-sky-500 text-white ring-1 ring-sky-500' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{res.label}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        videoQuality === res.value ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {res.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Container Format
                </label>
                <div className="flex gap-2">
                  {['mp4', 'mkv', 'webm'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setVideoFormat(fmt)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                        videoFormat === fmt
                          ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIO ONLY MODE */}
          {mode === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Audio Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {audioCodecs.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAudioFormat(c.value)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        audioFormat === c.value
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {['mp3', 'm4a'].includes(audioFormat) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Bitrate Quality
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {audioBitrates.map(b => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setAudioQuality(b.value)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          audioQuality === b.value
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {b.value} kbps
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOM COMMAND MODE */}
          {mode === 'custom' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Custom yt-dlp Arguments
                  </label>
                  {templates.length > 0 && (
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                      className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    >
                      <option value="">Load from Template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="--embed-thumbnail --add-metadata --sponsorblock-remove all"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Arguments will be passed directly into the yt-dlp command. Output destination and URL are automatically appended.
                </p>
              </div>
            </div>
          )}

          {/* EXPANDABLE ADVANCED OPTIONS */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Video Clipping, Subtitles & Cookie Profiles</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                {/* Video Clipping (Section Slider) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trim / Clip Section</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={enableClip}
                      onChange={(e) => setEnableClip(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>

                  {enableClip && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Start Time (HH:MM:SS)</span>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="00:00:00"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">End Time (HH:MM:SS)</span>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder={metadata.duration_string || "00:01:30"}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitles */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Subtitles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Download & Embed Subtitles</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={subtitles}
                      onChange={(e) => setSubtitles(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>

                  {subtitles && (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Subtitle Languages (comma-separated codes)</span>
                      <input
                        type="text"
                        value={subtitleLangs}
                        onChange={(e) => setSubtitleLangs(e.target.value)}
                        placeholder="en,bn,es,all"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Metadata & Thumbnail Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedThumbnail}
                      onChange={(e) => setEmbedThumbnail(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span>Embed Thumbnail</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedMetadata}
                      onChange={(e) => setEmbedMetadata(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span>Add Metadata Tags</span>
                  </label>
                </div>

                {/* Cookie Profile Selector */}
                {cookies.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                      <Cookie className="w-3.5 h-3.5 text-amber-400" />
                      <span>Apply Cookie Profile (Bypass Auth)</span>
                    </label>
                    <select
                      value={selectedCookieProfileId}
                      onChange={(e) => setSelectedCookieProfileId(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none"
                    >
                      <option value="">No Cookies (Default)</option>
                      {cookies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-xs font-semibold text-white flex items-center space-x-2 shadow-lg shadow-sky-500/25 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Start Download</span>
          </button>
        </div>

      </div>
    </div>
  );
};
