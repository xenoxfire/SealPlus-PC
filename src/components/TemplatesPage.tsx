import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Edit3, Check, X, Sparkles, HelpCircle } from 'lucide-react';
import { CommandTemplate, AppSettings } from '../types/seal';
import { api } from '../services/api';

interface TemplatesPageProps {
  templates: CommandTemplate[];
  settings: AppSettings;
  onRefreshTemplates: () => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  templates,
  settings,
  onRefreshTemplates
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [desc, setDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setCommand('');
    setDesc('');
    setIsEditing(true);
  };

  const handleOpenEdit = (t: CommandTemplate) => {
    setEditId(t.id);
    setName(t.name);
    setCommand(t.command);
    setDesc(t.desc || '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;

    setIsSaving(true);
    try {
      await api.saveTemplate({
        id: editId || undefined,
        name: name.trim(),
        command: command.trim(),
        desc: desc.trim()
      });
      setIsEditing(false);
      onRefreshTemplates();
    } catch (err: any) {
      alert('Failed to save template: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteTemplate(id);
      onRefreshTemplates();
    } catch (err: any) {
      alert('Failed to delete template: ' + err.message);
    }
  };

  const commonPresets = [
    { name: 'Extract Subtitles Only', command: '--write-subs --skip-download --sub-format srt', desc: 'Downloads only SRT subtitle files' },
    { name: 'Download Audio in FLAC', command: '-x --audio-format flac', desc: 'Highest resolution lossless audio' },
    { name: 'Rate Limit (2MB/s)', command: '--rate-limit 2M', desc: 'Limits download speed to save bandwidth' },
    { name: 'Custom SponsorBlock', command: '--sponsorblock-remove sponsor,intro,outro', desc: 'Skips intros, outros, and sponsor segments' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <span>Command Templates</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create reusable custom yt-dlp arguments and presets
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Template Edit Form Modal */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editId ? 'Edit Template' : 'New Command Template'}</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 1080p with SponsorBlock"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">Command Line Arguments</label>
            <textarea
              rows={2}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. -x --audio-format mp3 --audio-quality 0"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">Description (Optional)</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Extracts highest quality MP3"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Templates */}
      <div className="grid grid-cols-1 gap-3">
        {templates.map(t => (
          <div
            key={t.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{t.name}</span>
              </div>
              <p className="text-xs font-mono text-purple-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 inline-block">
                {t.command}
              </p>
              {t.desc && (
                <p className="text-xs text-slate-400">{t.desc}</p>
              )}
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleOpenEdit(t)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Presets */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Recommended Template Presets</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commonPresets.map((p, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{p.name}</p>
                <p className="text-[11px] font-mono text-purple-400 truncate">{p.command}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setName(p.name);
                  setCommand(p.command);
                  setDesc(p.desc);
                  setIsEditing(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white shrink-0"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
