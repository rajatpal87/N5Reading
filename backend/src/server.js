import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { db, dbType } from './db/db.js';
import videoRoutes from './routes/videos.js';
import { limiter, helmetConfig, corsOptions, errorSanitizer } from './middleware/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware (apply first)
app.use(helmetConfig); // Security headers
app.use(limiter); // Rate limiting
app.use(cors(corsOptions)); // CORS with restrictions

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Static files (for uploaded videos) with proper headers
app.use('/uploads', (req, res, next) => {
  // Allow media files to be accessed
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.mp3') || filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'N5 Reading API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    if (dbType === 'postgresql') {
      // PostgreSQL
      const vocabResult = await db.query('SELECT COUNT(*) as count FROM jlpt_vocabulary WHERE jlpt_level = 5');
      const grammarResult = await db.query('SELECT COUNT(*) as count FROM grammar_patterns WHERE jlpt_level = 5');
      
      res.json({
        status: 'ok',
        database: 'PostgreSQL',
        data: {
          n5_vocabulary: parseInt(vocabResult.rows[0].count),
          n5_grammar: parseInt(grammarResult.rows[0].count)
        }
      });
    } else {
      // SQLite
      db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary WHERE jlpt_level = 5', (err, row) => {
        if (err) {
          res.status(500).json({ error: 'Database error', details: err.message });
        } else {
          db.get('SELECT COUNT(*) as count FROM grammar_patterns WHERE jlpt_level = 5', (err2, row2) => {
            if (err2) {
              res.status(500).json({ error: 'Database error', details: err2.message });
            } else {
              res.json({
                status: 'ok',
                database: 'SQLite',
                data: {
                  n5_vocabulary: row.count,
                  n5_grammar: row2.count
                }
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Routes
app.use('/api/videos', videoRoutes);

// Error handling (must be last)
app.use(errorSanitizer);

app.listen(PORT, () => {
  console.log(`\n🚀 N5 Reading Backend Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Test DB: http://localhost:${PORT}/api/test-db\n`);
});

