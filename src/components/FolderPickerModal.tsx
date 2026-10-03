import React, { useState, useRef } from 'react';
import { Folder, FolderPlus, HardDrive, Check, X, Laptop, ArrowRight } from 'lucide-react';

interface FolderPickerModalProps {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderPath: string) => void;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  currentPath,
  isOpen,
  onClose,
  onSelectFolder,
}) => {
  const [customPath, setCustomPath] = useState(currentPath || 'Downloads');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset popular locations on Windows & PC
  const pcPresets = [
    { label: 'PC Downloads (ডিফল্ট ডাউনলোড)', path: 'Downloads', icon: '📥' },
    { label: 'Videos Folder (ভিডিও ফোল্ডার)', path: 'Videos', icon: '🎬' },
    { label: 'Music Folder (মিউজিক ফোল্ডার)', path: 'Music', icon: '🎵' },
    { label: 'Desktop (ডেস্কটপ ফোল্ডার)', path: 'Desktop', icon: '🖥️' },
    { label: 'Drive D:\\Videos (ডি ড্রাইভ ভিডিও)', path: 'D:\\Videos', icon: '💾' },
    { label: 'Drive D:\\Downloads (ডি ড্রাইভ ডাউনলোড)', path: 'D:\\Downloads', icon: '💾' },
    { label: 'Drive C:\\Downloads (সি ড্রাইভ)', path: 'C:\\Downloads', icon: '💽' },
    { label: 'Drive E:\\Downloads (ই ড্রাইভ)', path: 'E:\\Downloads', icon: '💽' }
  ];

  // Native PC folder selector
  const handleOpenNativeDirectoryPicker = async () => {
    // 1. Try File System Access API (Supported on Chrome / Edge / Opera on Windows & PC)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          id: 'seal-downloads-dir',
          mode: 'read'
        });
        if (dirHandle && dirHandle.name) {
          const folderName = dirHandle.name;
          const detectedPath = folderName.includes(':') || folderName.startsWith('/')
            ? folderName
            : `Downloads/${folderName}`;
          setCustomPath(detectedPath);
          handleConfirm(detectedPath);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User closed dialog
      }
    }

    // 2. Fallback to HTML5 directory picker
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }
  };

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const relPath = firstFile.webkitRelativePath || '';
      const folderName = relPath.split('/')[0] || 'Selected_Folder';
      const picked = `Downloads/${folderName}`;
      setCustomPath(picked);
      handleConfirm(picked);
    }
  };

  const handleConfirm = (pathToSave: string) => {
    const target = pathToSave.trim() || 'Downloads';
    onSelectFolder(target);
    setSuccessMsg(`ফোল্ডার সেভ হয়েছে: ${target}`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Hidden native folder input for fallback */}
      <input
        type="file"
        ref={hiddenInputRef}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        className="hidden"
        onChange={handleNativeInputChange}
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Download Location (পিসির ফোল্ডার নির্বাচন করুন)
              </h3>
              <p className="text-xs text-slate-400">
                একবার নির্বাচন করলেই সব ভিডিও এই ফোল্ডারে সেভ হবে
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native Browser Button (Primary Action) */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
          <p className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>পিসির ড্রাইভ / ফোল্ডার খুলুন (Open PC Explorer):</span>
          </p>

          <button
            type="button"
            onClick={handleOpenNativeDirectoryPicker}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 group active:scale-98"
          >
            <Folder className="w-4 h-4" />
            <span>Browse PC Folder (পিসির ফোল্ডার বেছে নিন)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Popular Locations Fast Click */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>জনপ্রিয় পিসি ফোল্ডার (Quick Select Locations):</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {pcPresets.map((preset) => (
              <button
                key={preset.path}
                type="button"
                onClick={() => {
                  setCustomPath(preset.path);
                  handleConfirm(preset.path);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                  customPath === preset.path
                    ? 'bg-sky-500/20 border-sky-400 text-white ring-1 ring-sky-500 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">{preset.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-white">{preset.path}</p>
                  <p className="text-[10px] text-slate-400 truncate">{preset.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Folder Path Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm(customPath);
          }}
          className="space-y-2 pt-1"
        >
          <label className="text-xs font-semibold text-slate-300 block">
            Custom Folder Path (পিসির ড্রাইভ লোকেশন):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="e.g. D:\Videos or C:\Users\Downloads or /downloads"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs font-mono text-white outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shrink-0 flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Select Folder (সেভ করুন)</span>
            </button>
          </div>
        </form>

        {/* Success confirmation toast inside modal */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
};
