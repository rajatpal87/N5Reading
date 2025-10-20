import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration: Add progress tracking columns to videos table
 * Works with both SQLite and PostgreSQL
 */
export async function migrateProgressTracking(db, dbType = 'sqlite') {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running migration: Add progress tracking...');

    // For PostgreSQL, use IF NOT EXISTS syntax
    if (dbType === 'postgresql') {
      const migrations = [
        'ALTER TABLE videos ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0',
        'ALTER TABLE videos ADD COLUMN IF NOT EXISTS status_message TEXT',
        'ALTER TABLE videos ADD COLUMN IF NOT EXISTS estimated_time_remaining INTEGER',
      ];

      (async () => {
        try {
          for (const sql of migrations) {
            await db.query(sql);
          }
          console.log('  ✓ Progress tracking columns ensured');
          console.log('✅ Progress tracking migration complete');
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
      return;
    }

    // SQLite path
    const migrations = [
      {
        name: 'progress',
        sql: 'ALTER TABLE videos ADD COLUMN progress INTEGER DEFAULT 0',
      },
      {
        name: 'status_message',
        sql: 'ALTER TABLE videos ADD COLUMN status_message TEXT',
      },
      {
        name: 'estimated_time_remaining',
        sql: 'ALTER TABLE videos ADD COLUMN estimated_time_remaining INTEGER',
      },
    ];

    // Check and run each migration
    const runMigration = async (migration) => {
      return new Promise((resolve, reject) => {
        // Check if column exists
        db.all('PRAGMA table_info(videos)', (err, columns) => {
          if (err) {
            reject(err);
            return;
          }

          const columnExists = columns.some(col => col.name === migration.name);

          if (columnExists) {
            console.log(`  ✓ Column '${migration.name}' already exists, skipping`);
            resolve();
          } else {
            // Add the column
            db.run(migration.sql, (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`  ✓ Added column '${migration.name}'`);
                resolve();
              }
            });
          }
        });
      });
    };

    // Run all migrations sequentially
    (async () => {
      try {
        for (const migration of migrations) {
          await runMigration(migration);
        }
        console.log('✅ Progress tracking migration complete');
        resolve();
      } catch (error) {
        console.error('❌ Migration error:', error);
        reject(error);
      }
    })();
  });
}

// Run migration if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dbPath = path.join(__dirname, '../../data/n5reading.db');
  const db = new sqlite3.Database(dbPath);

  migrateProgressTracking(db)
    .then(() => {
      console.log('✅ Migration successful');
      db.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      db.close();
      process.exit(1);
    });
}

