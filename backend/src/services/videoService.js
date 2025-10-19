import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Extract video metadata using FFprobe (part of FFmpeg)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} Video metadata (duration, codec, resolution, etc.)
 */
export async function extractVideoMetadata(videoPath) {
  try {
    // Check if FFmpeg/FFprobe is installed
    const { stdout } = await execPromise(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`
    );

    const metadata = JSON.parse(stdout);
    
    // Extract useful information
    const videoStream = metadata.streams?.find(s => s.codec_type === 'video');
    const audioStream = metadata.streams?.find(s => s.codec_type === 'audio');
    
    return {
      duration: parseFloat(metadata.format?.duration || 0),
      size: parseInt(metadata.format?.size || 0),
      format: metadata.format?.format_name,
      bitrate: parseInt(metadata.format?.bit_rate || 0),
      video: videoStream ? {
        codec: videoStream.codec_name,
        width: videoStream.width,
        height: videoStream.height,
        fps: eval(videoStream.r_frame_rate) || 0,
        bitrate: parseInt(videoStream.bit_rate || 0)
      } : null,
      audio: audioStream ? {
        codec: audioStream.codec_name,
        sampleRate: parseInt(audioStream.sample_rate || 0),
        channels: audioStream.channels,
        bitrate: parseInt(audioStream.bit_rate || 0)
      } : null
    };

  } catch (error) {
    console.warn('FFmpeg not available or error extracting metadata:', error.message);
    
    // Fallback: return basic metadata without FFmpeg
    return {
      duration: 0,
      size: 0,
      format: 'unknown',
      bitrate: 0,
      video: null,
      audio: null,
      error: 'FFmpeg not installed - metadata extraction unavailable'
    };
  }
}

/**
 * Extract audio from video file with progress tracking
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path for output audio file
 * @param {number} videoDuration - Video duration in seconds (for time estimation)
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Audio file info
 */
export async function extractAudio(videoPath, outputPath, videoDuration = 0, onProgress = null) {
  try {
    console.log('🎵 Extracting audio from video:', videoPath);
    
    // Report start
    if (onProgress) {
      onProgress({
        stage: 'start',
        progress: 0,
        message: 'Starting audio extraction...',
      });
    }
    
    // Simulate progress updates during extraction (FFmpeg doesn't provide easy progress tracking)
    const estimatedDuration = Math.max(20, videoDuration * 0.5); // Rough estimate
    let progressPercent = 10;
    
    const progressInterval = setInterval(() => {
      if (progressPercent < 90 && onProgress) {
        progressPercent += 15;
        onProgress({
          stage: 'extracting',
          progress: progressPercent,
          message: 'Extracting audio from video...',
        });
      }
    }, estimatedDuration * 100); // Update every ~10% of estimated time
    
    try {
      // Extract audio as WAV (16kHz, mono, for Whisper API)
      await execPromise(
        `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}" -y`
      );
    } finally {
      clearInterval(progressInterval);
    }
    
    const fs = await import('fs');
    const stats = fs.statSync(outputPath);
    
    console.log('✅ Audio extracted:', outputPath);
    
    // Report completion
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Audio extraction complete',
      });
    }
    
    return {
      path: outputPath,
      size: stats.size,
      format: 'wav',
      sampleRate: 16000,
      channels: 1,
    };
  } catch (error) {
    console.error('❌ Audio extraction error:', error.message);
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
}

/**
 * Generate video thumbnail
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path for output thumbnail
 * @param {number} timestamp - Timestamp in seconds for thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
export async function generateThumbnail(videoPath, outputPath, timestamp = 1) {
  try {
    await execPromise(
      `ffmpeg -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}"`
    );
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate thumbnail: ${error.message}`);
  }
}

/**
 * Check if FFmpeg is installed
 * @returns {Promise<boolean>} True if FFmpeg is available
 */
export async function checkFFmpegInstalled() {
  try {
    await execPromise('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
}

