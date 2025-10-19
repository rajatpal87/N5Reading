import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTables } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.db');

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');

  const db = new sqlite3.Database(dbPath);

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  try {
    // Create tables first
    await createTables(db);

    // Clear existing N5 data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM jlpt_vocabulary WHERE jlpt_level = 5', (err) => {
        if (err) reject(err);
        else {
          db.run('DELETE FROM grammar_patterns WHERE jlpt_level = 5', (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
    console.log('🗑️  Cleared existing N5 data\n');

    // Load N5 vocabulary
    console.log('📚 Loading N5 vocabulary...');
    const vocabularyPath = path.join(__dirname, 'data', 'n5_vocabulary.json');
    const vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, 'utf-8'));

    for (const word of vocabulary) {
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
    console.log(`✅ Inserted ${vocabulary.length} N5 vocabulary words\n`);

    // Load N5 grammar patterns
    console.log('📝 Loading N5 grammar patterns...');
    const grammarPath = path.join(__dirname, 'data', 'n5_grammar_patterns.json');
    const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));

    for (const pattern of grammar) {
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
    console.log(`✅ Inserted ${grammar.length} N5 grammar patterns\n`);

    // Print summary
    db.get('SELECT COUNT(*) as count FROM jlpt_vocabulary WHERE jlpt_level = 5', (err, row) => {
      if (!err) {
        db.get('SELECT COUNT(*) as count FROM grammar_patterns WHERE jlpt_level = 5', (err2, row2) => {
          if (!err2) {
            console.log('📊 Database Seeding Summary:');
            console.log(`   - N5 Vocabulary: ${row.count} words`);
            console.log(`   - N5 Grammar: ${row2.count} patterns`);
            console.log('\n✅ Database seeding completed successfully!\n');
            
            db.close();
            process.exit(0);
          }
        });
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    db.close();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();

