# 🦭 Seal Plus PC - Video & Audio Downloader

> An elegant, feature-rich Desktop & Web port of **Seal Plus**, designed with Google's **Material You (Material 3)** aesthetic and powered by the cutting-edge **yt-dlp** and **ffmpeg** engine.

---

## 🌟 Key Features

* **🎨 Material You Dynamic Theming**: Adaptive color palettes (Ocean Blue, Monet Purple, Emerald Green, Sunset Orange, Cyber Teal, Rose Pink) with Dark / AMOLED mode and Frosted Glass (Glassmorphism) effects.
* **⚡ High-Speed Video & Audio Downloading**:
  * **Video**: Download up to 4K (2160p), 1440p, 1080p Full HD, 720p, 480p, 360p with 60 FPS in **MP4**, **MKV**, or **WebM**.
  * **Audio**: Extract studio-quality audio in **MP3 (320kbps)**, **M4A (AAC)**, **Opus**, **FLAC (Lossless)**, and **WAV**.
* **✂️ Video Section Clipping**: Select custom Start (`00:00:00`) and End times (`00:02:45`) to download only the desired segment of a video.
* **🖼️ Thumbnail Downloader**: Extract full-resolution original thumbnails (MaxRes 1080p, High, Medium, SD) with 1-click downloads.
* **💬 Comments Downloader & Reader**: Scrape comments, view commenter avatars and like counts, and export to **JSON** or **TXT**.
* **🔍 Video Info & Metadata Inspector**: View full stream information, codec details, bitrates, audio channels, tags, and license with 1-click JSON export.
* **📑 Batch URL Importer**: Paste 10-50+ video links at once and enqueue them with a single preset.
* **🔒 Privacy & Security PIN Lock**: Protect your downloaded media and library with a custom 4-6 digit security PIN.
* **🍪 Cookie Profiles**: Import Netscape `cookies.txt` to bypass age-restrictions and download login-protected/member-only videos.
* **💻 Command Templates**: Create, save, and reuse custom `yt-dlp` arguments (e.g., `--sponsorblock-remove all`, `--rate-limit 2M`).
* **🎬 Built-in Media Player**: Play videos and audio directly in your browser with seek, speed control (0.75x - 2x), and volume.
* **💾 Direct File Saver**: 1-click save any completed download directly to your PC's local storage.

---

## 🚀 Quick Start on PC (Windows / Mac / Linux)

### 1. Prerequisites
Make sure your PC has:
- **Node.js** (v18 or newer): [Download Node.js](https://nodejs.org/)
- **yt-dlp**:
  - **Windows**: `winget install yt-dlp` or download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
  - **Mac**: `brew install yt-dlp`
  - **Linux**: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp`
- **ffmpeg** (for audio/video merging and conversions):
  - **Windows**: `winget install Gyan.FFmpeg`
  - **Mac**: `brew install ffmpeg`
  - **Linux**: `sudo apt install ffmpeg`

### 2. Installation & Running

```bash
# Clone the repository
git clone https://github.com/xenoxfire/SealPlus-PC.git

# Enter the project directory
cd SealPlus-PC

# Install dependencies
npm install

# Start the application
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🛠️ Project Architecture

- **Backend**: Node.js & Express (`server.ts`) executing native `yt-dlp` and `ffmpeg` processes with Server-Sent Events (SSE) for real-time progress streaming.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, and Motion.
- **Storage**: Clean local file-based database for settings, history, cookie profiles, and command templates.

---

## 📄 License
Licensed under Apache-2.0. Based on Seal by JunkFood02 and enhanced for PC.
