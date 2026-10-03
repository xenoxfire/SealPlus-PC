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

  // Video Info & format extraction with robust fallback
  async getVideoInfo(url: string): Promise<VideoMetadata> {
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return data;
        }
      }
    } catch (e) {
      console.warn('API info fetch error, using client fallback', e);
    }

    // Client-side instant fallback for YouTube and other URLs
    let clean = url.trim().replace(/^["']|["']$/g, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const match = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
    const ytId = match ? match[1] : null;

    return {
      id: ytId || 'media-' + Date.now(),
      title: ytId ? 'YouTube Video' : 'Online Video',
      uploader: ytId ? 'YouTube Channel' : 'Media',
      thumbnail: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '',
      webpage_url: clean,
      duration_string: 'HD',
      videoFormats: [
        { format_id: '1080', ext: 'mp4', resolution: '1080p Full HD', height: 1080 },
        { format_id: '720', ext: 'mp4', resolution: '720p HD', height: 720 },
        { format_id: '480', ext: 'mp4', resolution: '480p SD', height: 480 },
        { format_id: 'best', ext: 'mp4', resolution: 'Best Available', height: 1080 }
      ],
      audioFormats: [
        { format_id: 'bestaudio', ext: 'mp3', abr: 320, format_note: 'MP3 High Quality' },
        { format_id: '140', ext: 'm4a', abr: 128, format_note: 'AAC Audio' }
      ],
      uniqueResolutions: [1080, 720, 480],
      rawFormatsCount: 4,
      isFallback: true
    };
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

  // Pause task
  async pauseTask(taskId: string): Promise<void> {
    await fetch(`/api/pause/${taskId}`, { method: 'POST' });
  },

  // Resume task
  async resumeTask(taskId: string): Promise<void> {
    await fetch(`/api/resume/${taskId}`, { method: 'POST' });
  },

  // Retry task
  async retryTask(taskId: string): Promise<void> {
    await fetch(`/api/retry/${taskId}`, { method: 'POST' });
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    await fetch(`/api/delete-task/${taskId}`, { method: 'POST' });
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
