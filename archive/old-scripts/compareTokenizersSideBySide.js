import TinySegmenter from 'tiny-segmenter';
import kuromoji from 'kuromoji';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tinySegmenter = new TinySegmenter();

console.log('🔄 Loading Kuromoji dictionary...\n');

// Build Kuromoji tokenizer
kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build(async (err, tokenizer) => {
  if (err) {
    console.error('❌ Error loading Kuromoji:', err);
    process.exit(1);
  }

  console.log('✅ Kuromoji loaded successfully!\n');

  // Load the previously generated samples
  const jsonPath = path.join(__dirname, 'tokenizer_comparison.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Please run compareTokenizers.js first to generate samples!');
    process.exit(1);
  }

  const samples = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📊 Loaded ${samples.length} samples\n`);
  console.log('🔄 Tokenizing with Kuromoji...\n');

  // Process each sample with Kuromoji
  const results = samples.map((sample, index) => {
    const kuromojiTokens = tokenizer.tokenize(sample.original_text);
    
    // Extract just surface forms for comparison
    const kuromojiWords = kuromojiTokens.map(t => t.surface_form);
    
    // Extract basic forms (dictionary forms)
    const kuromojiBasicForms = kuromojiTokens.map(t => t.basic_form);
    
    // Extract POS tags
    const kuromojiPOS = kuromojiTokens.map(t => t.pos);
    
    // Create detailed token info
    const kuromojiDetailed = kuromojiTokens.map(t => ({
      word: t.surface_form,
      pos: t.pos,
      basic: t.basic_form,
      reading: t.reading || ''
    }));

    if ((index + 1) % 10 === 0) {
      process.stdout.write(`\r   Progress: ${index + 1}/${samples.length}`);
    }

    return {
      ...sample,
      kuromoji_count: kuromojiWords.length,
      kuromoji_words: kuromojiWords.join(' | '),
      kuromoji_basic: kuromojiBasicForms.join(' | '),
      kuromoji_pos: kuromojiPOS.join(' | '),
      kuromoji_detailed: kuromojiDetailed,
      token_diff: sample.token_count - kuromojiWords.length
    };
  });

  console.log(`\n✅ Kuromoji tokenization complete!\n`);

  // Calculate statistics
  const stats = {
    total_samples: results.length,
    tiny_total_tokens: results.reduce((sum, r) => sum + r.token_count, 0),
    kuromoji_total_tokens: results.reduce((sum, r) => sum + r.kuromoji_count, 0),
    avg_tiny: (results.reduce((sum, r) => sum + r.token_count, 0) / results.length).toFixed(2),
    avg_kuromoji: (results.reduce((sum, r) => sum + r.kuromoji_count, 0) / results.length).toFixed(2),
    more_tokens_tiny: results.filter(r => r.token_diff > 0).length,
    same_tokens: results.filter(r => r.token_diff === 0).length,
    fewer_tokens_tiny: results.filter(r => r.token_diff < 0).length,
    avg_diff: (results.reduce((sum, r) => sum + Math.abs(r.token_diff), 0) / results.length).toFixed(2)
  };

  // Save updated JSON
  const outputJsonPath = path.join(__dirname, 'tokenizer_comparison_full.json');
  fs.writeFileSync(outputJsonPath, JSON.stringify({ results, stats }, null, 2), 'utf-8');
  console.log(`✅ Full comparison saved to: ${outputJsonPath}\n`);

  // Create detailed markdown comparison
  let mdContent = '# 🔍 Tokenizer Comparison: TinySegmenter vs Kuromoji\n\n';
  mdContent += `**Generated:** ${new Date().toISOString()}\n\n`;
  mdContent += '## 📊 Statistics\n\n';
  mdContent += `- **Total Samples:** ${stats.total_samples}\n`;
  mdContent += `- **TinySegmenter Total Tokens:** ${stats.tiny_total_tokens} (avg: ${stats.avg_tiny})\n`;
  mdContent += `- **Kuromoji Total Tokens:** ${stats.kuromoji_total_tokens} (avg: ${stats.avg_kuromoji})\n`;
  mdContent += `- **TinySegmenter creates MORE tokens:** ${stats.more_tokens_tiny} samples\n`;
  mdContent += `- **Same token count:** ${stats.same_tokens} samples\n`;
  mdContent += `- **TinySegmenter creates FEWER tokens:** ${stats.fewer_tokens_tiny} samples\n`;
  mdContent += `- **Average difference:** ${stats.avg_diff} tokens\n\n`;
  mdContent += '---\n\n';
  mdContent += '## 📋 Detailed Comparison\n\n';

  results.forEach((r, index) => {
    mdContent += `### ${r.id}. ${r.original_text}\n\n`;
    mdContent += `**TinySegmenter (${r.token_count} tokens):**\n\`\`\`\n${r.tokens_tiny}\n\`\`\`\n\n`;
    mdContent += `**Kuromoji (${r.kuromoji_count} tokens):**\n\`\`\`\n${r.kuromoji_words}\n\`\`\`\n\n`;
    
    if (r.token_diff !== 0) {
      const diff = r.token_diff > 0 
        ? `🔴 TinySegmenter created ${r.token_diff} more token(s)`
        : `🟢 TinySegmenter created ${Math.abs(r.token_diff)} fewer token(s)`;
      mdContent += `**Difference:** ${diff}\n\n`;
    } else {
      mdContent += `**Difference:** ✅ Same token count\n\n`;
    }

    // Show detailed Kuromoji info
    mdContent += `**Kuromoji Details:**\n`;
    mdContent += '| Token | POS | Dictionary Form | Reading |\n';
    mdContent += '|-------|-----|----------------|----------|\n';
    r.kuromoji_detailed.forEach(t => {
      mdContent += `| ${t.word} | ${t.pos} | ${t.basic} | ${t.reading} |\n`;
    });
    mdContent += '\n---\n\n';
  });

  const mdPath = path.join(__dirname, 'tokenizer_comparison_detailed.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`✅ Detailed markdown saved to: ${mdPath}\n`);

  // Create CSV comparison
  const csvPath = path.join(__dirname, 'tokenizer_comparison_full.csv');
  const csvHeader = 'ID,Original Text,Tiny Tokens,Tiny Output,Kuromoji Tokens,Kuromoji Output,Difference\n';
  const csvRows = results.map(r => {
    const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
    return `${r.id},${escapeCsv(r.original_text)},${r.token_count},${escapeCsv(r.tokens_tiny)},${r.kuromoji_count},${escapeCsv(r.kuromoji_words)},${r.token_diff}`;
  }).join('\n');
  
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');
  console.log(`✅ CSV comparison saved to: ${csvPath}\n`);

  // Print first 10 comparisons to console
  console.log('━'.repeat(100));
  console.log('📋 FIRST 10 SIDE-BY-SIDE COMPARISONS:\n');
  console.log('━'.repeat(100));

  results.slice(0, 10).forEach(r => {
    console.log(`\n${r.id}. ${r.original_text}`);
    console.log(`\n   TinySegmenter (${r.token_count}):`);
    console.log(`   ${r.tokens_tiny}`);
    console.log(`\n   Kuromoji (${r.kuromoji_count}):`);
    console.log(`   ${r.kuromoji_words}`);
    
    if (r.token_diff > 0) {
      console.log(`\n   🔴 Tiny created ${r.token_diff} MORE token(s)`);
    } else if (r.token_diff < 0) {
      console.log(`\n   🟢 Tiny created ${Math.abs(r.token_diff)} FEWER token(s)`);
    } else {
      console.log(`\n   ✅ Same token count`);
    }
    console.log('\n' + '━'.repeat(100));
  });

  console.log('\n📊 SUMMARY:\n');
  console.log('━'.repeat(100));
  console.log(`Total Samples: ${stats.total_samples}`);
  console.log(`TinySegmenter: ${stats.tiny_total_tokens} total tokens (avg: ${stats.avg_tiny})`);
  console.log(`Kuromoji:      ${stats.kuromoji_total_tokens} total tokens (avg: ${stats.avg_kuromoji})`);
  console.log(`\nKuromoji generally creates ${stats.kuromoji_total_tokens < stats.tiny_total_tokens ? 'FEWER' : 'MORE'} tokens`);
  console.log(`(${Math.abs(stats.tiny_total_tokens - stats.kuromoji_total_tokens)} token difference across all samples)`);
  console.log('━'.repeat(100));

  console.log('\n✅ All comparison files generated!\n');
  console.log('📄 Files:');
  console.log(`   - ${outputJsonPath}`);
  console.log(`   - ${mdPath}`);
  console.log(`   - ${csvPath}\n`);

  process.exit(0);
});


