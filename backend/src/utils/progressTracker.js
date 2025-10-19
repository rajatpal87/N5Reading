/**
 * Progress Tracker Utility
 * Centralized progress updates for video processing
 */

/**
 * Update video processing progress
 * @param {Object} db - Database connection
 * @param {string} dbType - 'sqlite' or 'postgresql'
 * @param {number} videoId - Video ID
 * @param {Object} progressData - Progress data
 * @param {string} progressData.status - Processing status
 * @param {number} progressData.progress - Progress percentage (0-100)
 * @param {string} progressData.status_message - Human-readable status message
 * @param {number} progressData.estimated_time_remaining - Estimated seconds remaining
 */
export async function updateProgress(db, dbType, videoId, progressData) {
  const {
    status,
    progress = null,
    status_message = null,
    estimated_time_remaining = null,
  } = progressData;

  console.log(`📊 Progress [Video ${videoId}]: ${progress}% - ${status_message || status}`);

  const updateQuery = dbType === 'postgresql'
    ? `UPDATE videos 
       SET status = $1, progress = $2, status_message = $3, estimated_time_remaining = $4 
       WHERE id = $5`
    : `UPDATE videos 
       SET status = ?, progress = ?, status_message = ?, estimated_time_remaining = ? 
       WHERE id = ?`;

  const values = [status, progress, status_message, estimated_time_remaining, videoId];

  try {
    if (dbType === 'postgresql') {
      await db.query(updateQuery, values);
    } else {
      await new Promise((resolve, reject) => {
        db.run(updateQuery, values, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  } catch (error) {
    console.error('❌ Error updating progress:', error);
    // Don't throw - progress updates shouldn't break the main flow
  }
}

/**
 * Calculate estimated time remaining based on video duration
 * @param {number} videoDuration - Video duration in seconds
 * @param {string} operation - Operation type ('audio_extraction', 'transcription', 'translation')
 * @returns {number} Estimated seconds
 */
export function estimateTime(videoDuration, operation) {
  const estimates = {
    audio_extraction: Math.max(20, videoDuration * 0.5), // ~50% of video duration, min 20s
    compression: 5, // Usually very fast
    transcription: Math.max(30, videoDuration * 2.5), // ~2.5x real-time
    translation: 30, // Base estimate, adjusted per segment
  };

  return Math.round(estimates[operation] || 30);
}

/**
 * Progress presets for common operations
 */
export const ProgressPresets = {
  // YouTube Download
  YOUTUBE_START: {
    status: 'downloading_youtube',
    progress: 0,
    status_message: 'Starting YouTube download...',
  },
  YOUTUBE_DOWNLOADING: (percent) => ({
    status: 'downloading_youtube',
    progress: Math.min(percent, 95),
    status_message: `Downloading from YouTube... ${percent}%`,
  }),
  YOUTUBE_COMPLETE: {
    status: 'uploaded',
    progress: 100,
    status_message: 'YouTube download complete',
    estimated_time_remaining: 0,
  },

  // Audio Extraction
  AUDIO_START: (duration) => ({
    status: 'extracting_audio',
    progress: 0,
    status_message: 'Extracting audio from video...',
    estimated_time_remaining: estimateTime(duration, 'audio_extraction'),
  }),
  AUDIO_PROGRESS: (percent, duration) => ({
    status: 'extracting_audio',
    progress: Math.min(percent, 95),
    status_message: 'Extracting audio from video...',
    estimated_time_remaining: Math.round(estimateTime(duration, 'audio_extraction') * (100 - percent) / 100),
  }),
  AUDIO_COMPLETE: {
    status: 'audio_extracted',
    progress: 100,
    status_message: 'Audio extraction complete',
    estimated_time_remaining: 0,
  },

  // Audio Compression
  COMPRESSION_START: (originalSizeMB, targetSizeMB) => ({
    status: 'compressing_audio',
    progress: 0,
    status_message: `Compressing audio (${originalSizeMB}MB → ${targetSizeMB}MB)...`,
    estimated_time_remaining: 5,
  }),
  COMPRESSION_COMPLETE: {
    status: 'compressing_audio',
    progress: 100,
    status_message: 'Audio compression complete',
    estimated_time_remaining: 0,
  },

  // Transcription
  TRANSCRIPTION_START: (duration) => ({
    status: 'transcribing',
    progress: 0,
    status_message: 'Transcribing Japanese audio...',
    estimated_time_remaining: estimateTime(duration, 'transcription'),
  }),
  TRANSCRIPTION_PROGRESS: (duration) => ({
    status: 'transcribing',
    progress: 50, // Indeterminate, show halfway
    status_message: 'Transcribing Japanese audio...',
    estimated_time_remaining: Math.round(estimateTime(duration, 'transcription') / 2),
  }),
  TRANSCRIPTION_COMPLETE: {
    status: 'transcribing',
    progress: 100,
    status_message: 'Transcription complete',
    estimated_time_remaining: 0,
  },

  // Translation
  TRANSLATION_START: (totalSegments) => ({
    status: 'translating',
    progress: 0,
    status_message: `Translating segments (0/${totalSegments})...`,
    estimated_time_remaining: Math.ceil(totalSegments / 10), // ~10 segments/second
  }),
  TRANSLATION_PROGRESS: (current, total) => ({
    status: 'translating',
    progress: Math.round((current / total) * 100),
    status_message: `Translating segment ${current}/${total}...`,
    estimated_time_remaining: Math.ceil((total - current) / 10),
  }),
  TRANSLATION_COMPLETE: {
    status: 'completed',
    progress: 100,
    status_message: 'Transcription and translation complete',
    estimated_time_remaining: 0,
  },

  // Error
  ERROR: (message) => ({
    status: 'error',
    progress: 0,
    status_message: message,
    estimated_time_remaining: 0,
  }),
};

