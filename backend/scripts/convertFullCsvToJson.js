import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = '/Users/rajatpal/Downloads/jlpt_vocab.csv';
const outputPath = path.join(__dirname, '../src/db/data/jlpt_vocabulary_full.json');

const vocabulary = [];
const levelMap = {
  'N1': 1,
  'N2': 2,
  'N3': 3,
  'N4': 4,
  'N5': 5
};

console.log('📖 Reading CSV file...');

// Read and parse CSV manually
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

// Find column indices
const originalIdx = headers.indexOf('Original');
const furiganaIdx = headers.indexOf('Furigana');
const englishIdx = headers.indexOf('English');
const levelIdx = headers.indexOf('JLPT Level');

console.log('📋 CSV Headers:', headers);
console.log(`📍 Column indices: Original=${originalIdx}, Furigana=${furiganaIdx}, English=${englishIdx}, Level=${levelIdx}`);

// Process each line (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Split by comma, but handle quoted fields
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  const level = fields[levelIdx];
  
  // Only process valid JLPT levels
  if (levelMap[level]) {
    const entry = {
      kanji: fields[originalIdx] || '',
      hiragana: fields[furiganaIdx] || '',
      romaji: null,
      english: fields[englishIdx] || '',
      part_of_speech: null,
      chapter: null,
      jlpt_level: levelMap[level]
    };
    
    // Only add if we have meaningful data
    if (entry.kanji && entry.hiragana && entry.english) {
      vocabulary.push(entry);
    }
  }
}

console.log(`\n✅ Conversion complete!`);
console.log(`📊 Total words: ${vocabulary.length}`);

// Count by level
const counts = {};
vocabulary.forEach(word => {
  counts[word.jlpt_level] = (counts[word.jlpt_level] || 0) + 1;
});

console.log('\n📈 Breakdown by level:');
Object.keys(counts).sort().reverse().forEach(level => {
  const levelName = Object.keys(levelMap).find(k => levelMap[k] === parseInt(level));
  console.log(`   ${levelName}: ${counts[level]} words`);
});

// Save to JSON
fs.writeFileSync(
  outputPath,
  JSON.stringify(vocabulary, null, 2)
);

console.log(`\n💾 Saved to: ${outputPath}`);

