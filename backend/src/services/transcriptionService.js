import OpenAI from 'openai';
import fs from 'fs';

// Lazy initialization of OpenAI client
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.');
    }

    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<Object>} Transcription result with text and segments
 */
export async function transcribeAudio(audioPath) {
  try {
    console.log('🎤 Starting transcription for:', audioPath);

    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Get file size (Whisper API has 25MB limit)
    const stats = fs.statSync(audioPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📊 Audio file size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 25) {
      throw new Error(`Audio file too large (${fileSizeMB.toFixed(2)}MB). Whisper API limit is 25MB.`);
    }

    // Create read stream for the audio file
    const audioStream = fs.createReadStream(audioPath);

    // Call Whisper API with verbose JSON for timestamps
    const startTime = Date.now();
    const client = getOpenAIClient();
    const transcription = await client.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language: 'ja', // Japanese
      response_format: 'verbose_json', // Get timestamps
      timestamp_granularities: ['segment'], // Segment-level timestamps
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Transcription complete in ${duration}s`);
    console.log(`📝 Text length: ${transcription.text.length} characters`);
    console.log(`📊 Segments: ${transcription.segments?.length || 0}`);

    // Calculate cost (Whisper API is $0.006 per minute)
    const audioDurationMin = (transcription.duration || 0) / 60;
    const estimatedCost = audioDurationMin * 0.006;
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}`);

    return {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments || [],
      cost: estimatedCost,
    };

  } catch (error) {
    console.error('❌ Transcription error:', error.message);

    // Check for API key issues
    if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.');
    }

    // Check for rate limit
    if (error.message.includes('rate limit') || error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a few moments.');
    }

    // Check for quota
    if (error.message.includes('quota') || error.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your billing at platform.openai.com.');
    }

    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Split long text into smaller chunks for translation
 * @param {string} text - Text to split
 * @param {number} maxLength - Maximum length per chunk
 * @returns {Array<string>} Array of text chunks
 */
export function splitTextIntoChunks(text, maxLength = 5000) {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  let currentChunk = '';

  // Split by sentences (Japanese periods: 。)
  const sentences = text.split(/(?<=[。！？\n])/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        // Single sentence is too long, split it anyway
        chunks.push(sentence.substring(0, maxLength));
        currentChunk = sentence.substring(maxLength);
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

