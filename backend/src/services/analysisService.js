import kuromoji from 'kuromoji';
import { db, dbType } from '../db/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-loaded Kuromoji tokenizer
let kuromojiTokenizer = null;

/**
 * Initialize Kuromoji tokenizer (lazy loading)
 * @returns {Promise<Object>} Kuromoji tokenizer instance
 */
function getTokenizer() {
  return new Promise((resolve, reject) => {
    if (kuromojiTokenizer) {
      resolve(kuromojiTokenizer);
    } else {
      const dicPath = path.join(__dirname, '../../node_modules/kuromoji/dict');
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) {
          reject(err);
        } else {
          kuromojiTokenizer = tokenizer;
          console.log('✅ Kuromoji tokenizer initialized');
          resolve(tokenizer);
        }
      });
    }
  });
}

/**
 * Tokenize Japanese text into words using Kuromoji
 * @param {string} text - Japanese text to tokenize
 * @returns {Promise<Array<string>>} Array of tokens (surface forms)
 */
async function tokenizeJapanese(text) {
  if (!text || text.trim().length === 0) return [];
  
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    
    // Return surface forms (like TinySegmenter did)
    return tokens.map(t => t.surface_form);
  } catch (error) {
    console.error('❌ Kuromoji tokenization error:', error);
    // Fallback: return the original text as a single token
    return [text];
  }
}

/**
 * Tokenize Japanese text with detailed Kuromoji metadata
 * Returns full token objects with POS, basic_form, reading, conjugation info
 * @param {string} text - Japanese text to tokenize
 * @returns {Promise<Array>} Array of token objects with full metadata
 */
async function tokenizeJapaneseDetailed(text) {
  if (!text || text.trim().length === 0) return [];
  
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    
    // Return full token objects with all Kuromoji metadata
    return tokens.map(t => ({
      surface_form: t.surface_form,
      pos: t.pos || '*',
      pos_detail_1: t.pos_detail_1 || '*',
      pos_detail_2: t.pos_detail_2 || '*',
      pos_detail_3: t.pos_detail_3 || '*',
      conjugation_type: t.conjugated_type || '*',
      conjugation_form: t.conjugated_form || '*',
      basic_form: t.basic_form || t.surface_form,
      reading: t.reading || '*',
      pronunciation: t.pronunciation || '*'
    }));
  } catch (error) {
    console.error('❌ Kuromoji detailed tokenization error:', error);
    // Fallback: return basic token object
    return [{
      surface_form: text,
      pos: '*',
      basic_form: text,
      reading: '*',
      conjugation_type: '*',
      conjugation_form: '*'
    }];
  }
}

/**
 * Get all N5 vocabulary from database
 * @returns {Promise<Array>} N5 vocabulary list
 */
async function getN5Vocabulary() {
  if (dbType === 'postgresql') {
    const result = await db.query(
      'SELECT * FROM jlpt_vocabulary WHERE jlpt_level = 5 ORDER BY id'
    );
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM jlpt_vocabulary WHERE jlpt_level = 5 ORDER BY id',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

/**
 * Get all N5 grammar patterns from database
 * @returns {Promise<Array>} N5 grammar patterns list
 */
async function getN5GrammarPatterns() {
  if (dbType === 'postgresql') {
    const result = await db.query(
      'SELECT * FROM grammar_patterns WHERE jlpt_level = 5 ORDER BY id'
    );
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM grammar_patterns WHERE jlpt_level = 5 ORDER BY id',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

/**
 * Find N5 vocabulary matches in text
 * @param {string} text - Japanese text to analyze
 * @param {Array} vocabulary - N5 vocabulary list
 * @returns {Promise<Array>} Matched words with positions
 */
async function findVocabularyMatches(text, vocabulary) {
  const tokens = await tokenizeJapaneseDetailed(text);
  const matches = [];
  
  // Create lookup maps for faster matching (match by surface form and basic form)
  const kanjiMap = new Map();
  const hiraganaMap = new Map();
  
  vocabulary.forEach(word => {
    if (word.kanji) kanjiMap.set(word.kanji, word);
    if (word.hiragana) hiraganaMap.set(word.hiragana, word);
    
    // Also check variants
    if (word.variants) {
      try {
        const variants = JSON.parse(word.variants);
        variants.forEach(variant => {
          kanjiMap.set(variant, word);
          hiraganaMap.set(variant, word);
        });
      } catch (e) {
        // variants not JSON, skip
      }
    }
  });
  
  // Track position in original text
  let currentPos = 0;
  
  tokens.forEach(tokenObj => {
    const surfaceForm = tokenObj.surface_form;
    const basicForm = tokenObj.basic_form;
    
    // Find token position in text
    const tokenPos = text.indexOf(surfaceForm, currentPos);
    
    // Check if token matches any N5 word (by surface form or basic/dictionary form)
    let matchedWord = null;
    
    // First try surface form
    if (kanjiMap.has(surfaceForm)) {
      matchedWord = kanjiMap.get(surfaceForm);
    } else if (hiraganaMap.has(surfaceForm)) {
      matchedWord = hiraganaMap.get(surfaceForm);
    }
    
    // If not found, try basic form (dictionary form)
    if (!matchedWord && basicForm && basicForm !== '*') {
      if (kanjiMap.has(basicForm)) {
        matchedWord = kanjiMap.get(basicForm);
      } else if (hiraganaMap.has(basicForm)) {
        matchedWord = hiraganaMap.get(basicForm);
      }
    }
    
    if (matchedWord) {
      matches.push({
        word_id: matchedWord.id,
        matched_text: surfaceForm,
        position: tokenPos,
        kanji: matchedWord.kanji,
        hiragana: matchedWord.hiragana,
        english: matchedWord.english,
        part_of_speech: matchedWord.part_of_speech,
        chapter: matchedWord.chapter,
        // Store Kuromoji metadata
        pos: tokenObj.pos,
        basic_form: tokenObj.basic_form,
        reading: tokenObj.reading,
        conjugation_type: tokenObj.conjugation_type,
        conjugation_form: tokenObj.conjugation_form,
      });
    }
    
    currentPos = tokenPos + surfaceForm.length;
  });
  
  return matches;
}

/**
 * Find N5 grammar pattern matches in text
 * @param {string} text - Japanese text to analyze
 * @param {Array} patterns - N5 grammar patterns list
 * @returns {Array} Matched patterns with positions
 */
function findGrammarMatches(text, patterns) {
  const matches = [];
  
  patterns.forEach(pattern => {
    try {
      const regex = new RegExp(pattern.pattern_regex, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          pattern_id: pattern.id,
          matched_text: match[0],
          position: match.index,
          pattern_name: pattern.pattern_name,
          pattern_structure: pattern.pattern_structure,
          english_explanation: pattern.english_explanation,
          chapter: pattern.chapter,
        });
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern.id}:`, error.message);
    }
  });
  
  return matches;
}

/**
 * Analyze vocabulary in transcription segments
 * @param {Array} segments - Transcription segments with timestamps
 * @param {Array} vocabulary - N5 vocabulary list
 * @returns {Promise<Array>} Vocabulary matches with timestamps
 */
async function analyzeVocabularyInSegments(segments, vocabulary) {
  const allMatches = [];
  
  for (const segment of segments) {
    const matches = await findVocabularyMatches(segment.text || '', vocabulary);
    
    matches.forEach(match => {
      allMatches.push({
        ...match,
        start_time: segment.start,
        end_time: segment.end,
        segment_text: segment.text,
      });
    });
  }
  
  return allMatches;
}

/**
 * Analyze grammar patterns in transcription segments
 * @param {Array} segments - Transcription segments
 * @param {Array} patterns - N5 grammar patterns list
 * @returns {Array} Grammar matches with context
 */
function analyzeGrammarInSegments(segments, patterns) {
  const allMatches = [];
  
  segments.forEach(segment => {
    const matches = findGrammarMatches(segment.text || '', patterns);
    
    matches.forEach(match => {
      allMatches.push({
        ...match,
        start_time: segment.start,
        end_time: segment.end,
        segment_text: segment.text,
      });
    });
  });
  
  return allMatches;
}

/**
 * Full video analysis - detect N5 vocabulary and grammar
 * @param {number} videoId - Video ID to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeVideo(videoId) {
  try {
    console.log(`📊 Starting N5 analysis for video ${videoId}...`);
    
    // 1. Get transcription
    let transcription;
    if (dbType === 'postgresql') {
      const result = await db.query(
        'SELECT * FROM transcriptions WHERE video_id = $1',
        [videoId]
      );
      transcription = result.rows[0];
    } else {
      transcription = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM transcriptions WHERE video_id = ?',
          [videoId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
    
    if (!transcription) {
      throw new Error('Transcription not found for this video');
    }
    
    // Parse segments
    const segments = JSON.parse(transcription.segments || '[]');
    const fullText = transcription.full_text || '';
    
    // 2. Get N5 data
    const [vocabulary, grammarPatterns] = await Promise.all([
      getN5Vocabulary(),
      getN5GrammarPatterns(),
    ]);
    
    console.log(`📚 Loaded ${vocabulary.length} N5 words, ${grammarPatterns.length} patterns`);
    
    // 3. Analyze vocabulary
    const vocabularyMatches = await analyzeVocabularyInSegments(segments, vocabulary);
    
    // Deduplicate (same word might appear multiple times)
    const uniqueWords = new Map();
    vocabularyMatches.forEach(match => {
      if (!uniqueWords.has(match.word_id)) {
        uniqueWords.set(match.word_id, {
          word_id: match.word_id,
          kanji: match.kanji,
          hiragana: match.hiragana,
          english: match.english,
          part_of_speech: match.part_of_speech,
          chapter: match.chapter,
          occurrences: [],
          first_appearance: match.start_time, // Initialize with first occurrence
        });
      }
      
      const wordData = uniqueWords.get(match.word_id);
      
      // Update first_appearance if this occurrence is earlier
      if (match.start_time < wordData.first_appearance) {
        wordData.first_appearance = match.start_time;
      }
      
      wordData.occurrences.push({
        matched_text: match.matched_text,
        start_time: match.start_time,
        end_time: match.end_time,
        segment_text: match.segment_text,
        position: match.position,
      });
    });
    
    // 4. Analyze grammar
    const grammarMatches = analyzeGrammarInSegments(segments, grammarPatterns);
    
    // Deduplicate patterns
    const uniquePatterns = new Map();
    grammarMatches.forEach(match => {
      if (!uniquePatterns.has(match.pattern_id)) {
        uniquePatterns.set(match.pattern_id, {
          pattern_id: match.pattern_id,
          pattern_name: match.pattern_name,
          pattern_structure: match.pattern_structure,
          english_explanation: match.english_explanation,
          chapter: match.chapter,
          occurrences: [],
        });
      }
      
      uniquePatterns.get(match.pattern_id).occurrences.push({
        matched_text: match.matched_text,
        start_time: match.start_time,
        end_time: match.end_time,
        segment_text: match.segment_text,
        position: match.position,
      });
    });
    
    // 5. Store results in database
    // Store vocabulary instances
    for (const match of vocabularyMatches) {
      const insertQuery = dbType === 'postgresql'
        ? `INSERT INTO vocabulary_instances 
           (transcription_id, word_id, matched_text, start_time, end_time, pos, basic_form, reading, conjugation_type, conjugation_form) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        : `INSERT INTO vocabulary_instances 
           (transcription_id, word_id, matched_text, start_time, end_time, pos, basic_form, reading, conjugation_type, conjugation_form) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      if (dbType === 'postgresql') {
        await db.query(insertQuery, [
          transcription.id,
          match.word_id,
          match.matched_text,
          match.start_time,
          match.end_time,
          match.pos || null,
          match.basic_form || null,
          match.reading || null,
          match.conjugation_type || null,
          match.conjugation_form || null,
        ]);
      } else {
        await new Promise((resolve, reject) => {
          db.run(insertQuery, [
            transcription.id,
            match.word_id,
            match.matched_text,
            match.start_time,
            match.end_time,
            match.pos || null,
            match.basic_form || null,
            match.reading || null,
            match.conjugation_type || null,
            match.conjugation_form || null,
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    // Store grammar instances
    for (const match of grammarMatches) {
      const insertQuery = dbType === 'postgresql'
        ? `INSERT INTO detected_grammar 
           (transcription_id, pattern_id, matched_text, position_in_text, start_time, end_time) 
           VALUES ($1, $2, $3, $4, $5, $6)`
        : `INSERT INTO detected_grammar 
           (transcription_id, pattern_id, matched_text, position_in_text, start_time, end_time) 
           VALUES (?, ?, ?, ?, ?, ?)`;
      
      if (dbType === 'postgresql') {
        await db.query(insertQuery, [
          transcription.id,
          match.pattern_id,
          match.matched_text,
          match.position,
          match.start_time,
          match.end_time,
        ]);
      } else {
        await new Promise((resolve, reject) => {
          db.run(insertQuery, [
            transcription.id,
            match.pattern_id,
            match.matched_text,
            match.position,
            match.start_time,
            match.end_time,
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    // 6. Calculate statistics
    const totalWords = (await tokenizeJapanese(fullText)).length;
    const n5WordCount = vocabularyMatches.length;
    const n5Density = totalWords > 0 ? (n5WordCount / totalWords) : 0;
    
    const result = {
      video_id: videoId,
      vocabulary: {
        unique_count: uniqueWords.size,
        total_occurrences: vocabularyMatches.length,
        words: Array.from(uniqueWords.values()).map(word => ({
          ...word,
          japanese: word.kanji || word.hiragana,
          reading: word.hiragana,
          frequency: word.occurrences.length,
          first_appearance: word.first_appearance,
        })),
      },
      grammar: {
        unique_count: uniquePatterns.size,
        total_occurrences: grammarMatches.length,
        patterns: Array.from(uniquePatterns.values()).map(pattern => ({
          ...pattern,
          frequency: pattern.occurrences.length,
        })),
      },
      stats: {
        total_words: totalWords,
        n5_word_count: n5WordCount,
        n5_word_unique: uniqueWords.size,
        n5_grammar_unique: uniquePatterns.size,
        n5_density: Math.round(n5Density * 100), // Percentage
        study_time_estimate: Math.ceil(segments.length / 6), // ~6 segments per minute
      },
    };
    
    console.log(`✅ Analysis complete:`);
    console.log(`   🟡 ${uniqueWords.size} unique N5 words (${vocabularyMatches.length} total)`);
    console.log(`   📝 ${uniquePatterns.size} unique grammar patterns (${grammarMatches.length} total)`);
    console.log(`   🎯 N5 density: ${result.stats.n5_density}%`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    throw new Error(`Failed to analyze video: ${error.message}`);
  }
}

/**
 * Get analysis results for a video
 * @param {number} videoId - Video ID
 * @returns {Promise<Object>} Analysis results
 */
export async function getVideoAnalysis(videoId) {
  try {
    // Get transcription
    let transcription;
    if (dbType === 'postgresql') {
      const result = await db.query(
        'SELECT * FROM transcriptions WHERE video_id = $1',
        [videoId]
      );
      transcription = result.rows[0];
    } else {
      transcription = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM transcriptions WHERE video_id = ?',
          [videoId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
    
    if (!transcription) {
      throw new Error('Transcription not found');
    }
    
    // Get vocabulary instances with word details
    let vocabularyInstances;
    if (dbType === 'postgresql') {
      const result = await db.query(`
        SELECT vi.*, v.kanji, v.hiragana, v.english, v.part_of_speech, v.chapter
        FROM vocabulary_instances vi
        JOIN jlpt_vocabulary v ON vi.word_id = v.id
        WHERE vi.transcription_id = $1
        ORDER BY vi.start_time
      `, [transcription.id]);
      vocabularyInstances = result.rows;
    } else {
      vocabularyInstances = await new Promise((resolve, reject) => {
        db.all(`
          SELECT vi.*, v.kanji, v.hiragana, v.english, v.part_of_speech, v.chapter
          FROM vocabulary_instances vi
          JOIN jlpt_vocabulary v ON vi.word_id = v.id
          WHERE vi.transcription_id = ?
          ORDER BY vi.start_time
        `, [transcription.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
    
    // Get grammar instances with pattern details
    let grammarInstances;
    if (dbType === 'postgresql') {
      const result = await db.query(`
        SELECT dg.*, gp.pattern_name, gp.pattern_structure, 
               gp.english_explanation, gp.chapter
        FROM detected_grammar dg
        JOIN grammar_patterns gp ON dg.pattern_id = gp.id
        WHERE dg.transcription_id = $1
      `, [transcription.id]);
      grammarInstances = result.rows;
    } else {
      grammarInstances = await new Promise((resolve, reject) => {
        db.all(`
          SELECT dg.*, gp.pattern_name, gp.pattern_structure, 
                 gp.english_explanation, gp.chapter
          FROM detected_grammar dg
          JOIN grammar_patterns gp ON dg.pattern_id = gp.id
          WHERE dg.transcription_id = ?
        `, [transcription.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
    
    // Group vocabulary by word with enhanced Kuromoji metadata
    const vocabularyMap = new Map();
    vocabularyInstances.forEach(instance => {
      if (!vocabularyMap.has(instance.word_id)) {
        vocabularyMap.set(instance.word_id, {
          word_id: instance.word_id,
          kanji: instance.kanji,
          hiragana: instance.hiragana,
          english: instance.english,
          part_of_speech: instance.part_of_speech,
          chapter: instance.chapter,
          occurrences: [],
          forms: new Set(), // Track all forms this word appears in
          first_appearance: instance.start_time, // Initialize with first occurrence
        });
      }
      
      const wordData = vocabularyMap.get(instance.word_id);
      
      // Update first_appearance if this occurrence is earlier
      if (instance.start_time < wordData.first_appearance) {
        wordData.first_appearance = instance.start_time;
      }
      
      // Track unique forms
      if (instance.matched_text) {
        wordData.forms.add(instance.matched_text);
      }
      
      wordData.occurrences.push({
        start_time: instance.start_time,
        end_time: instance.end_time,
        matched_text: instance.matched_text,
        pos: instance.pos,
        basic_form: instance.basic_form,
        reading: instance.reading,
        conjugation_type: instance.conjugation_type,
        conjugation_form: instance.conjugation_form,
      });
    });
    
    // Group grammar by pattern
    const grammarMap = new Map();
    grammarInstances.forEach(instance => {
      if (!grammarMap.has(instance.pattern_id)) {
        grammarMap.set(instance.pattern_id, {
          pattern_id: instance.pattern_id,
          pattern_name: instance.pattern_name,
          pattern_structure: instance.pattern_structure,
          english_explanation: instance.english_explanation,
          chapter: instance.chapter,
          occurrences: [],
        });
      }
      
      grammarMap.get(instance.pattern_id).occurrences.push({
        matched_text: instance.matched_text,
        start_time: instance.start_time,
        end_time: instance.end_time,
        position: instance.position_in_text,
      });
    });
    
    const segments = JSON.parse(transcription.segments || '[]');
    
    return {
      video_id: videoId,
      vocabulary: {
        unique_count: vocabularyMap.size,
        total_occurrences: vocabularyInstances.length,
        words: Array.from(vocabularyMap.values()).map(word => ({
          ...word,
          japanese: word.kanji || word.hiragana,
          reading: word.hiragana,
          frequency: word.occurrences.length,
          first_appearance: word.first_appearance,
          forms: Array.from(word.forms), // Convert Set to Array
        })),
      },
      grammar: {
        unique_count: grammarMap.size,
        total_occurrences: grammarInstances.length,
        patterns: Array.from(grammarMap.values()).map(pattern => ({
          ...pattern,
          frequency: pattern.occurrences.length,
        })),
      },
      stats: {
        n5_word_unique: vocabularyMap.size,
        n5_word_total: vocabularyInstances.length,
        n5_grammar_unique: grammarMap.size,
        n5_grammar_total: grammarInstances.length,
        study_time_estimate: Math.ceil(segments.length / 6),
      },
    };
    
  } catch (error) {
    console.error('❌ Error getting analysis:', error);
    throw new Error(`Failed to get analysis: ${error.message}`);
  }
}

/**
 * Generate N5 timeline data for visualization
 * Divides video into segments and calculates N5 density for each
 * @param {number} videoId - The ID of the video
 * @param {number} segmentDuration - Duration of each timeline segment in seconds (default: 15)
 * @returns {Promise<Object>} Timeline data with segments and recommendations
 */
export async function getN5Timeline(videoId, segmentDuration = 15) {
  console.log(`📊 Generating N5 timeline for video ID: ${videoId}`);
  
  try {
    // 1. Get video duration
    let video;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT * FROM videos WHERE id = $1', [videoId]);
      video = result.rows[0];
    } else {
      video = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM videos WHERE id = ?', [videoId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!video) {
      throw new Error(`Video not found for ID: ${videoId}`);
    }
    
    const videoDuration = video.duration || 0;
    if (videoDuration === 0) {
      throw new Error('Video duration is 0, cannot generate timeline');
    }
    
    // 2. Get transcription
    let transcription;
    if (dbType === 'postgresql') {
      const result = await db.query('SELECT * FROM transcriptions WHERE video_id = $1', [videoId]);
      transcription = result.rows[0];
    } else {
      transcription = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM transcriptions WHERE video_id = ?', [videoId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!transcription) {
      throw new Error(`Transcription not found for video ID: ${videoId}`);
    }
    
    const segments = JSON.parse(transcription.segments || '[]');
    
    // 3. Get vocabulary and grammar instances
    let vocabularyInstances;
    if (dbType === 'postgresql') {
      const result = await db.query(`
        SELECT vi.*, jv.kanji, jv.hiragana, jv.english
        FROM vocabulary_instances vi
        JOIN jlpt_vocabulary jv ON vi.word_id = jv.id
        WHERE vi.transcription_id = $1
        ORDER BY vi.start_time
      `, [transcription.id]);
      vocabularyInstances = result.rows;
    } else {
      vocabularyInstances = await new Promise((resolve, reject) => {
        db.all(`
          SELECT vi.*, jv.kanji, jv.hiragana, jv.english
          FROM vocabulary_instances vi
          JOIN jlpt_vocabulary jv ON vi.word_id = jv.id
          WHERE vi.transcription_id = ?
          ORDER BY vi.start_time
        `, [transcription.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
    
    let grammarInstances;
    if (dbType === 'postgresql') {
      const result = await db.query(`
        SELECT dg.*, gp.pattern_name
        FROM detected_grammar dg
        JOIN grammar_patterns gp ON dg.pattern_id = gp.id
        WHERE dg.transcription_id = $1
        ORDER BY dg.position_in_text
      `, [transcription.id]);
      grammarInstances = result.rows;
    } else {
      grammarInstances = await new Promise((resolve, reject) => {
        db.all(`
          SELECT dg.*, gp.pattern_name
          FROM detected_grammar dg
          JOIN grammar_patterns gp ON dg.pattern_id = gp.id
          WHERE dg.transcription_id = ?
          ORDER BY dg.position_in_text
        `, [transcription.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
    
    // 4. Create timeline segments
    const numSegments = Math.ceil(videoDuration / segmentDuration);
    const timelineSegments = [];
    
    for (let i = 0; i < numSegments; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, videoDuration);
      
      // Count N5 words in this time range
      const wordsInSegment = vocabularyInstances.filter(
        v => v.start_time >= startTime && v.start_time < endTime
      );
      
      // Count grammar patterns in this time range
      const grammarInSegment = grammarInstances.filter(g => {
        // Find which transcription segment this grammar instance belongs to
        const transcriptionSegment = segments.find((s, idx) => {
          const segmentStart = s.start;
          const segmentEnd = s.end || (segments[idx + 1]?.start || videoDuration);
          return segmentStart <= startTime && startTime < segmentEnd;
        });
        return transcriptionSegment && transcriptionSegment.start >= startTime && transcriptionSegment.start < endTime;
      });
      
      // Count unique N5 words
      const uniqueWords = new Set(wordsInSegment.map(w => w.word_id)).size;
      const uniqueGrammar = new Set(grammarInSegment.map(g => g.pattern_id)).size;
      
      // Calculate total words in this time range
      let totalWords = 0;
      const segmentsInRange = segments.filter(s => s.start >= startTime && s.start < endTime);
      for (const seg of segmentsInRange) {
        if (seg.text) {
          totalWords += (await tokenizeJapanese(seg.text)).length;
        }
      }
      
      // Calculate N5 density (percentage of N5 words vs total words)
      const density = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) : 0;
      
      // Categorize segment
      let level = 'low';
      if (density >= 50) level = 'high';
      else if (density >= 25) level = 'medium';
      
      timelineSegments.push({
        start: startTime,
        end: endTime,
        n5_word_count: uniqueWords,
        n5_grammar_count: uniqueGrammar,
        total_words: totalWords,
        density: density,
        level: level,
      });
    }
    
    // 5. Find recommended segments (highest N5 density)
    const recommendedSegments = timelineSegments
      .filter(s => s.n5_word_count > 0) // Only segments with N5 content
      .sort((a, b) => b.density - a.density) // Sort by density descending
      .slice(0, 5) // Top 5 segments
      .map(s => ({
        start: s.start,
        end: s.end,
        density: s.density,
        n5_word_count: s.n5_word_count,
        n5_grammar_count: s.n5_grammar_count,
        description: getSegmentDescription(s, segments),
      }));
    
    console.log(`✅ Timeline generated: ${numSegments} segments, ${recommendedSegments.length} recommended`);
    
    return {
      video_id: videoId,
      duration: videoDuration,
      segment_duration: segmentDuration,
      segments: timelineSegments,
      recommended: recommendedSegments,
      overall_density: Math.round(
        timelineSegments.reduce((sum, s) => sum + s.density, 0) / timelineSegments.length
      ),
    };
    
  } catch (error) {
    console.error('❌ Error generating timeline:', error);
    throw new Error(`Failed to generate timeline: ${error.message}`);
  }
}

/**
 * Get a brief description of what's happening in a segment
 * @param {Object} timelineSegment - Timeline segment data
 * @param {Array} transcriptionSegments - Full transcription segments
 * @returns {string} Description
 */
function getSegmentDescription(timelineSegment, transcriptionSegments) {
  const segmentsInRange = transcriptionSegments.filter(
    s => s.start >= timelineSegment.start && s.start < timelineSegment.end
  );
  
  if (segmentsInRange.length === 0) return 'N5 content';
  
  // Get first few words of the first segment as description
  const firstSegment = segmentsInRange[0];
  const text = firstSegment.text || '';
  const words = text.split(' ').slice(0, 5).join(' ');
  return words + (text.split(' ').length > 5 ? '...' : '');
}

