import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CSV_PATH = '/Users/rajatpal/Downloads/jlpt_vocab.csv';
const OUTPUT_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary_new.json');

console.log('📚 Converting CSV to JSON for N5 Vocabulary...\n');

// Read CSV
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header
const header = lines[0];
console.log(`Header: ${header}\n`);

// Parse CSV and filter N5 only
const n5Vocabulary = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  
  // Simple CSV parsing (handles quoted commas)
  const match = line.match(/^([^,]*),([^,]*),(".*?"|[^,]*),(.*)$/);
  
  if (!match) {
    console.warn(`⚠️  Skipping malformed line ${i}: ${line.substring(0, 50)}...`);
    continue;
  }
  
  const [_, original, furigana, english, jlptLevel] = match;
  
  // Only include N5 entries
  if (jlptLevel.trim() !== 'N5') {
    continue;
  }
  
  // Clean up quoted values
  const cleanEnglish = english.replace(/^"(.*)"$/, '$1');
  
  // Build vocabulary entry
  const entry = {
    kanji: original.trim() || null,
    hiragana: furigana.trim(),
    romaji: null, // Not in CSV, could generate if needed
    english: cleanEnglish.trim(),
    part_of_speech: null, // Not in CSV
    chapter: null, // Not in CSV
    jlpt_level: 5
  };
  
  n5Vocabulary.push(entry);
}

// Write to JSON
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(n5Vocabulary, null, 2), 'utf-8');

console.log(`✅ Conversion complete!`);
console.log(`📊 Total N5 entries: ${n5Vocabulary.length}`);
console.log(`💾 Saved to: ${OUTPUT_PATH}`);
console.log(`\n🔍 Sample entries:`);
console.log(JSON.stringify(n5Vocabulary.slice(0, 3), null, 2));


