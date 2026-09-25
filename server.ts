import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure necessary directories exist
const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');
const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const COOKIES_FILE = path.join(DATA_DIR, 'cookies.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Initialize data files if not present
function initFile(file: string, defaultData: any) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

initFile(TEMPLATES_FILE, [
  { id: '1', name: 'Extract Best MP3 Audio', command: '-x --audio-format mp3 --audio-quality 0', desc: 'Converts audio to highest quality MP3 with metadata' },
  { id: '2', name: 'Embed Thumbnail & Metadata', command: '--embed-thumbnail --add-metadata', desc: 'Embeds video thumbnail and ID3/MP4 tags' },
  { id: '3', name: '1080p Maximum Quality', command: '-f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --merge-output-format mp4', desc: 'Caps video resolution at 1080p Full HD' },
  { id: '4', name: 'Bypass Geo-Restriction', command: '--geo-bypass', desc: 'Bypasses geographical viewing restrictions' },
  { id: '5', name: 'SponsorBlock Audio/Video', command: '--sponsorblock-remove all', desc: 'Removes sponsor segments using SponsorBlock API' }
]);

initFile(COOKIES_FILE, [
  { id: '1', name: 'Default Profile', domain: 'youtube.com', content: '# Netscape HTTP Cookie File\n', updatedAt: new Date().toISOString() }
]);

initFile(HISTORY_FILE, []);

initFile(SETTINGS_FILE, {
  downloadDir: DOWNLOADS_DIR,
  defaultVideoFormat: 'mp4',
  defaultAudioFormat: 'mp3',
  defaultQuality: '1080p',
  maxConcurrentDownloads: 3,
  embedThumbnail: true,
  embedMetadata: true,
  subtitles: false,
  subtitleLangs: 'en,bn,es',
  theme: 'blue',
  darkMode: 'dark',
  glassEffect: true,
  securityPin: '',
  isPinLocked: false
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Active download tasks in memory
interface DownloadTask {
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
  outputPath?: string;
  error?: string;
  quality?: string;
  format?: string;
  type: 'video' | 'audio' | 'thumbnail' | 'comments' | 'batch';
  createdAt: string;
  process?: any;
  spawnArgs?: string[];
  options?: any;
}

const activeTasks = new Map<string, DownloadTask>();
const sseClients = new Map<string, Response[]>();

function notifyTaskUpdate(task: DownloadTask) {
  const clients = sseClients.get(task.id) || [];
  const data = JSON.stringify({
    id: task.id,
    status: task.status,
    progress: task.progress,
    speed: task.speed,
    eta: task.eta,
    downloadedBytes: task.downloadedBytes,
    totalBytes: task.totalBytes,
    filename: task.filename,
    error: task.error,
    title: task.title,
    thumbnail: task.thumbnail
  });
  clients.forEach(res => {
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// --------------------- API ROUTES ---------------------

// System Status & yt-dlp check
app.get('/api/status', (req: Request, res: Response) => {
  exec('yt-dlp --version', (err, stdout) => {
    const ytdlpVersion = err ? 'Not installed' : stdout.trim();
    exec('ffmpeg -version', (fErr, fOut) => {
      const ffmpegAvailable = !fErr;
      res.json({
        status: 'online',
        ytdlp: !err,
        ytdlpVersion,
        ffmpeg: ffmpegAvailable,
        platform: process.platform,
        downloadsPath: DOWNLOADS_DIR
      });
    });
  });
});

// Update yt-dlp binary
app.post('/api/update-ytdlp', (req: Request, res: Response) => {
  exec('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp && yt-dlp --version', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    const version = stdout.trim().split('\n').pop();
    res.json({ success: true, version });
  });
});

// Fetch detailed Video Metadata (yt-dlp --dump-json)
app.get('/api/info', (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Sanitize URL
  const cleanUrl = url.trim();

  const args = [
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    cleanUrl
  ];

  const ytdlp = spawn('yt-dlp', args);
  let stdoutData = '';
  let stderrData = '';

  const timer = setTimeout(() => {
    ytdlp.kill();
  }, 45000); // 45 seconds timeout

  ytdlp.stdout.on('data', (chunk) => {
    stdoutData += chunk.toString();
  });

  ytdlp.stderr.on('data', (chunk) => {
    stderrData += chunk.toString();
  });

  ytdlp.on('close', (code) => {
    clearTimeout(timer);
    if (code !== 0 || !stdoutData) {
      // Check if fallback dummy preview is helpful for invalid or restricted links
      return res.status(500).json({
        error: stderrData || 'Failed to fetch video details. Ensure link is public and valid.',
        code
      });
    }

    try {
      const info = JSON.parse(stdoutData);
      
      // Parse available formats nicely
      const formats = info.formats || [];
      const videoFormats: any[] = [];
      const audioFormats: any[] = [];

      formats.forEach((f: any) => {
        if (f.vcodec && f.vcodec !== 'none') {
          videoFormats.push({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.resolution || `${f.width || '?'}x${f.height || '?'}`,
            height: f.height,
            width: f.width,
            fps: f.fps,
            vcodec: f.vcodec,
            acodec: f.acodec,
            filesize: f.filesize || f.filesize_approx || 0,
            tbr: f.tbr,
            format_note: f.format_note
          });
        }
        if (f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')) {
          audioFormats.push({
            format_id: f.format_id,
            ext: f.ext,
            abr: f.abr,
            acodec: f.acodec,
            filesize: f.filesize || f.filesize_approx || 0,
            format_note: f.format_note
          });
        }
      });

      // Filter and sort resolutions
      const uniqueResolutions = Array.from(new Set(videoFormats.map(v => v.height).filter(Boolean))).sort((a: any, b: any) => b - a);

      res.json({
        id: info.id,
        title: info.title,
        description: info.description,
        duration: info.duration,
        duration_string: info.duration_string,
        uploader: info.uploader || info.channel || info.creator || 'Unknown Creator',
        uploader_url: info.uploader_url || info.channel_url,
        view_count: info.view_count,
        like_count: info.like_count,
        thumbnail: info.thumbnail,
        thumbnails: info.thumbnails || [],
        webpage_url: info.webpage_url || cleanUrl,
        upload_date: info.upload_date,
        tags: info.tags || [],
        categories: info.categories || [],
        subtitles: Object.keys(info.subtitles || {}),
        automatic_captions: Object.keys(info.automatic_captions || {}),
        uniqueResolutions,
        videoFormats,
        audioFormats,
        rawFormatsCount: formats.length
      });
    } catch (parseError: any) {
      res.status(500).json({ error: 'Failed to parse metadata JSON: ' + parseError.message });
    }
  });
});

// Fetch comments
app.get('/api/comments', (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const args = [
    '--write-comments',
    '--dump-single-json',
    '--playlist-items', '0',
    '--extractor-args', 'youtube:max_comments=40',
    url.trim()
  ];

  exec(args.map(a => `"${a}"`).join(' ').replace(/^"yt-dlp"/, 'yt-dlp'), { maxBuffer: 1024 * 1024 * 15 }, (err, stdout, stderr) => {
    if (err || !stdout) {
      return res.status(500).json({ error: stderr || 'No comments found or comments disabled for this video.' });
    }
    try {
      const data = JSON.parse(stdout);
      const comments = (data.comments || []).map((c: any) => ({
        id: c.id,
        author: c.author,
        author_thumbnail: c.author_thumbnail,
        text: c.text,
        like_count: c.like_count || 0,
        timestamp: c.timestamp,
        time_text: c._time_text || (c.timestamp ? new Date(c.timestamp * 1000).toLocaleDateString() : '')
      }));
      res.json({
        total: comments.length,
        comments
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to parse comments: ' + e.message });
    }
  });
});

// Start a Download
app.post('/api/download', async (req: Request, res: Response) => {
  const {
    url,
    title = 'Media',
    thumbnail,
    mode = 'video', // 'video' | 'audio' | 'custom'
    videoQuality = 'best',
    videoFormat = 'mp4',
    audioFormat = 'mp3',
    audioQuality = '320',
    embedThumbnail = true,
    embedMetadata = true,
    subtitles = false,
    subtitleLangs = 'en',
    startTime,
    endTime,
    customCommand = '',
    cookieProfileId
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const task: DownloadTask = {
    id: taskId,
    url,
    title: title || 'Media Download',
    thumbnail,
    status: 'pending',
    progress: 0,
    speed: '0 KiB/s',
    eta: '--:--',
    downloadedBytes: 0,
    totalBytes: 0,
    type: mode === 'audio' ? 'audio' : 'video',
    quality: mode === 'audio' ? `${audioFormat.toUpperCase()} (${audioQuality}k)` : `${videoQuality} (${videoFormat.toUpperCase()})`,
    format: mode === 'audio' ? audioFormat : videoFormat,
    createdAt: new Date().toISOString()
  };

  activeTasks.set(taskId, task);

  // Build yt-dlp arguments
  const outputTemplate = path.join(DOWNLOADS_DIR, `%(title).100s-%(id)s.%(ext)s`);
  const args: string[] = ['--newline'];

  if (mode === 'audio') {
    args.push('-x');
    args.push('--audio-format', audioFormat);
    if (audioQuality) {
      args.push('--audio-quality', audioQuality === '320' ? '0' : audioQuality);
    }
  } else if (mode === 'custom' && customCommand) {
    // Custom arguments
    const parts = customCommand.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    parts.forEach((p: string) => args.push(p.replace(/(^"|"$)/g, '')));
  } else {
    // Video mode
    if (videoQuality === 'best') {
      args.push('-f', `bestvideo+bestaudio/best`);
    } else {
      const height = parseInt(videoQuality, 10);
      if (!isNaN(height)) {
        args.push('-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`);
      } else {
        args.push('-f', videoQuality);
      }
    }
    if (videoFormat && videoFormat !== 'auto') {
      args.push('--merge-output-format', videoFormat);
    }
  }

  // Metadata & Thumbnail
  if (embedMetadata) {
    args.push('--add-metadata');
  }
  if (embedThumbnail) {
    args.push('--embed-thumbnail');
  }

  // Subtitles
  if (subtitles) {
    args.push('--write-subs');
    if (subtitleLangs) {
      args.push('--sub-langs', subtitleLangs);
    }
    args.push('--embed-subs');
  }

  // Sections (Clipping)
  if (startTime || endTime) {
    const s = startTime || '00:00:00';
    const e = endTime || 'inf';
    args.push('--download-sections', `*${s}-${e}`);
  }

  // Cookies support
  if (cookieProfileId) {
    try {
      const cookiesData = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
      const profile = cookiesData.find((p: any) => p.id === cookieProfileId);
      if (profile && profile.content && profile.content.trim()) {
        const tempCookiePath = path.join(DATA_DIR, `temp_cookie_${taskId}.txt`);
        fs.writeFileSync(tempCookiePath, profile.content, 'utf-8');
        args.push('--cookies', tempCookiePath);
      }
    } catch {
      // ignore
    }
  }

  args.push('-o', outputTemplate);
  args.push(url.trim());

  task.spawnArgs = args;
  task.options = { ...req.body };

  executeDownloadTask(task);

  res.json({
    success: true,
    taskId,
    task
  });
});

function executeDownloadTask(task: DownloadTask) {
  const args = [...(task.spawnArgs || [])];
  if (!args.includes('--continue')) {
    args.unshift('--continue');
  }

  // Spawn process
  const child = spawn('yt-dlp', args);
  task.process = child;
  task.status = 'downloading';
  task.error = undefined;
  notifyTaskUpdate(task);

  let downloadedFile = '';

  child.stdout.on('data', (chunk) => {
    if (task.status === 'paused' || task.status === 'cancelled') return;

    const text = chunk.toString();

    // Check for destination/output file
    const destMatch = text.match(/(?:Destination|Merging formats into|has already been downloaded):\s*(.+)/);
    if (destMatch && destMatch[1]) {
      downloadedFile = path.basename(destMatch[1].trim());
      task.outputPath = destMatch[1].trim();
      task.filename = downloadedFile;
    }

    // Check for progress
    const progressMatch = text.match(/\[download\]\s+([\d\.]+)%\s+of\s+~?([\d\.]+)(\w+)\s+at\s+([\d\.]+\w+\/s)\s+ETA\s+([\d:]+)/);
    if (progressMatch) {
      task.progress = parseFloat(progressMatch[1]);
      task.speed = progressMatch[4];
      task.eta = progressMatch[5];
      notifyTaskUpdate(task);
    } else {
      const simpleProg = text.match(/\[download\]\s+([\d\.]+)%/);
      if (simpleProg) {
        task.progress = parseFloat(simpleProg[1]);
        notifyTaskUpdate(task);
      }
    }

    if (text.includes('[Merger]') || text.includes('[ExtractAudio]')) {
      task.status = 'processing';
      task.progress = 98;
      notifyTaskUpdate(task);
    }
  });

  child.stderr.on('data', (chunk) => {
    const errText = chunk.toString();
    if (errText.includes('ERROR:')) {
      task.error = errText;
    }
  });

  child.on('close', (code) => {
    // Clean up temporary cookie file if created
    const tempCookie = path.join(DATA_DIR, `temp_cookie_${task.id}.txt`);
    if (fs.existsSync(tempCookie)) {
      try { fs.unlinkSync(tempCookie); } catch {}
    }

    if (task.status === 'paused' || task.status === 'cancelled') {
      return;
    }

    if (code === 0) {
      task.status = 'completed';
      task.progress = 100;
      task.eta = 'Done';
      task.speed = 'Completed';

      // Scan downloads dir to find the file if not captured
      if (!task.filename) {
        const files = fs.readdirSync(DOWNLOADS_DIR);
        const latest = files
          .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtimeMs }))
          .sort((a, b) => b.time - a.time)[0];
        if (latest) {
          task.filename = latest.name;
          task.outputPath = path.join(DOWNLOADS_DIR, latest.name);
        }
      }

      // Add to history
      try {
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        let fileSize = 0;
        if (task.outputPath && fs.existsSync(task.outputPath)) {
          fileSize = fs.statSync(task.outputPath).size;
        }
        // Avoid duplicate in history
        const existingIdx = history.findIndex((h: any) => h.id === task.id || (task.filename && h.filename === task.filename));
        const historyEntry = {
          id: task.id,
          title: task.title,
          url: task.url,
          filename: task.filename,
          size: fileSize,
          type: task.type,
          quality: task.quality,
          format: task.format,
          thumbnail: task.thumbnail,
          date: new Date().toISOString()
        };

        if (existingIdx !== -1) {
          history[existingIdx] = historyEntry;
        } else {
          history.unshift(historyEntry);
        }
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 200), null, 2), 'utf-8');
      } catch (e) {
        console.error('Failed to update history', e);
      }
    } else {
      task.status = 'error';
      task.error = task.error || `Process exited with code ${code}`;
    }
    notifyTaskUpdate(task);
  });
}

// Pause task
app.post('/api/pause/:taskId', (req: Request, res: Response) => {
  const task = activeTasks.get(req.params.taskId);
  if (task) {
    task.status = 'paused';
    task.speed = 'Paused';
    if (task.process) {
      try {
        task.process.kill('SIGTERM');
      } catch {}
    }
    notifyTaskUpdate(task);
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Resume task
app.post('/api/resume/:taskId', (req: Request, res: Response) => {
  const task = activeTasks.get(req.params.taskId);
  if (task) {
    executeDownloadTask(task);
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Retry task
app.post('/api/retry/:taskId', (req: Request, res: Response) => {
  const task = activeTasks.get(req.params.taskId);
  if (task) {
    task.progress = 0;
    executeDownloadTask(task);
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Delete task from active tasks and disk
app.post('/api/delete-task/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = activeTasks.get(taskId);
  if (task) {
    if (task.process) {
      try { task.process.kill(); } catch {}
    }
    if (task.outputPath && fs.existsSync(task.outputPath)) {
      try { fs.unlinkSync(task.outputPath); } catch {}
    }
    // Delete partial files
    if (task.filename) {
      const partFile = path.join(DOWNLOADS_DIR, `${task.filename}.part`);
      const ytdlFile = path.join(DOWNLOADS_DIR, `${task.filename}.ytdl`);
      if (fs.existsSync(partFile)) try { fs.unlinkSync(partFile); } catch {}
      if (fs.existsSync(ytdlFile)) try { fs.unlinkSync(ytdlFile); } catch {}
    }
    activeTasks.delete(taskId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// SSE endpoint for real-time progress
app.get('/api/progress/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const clients = sseClients.get(taskId) || [];
  clients.push(res);
  sseClients.set(taskId, clients);

  const task = activeTasks.get(taskId);
  if (task) {
    res.write(`data: ${JSON.stringify(task)}\n\n`);
  }

  req.on('close', () => {
    const updated = (sseClients.get(taskId) || []).filter(c => c !== res);
    if (updated.length > 0) {
      sseClients.set(taskId, updated);
    } else {
      sseClients.delete(taskId);
    }
  });
});

// Poll task status
app.get('/api/tasks/:taskId', (req: Request, res: Response) => {
  const task = activeTasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Cancel task
app.post('/api/cancel/:taskId', (req: Request, res: Response) => {
  const task = activeTasks.get(req.params.taskId);
  if (task) {
    if (task.process) {
      task.process.kill();
    }
    task.status = 'cancelled';
    notifyTaskUpdate(task);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Get all active tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const tasks = Array.from(activeTasks.values()).map(t => {
    const { process, ...safeTask } = t;
    return safeTask;
  });
  res.json(tasks);
});

// Downloads History
app.get('/api/downloads', (req: Request, res: Response) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    res.json(history);
  } catch {
    res.json([]);
  }
});

// Delete Download Item & File
app.delete('/api/downloads/:id', (req: Request, res: Response) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    const item = history.find((h: any) => h.id === req.params.id);
    if (item && item.filename) {
      const filePath = path.join(DOWNLOADS_DIR, item.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }
    const filtered = history.filter((h: any) => h.id !== req.params.id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Stream or Download File from downloads directory with range request support
app.get('/api/downloads/file/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const isDownload = req.query.download === 'true';

  if (isDownload) {
    return res.download(filePath, filename);
  }

  // Media streaming with HTTP 206 Partial Content
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' :
                      filename.endsWith('.m4a') ? 'audio/mp4' :
                      filename.endsWith('.opus') ? 'audio/opus' :
                      filename.endsWith('.webm') ? 'video/webm' :
                      'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' :
                      filename.endsWith('.m4a') ? 'audio/mp4' :
                      filename.endsWith('.opus') ? 'audio/opus' :
                      filename.endsWith('.webm') ? 'video/webm' :
                      'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Command Templates
app.get('/api/templates', (req: Request, res: Response) => {
  try {
    const data = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

app.post('/api/templates', (req: Request, res: Response) => {
  try {
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
    const { id, name, command, desc } = req.body;
    if (id) {
      // update
      const idx = templates.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        templates[idx] = { id, name, command, desc };
      }
    } else {
      // create
      templates.push({
        id: 'tmpl_' + Date.now(),
        name,
        command,
        desc: desc || ''
      });
    }
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
    res.json(templates);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/templates/:id', (req: Request, res: Response) => {
  try {
    const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
    const filtered = templates.filter((t: any) => t.id !== req.params.id);
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    res.json(filtered);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Cookie Profiles
app.get('/api/cookies', (req: Request, res: Response) => {
  try {
    const data = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

app.post('/api/cookies', (req: Request, res: Response) => {
  try {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
    const { id, name, domain, content } = req.body;
    if (id) {
      const idx = cookies.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        cookies[idx] = { id, name, domain, content, updatedAt: new Date().toISOString() };
      }
    } else {
      cookies.push({
        id: 'cookie_' + Date.now(),
        name,
        domain: domain || 'all',
        content,
        updatedAt: new Date().toISOString()
      });
    }
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
    res.json(cookies);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/cookies/:id', (req: Request, res: Response) => {
  try {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
    const filtered = cookies.filter((c: any) => c.id !== req.params.id);
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    res.json(filtered);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Settings API
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    res.json(settings);
  } catch {
    res.json({});
  }
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const current = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    const updated = { ...current, ...req.body };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Direct Thumbnail Download Helper (proxies image to client as download)
app.get('/api/thumbnail-download', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  const title = (req.query.title as string) || 'thumbnail';
  if (!imageUrl) {
    return res.status(400).send('Image URL required');
  }

  try {
    const fetchResponse = await fetch(imageUrl);
    if (!fetchResponse.ok) {
      return res.status(500).send('Failed to fetch image');
    }
    const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^\w\s-]/g, '')}-thumbnail.${ext}"`);
    
    const arrayBuffer = await fetchResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send('Error downloading image: ' + err.message);
  }
});

// Export database/all settings as JSON backup
app.get('/api/backup/export', (req: Request, res: Response) => {
  try {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      templates: JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8')),
      cookies: JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8')),
      history: JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')),
      settings: JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))
    };
    res.setHeader('Content-Disposition', `attachment; filename="seal-plus-backup-${Date.now()}.json"`);
    res.json(backup);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Import backup
app.post('/api/backup/import', (req: Request, res: Response) => {
  try {
    const { templates, cookies, history, settings } = req.body;
    if (templates) fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
    if (cookies) fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
    if (history) fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    if (settings) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GitHub Push Endpoint for user
app.post('/api/github-push', async (req: Request, res: Response) => {
  const token = req.body.token || process.env.GITHUB_TOKEN || '';
  const repoName = (req.body.repoName || 'SealPlus-PC').trim();
  const commitMsg = req.body.commitMessage || 'Seal Plus for PC - Full Stack Desktop & Web yt-dlp Video & Audio Downloader';

  if (!token) {
    return res.status(400).json({ success: false, error: 'GitHub Personal Access Token is required.' });
  }

  try {
    // 1. Get authenticated user login
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'SealPlus-PC-App'
      }
    });

    if (!userRes.ok) {
      const errJson = await userRes.json();
      return res.status(401).json({ success: false, error: 'Invalid GitHub token: ' + (errJson.message || 'Unauthorized') });
    }

    const userData = await userRes.json();
    const username = userData.login;

    // 2. Check if repo exists, create if not
    const checkRepoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'SealPlus-PC-App'
      }
    });

    if (checkRepoRes.status === 404) {
      // Create repo
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SealPlus-PC-App'
        },
        body: JSON.stringify({
          name: repoName,
          description: 'Seal Plus for PC - Material You & yt-dlp Video/Audio Downloader Suite with Format Selector, Batch Downloads, Comments & Metadata Tools',
          private: false
        })
      });

      if (!createRes.ok) {
        const createErr = await createRes.json();
        return res.status(500).json({ success: false, error: 'Failed to create GitHub repo: ' + (createErr.message || 'Unknown') });
      }
    }

    // 3. Execute git commands
    const remoteUrl = `https://${username}:${token}@github.com/${username}/${repoName}.git`;
    const gitCommands = [
      'git config user.name "xenoxfire"',
      'git config user.email "manbd286@gmail.com"',
      'git branch -M main',
      'git remote remove origin || true',
      `git remote add origin ${remoteUrl}`,
      'git add .',
      `git commit -m "${commitMsg.replace(/"/g, '\\"')}" || true`,
      'git push -u origin main --force'
    ].join(' && ');

    exec(gitCommands, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: stderr || err.message,
          output: stdout
        });
      }

      res.json({
        success: true,
        repoUrl: `https://github.com/${username}/${repoName}`,
        cloneUrl: `https://github.com/${username}/${repoName}.git`,
        message: 'Successfully committed and pushed all code to your GitHub!'
      });
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------------------- VITE / STATIC SETUP ---------------------

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Seal Plus PC] Server running on http://localhost:${PORT}`);
  });
}

startServer();
