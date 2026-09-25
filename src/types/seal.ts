export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution?: string;
  height?: number;
  width?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize: number;
  tbr?: number;
  format_note?: string;
}

export interface AudioFormat {
  format_id: string;
  ext: string;
  abr?: number;
  acodec?: string;
  filesize: number;
  format_note?: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  duration_string?: string;
  uploader?: string;
  uploader_url?: string;
  view_count?: number;
  like_count?: number;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number; resolution?: string }>;
  webpage_url?: string;
  upload_date?: string;
  tags?: string[];
  subtitles?: string[];
  automatic_captions?: string[];
  uniqueResolutions?: number[];
  videoFormats?: VideoFormat[];
  audioFormats?: AudioFormat[];
  rawFormatsCount?: number;
}

export interface DownloadTaskItem {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  status: 'pending' | 'downloading' | 'processing' | 'paused' | 'completed' | 'error' | 'cancelled';
  progress: number;
  speed: string;
  eta: string;
  downloadedBytes: number;
  totalBytes: number;
  filename?: string;
  error?: string;
  quality?: string;
  format?: string;
  type: 'video' | 'audio' | 'thumbnail' | 'comments' | 'batch';
  createdAt: string;
  spawnArgs?: string[];
  options?: any;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  filename: string;
  size: number;
  type: 'video' | 'audio' | 'thumbnail';
  quality: string;
  format: string;
  thumbnail?: string;
  date: string;
}

export interface CommandTemplate {
  id: string;
  name: string;
  command: string;
  desc?: string;
}

export interface CookieProfile {
  id: string;
  name: string;
  domain: string;
  content: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  author: string;
  author_thumbnail?: string;
  text: string;
  like_count: number;
  timestamp?: number;
  time_text?: string;
}

export interface AppSettings {
  downloadDir: string;
  defaultVideoFormat: 'mp4' | 'mkv' | 'webm';
  defaultAudioFormat: 'mp3' | 'm4a' | 'opus' | 'flac' | 'wav';
  defaultQuality: string;
  maxConcurrentDownloads: number;
  embedThumbnail: boolean;
  embedMetadata: boolean;
  subtitles: boolean;
  subtitleLangs: string;
  theme: 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'pink';
  darkMode: 'dark' | 'light' | 'amoled';
  glassEffect: boolean;
  securityPin: string;
  isPinLocked: boolean;
}
