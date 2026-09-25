import React from 'react';
import { 
  Download, 
  X, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardDriveDownload, 
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import { DownloadTaskItem, AppSettings } from '../types/seal';

interface ActiveDownloadsProps {
  tasks: DownloadTaskItem[];
  settings: AppSettings;
  onCancelTask: (id: string) => void;
  onPlayMedia?: (filename: string, title: string) => void;
}

export const ActiveDownloads: React.FC<ActiveDownloadsProps> = ({
  tasks,
  settings,
  onCancelTask,
  onPlayMedia
}) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Download className="w-4 h-4 text-sky-400" />
          <span>Active Downloads ({tasks.length})</span>
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const isDone = task.status === 'completed';
          const isError = task.status === 'error';
          const isCancelled = task.status === 'cancelled';
          const isProcessing = task.status === 'processing';

          return (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                settings.glassEffect 
                  ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-lg' 
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  {task.thumbnail ? (
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60">
                      <img src={task.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-sky-400 border border-slate-700/60">
                      <Download className="w-5 h-5" />
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

                      {!isDone && !isError && !isCancelled && (
                        <>
                          <span className="font-mono text-sky-400 font-medium">{task.speed || 'Downloading...'}</span>
                          {task.eta && (
                            <span className="flex items-center space-x-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>ETA {task.eta}</span>
                            </span>
                          )}
                        </>
                      )}

                      {isDone && (
                        <span className="text-emerald-400 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      )}

                      {isProcessing && (
                        <span className="text-amber-400 font-medium flex items-center space-x-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Merging streams...</span>
                        </span>
                      )}

                      {isError && (
                        <span className="text-rose-400 font-medium flex items-center space-x-1" title={task.error}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">Failed: {task.error || 'Error'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {isDone && task.filename && (
                    <>
                      {onPlayMedia && (
                        <button
                          type="button"
                          onClick={() => onPlayMedia(task.filename!, task.title)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play</span>
                        </button>
                      )}

                      <a
                        href={`/api/downloads/file/${encodeURIComponent(task.filename)}?download=true`}
                        download
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-all"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save to PC</span>
                      </a>
                    </>
                  )}

                  {!isDone && !isError && (
                    <button
                      type="button"
                      onClick={() => onCancelTask(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Cancel download"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {!isDone && !isError && !isCancelled && (
                <div className="mt-3 w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
