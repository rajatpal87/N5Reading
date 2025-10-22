import { create as createYoutubeDl } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find yt-dlp binary path
 * @returns {string|null} Path to yt-dlp or null if not found
 */
function findYtDlpBinary() {
  // Try to find yt-dlp in PATH
  try {
    const result = execSync('which yt-dlp', { encoding: 'utf8' }).trim();
    if (result) {
      console.log('✅ Found yt-dlp at:', result);
      return result;
    }
  } catch (error) {
    // Not in PATH, try common locations
  }

  // Try common installation locations
  const possiblePaths = [
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    '/opt/homebrew/bin/yt-dlp',
    '/home/user/.local/bin/yt-dlp',
    `${process.env.HOME}/.local/bin/yt-dlp`,
    '/root/.local/bin/yt-dlp',
  ];

  for (const binPath of possiblePaths) {
    if (fs.existsSync(binPath)) {
      console.log('✅ Found yt-dlp at:', binPath);
      return binPath;
    }
  }

  console.error('❌ yt-dlp is not installed or not in PATH');
  console.error('Please install yt-dlp:');
  console.error('  - Ubuntu/Debian: sudo apt install yt-dlp');
  console.error('  - macOS: brew install yt-dlp');
  console.error('  - pip: pip3 install --user yt-dlp');
  console.error('  - Or download from: https://github.com/yt-dlp/yt-dlp');
  return null;
}

// Find and configure yt-dlp binary
const ytDlpPath = findYtDlpBinary();
const youtubedl = ytDlpPath ? createYoutubeDl(ytDlpPath) : createYoutubeDl();

/**
 * Try downloading with different browser cookies
 * @param {string} url - YouTube URL
 * @param {Object} options - yt-dlp options
 * @param {Array} browsers - List of browsers to try ['chrome', 'safari']
 * @returns {Promise<Object>} Result from yt-dlp
 */
async function tryWithBrowserCookies(url, options, browsers = ['chrome', 'safari']) {
  let lastError;
  
  for (const browser of browsers) {
    try {
      console.log(`🔐 Trying ${browser} cookies...`);
      const result = await youtubedl(url, {
        ...options,
        cookiesFromBrowser: browser,
      });
      console.log(`✅ Success with ${browser} cookies!`);
      return result;
    } catch (error) {
      lastError = error;
      
      // If it's a bot detection error, try next browser
      if (error.message.includes('Sign in to confirm') || error.message.includes('bot')) {
        console.log(`⚠️ ${browser} cookies didn't work, trying next...`);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all browsers failed, throw the last error
  throw lastError;
}

/**
 * Download YouTube video
 * @param {string} url - YouTube URL
 * @param {string} outputDir - Directory to save video
 * @returns {Promise<Object>} Downloaded video info
 */
export async function downloadYouTubeVideo(url, outputDir) {
  // Check if yt-dlp is available
  if (!ytDlpPath) {
    throw new Error(`
yt-dlp is not installed or not in PATH.

Installation options:
• Ubuntu/Debian: sudo apt install yt-dlp
• macOS: brew install yt-dlp
• Using pip: pip3 install --user yt-dlp
• Download binary: https://github.com/yt-dlp/yt-dlp/releases

After installing, you may need to restart the server.
    `.trim());
  }

  try {
    console.log('📥 Starting YouTube download:', url);
    console.log('📁 Output directory:', outputDir);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔧 Using yt-dlp at:', ytDlpPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      console.log('📁 Creating output directory...');
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename based on timestamp
    const timestamp = Date.now();
    const outputTemplate = path.join(outputDir, `${timestamp}-%(title)s.%(ext)s`);
    console.log('📝 Output template:', outputTemplate);

    console.log('🔍 Fetching video info first...');
    
    // Use standard download options without cookies
    console.log('📡 Fetching video info...');
    const baseOptions = {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      // Bot bypass options
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://www.youtube.com/',
      addHeader: [
        'Accept-Language:en-US,en;q=0.9',
        'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding:gzip, deflate',
        'DNT:1'
      ],
      extractorArgs: 'youtube:player_client=android,web',
      noCheckCertificates: true,
    };

    let info;
    try {
      // First try without cookies
      info = await youtubedl(url, baseOptions);
    } catch (error) {
      // If it fails and we have browser cookies available, try with cookies
      if (error.message.includes('Sign in') || error.message.includes('bot')) {
        console.log('⚠️ Standard download failed, trying with browser cookies...');
        try {
          info = await tryWithBrowserCookies(url, baseOptions);
        } catch (cookieError) {
          // If cookies also fail, throw the original error
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ Video info retrieved:', info.title);
    console.log('📊 Duration:', info.duration, 'seconds');

    console.log('⬇️ Starting video download...');

    const downloadOptions = {
      output: outputTemplate,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      noPlaylist: true,
      maxFilesize: '100M', // 100MB limit
      noWarnings: true,
      noPart: true,
      noOverwrites: true,
    };

    // Combine download options with bot bypass headers
    const finalDownloadOptions = {
      ...downloadOptions,
      // Bot bypass options
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://www.youtube.com/',
      addHeader: [
        'Accept-Language:en-US,en;q=0.9',
        'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding:gzip, deflate',
        'DNT:1'
      ],
      extractorArgs: 'youtube:player_client=android,web',
      noCheckCertificates: true,
    };

    let output;
    try {
      // First try without cookies
      output = await youtubedl(url, finalDownloadOptions);
    } catch (error) {
      // If it fails and we have browser cookies available, try with cookies
      if (error.message.includes('Sign in') || error.message.includes('bot')) {
        console.log('⚠️ Standard download failed, trying with browser cookies...');
        try {
          output = await tryWithBrowserCookies(url, downloadOptions);
        } catch (cookieError) {
          // If cookies also fail, throw the original error
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ Download complete');

    // Find the downloaded file
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith(timestamp.toString()))
      .sort((a, b) => {
        return fs.statSync(path.join(outputDir, b)).mtime.getTime() -
               fs.statSync(path.join(outputDir, a)).mtime.getTime();
      });

    if (files.length === 0) {
      throw new Error('Downloaded file not found');
    }

    const filename = files[0];
    const filePath = path.join(outputDir, filename);
    const stats = fs.statSync(filePath);

    console.log('✅ YouTube video downloaded:', filename);

    return {
      filename: filename,
      originalName: info.title || 'YouTube Video',
      filePath: filePath,
      fileSize: stats.size,
      duration: info.duration || 0,
      mimeType: 'video/mp4',
      youtubeUrl: url,
      youtubeTitle: info.title,
      youtubeDescription: info.description,
      youtubeChannel: info.uploader,
      youtubeThumbnail: info.thumbnail,
    };

  } catch (error) {
    console.error('❌ YouTube download error:', error.message);
    console.error('Error details:', error);

    // Check if yt-dlp is not installed
    if (error.message.includes('spawn') || error.message.includes('ENOENT') || error.code === 'ENOENT') {
      const installInstructions = `
yt-dlp is not installed or not in PATH.

Installation options:
• Ubuntu/Debian: sudo apt install yt-dlp
• macOS: brew install yt-dlp
• Using pip: pip3 install --user yt-dlp
• Download binary: https://github.com/yt-dlp/yt-dlp/releases

After installing, you may need to restart the server.
      `.trim();
      throw new Error(installInstructions);
    }

    // Check for bot detection / authentication required
    if (error.message.includes('Sign in to confirm') || error.message.includes('not a bot')) {
      throw new Error('YouTube blocked this request due to bot detection. Please try a different video or use the file upload feature to upload a downloaded video instead.');
    }

    // Check for video unavailability
    if (error.message.includes('unavailable') || error.message.includes('not available')) {
      throw new Error('This video is unavailable or private');
    }

    // Check for file size limit
    if (error.message.includes('too large') || error.message.includes('max-filesize')) {
      throw new Error('Video exceeds 100MB size limit');
    }

    throw new Error(`Failed to download YouTube video: ${error.message}`);
  }
}

/**
 * Check if URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean} True if YouTube URL
 */
export function isYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

/**
 * Get video info without downloading
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} Video information
 */
export async function getYouTubeVideoInfo(url) {
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
    });

    return {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      description: info.description,
      uploader: info.uploader,
      viewCount: info.view_count,
      uploadDate: info.upload_date,
    };
  } catch (error) {
    throw new Error(`Failed to get video info: ${error.message}`);
  }
}

