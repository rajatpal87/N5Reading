import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { createTables } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    try {
      await createTables(db);
    } catch (error) {
      console.error('❌ Error creating tables:', error);
    }
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export default db;

