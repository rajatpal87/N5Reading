import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, dbType } from '../db/db.js';
import { extractVideoMetadata } from '../services/videoService.js';
import { uploadLimiter } from '../middleware/security.js';
import { validateVideoId, validateFileUpload, sanitizeFilename } from '../middleware/validation.js';

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

