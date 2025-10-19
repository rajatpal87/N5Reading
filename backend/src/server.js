import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'N5 Reading API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', (req, res) => {
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
            data: {
              n5_vocabulary: row.count,
              n5_grammar: row2.count
            }
          });
        }
      });
    }
  });
});

// Routes will be added in Phase 1
// app.use('/api/videos', videoRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 N5 Reading Backend Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Test DB: http://localhost:${PORT}/api/test-db\n`);
});

