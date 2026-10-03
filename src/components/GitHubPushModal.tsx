import React, { useState } from 'react';
import { Github, CheckCircle2, AlertCircle, Loader2, X, Terminal, ExternalLink, Copy, Check } from 'lucide-react';

interface GitHubPushModalProps {
  onClose: () => void;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({ onClose }) => {
  const [repoName, setRepoName] = useState('SealPlus-PC');
  const [token, setToken] = useState(() => localStorage.getItem('seal_gh_token') || '');
  const [commitMessage, setCommitMessage] = useState('Seal Plus for PC - Full Stack Desktop & Web yt-dlp Video & Audio Downloader');
  const [isPushing, setIsPushing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; repoUrl?: string; cloneUrl?: string; error?: string } | null>(null);
  const [copiedClone, setCopiedClone] = useState(false);

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) localStorage.setItem('seal_gh_token', token);
    setIsPushing(true);
    setResult(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          repoName: repoName.trim(),
          commitMessage: commitMessage.trim()
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || 'Network error occurred while pushing to GitHub'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const copyCloneCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Push to GitHub</h3>
              <p className="text-xs text-slate-400">Account: xenoxfire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!result?.success ? (
            <form onSubmit={handlePush} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  GitHub Repository Name
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-400">
                  <span>github.com/xenoxfire/</span>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="flex-1 bg-transparent text-white font-semibold outline-none pl-1"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  If the repository does not exist, it will be automatically created under your GitHub account.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-sky-500"
                  required
                />
              </div>

              {result?.error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{result.error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPushing || !repoName.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  {isPushing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Repository & Pushing Code...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>Push to GitHub Repository</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-white">Successfully Pushed to GitHub!</p>
                  <p className="text-slate-300 mt-0.5">Your Seal Plus PC project is now live on your GitHub account.</p>
                </div>
              </div>

              {result.repoUrl && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Repository URL</span>
                    <a
                      href={result.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center space-x-1 font-mono text-[11px]"
                    >
                      <span>{result.repoUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* PC Setup Instructions */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>How to Run on your PC:</span>
                </p>

                <div className="p-3 rounded-xl bg-black font-mono text-[11px] text-slate-300 space-y-1 relative group">
                  <p className="text-emerald-400"># 1. Clone the repository to your PC:</p>
                  <p>git clone {result.cloneUrl || `https://github.com/xenoxfire/${repoName}.git`}</p>
                  <p className="text-emerald-400 pt-1"># 2. Enter directory & install packages:</p>
                  <p>cd {repoName}</p>
                  <p>npm install</p>
                  <p className="text-emerald-400 pt-1"># 3. Start Seal Plus PC on your computer:</p>
                  <p>npm run dev</p>

                  <button
                    onClick={() => copyCloneCmd(`git clone ${result.cloneUrl || `https://github.com/xenoxfire/${repoName}.git`} && cd ${repoName} && npm install && npm run dev`)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                    title="Copy all commands"
                  >
                    {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedClone ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Note: Make sure your PC has <code className="text-sky-300 font-mono">Node.js</code>, <code className="text-sky-300 font-mono">ffmpeg</code>, and <code className="text-sky-300 font-mono">yt-dlp</code> installed for full native media downloading!
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
