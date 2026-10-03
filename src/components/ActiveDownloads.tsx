import React, { useState } from 'react';
import { 
  Download, 
  Pause, 
  Play, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardDriveDownload, 
  Layers,
  Filter,
  Check,
  PauseCircle,
  PlayCircle,
  XCircle,
  Film
} from 'lucide-react';
import { DownloadTaskItem, AppSettings } from '../types/seal';

interface ActiveDownloadsProps {
  tasks: DownloadTaskItem[];
  settings: AppSettings;
  onCancelTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onRetryTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onPlayMedia?: (filename: string, title: string) => void;
}

export const ActiveDownloads: React.FC<ActiveDownloadsProps> = ({
  tasks,
  settings,
  onCancelTask,
  onPauseTask,
  onResumeTask,
  onRetryTask,
  onDeleteTask,
  onPlayMedia
}) => {
  const [filterState, setFilterState] = useState<'all' | 'downloading' | 'pending' | 'paused' | 'completed' | 'failed'>('all');

  // Calculate counts for each status
  const totalCount = tasks.length;
  const downloadingCount = tasks.filter(t => t.status === 'downloading' || t.status === 'processing').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const pausedCount = tasks.filter(t => t.status === 'paused').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const failedCount = tasks.filter(t => t.status === 'error' || t.status === 'cancelled').length;

  const filteredTasks = tasks.filter(task => {
    if (filterState === 'all') return true;
    if (filterState === 'downloading') return task.status === 'downloading' || task.status === 'processing';
    if (filterState === 'pending') return task.status === 'pending';
    if (filterState === 'paused') return task.status === 'paused';
    if (filterState === 'completed') return task.status === 'completed';
    if (filterState === 'failed') return task.status === 'error' || task.status === 'cancelled';
    return true;
  });

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Category Filter Chips / Counters */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Download Queue & Tasks Status</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click any filter to view</span>
        </div>

        {/* Status Count Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {/* All */}
          <button
            type="button"
            onClick={() => setFilterState('all')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'all'
                ? 'bg-slate-800 border-sky-500 text-white ring-1 ring-sky-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-white">{totalCount}</span>
            <span className="text-[11px] font-medium">মোট (Total)</span>
          </button>

          {/* Downloading */}
          <button
            type="button"
            onClick={() => setFilterState('downloading')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'downloading'
                ? 'bg-sky-500/20 border-sky-500 text-white ring-1 ring-sky-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-sky-400 flex items-center space-x-1">
              <span>{downloadingCount}</span>
              {downloadingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
            </span>
            <span className="text-[11px] font-medium">চলছে (Active)</span>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => setFilterState('pending')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'pending'
                ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-amber-400">{pendingCount}</span>
            <span className="text-[11px] font-medium">পেন্ডিং (Queue)</span>
          </button>

          {/* Paused / Stopped */}
          <button
            type="button"
            onClick={() => setFilterState('paused')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'paused'
                ? 'bg-indigo-500/20 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-indigo-400">{pausedCount}</span>
            <span className="text-[11px] font-medium">পজ / স্টপ</span>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => setFilterState('completed')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'completed'
                ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-emerald-400">{completedCount}</span>
            <span className="text-[11px] font-medium">কমপ্লিট (Done)</span>
          </button>

          {/* Failed */}
          <button
            type="button"
            onClick={() => setFilterState('failed')}
            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
              filterState === 'failed'
                ? 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base font-extrabold text-rose-400">{failedCount}</span>
            <span className="text-[11px] font-medium">ফেইল্ড (Failed)</span>
          </button>
        </div>
      </div>

      {/* Task List filtered */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            এই ক্যাটাগরিতে কোনো ডাউনলোড নেই (No downloads in this status).
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === 'completed';
            const isError = task.status === 'error';
            const isCancelled = task.status === 'cancelled';
            const isProcessing = task.status === 'processing';
            const isPaused = task.status === 'paused';
            const isDownloading = task.status === 'downloading';

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  settings.glassEffect 
                    ? 'bg-slate-900/70 backdrop-blur-xl border-slate-800/80 shadow-lg' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    {task.thumbnail ? (
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 relative">
                        <img src={task.thumbnail} alt="" className="w-full h-full object-cover" />
                        {isPaused && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Pause className="w-4 h-4 text-amber-300" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-sky-400 border border-slate-700/60">
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Film className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate" title={task.title}>
                        {task.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        {task.quality && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/60">
                            {task.quality}
                          </span>
                        )}

                        {/* Status Badges */}
                        {isDownloading && (
                          <>
                            <span className="font-mono text-sky-400 font-bold">{task.speed || 'Downloading...'}</span>
                            {task.eta && (
                              <span className="flex items-center space-x-1 text-slate-400 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>ETA {task.eta}</span>
                              </span>
                            )}
                          </>
                        )}

                        {isPaused && (
                          <span className="text-amber-400 font-bold flex items-center space-x-1">
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>স্টপ/পজ করা আছে (Paused)</span>
                          </span>
                        )}

                        {task.status === 'pending' && (
                          <span className="text-amber-300 font-medium">অপেক্ষমান (Pending)</span>
                        )}

                        {isProcessing && (
                          <span className="text-indigo-400 font-medium animate-pulse">
                            ভিডিও মার্জিং হচ্ছে (Merging Audio & Video)...
                          </span>
                        )}

                        {isDone && (
                          <span className="text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ডাউনলোড সম্পন্ন (Completed MP4)</span>
                          </span>
                        )}

                        {(isError || isCancelled) && (
                          <span className="text-rose-400 font-medium flex items-center space-x-1" title={task.error}>
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{task.error || 'Failed'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: ACTION BUTTONS (Stop, Push/Resume, Delete, Play, Save) */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                    
                    {/* 1. STOP / PAUSE BUTTON */}
                    {(isDownloading || task.status === 'pending') && (
                      <button
                        type="button"
                        onClick={() => onPauseTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        title="ডাউনলোড স্টপ / পজ করুন (Stop / Pause)"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop (স্টপ)</span>
                      </button>
                    )}

                    {/* 2. PUSH / RESUME BUTTON */}
                    {isPaused && (
                      <button
                        type="button"
                        onClick={() => onResumeTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        title="ডাউনলোড পুনরায় চালু করুন (Resume / Push)"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Push (চালু)</span>
                      </button>
                    )}

                    {/* 3. RETRY BUTTON (IF FAILED) */}
                    {(isError || isCancelled) && (
                      <button
                        type="button"
                        onClick={() => onRetryTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        title="আবার চেষ্টা করুন (Retry)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}

                    {/* 4. PLAY BUTTON (IF COMPLETED) */}
                    {isDone && task.filename && onPlayMedia && (
                      <button
                        type="button"
                        onClick={() => onPlayMedia(task.filename!, task.title)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        title="Play in App"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>
                    )}

                    {/* 5. DIRECT SAVE TO PC BUTTON (IF COMPLETED) */}
                    {isDone && task.filename && (
                      <a
                        href={`/api/downloads/file/${encodeURIComponent(task.filename)}?download=true`}
                        download={task.filename}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
                        title="ভিডিও ফাইল পিসিতে সেভ করুন (Save .mp4 file to PC)"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5" />
                        <span>পিসিতে সেভ (Save)</span>
                      </a>
                    )}

                    {/* 6. DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="ডাউনলোডটি মুছে ফেলুন (Delete / Remove)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Real-time Progress Bar */}
                {!isDone && !isError && !isCancelled && (
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{task.progress.toFixed(1)}%</span>
                      <span>{task.speed}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isPaused 
                            ? 'bg-amber-400' 
                            : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
