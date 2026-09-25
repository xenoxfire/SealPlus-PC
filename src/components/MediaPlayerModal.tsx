import React, { useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, FastForward } from 'lucide-react';

interface MediaPlayerModalProps {
  filename: string;
  title: string;
  onClose: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  filename,
  title,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAudio = filename.endsWith('.mp3') || filename.endsWith('.m4a') || filename.endsWith('.opus') || filename.endsWith('.flac') || filename.endsWith('.wav');
  const mediaUrl = `/api/downloads/file/${encodeURIComponent(filename)}`;

  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
            <p className="text-xs font-mono text-slate-400 truncate">{filename}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={changeSpeed}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-sky-400 border border-slate-700"
              title="Change playback speed"
            >
              {playbackRate}x
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Player */}
        <div className="bg-black flex items-center justify-center p-2 min-h-[300px] max-h-[65vh]">
          {isAudio ? (
            <div className="w-full py-12 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Play className="w-10 h-10 text-white fill-current" />
              </div>
              <audio
                ref={videoRef as any}
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-w-md"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={mediaUrl}
              controls
              autoPlay
              className="w-full max-h-[60vh] object-contain rounded-lg"
            />
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>HTML5 Native Media Stream</span>
          <a
            href={`${mediaUrl}?download=true`}
            download={filename}
            className="text-sky-400 hover:underline font-medium"
          >
            Direct File Download
          </a>
        </div>
      </div>
    </div>
  );
};
