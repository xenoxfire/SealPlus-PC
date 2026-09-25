import React, { useState } from 'react';
import { Cookie, Plus, Trash2, Edit3, Check, X, Shield, FileText, Info } from 'lucide-react';
import { CookieProfile, AppSettings } from '../types/seal';
import { api } from '../services/api';

interface CookiesPageProps {
  cookies: CookieProfile[];
  settings: AppSettings;
  onRefreshCookies: () => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = ({
  cookies,
  settings,
  onRefreshCookies
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('youtube.com');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setDomain('youtube.com');
    setContent('# Netscape HTTP Cookie File\n# http://curl.haxx.se/rfc/cookie_spec.html\n');
    setIsEditing(true);
  };

  const handleOpenEdit = (c: CookieProfile) => {
    setEditId(c.id);
    setName(c.name);
    setDomain(c.domain);
    setContent(c.content);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await api.saveCookie({
        id: editId || undefined,
        name: name.trim(),
        domain: domain.trim(),
        content: content.trim()
      });
      setIsEditing(false);
      onRefreshCookies();
    } catch (err: any) {
      alert('Failed to save cookie profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cookie profile?')) return;
    try {
      await api.deleteCookie(id);
      onRefreshCookies();
    } catch (err: any) {
      alert('Failed to delete cookie profile: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cookie className="w-5 h-5 text-amber-400" />
            <span>Cookie Profiles</span>
          </h2>
          <p className="text-xs text-slate-400">
            Store cookies to download age-restricted, member-only, or login-protected content
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Profile</span>
        </button>
      </div>

      {/* Editing Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editId ? 'Edit Cookie Profile' : 'New Cookie Profile'}</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-semibold">Profile Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. YouTube Account"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-semibold">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. youtube.com, instagram.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">
              Netscape Cookie Content (cookies.txt format)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Export cookies using Chrome/Firefox extensions like "Get cookies.txt locally" and paste the text above.
            </p>
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {cookies.map(c => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between shadow-md"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold">
                  {c.domain}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {c.content ? `${c.content.split('\n').filter(l => l.trim() && !l.startsWith('#')).length} active cookies stored` : 'Empty cookie profile'}
              </p>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
