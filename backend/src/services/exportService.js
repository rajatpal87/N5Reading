/**
 * Export Service
 * Handles generating CSV and Anki-compatible exports for vocabulary data
 */

/**
 * Generate standard CSV format for vocabulary
 * @param {Array} vocabularyData - Array of vocabulary objects
 * @returns {string} CSV formatted string
 */
export function generateVocabularyCSV(vocabularyData) {
  // CSV Header
  const header = 'Japanese,Reading,English,Chapter,First Appears,Frequency,Example Sentence\n';
  
  // Validate input
  if (!vocabularyData || !Array.isArray(vocabularyData)) {
    console.error('Invalid vocabularyData:', typeof vocabularyData);
    return header + '# No vocabulary data available\n';
  }
  
  if (vocabularyData.length === 0) {
    return header + '# No N5 vocabulary found in this video\n';
  }
  
  // Group by word_id to count frequency and get first occurrence
  const vocabMap = new Map();
  
  for (const vocab of vocabularyData) {
    const wordId = vocab.word_id;
    if (!vocabMap.has(wordId)) {
      vocabMap.set(wordId, {
        japanese: vocab.kanji || vocab.hiragana,
        reading: vocab.hiragana,
        english: vocab.english,
        chapter: vocab.chapter,
        firstAppears: formatTime(vocab.start_time),
        frequency: 1,
        exampleSentence: vocab.matched_text || '',
      });
    } else {
      const existing = vocabMap.get(wordId);
      existing.frequency += 1;
    }
  }
  
  // Convert to CSV rows
  const rows = Array.from(vocabMap.values()).map(v => {
    return `"${escapeCSV(v.japanese)}","${escapeCSV(v.reading)}","${escapeCSV(v.english)}","${escapeCSV(v.chapter)}","${v.firstAppears}",${v.frequency},"${escapeCSV(v.exampleSentence)}"`;
  });
  
  return header + rows.join('\n');
}

/**
 * Generate Anki-compatible CSV format
 * Format: Front (Japanese), Back (Reading + English + Chapter + Example)
 * @param {Array} vocabularyData - Array of vocabulary objects
 * @param {Array} transcriptionSegments - Array of transcription segments for context
 * @returns {string} Anki CSV formatted string
 */
export function generateAnkiCSV(vocabularyData, transcriptionSegments = []) {
  // Anki CSV format: Front,Back
  // Front: Japanese word (kanji/hiragana)
  // Back: Reading (hiragana) + English + Chapter + Example sentence
  
  const header = 'Front,Back\n';
  
  // Validate input
  if (!vocabularyData || !Array.isArray(vocabularyData)) {
    console.error('Invalid vocabularyData:', typeof vocabularyData);
    return header + '"# No vocabulary data available",""\n';
  }
  
  if (vocabularyData.length === 0) {
    return header + '"# No N5 vocabulary found",""\n';
  }
  
  // Group by word_id to avoid duplicates
  const vocabMap = new Map();
  
  for (const vocab of vocabularyData) {
    const wordId = vocab.word_id;
    if (!vocabMap.has(wordId)) {
      // Find an example sentence from transcription
      const exampleSegment = transcriptionSegments.find(seg => 
        seg.text && seg.text.includes(vocab.matched_text || vocab.hiragana)
      );
      
      const exampleSentence = exampleSegment ? exampleSegment.text : vocab.matched_text || '';
      const exampleTranslation = exampleSegment ? (exampleSegment.translated_text || exampleSegment.translation || '') : '';
      
      vocabMap.set(wordId, {
        front: vocab.kanji || vocab.hiragana,
        reading: vocab.hiragana,
        english: vocab.english,
        chapter: vocab.chapter,
        exampleSentence: exampleSentence,
        exampleTranslation: exampleTranslation,
      });
    }
  }
  
  // Convert to Anki CSV rows
  const rows = Array.from(vocabMap.values()).map(v => {
    const front = escapeCSV(v.front);
    const back = [
      v.reading !== v.front ? `Reading: ${v.reading}` : '',
      `Meaning: ${v.english}`,
      `Chapter: ${v.chapter}`,
      v.exampleSentence ? `Example: ${v.exampleSentence}` : '',
      v.exampleTranslation ? `(${v.exampleTranslation})` : '',
    ].filter(Boolean).join(' | ');
    
    return `"${front}","${escapeCSV(back)}"`;
  });
  
  return header + rows.join('\n');
}

/**
 * Generate CSV format for grammar patterns
 * @param {Array} grammarData - Array of grammar objects
 * @returns {string} CSV formatted string
 */
export function generateGrammarCSV(grammarData) {
  const header = 'Pattern,Explanation,Chapter,Example,Translation,First Appears,Frequency\n';
  
  // Validate input
  if (!grammarData || !Array.isArray(grammarData)) {
    console.error('Invalid grammarData:', typeof grammarData);
    return header + '# No grammar data available\n';
  }
  
  if (grammarData.length === 0) {
    return header + '# No N5 grammar patterns found in this video\n';
  }
  
  // Group by pattern_id to count frequency
  const grammarMap = new Map();
  
  for (const grammar of grammarData) {
    const patternId = grammar.pattern_id;
    if (!grammarMap.has(patternId)) {
      grammarMap.set(patternId, {
        pattern: grammar.pattern_name,
        explanation: grammar.english_explanation,
        chapter: grammar.chapter,
        example: grammar.example_japanese || grammar.matched_text,
        translation: grammar.example_english || '',
        firstAppears: formatTimeFromPosition(grammar.position_in_text),
        frequency: 1,
      });
    } else {
      const existing = grammarMap.get(patternId);
      existing.frequency += 1;
    }
  }
  
  // Convert to CSV rows
  const rows = Array.from(grammarMap.values()).map(g => {
    return `"${escapeCSV(g.pattern)}","${escapeCSV(g.explanation)}","${escapeCSV(g.chapter)}","${escapeCSV(g.example)}","${escapeCSV(g.translation)}","${g.firstAppears}",${g.frequency}`;
  });
  
  return header + rows.join('\n');
}

/**
 * Escape special characters for CSV
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeCSV(str) {
  if (!str) return '';
  // Convert to string and escape double quotes
  return String(str).replace(/"/g, '""');
}

/**
 * Format seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format position (character index) to approximate timestamp (placeholder)
 * @param {number} position - Character position in text
 * @returns {string} Placeholder timestamp
 */
function formatTimeFromPosition(position) {
  // This is a placeholder - ideally we'd map position back to actual timestamp
  // For now, just return a generic marker
  return '~';
}

