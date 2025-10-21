import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../youtube_learning.db');
const vocabPath = path.join(__dirname, '../src/db/data/jlpt_vocabulary_full.json');

console.log('📂 Database path:', dbPath);
console.log('📖 Vocabulary file:', vocabPath);

const db = new sqlite3.Database(dbPath);

async function updateVocabulary() {
  try {
    console.log('\n🔄 Starting vocabulary update...\n');

    // Step 1: Delete existing vocabulary instances (to avoid FK errors)
    console.log('1️⃣  Deleting existing vocabulary instances...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM vocabulary_instances', function(err) {
        if (err) {
          if (err.message.includes('no such table')) {
            console.log(`   ⏭️  Table doesn't exist yet, skipping...`);
            resolve();
          } else {
            reject(err);
          }
        } else {
          console.log(`   ✅ Deleted ${this.changes} vocabulary instances`);
          resolve();
        }
      });
    });

    // Step 2: Delete existing JLPT vocabulary
    console.log('\n2️⃣  Deleting existing JLPT vocabulary...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM jlpt_vocabulary', function(err) {
        if (err) {
          if (err.message.includes('no such table')) {
            console.log(`   ⏭️  Table doesn't exist yet, will create on insert...`);
            resolve();
          } else {
            reject(err);
          }
        } else {
          console.log(`   ✅ Deleted ${this.changes} vocabulary entries`);
          resolve();
        }
      });
    });

    // Step 3: Load new vocabulary
    console.log('\n3️⃣  Loading new vocabulary from JSON...');
    const newVocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    console.log(`   📊 Found ${newVocabulary.length} words to import`);

    // Step 4: Insert new vocabulary
    console.log('\n4️⃣  Inserting new vocabulary...');
    let count = 0;
    for (const word of newVocabulary) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO jlpt_vocabulary (kanji, hiragana, romaji, english, part_of_speech, chapter, jlpt_level)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          word.kanji,
          word.hiragana,
          word.romaji,
          word.english,
          word.part_of_speech,
          word.chapter,
          word.jlpt_level
        ], (err) => {
          if (err) reject(err);
          else {
            count++;
            if (count % 1000 === 0) {
              console.log(`   ⏳ Inserted ${count} words...`);
            }
            resolve();
          }
        });
      });
    }
    console.log(`   ✅ Successfully inserted ${count} words!`);

    // Step 5: Verify insertion
    console.log('\n5️⃣  Verifying database...');
    const countByLevel = await new Promise((resolve, reject) => {
      db.all(`
        SELECT jlpt_level, COUNT(*) as count
        FROM jlpt_vocabulary
        GROUP BY jlpt_level
        ORDER BY jlpt_level DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📈 Final database breakdown:');
    const levelNames = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };
    countByLevel.forEach(row => {
      console.log(`   ${levelNames[row.jlpt_level]}: ${row.count} words`);
    });

    const total = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log(`\n✅ Total vocabulary in database: ${total.count} words`);

    console.log('\n🎉 Database update complete!');
    console.log('\n⚠️  NOTE: You should re-analyze existing videos to detect new vocabulary.');

  } catch (error) {
    console.error('\n❌ Error updating vocabulary:', error);
  } finally {
    db.close();
  }
}

updateVocabulary();

