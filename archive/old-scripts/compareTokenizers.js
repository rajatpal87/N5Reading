import TinySegmenter from 'tiny-segmenter';
import { db, dbType } from '../src/db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tinySegmenter = new TinySegmenter();

console.log('🔍 Extracting Japanese text samples from database...\n');

// Get sample Japanese text from transcriptions
const getSampleText = () => {
  return new Promise((resolve, reject) => {
    if (dbType === 'postgresql') {
      db.query(
        `SELECT segments FROM transcriptions WHERE segments IS NOT NULL LIMIT 5`,
        (err, result) => {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    } else {
      db.all(
        `SELECT segments FROM transcriptions WHERE segments IS NOT NULL LIMIT 5`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    }
  });
};

const main = async () => {
  try {
    const transcriptions = await getSampleText();
    
    if (!transcriptions || transcriptions.length === 0) {
      console.log('❌ No transcriptions found in database');
      process.exit(1);
    }

    const samples = [];
    
    // Extract unique sentences from segments
    transcriptions.forEach(transcription => {
      try {
        const segments = JSON.parse(transcription.segments);
        segments.forEach(seg => {
          if (seg.text && seg.text.trim().length > 0) {
            samples.push(seg.text.trim());
          }
        });
      } catch (e) {
        console.error('Error parsing segments:', e.message);
      }
    });

    // Take first 100 unique samples
    const uniqueSamples = [...new Set(samples)].slice(0, 100);
    
    console.log(`📊 Found ${uniqueSamples.length} unique text samples\n`);
    console.log('🔄 Tokenizing with TinySegmenter...\n');

    // Create results array
    const results = uniqueSamples.map((text, index) => {
      const tokens = tinySegmenter.segment(text);
      return {
        id: index + 1,
        original_text: text,
        token_count: tokens.length,
        tokens_tiny: tokens.join(' | '),
        tokens_kuromoji: '' // Will be filled after Kuromoji implementation
      };
    });

    // Save as CSV
    const csvPath = path.join(__dirname, 'tokenizer_comparison.csv');
    const csvHeader = 'ID,Original Text,Token Count (Tiny),TinySegmenter Tokens,Kuromoji Tokens (TBD)\n';
    const csvRows = results.map(r => {
      // Escape commas and quotes in CSV
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
      return `${r.id},${escapeCsv(r.original_text)},${r.token_count},${escapeCsv(r.tokens_tiny)},${escapeCsv(r.tokens_kuromoji)}`;
    }).join('\n');
    
    fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');
    console.log(`✅ CSV saved to: ${csvPath}\n`);

    // Save as formatted markdown table
    const mdPath = path.join(__dirname, 'tokenizer_comparison.md');
    let mdContent = '# Tokenizer Comparison: TinySegmenter vs Kuromoji\n\n';
    mdContent += `Generated: ${new Date().toISOString()}\n\n`;
    mdContent += `Total samples: ${results.length}\n\n`;
    mdContent += '---\n\n';
    mdContent += '| ID | Original Text | Tokens | TinySegmenter Output |\n';
    mdContent += '|----|---------------|--------|----------------------|\n';
    
    results.forEach(r => {
      const shortText = r.original_text.length > 40 
        ? r.original_text.substring(0, 40) + '...' 
        : r.original_text;
      mdContent += `| ${r.id} | ${shortText} | ${r.token_count} | ${r.tokens_tiny} |\n`;
    });

    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    console.log(`✅ Markdown table saved to: ${mdPath}\n`);

    // Save as JSON for programmatic use
    const jsonPath = path.join(__dirname, 'tokenizer_comparison.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`✅ JSON saved to: ${jsonPath}\n`);

    // Print first 10 examples to console
    console.log('📋 First 10 examples:\n');
    console.log('━'.repeat(100));
    results.slice(0, 10).forEach(r => {
      console.log(`\n${r.id}. ${r.original_text}`);
      console.log(`   Tokens (${r.token_count}): ${r.tokens_tiny}`);
      console.log('━'.repeat(100));
    });

    console.log(`\n✅ Done! Generated ${results.length} samples\n`);
    console.log('📄 Files created:');
    console.log(`   - ${csvPath}`);
    console.log(`   - ${mdPath}`);
    console.log(`   - ${jsonPath}`);
    
    db.close ? db.close() : null;
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();


