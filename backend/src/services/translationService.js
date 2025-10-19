import * as deepl from 'deepl-node';

// Initialize DeepL translator
let translator = null;

function getTranslator() {
  if (!translator) {
    const apiKey = process.env.DEEPL_API_KEY;
    
    if (!apiKey || apiKey === 'your_deepl_api_key_here') {
      throw new Error('DeepL API key not configured. Please set DEEPL_API_KEY in .env file.');
    }

    translator = new deepl.Translator(apiKey);
  }
  return translator;
}

/**
 * Translate Japanese text to English using DeepL API
 * @param {string} text - Japanese text to translate
 * @returns {Promise<Object>} Translation result
 */
export async function translateText(text) {
  try {
    console.log('🌏 Starting translation...');
    console.log(`📝 Text length: ${text.length} characters`);

    if (!text || text.trim().length === 0) {
      return {
        translatedText: '',
        detectedSourceLang: 'ja',
        charCount: 0,
        cost: 0,
      };
    }

    const startTime = Date.now();
    const result = await getTranslator().translateText(
      text,
      'ja', // Source language: Japanese
      'en-US' // Target language: English (US)
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Translation complete in ${duration}s`);

    // Calculate cost (DeepL Free: 500K chars/month, DeepL Pro: €25/1M chars ≈ $0.000025/char)
    const charCount = text.length;
    const estimatedCost = charCount * 0.000025; // Assuming Pro pricing
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)} (${charCount} chars)`);

    return {
      translatedText: result.text,
      detectedSourceLang: result.detectedSourceLang,
      charCount: charCount,
      cost: estimatedCost,
    };

  } catch (error) {
    console.error('❌ Translation error:', error.message);

    // Check for API key issues
    if (error.message.includes('Authorization') || error.message.includes('403')) {
      throw new Error('Invalid DeepL API key. Please check your DEEPL_API_KEY in .env file.');
    }

    // Check for quota exceeded
    if (error.message.includes('quota') || error.message.includes('456')) {
      throw new Error('DeepL API quota exceeded. Please upgrade your plan or wait until next month.');
    }

    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Translate an array of text segments with progress tracking
 * @param {Array<Object>} segments - Array of segments with text
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Array<Object>>} Array of translated segments
 */
export async function translateSegments(segments, onProgress = null) {
  try {
    console.log(`🌏 Translating ${segments.length} segments...`);

    const translatedSegments = [];
    let totalChars = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      if (!segment.text || segment.text.trim().length === 0) {
        translatedSegments.push({
          ...segment,
          translation: '',
        });
        continue;
      }

      try {
        const result = await translateText(segment.text);
        translatedSegments.push({
          ...segment,
          translation: result.translatedText,
        });
        totalChars += result.charCount;

        // Report progress
        const progress = Math.round(((i + 1) / segments.length) * 100);
        if (onProgress && (i + 1) % 5 === 0) {
          onProgress({
            stage: 'translating',
            progress: progress,
            current: i + 1,
            total: segments.length,
            message: `Translating segment ${i + 1}/${segments.length}...`,
          });
        }

        // Log progress every 5 segments
        if ((i + 1) % 5 === 0) {
          console.log(`📊 Progress: ${i + 1}/${segments.length} segments (${progress}%)`);
        }

        // Small delay to avoid rate limiting (DeepL allows ~100 requests/min)
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Error translating segment ${i + 1}:`, error.message);
        // Continue with next segment even if one fails
        translatedSegments.push({
          ...segment,
          translation: `[Translation failed: ${error.message}]`,
        });
      }
    }

    const totalCost = totalChars * 0.000025;
    console.log(`✅ All segments translated. Total: ${totalChars} chars, Cost: $${totalCost.toFixed(4)}`);

    // Report completion
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Translation complete',
      });
    }

    return translatedSegments;

  } catch (error) {
    console.error('❌ Batch translation error:', error.message);
    throw new Error(`Failed to translate segments: ${error.message}`);
  }
}

/**
 * Get DeepL API usage statistics
 * @returns {Promise<Object>} Usage statistics
 */
export async function getUsageStats() {
  try {
    const usage = await getTranslator().getUsage();
    
    let limitType = 'unknown';
    let percentUsed = 0;

    if (usage.character) {
      percentUsed = (usage.character.count / usage.character.limit) * 100;
      limitType = 'character';
    } else if (usage.document) {
      percentUsed = (usage.document.count / usage.document.limit) * 100;
      limitType = 'document';
    }

    return {
      count: usage.character?.count || usage.document?.count || 0,
      limit: usage.character?.limit || usage.document?.limit || 0,
      percentUsed: percentUsed.toFixed(2),
      limitType: limitType,
      anyLimitReached: usage.anyLimitReached,
    };
  } catch (error) {
    console.error('❌ Error fetching usage stats:', error.message);
    throw new Error(`Failed to get usage stats: ${error.message}`);
  }
}

