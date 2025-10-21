import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, dbType } from '../src/db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOCAB_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary.json');

console.log('🔄 Updating N5 Vocabulary in Database...\n');

// Load vocabulary data
const vocabData = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf-8'));
console.log(`📖 Loaded ${vocabData.length} entries from JSON file\n`);

const updateDatabase = async () => {
  try {
    if (dbType === 'postgresql') {
      // PostgreSQL approach
      console.log('🗑️  Clearing old N5 vocabulary...');
      await new Promise((resolve, reject) => {
        db.query('DELETE FROM jlpt_vocabulary WHERE jlpt_level = 5', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('💾 Inserting new vocabulary...');
      let inserted = 0;
      
      for (const word of vocabData) {
        await new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO jlpt_vocabulary (kanji, hiragana, romaji, english, part_of_speech, jlpt_level, chapter)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [word.kanji, word.hiragana, word.romaji, word.english, word.part_of_speech, word.jlpt_level, word.chapter],
            (err) => {
              if (err) reject(err);
              else {
                inserted++;
                if (inserted % 100 === 0) {
                  process.stdout.write(`\r   Progress: ${inserted}/${vocabData.length}`);
                }
                resolve();
              }
            }
          );
        });
      }
      
      console.log(`\n✅ Successfully inserted ${inserted} entries`);
      
    } else {
      // SQLite approach
      db.serialize(() => {
        console.log('🗑️  Clearing vocabulary instances (to avoid FK constraint)...');
        db.run('DELETE FROM vocabulary_instances', (err) => {
          if (err) {
            console.error('❌ Error clearing vocabulary instances:', err);
            process.exit(1);
          }
          console.log('✅ Vocabulary instances cleared\n');
        });
        
        console.log('🗑️  Clearing old N5 vocabulary...');
        db.run('DELETE FROM jlpt_vocabulary WHERE jlpt_level = 5', (err) => {
          if (err) {
            console.error('❌ Error clearing old vocabulary:', err);
            process.exit(1);
          }
          console.log('✅ Old vocabulary cleared\n');
        });

        console.log('💾 Inserting new vocabulary...');
        const stmt = db.prepare(
          `INSERT INTO jlpt_vocabulary (kanji, hiragana, romaji, english, part_of_speech, jlpt_level, chapter)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        let inserted = 0;
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
                console.error(`❌ Error at entry ${index}:`, err.message);
              } else {
                inserted++;
                if (inserted % 100 === 0) {
                  process.stdout.write(`\r   Progress: ${inserted}/${vocabData.length}`);
                }
              }
            }
          );
        });

        stmt.finalize((err) => {
          if (err) {
            console.error('❌ Error finalizing:', err);
            process.exit(1);
          }

          // Verify
          db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary WHERE jlpt_level = 5', (err, row) => {
            if (err) {
              console.error('❌ Error counting:', err);
              process.exit(1);
            }

            console.log(`\n\n✅ Update complete!`);
            console.log(`📊 N5 vocabulary count in database: ${row.count}`);
            console.log(`📊 Expected: ${vocabData.length}`);
            
            if (row.count === vocabData.length) {
              console.log('\n🎉 Success! Vocabulary updated from 296 to 718 entries!\n');
            } else {
              console.log(`\n⚠️  Warning: Count mismatch (${row.count} vs ${vocabData.length})\n`);
            }

            db.close(() => {
              process.exit(0);
            });
          });
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateDatabase();

