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
 * Extract audio from video file
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path for output audio file
 * @returns {Promise<string>} Path to extracted audio file
 */
export async function extractAudio(videoPath, outputPath) {
  try {
    await execPromise(
      `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`
    );
    return outputPath;
  } catch (error) {
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

