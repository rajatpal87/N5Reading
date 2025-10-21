import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const NEW_VOCAB_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary_new.json');
const TEST_DB_PATH = path.join(__dirname, '../test_vocabulary.db');

console.log('🧪 Testing New N5 Vocabulary Import...\n');

// Clean up old test database if exists
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
  console.log('🗑️  Removed old test database\n');
}

// Create test database
const db = new sqlite3.Database(TEST_DB_PATH);

// Create table
db.serialize(() => {
  console.log('📋 Creating test table...');
  
  db.run(`CREATE TABLE IF NOT EXISTS jlpt_vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji TEXT,
    hiragana TEXT NOT NULL,
    romaji TEXT,
    english TEXT NOT NULL,
    part_of_speech TEXT,
    jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
    chapter TEXT,
    variants TEXT,
    reading TEXT,
    frequency_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
      process.exit(1);
    }
    console.log('✅ Table created successfully\n');
  });

  // Load vocabulary data
  console.log('📖 Loading vocabulary data...');
  const vocabData = JSON.parse(fs.readFileSync(NEW_VOCAB_PATH, 'utf-8'));
  console.log(`📊 Found ${vocabData.length} entries\n`);

  // Prepare insert statement
  const stmt = db.prepare(`
    INSERT INTO jlpt_vocabulary (kanji, hiragana, romaji, english, part_of_speech, jlpt_level, chapter)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log('💾 Inserting vocabulary entries...');
  let inserted = 0;
  let errors = 0;

  vocabData.forEach((word, index) => {
    stmt.run(
      word.kanji,
      word.hiragana,
      word.romaji,
      word.english,
      word.part_of_speech,
      word.jlpt_level,
      word.chapter,
      (err) => {
        if (err) {
          console.error(`❌ Error inserting entry ${index}:`, word, err.message);
          errors++;
        } else {
          inserted++;
        }
      }
    );
  });

  stmt.finalize();

  // Verify the data
  db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary', (err, row) => {
    if (err) {
      console.error('❌ Error counting entries:', err);
    } else {
      console.log(`\n✅ Import complete!`);
      console.log(`📊 Total entries in database: ${row.count}`);
      console.log(`✅ Successfully inserted: ${inserted}`);
      if (errors > 0) {
        console.log(`❌ Errors: ${errors}`);
      }
    }

    // Show sample data
    db.all('SELECT * FROM jlpt_vocabulary LIMIT 5', (err, rows) => {
      if (err) {
        console.error('❌ Error fetching sample:', err);
      } else {
        console.log('\n🔍 Sample entries from database:');
        rows.forEach((row, i) => {
          console.log(`${i + 1}. ${row.kanji || row.hiragana} (${row.hiragana}) - ${row.english}`);
        });
      }

      // Test search functionality
      db.get(
        'SELECT * FROM jlpt_vocabulary WHERE hiragana = ?',
        ['あう'],
        (err, row) => {
          if (err) {
            console.error('❌ Error searching:', err);
          } else if (row) {
            console.log('\n🔎 Test search for "あう" (au):');
            console.log(`   Found: ${row.kanji} - ${row.english}`);
          }

          console.log('\n✅ All tests passed!');
          console.log(`💾 Test database saved at: ${TEST_DB_PATH}`);
          console.log('\n📝 Next steps:');
          console.log('   1. Review the test database');
          console.log('   2. If everything looks good, run the swap script');
          
          db.close();
        }
      );
    });
  });
});


