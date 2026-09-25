import { VideoMetadata, DownloadTaskItem, DownloadHistoryItem, CommandTemplate, CookieProfile, AppSettings, CommentItem } from '../types/seal';

export const api = {
  // System status
  async getStatus(): Promise<{ status: string; ytdlp: boolean; ytdlpVersion: string; ffmpeg: boolean; downloadsPath: string }> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  // Update yt-dlp binary
  async updateYtDlp(): Promise<{ success: boolean; version?: string; error?: string }> {
    const res = await fetch('/api/update-ytdlp', { method: 'POST' });
    return res.json();
  },

  // Video Info & format extraction
  async getVideoInfo(url: string): Promise<VideoMetadata> {
    const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch video info');
    }
    return data;
  },

  // Fetch comments
  async getComments(url: string): Promise<{ total: number; comments: CommentItem[] }> {
    const res = await fetch(`/api/comments?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch comments');
    }
    return data;
  },

  // Start download
  async startDownload(payload: {
    url: string;
    title?: string;
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
  }): Promise<{ success: boolean; taskId: string; task: DownloadTaskItem }> {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to start download');
    }
    return data;
  },

  // Poll tasks or get task
  async getTask(taskId: string): Promise<DownloadTaskItem> {
    const res = await fetch(`/api/tasks/${taskId}`);
    if (!res.ok) throw new Error('Task not found');
    return res.json();
  },

  // Cancel task
  async cancelTask(taskId: string): Promise<void> {
    await fetch(`/api/cancel/${taskId}`, { method: 'POST' });
  },

  // Get active tasks
  async getActiveTasks(): Promise<DownloadTaskItem[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) return [];
    return res.json();
  },

  // Download History
  async getHistory(): Promise<DownloadHistoryItem[]> {
    const res = await fetch('/api/downloads');
    if (!res.ok) return [];
    return res.json();
  },

  async deleteHistoryItem(id: string): Promise<void> {
    await fetch(`/api/downloads/${id}`, { method: 'DELETE' });
  },

  // Command templates
  async getTemplates(): Promise<CommandTemplate[]> {
    const res = await fetch('/api/templates');
    if (!res.ok) return [];
    return res.json();
  },

  async saveTemplate(template: Partial<CommandTemplate>): Promise<CommandTemplate[]> {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return res.json();
  },

  async deleteTemplate(id: string): Promise<CommandTemplate[]> {
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Cookie profiles
  async getCookies(): Promise<CookieProfile[]> {
    const res = await fetch('/api/cookies');
    if (!res.ok) return [];
    return res.json();
  },

  async saveCookie(cookie: Partial<CookieProfile>): Promise<CookieProfile[]> {
    const res = await fetch('/api/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cookie)
    });
    return res.json();
  },

  async deleteCookie(id: string): Promise<CookieProfile[]> {
    const res = await fetch(`/api/cookies/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Backup
  async exportBackup(): Promise<void> {
    window.location.href = '/api/backup/export';
  },

  async importBackup(data: any): Promise<boolean> {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  }
};
