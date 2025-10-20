import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, dbType } from '../db/db.js';
import { extractVideoMetadata, extractAudio } from '../services/videoService.js';
import { downloadYouTubeVideo, isYouTubeUrl } from '../services/youtubeService.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { translateText, translateSegments } from '../services/translationService.js';
import { analyzeVideo, getVideoAnalysis, getN5Timeline } from '../services/analysisService.js';
import { generateVocabularyCSV, generateAnkiCSV, generateGrammarCSV } from '../services/exportService.js';
import { uploadLimiter } from '../middleware/security.js';
import { validateVideoId, validateFileUpload, sanitizeFilename } from '../middleware/validation.js';
import { updateProgress, ProgressPresets, estimateTime } from '../utils/progressTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique, sanitized filename: timestamp-sanitized-originalname
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueName = `${Date.now()}-${sanitized}`;
    cb(null, uniqueName);
  }
});

// File filter - only accept video files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/x-msvideo', // AVI
    'video/quicktime', // MOV
    'video/x-matroska', // MKV
    'video/webm'
  ];

  const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, AVI, MOV, MKV, and WEBM are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

// POST /api/videos/upload - Upload a video
router.post('/upload', uploadLimiter, upload.single('video'), validateFileUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Extract video metadata using FFmpeg
    const metadata = await extractVideoMetadata(req.file.path);

    // Save to database
    const videoData = {
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      duration: metadata.duration,
      mime_type: req.file.mimetype,
      status: 'uploaded'
    };

    if (dbType === 'postgresql') {
      // PostgreSQL
      const result = await db.query(
        `INSERT INTO videos (filename, original_name, file_path, file_size, duration, mime_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [videoData.filename, videoData.original_name, videoData.file_path, 
         videoData.file_size, videoData.duration, videoData.mime_type, videoData.status]
      );
      
      res.status(201).json({
        message: 'Video uploaded successfully',
        video: result.rows[0]
      });
    } else {
      // SQLite
      db.run(
        `INSERT INTO videos (filename, original_name, file_path, file_size, duration, mime_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [videoData.filename, videoData.original_name, videoData.file_path,
         videoData.file_size, videoData.duration, videoData.mime_type, videoData.status],
        function(err) {
          if (err) {
            console.error('Error saving video to database:', err);
            return res.status(500).json({ error: 'Failed to save video metadata' });
          }

          // Get the inserted video
          db.get('SELECT * FROM videos WHERE id = ?', [this.lastID], (err, video) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to retrieve video' });
            }
            
            res.status(201).json({
              message: 'Video uploaded successfully',
              video: video
            });
          });
        }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
});

// POST /api/videos/youtube - Download video from YouTube URL
router.post('/youtube', uploadLimiter, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!isYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('📥 Downloading YouTube video:', url);

    // Download video
    const videoInfo = await downloadYouTubeVideo(url, uploadsDir);

    // Extract metadata using FFmpeg
    const metadata = await extractVideoMetadata(videoInfo.filePath);
    const duration = metadata.format && metadata.format.duration ? parseFloat(metadata.format.duration) : videoInfo.duration || 0;
    
    // Safely extract resolution
    let resolution = null;
    if (metadata.streams && Array.isArray(metadata.streams)) {
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (videoStream && videoStream.width && videoStream.height) {
        resolution = `${videoStream.width}x${videoStream.height}`;
      }
    }

    // Store in database (using correct column names from schema)
    const insertQuery = dbType === 'postgresql'
      ? `INSERT INTO videos (filename, original_name, file_path, mime_type, file_size, duration, status, youtube_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
      : `INSERT INTO videos (filename, original_name, file_path, mime_type, file_size, duration, status, youtube_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      videoInfo.filename,
      videoInfo.youtubeTitle || videoInfo.originalName,
      `/uploads/${videoInfo.filename}`,
      videoInfo.mimeType,
      videoInfo.fileSize,
      duration,
      'uploaded',
      url
    ];

    let newVideo;
    if (dbType === 'postgresql') {
      const result = await db.query(insertQuery, values);
      newVideo = result.rows[0];
    } else {
      // SQLite
      newVideo = await new Promise((resolve, reject) => {
        db.run(insertQuery, values, function(err) {
          if (err) {
            reject(err);
          } else {
            // Build video object with inserted ID (matching schema column names)
            const video = {
              id: this.lastID,
              filename: values[0],
              original_name: values[1],
              file_path: values[2],
              mime_type: values[3],
              file_size: values[4],
              duration: values[5],
              status: values[6],
              youtube_url: values[7]
            };
            resolve(video);
          }
        });
      });
    }

    console.log('✅ YouTube video downloaded and saved');

    res.status(201).json({ 
      message: 'YouTube video downloaded successfully', 
      video: newVideo 
    });

  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    res.status(500).json({ 
      error: 'Failed to download YouTube video', 
      details: error.message 
    });
  }
});

// GET /api/videos - List all videos
router.get('/', async (req, res) => {
  try {
    if (dbType === 'postgresql') {
      // PostgreSQL
      const result = await db.query(
        'SELECT * FROM videos ORDER BY created_at DESC'
      );
      res.json({ videos: result.rows });
    } else {
      // SQLite
      db.all('SELECT * FROM videos ORDER BY created_at DESC', (err, videos) => {
        if (err) {
          console.error('Error fetching videos:', err);
          return res.status(500).json({ error: 'Failed to fetch videos' });
        }
        res.json({ videos: videos || [] });
      });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET /api/videos/:id - Get single video
router.get('/:id', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    if (dbType === 'postgresql') {
      // PostgreSQL
      const result = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json({ video: result.rows[0] });
    } else {
      // SQLite
      db.get('SELECT * FROM videos WHERE id = ?', [id], (err, video) => {
        if (err) {
          console.error('Error fetching video:', err);
          return res.status(500).json({ error: 'Failed to fetch video' });
        }
        if (!video) {
          return res.status(404).json({ error: 'Video not found' });
        }
        res.json({ video });
      });
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// POST /api/videos/:id/process - Extract audio and prepare for transcription
router.post('/:id/process', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // Get video info
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if already processing
    if (video.status === 'processing') {
      return res.status(400).json({ error: 'Video is already being processed' });
    }

    // Update status to extracting_audio with progress
    await updateProgress(db, dbType, id, ProgressPresets.AUDIO_START(video.duration || 0));

    // Extract audio with progress tracking
    const videoPath = path.join(uploadsDir, video.filename);
    const audioFilename = `${video.filename.split('.')[0]}.wav`;
    const audioPath = path.join(uploadsDir, audioFilename);

    console.log('🎵 Extracting audio for video:', video.id);

    const audioInfo = await extractAudio(videoPath, audioPath, video.duration || 0, async (progressData) => {
      // Report progress during extraction
      if (progressData.stage === 'extracting') {
        await updateProgress(db, dbType, id, ProgressPresets.AUDIO_PROGRESS(
          progressData.progress,
          video.duration || 0
        ));
      }
    });

    // Update video with audio path and mark as complete
    await updateProgress(db, dbType, id, ProgressPresets.AUDIO_COMPLETE);
    
    const updateAudioQuery = dbType === 'postgresql'
      ? `UPDATE videos SET audio_path = $1 WHERE id = $2`
      : `UPDATE videos SET audio_path = ? WHERE id = ?`;

    if (dbType === 'postgresql') {
      await db.query(updateAudioQuery, [`/uploads/${audioFilename}`, id]);
    } else {
      await new Promise((resolve, reject) => {
        db.run(updateAudioQuery, [`/uploads/${audioFilename}`, id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('✅ Audio extracted for video:', video.id);

    res.json({
      message: 'Audio extracted successfully',
      video: {
        id: video.id,
        status: 'audio_extracted',
        audioPath: `/uploads/${audioFilename}`,
        audioSize: audioInfo.size,
      }
    });

  } catch (error) {
    console.error('Error processing video:', error);

    // Update status to error with progress tracker
    await updateProgress(db, dbType, id, ProgressPresets.ERROR(error.message));

    res.status(500).json({
      error: 'Failed to process video',
      details: error.message
    });
  }
});

// DELETE /api/videos/:id - Delete a video
router.delete('/:id', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // First, get video info to delete file
    const getVideo = dbType === 'postgresql'
      ? db.query('SELECT * FROM videos WHERE id = $1', [id])
      : new Promise((resolve, reject) => {
          db.get('SELECT * FROM videos WHERE id = ?', [id], (err, video) => {
            if (err) reject(err);
            else resolve({ rows: video ? [video] : [] });
          });
        });

    const videoResult = await getVideo;
    
    if (dbType === 'postgresql' && videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    if (dbType === 'sqlite' && !videoResult.rows[0]) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResult.rows[0];

    // Delete file from filesystem
    if (fs.existsSync(video.file_path)) {
      fs.unlinkSync(video.file_path);
    }

    // Delete from database
    if (dbType === 'postgresql') {
      await db.query('DELETE FROM videos WHERE id = $1', [id]);
    } else {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM videos WHERE id = ?', [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// POST /api/videos/:id/transcribe - Transcribe and translate video audio
router.post('/:id/transcribe', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // Get video info
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if audio has been extracted
    if (!video.audio_path) {
      return res.status(400).json({ error: 'Audio not extracted yet. Please extract audio first.' });
    }

    // Check if already transcribing
    if (video.status === 'transcribing' || video.status === 'translating') {
      return res.status(400).json({ error: 'Video is already being processed' });
    }

    // Update status to transcribing with progress
    await updateProgress(db, dbType, id, ProgressPresets.TRANSCRIPTION_START(video.duration || 0));

    console.log('🎤 Starting transcription for video:', video.id);

    // Get audio file path
    const audioPath = path.join(uploadsDir, path.basename(video.audio_path));

    // Step 1: Transcribe audio with progress tracking
    const transcriptionResult = await transcribeAudio(audioPath, async (progressData) => {
      // Report progress during transcription/compression
      if (progressData.stage === 'compressing') {
        const originalSizeMB = parseFloat(progressData.message.match(/\d+\.\d+/)[0]);
        const targetSizeMB = parseFloat(progressData.message.match(/\d+\.\d+/g)[1]);
        await updateProgress(db, dbType, id, ProgressPresets.COMPRESSION_START(originalSizeMB, targetSizeMB));
      } else if (progressData.stage === 'compressed') {
        await updateProgress(db, dbType, id, ProgressPresets.COMPRESSION_COMPLETE);
      } else if (progressData.stage === 'transcribing') {
        await updateProgress(db, dbType, id, ProgressPresets.TRANSCRIPTION_PROGRESS(video.duration || 0));
      }
    });

    console.log('✅ Transcription complete, storing in database...');

    // Store transcription in database
    const insertTranscriptionQuery = dbType === 'postgresql'
      ? `INSERT INTO transcriptions (video_id, language, full_text, segments) VALUES ($1, $2, $3, $4) RETURNING *`
      : `INSERT INTO transcriptions (video_id, language, full_text, segments) VALUES (?, ?, ?, ?)`;

    const segmentsJson = JSON.stringify(transcriptionResult.segments);

    let transcription;
    if (dbType === 'postgresql') {
      const result = await db.query(insertTranscriptionQuery, [
        id,
        transcriptionResult.language,
        transcriptionResult.text,
        segmentsJson
      ]);
      transcription = result.rows[0];
    } else {
      transcription = await new Promise((resolve, reject) => {
        db.run(insertTranscriptionQuery, [
          id,
          transcriptionResult.language,
          transcriptionResult.text,
          segmentsJson
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              video_id: id,
              language: transcriptionResult.language,
              full_text: transcriptionResult.text,
              segments: segmentsJson
            });
          }
        });
      });
    }

    // Update video status to translating with progress
    await updateProgress(db, dbType, id, ProgressPresets.TRANSLATION_START(transcriptionResult.segments.length));

    console.log('🌏 Starting translation...');

    // Step 2: Translate full text
    const translationResult = await translateText(transcriptionResult.text);

    // Step 3: Translate segments with progress tracking
    const translatedSegments = await translateSegments(transcriptionResult.segments, async (progressData) => {
      // Report progress during translation
      if (progressData.stage === 'translating' && progressData.current) {
        await updateProgress(db, dbType, id, ProgressPresets.TRANSLATION_PROGRESS(
          progressData.current,
          progressData.total
        ));
      }
    });

    console.log('✅ Translation complete, storing in database...');

    // Store translation in database
    const insertTranslationQuery = dbType === 'postgresql'
      ? `INSERT INTO translations (transcription_id, language, full_text, segments) VALUES ($1, $2, $3, $4) RETURNING *`
      : `INSERT INTO translations (transcription_id, language, full_text, segments) VALUES (?, ?, ?, ?)`;

    const translatedSegmentsJson = JSON.stringify(translatedSegments);

    let translation;
    if (dbType === 'postgresql') {
      const result = await db.query(insertTranslationQuery, [
        transcription.id,
        'en',
        translationResult.translatedText,
        translatedSegmentsJson
      ]);
      translation = result.rows[0];
    } else {
      translation = await new Promise((resolve, reject) => {
        db.run(insertTranslationQuery, [
          transcription.id,
          'en',
          translationResult.translatedText,
          translatedSegmentsJson
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              transcription_id: transcription.id,
              language: 'en',
              full_text: translationResult.translatedText,
              segments: translatedSegmentsJson
            });
          }
        });
      });
    }

    // Update video status to analyzing (ready for Phase 4) with progress complete
    await updateProgress(db, dbType, id, ProgressPresets.TRANSLATION_COMPLETE);

    console.log('✅ Transcription and translation complete for video:', video.id);

    // Step 4: Run N5 analysis to populate vocabulary and grammar tables
    console.log('📊 Running N5 analysis...');
    try {
      await analyzeVideo(id);
      console.log('✅ N5 analysis complete');
    } catch (analysisError) {
      console.error('⚠️ N5 analysis failed (non-critical):', analysisError.message);
      // Continue anyway - analysis can be retried later
    }

    // Calculate total cost
    const totalCost = transcriptionResult.cost + translationResult.cost;

    res.json({
      message: 'Transcription and translation complete',
      video: {
        id: video.id,
        status: 'analyzing',
      },
      transcription: {
        id: transcription.id,
        text: transcriptionResult.text,
        language: transcriptionResult.language,
        segmentCount: transcriptionResult.segments.length,
      },
      translation: {
        id: translation.id,
        text: translationResult.translatedText,
        language: 'en',
      },
      cost: {
        transcription: transcriptionResult.cost,
        translation: translationResult.cost,
        total: totalCost,
      }
    });

  } catch (error) {
    console.error('Error transcribing video:', error);

    // Update status to error with progress tracker
    await updateProgress(db, dbType, id, ProgressPresets.ERROR(error.message));

    res.status(500).json({
      error: 'Failed to transcribe video',
      details: error.message
    });
  }
});

// GET /api/videos/:id/transcription - Get transcription and translation for a video
router.get('/:id/transcription', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // Get transcription
    let transcription;
    if (dbType === 'postgresql') {
      const result = await db.query(
        'SELECT * FROM transcriptions WHERE video_id = $1', 
        [id]
      );
      transcription = result.rows[0];
    } else {
      transcription = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM transcriptions WHERE video_id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found for this video' });
    }

    // Get translation
    let translation;
    if (dbType === 'postgresql') {
      const result = await db.query(
        'SELECT * FROM translations WHERE transcription_id = $1', 
        [transcription.id]
      );
      translation = result.rows[0];
    } else {
      translation = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM translations WHERE transcription_id = ?', [transcription.id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    // Parse JSON segments
    const segments = JSON.parse(transcription.segments || '[]');
    const translatedSegmentsArray = translation ? JSON.parse(translation.segments || '[]') : [];

    // Merge segments with translations
    const mergedSegments = segments.map((seg, idx) => {
      const translatedSeg = translatedSegmentsArray[idx];
      return {
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
        translated_text: translatedSeg?.translation || translatedSeg?.translated_text || ''
      };
    });

    res.json({
      japanese: transcription.full_text,
      english: translation?.full_text || '',
      segments: mergedSegments
    });

  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transcription',
      details: error.message 
    });
  }
});

// POST /api/videos/:id/analyze - Analyze video for N5 content
router.post('/:id/analyze', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // Get video info
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
    }

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if transcription/translation is complete
    if (video.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Video must be transcribed and translated first',
        current_status: video.status
      });
    }

    console.log('📊 Starting N5 analysis for video:', video.id);

    // Analyze video
    const analysis = await analyzeVideo(id);

    res.json({
      message: 'N5 analysis complete',
      analysis: analysis
    });

  } catch (error) {
    console.error('Error analyzing video:', error);
    res.status(500).json({
      error: 'Failed to analyze video',
      details: error.message
    });
  }
});

// GET /api/videos/:id/analysis - Get N5 analysis results
router.get('/:id/analysis', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    const analysis = await getVideoAnalysis(id);
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      error: 'Failed to fetch analysis',
      details: error.message
    });
  }
});

// GET /api/videos/:id/timeline - Get N5 timeline data for visualization
router.get('/:id/timeline', validateVideoId, async (req, res) => {
  const { id } = req.params;
  const segmentDuration = parseInt(req.query.duration) || 15; // Default 15 seconds

  try {
    const timeline = await getN5Timeline(id, segmentDuration);
    res.json(timeline);
  } catch (error) {
    console.error('Error generating timeline:', error);
    res.status(500).json({
      error: 'Failed to generate timeline',
      details: error.message
    });
  }
});

// GET /api/videos/:id/export/vocabulary - Export vocabulary as CSV
router.get('/:id/export/vocabulary', validateVideoId, async (req, res) => {
  const { id } = req.params;
  const format = req.query.format || 'csv'; // 'csv' or 'anki'

  try {
    // Get analysis data
    const analysis = await getVideoAnalysis(id);
    const vocabularyData = analysis.vocabulary?.words || [];
    
    // Get video info for filename
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT original_name FROM videos WHERE id = $1', [id]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT original_name FROM videos WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    const videoName = video?.original_name || `video_${id}`;
    const safeName = videoName.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    
    // Generate CSV based on format
    let csvContent;
    let filename;
    
    if (format === 'anki') {
      // Get transcription segments for context
      let transcription;
      if (dbType === 'postgresql') {
        const result = await db.query('SELECT segments FROM transcriptions WHERE video_id = $1', [id]);
        transcription = result.rows[0];
      } else {
        transcription = await new Promise((resolve, reject) => {
          db.get('SELECT segments FROM transcriptions WHERE video_id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }
      const segments = transcription ? JSON.parse(transcription.segments || '[]') : [];
      
      csvContent = generateAnkiCSV(vocabularyData, segments);
      filename = `${safeName}_n5_vocabulary_anki.csv`;
    } else {
      csvContent = generateVocabularyCSV(vocabularyData);
      filename = `${safeName}_n5_vocabulary.csv`;
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Add UTF-8 BOM for Excel compatibility
    res.write('\ufeff');
    res.end(csvContent);
    
  } catch (error) {
    console.error('Error exporting vocabulary:', error);
    res.status(500).json({
      error: 'Failed to export vocabulary',
      details: error.message
    });
  }
});

// GET /api/videos/:id/export/grammar - Export grammar patterns as CSV
router.get('/:id/export/grammar', validateVideoId, async (req, res) => {
  const { id } = req.params;

  try {
    // Get analysis data
    const analysis = await getVideoAnalysis(id);
    const grammarData = analysis.grammar?.patterns || [];
    
    // Get video info for filename
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT original_name FROM videos WHERE id = $1', [id]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT original_name FROM videos WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    const videoName = video?.original_name || `video_${id}`;
    const safeName = videoName.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    
    // Generate CSV
    const csvContent = generateGrammarCSV(grammarData);
    const filename = `${safeName}_n5_grammar.csv`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Add UTF-8 BOM for Excel compatibility
    res.write('\ufeff');
    res.end(csvContent);
    
  } catch (error) {
    console.error('Error exporting grammar:', error);
    res.status(500).json({
      error: 'Failed to export grammar',
      details: error.message
    });
  }
});

// Error handling middleware for Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

export default router;

