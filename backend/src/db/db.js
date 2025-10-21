import sqlite3 from 'sqlite3';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import { createTables } from './schema.js';
import { migrateGrammarTimestamps } from './migrateGrammarTimestamps.js';
import { migrateProgressTracking } from './migrateProgress.js';
import { migrateVocabularyMetadata } from './migrateVocabularyMetadata.js';
import { autoSeedIfEmpty } from './autoSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
let dbType;

// Determine database type based on environment
if (process.env.DATABASE_URL) {
  // Production: Use PostgreSQL (Render provides DATABASE_URL)
  console.log('🔧 Connecting to PostgreSQL database...');
  dbType = 'postgresql';
  
  const { Pool } = pg;
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test connection and create tables
  db.query('SELECT NOW()', async (err, res) => {
    if (err) {
      console.error('❌ Error connecting to PostgreSQL:', err);
    } else {
      console.log('✅ Connected to PostgreSQL database');
      try {
        await createTables(db, dbType);
        await migrateProgressTracking(db, dbType);
        await migrateGrammarTimestamps(db, dbType);
        await migrateVocabularyMetadata(db, dbType);
        console.log('✅ Database migrations complete');
        await autoSeedIfEmpty(db, dbType);
      } catch (error) {
        console.error('❌ Error during database setup:', error);
      }
    }
  });

} else {
  // Development: Use SQLite
  console.log('🔧 Connecting to SQLite database...');
  dbType = 'sqlite';
  
  const dbPath = path.join(__dirname, '../../database.db');
  db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
      console.error('❌ Error opening SQLite database:', err);
    } else {
      console.log('✅ Connected to SQLite database');
      
      // Enable foreign keys for SQLite
      db.run('PRAGMA foreign_keys = ON');
      
      try {
        await createTables(db, dbType);
        await migrateProgressTracking(db, dbType);
        await migrateGrammarTimestamps(db, dbType);
        await migrateVocabularyMetadata(db, dbType);
        console.log('✅ Database migrations complete');
        await autoSeedIfEmpty(db, dbType);
      } catch (error) {
        console.error('❌ Error during database setup:', error);
      }
    }
  });
}

export { db, dbType };
export default db;
