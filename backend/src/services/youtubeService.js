import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  try {
    console.log('📥 Starting YouTube download:', url);
    console.log('📁 Output directory:', outputDir);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    
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
    
    // Determine if we're in production (Render) or local development
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    
    let info;
    if (isProduction) {
      // Production: Don't use browser cookies (not available on servers)
      console.log('🌐 Production mode - downloading without browser cookies');
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noPlaylist: true,
      });
    } else {
      // Development: Try with browser cookies for better success rate
      console.log('💻 Development mode - trying with browser cookies');
      info = await tryWithBrowserCookies(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noPlaylist: true,
      });
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

    let output;
    if (isProduction) {
      // Production: Download without browser cookies
      output = await youtubedl(url, downloadOptions);
    } else {
      // Development: Try with browser cookies
      output = await tryWithBrowserCookies(url, downloadOptions);
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
    
    // Check if yt-dlp is not installed
    if (error.message.includes('spawn') || error.message.includes('ENOENT')) {
      throw new Error('yt-dlp is not installed. Please install it with: brew install yt-dlp');
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

