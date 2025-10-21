import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-seed N5 vocabulary and grammar patterns if database is empty
 * Works with both SQLite and PostgreSQL
 */
export async function autoSeedIfEmpty(db, dbType = 'sqlite') {
  try {
    console.log('🔍 Checking if database needs seeding...');
    
    // Check if vocabulary exists
    let vocabCount;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT COUNT(*) as count FROM jlpt_vocabulary');
      vocabCount = parseInt(result.rows[0].count);
    } else {
      vocabCount = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
    }
    
    // If data exists, skip seeding
    if (vocabCount > 0) {
      console.log(`✅ Database already seeded (${vocabCount} words found)\n`);
      return;
    }
    
    console.log('🌱 Database is empty, starting auto-seed...\n');
    
    // Load JLPT vocabulary (N5-N1)
    console.log('📚 Loading JLPT vocabulary (N5-N1)...');
    const vocabularyPath = path.join(__dirname, 'data', 'n5_vocabulary.json');
    const vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, 'utf-8'));
    
    for (const word of vocabulary) {
      if (dbType === 'postgresql') {
        await db.query(`
          INSERT INTO jlpt_vocabulary 
          (kanji, hiragana, romaji, english, part_of_speech, jlpt_level, chapter, variants, reading)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          word.kanji || null,
          word.hiragana,
          word.romaji || null,
          word.english,
          word.part_of_speech || null,
          word.jlpt_level || 5,
          word.chapter || null,
          word.variants ? JSON.stringify(word.variants) : null,
          word.reading || word.hiragana
        ]);
      } else {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO jlpt_vocabulary 
            (kanji, hiragana, romaji, english, part_of_speech, jlpt_level, chapter, variants, reading)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            word.kanji || null,
            word.hiragana,
            word.romaji || null,
            word.english,
            word.part_of_speech || null,
            word.jlpt_level || 5,
            word.chapter || null,
            word.variants ? JSON.stringify(word.variants) : null,
            word.reading || word.hiragana
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    // Count by level for summary
    const levelCounts = {};
    vocabulary.forEach(word => {
      levelCounts[word.jlpt_level] = (levelCounts[word.jlpt_level] || 0) + 1;
    });
    const levelNames = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };
    const summary = Object.keys(levelCounts).sort().reverse().map(level => 
      `${levelNames[level]}: ${levelCounts[level]}`
    ).join(', ');
    
    console.log(`✅ Inserted ${vocabulary.length} JLPT words (${summary})`);
    
    // Load N5 grammar patterns
    console.log('📝 Loading N5 grammar patterns...');
    const grammarPath = path.join(__dirname, 'data', 'n5_grammar_patterns.json');
    const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
    
    for (const pattern of grammar) {
      if (dbType === 'postgresql') {
        await db.query(`
          INSERT INTO grammar_patterns
          (pattern_name, pattern_structure, pattern_regex, jlpt_level, english_explanation, 
           example_japanese, example_english, chapter, difficulty_rank)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          pattern.pattern_name,
          pattern.pattern_structure || null,
          pattern.pattern_regex,
          pattern.jlpt_level || 5,
          pattern.english_explanation || null,
          pattern.example_japanese || null,
          pattern.example_english || null,
          pattern.chapter || null,
          pattern.difficulty_rank || null
        ]);
      } else {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO grammar_patterns
            (pattern_name, pattern_structure, pattern_regex, jlpt_level, english_explanation, 
             example_japanese, example_english, chapter, difficulty_rank)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            pattern.pattern_name,
            pattern.pattern_structure || null,
            pattern.pattern_regex,
            pattern.jlpt_level || 5,
            pattern.english_explanation || null,
            pattern.example_japanese || null,
            pattern.example_english || null,
            pattern.chapter || null,
            pattern.difficulty_rank || null
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    console.log(`✅ Inserted ${grammar.length} N5 grammar patterns`);
    
    console.log('✅ Auto-seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error during auto-seed:', error.message);
    throw error;
  }
}

