import { db, dbType } from './db.js';

/**
 * Run database migrations
 * Adds new columns to existing tables without dropping data
 */
export async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    // Migration 1: Add audio_path, youtube_url, error_message to videos table
    if (dbType === 'postgresql') {
      // PostgreSQL migrations
      await db.query(`
        ALTER TABLE videos 
        ADD COLUMN IF NOT EXISTS audio_path TEXT,
        ADD COLUMN IF NOT EXISTS youtube_url TEXT,
        ADD COLUMN IF NOT EXISTS error_message TEXT
      `).catch(err => {
        // Ignore errors if columns already exist
        if (!err.message.includes('already exists')) {
          throw err;
        }
      });
      
      console.log('✅ PostgreSQL migrations complete');
      
    } else {
      // SQLite migrations (need to check if columns exist first)
      const checkColumn = (tableName, columnName) => {
        return new Promise((resolve, reject) => {
          db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
            if (err) reject(err);
            else resolve(columns.some(col => col.name === columnName));
          });
        });
      };

      const addColumn = (tableName, columnName, columnType) => {
        return new Promise((resolve, reject) => {
          db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      // Check and add audio_path
      if (!await checkColumn('videos', 'audio_path')) {
        await addColumn('videos', 'audio_path', 'TEXT');
        console.log('  ✅ Added audio_path column');
      }

      // Check and add youtube_url
      if (!await checkColumn('videos', 'youtube_url')) {
        await addColumn('videos', 'youtube_url', 'TEXT');
        console.log('  ✅ Added youtube_url column');
      }

      // Check and add error_message
      if (!await checkColumn('videos', 'error_message')) {
        await addColumn('videos', 'error_message', 'TEXT');
        console.log('  ✅ Added error_message column');
      }

      console.log('✅ SQLite migrations complete');
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

