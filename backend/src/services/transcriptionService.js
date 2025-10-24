import OpenAI from 'openai';
import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';
import path from 'path';

const execPromise = util.promisify(exec);

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
      timeout: 120000, // 120 seconds (2 minutes)
      maxRetries: 3, // Retry up to 3 times on network errors
    });
    
    console.log('🔧 OpenAI client initialized with 120s timeout and 3 retries');
  }
  return openai;
}

/**
 * Generate mock transcription for testing without OpenAI API
 * @param {string} audioPath - Path to audio file (for duration calculation)
 * @returns {Object} Mock transcription result
 */
function generateMockTranscription(audioPath) {
  console.log('🧪 Generating mock Japanese transcription for testing...');
  
  // Sample N5 Japanese conversation
  const mockSegments = [
    { start: 0, end: 3.5, text: 'こんにちは。元気ですか。' },
    { start: 3.5, end: 6.0, text: 'はい、元気です。ありがとうございます。' },
    { start: 6.0, end: 9.5, text: '今日はいい天気ですね。' },
    { start: 9.5, end: 12.0, text: 'そうですね。とてもいいです。' },
    { start: 12.0, end: 15.5, text: '週末は何をしますか。' },
    { start: 15.5, end: 19.0, text: '友達と公園に行きます。' },
    { start: 19.0, end: 22.5, text: 'それはいいですね。楽しんでください。' },
    { start: 22.5, end: 25.0, text: 'ありがとうございます。さようなら。' },
  ];
  
  const fullText = mockSegments.map(s => s.text).join(' ');
  const duration = mockSegments[mockSegments.length - 1].end;
  
  return {
    text: fullText,
    language: 'ja',
    duration: duration,
    segments: mockSegments,
    cost: 0, // No cost for mock data
  };
}

/**
 * Compress audio file to meet Whisper API 25MB limit
 * @param {string} inputPath - Path to input audio file
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<string>} Path to compressed audio file
 */
async function compressAudio(inputPath, onProgress = null) {
  const outputPath = inputPath.replace('.wav', '_compressed.mp3');
  
  console.log('🗜️ Compressing audio file to meet 25MB limit...');
  
  const originalStats = fs.statSync(inputPath);
  const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(1);
  const estimatedSizeMB = (originalSizeMB * 0.15).toFixed(1); // Rough estimate for 64kbps
  
  if (onProgress) {
    onProgress({
      stage: 'compressing',
      progress: 0,
      message: `Compressing audio (${originalSizeMB}MB → ~${estimatedSizeMB}MB)...`,
    });
  }
  
  try {
    // Compress to MP3 with lower bitrate (64kbps is fine for speech recognition)
    // Mono channel, 16kHz sample rate - optimized for Whisper
    await execPromise(
      `ffmpeg -i "${inputPath}" -acodec libmp3lame -b:a 64k -ar 16000 -ac 1 "${outputPath}" -y`
    );
    
    const compressedStats = fs.statSync(outputPath);
    const compressedSizeMB = compressedStats.size / (1024 * 1024);
    console.log(`✅ Audio compressed: ${compressedSizeMB.toFixed(2)} MB`);
    
    if (onProgress) {
      onProgress({
        stage: 'compressed',
        progress: 100,
        message: `Audio compressed (${compressedSizeMB.toFixed(1)}MB)`,
      });
    }
    
    return outputPath;
  } catch (error) {
    console.error('❌ Compression error:', error.message);
    throw new Error(`Failed to compress audio: ${error.message}`);
  }
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {string} audioPath - Path to audio file
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Transcription result with text and segments
 */
export async function transcribeAudio(audioPath, onProgress = null) {
  let compressedPath = null;
  
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

    let fileToTranscribe = audioPath;
    
            // If file is > 25MB, compress it
            if (fileSizeMB > 25) {
              console.log('⚠️ File exceeds 25MB limit, compressing...');
              compressedPath = await compressAudio(audioPath, onProgress);
              fileToTranscribe = compressedPath;
            }
            
            // Report transcription start
            if (onProgress) {
              onProgress({
                stage: 'transcribing',
                progress: 50,
                message: 'Transcribing Japanese audio...',
              });
            }

    // Create read stream for the audio file
    const audioStream = fs.createReadStream(fileToTranscribe);

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
            
            // Report completion
            if (onProgress) {
              onProgress({
                stage: 'complete',
                progress: 100,
                message: 'Transcription complete',
              });
            }

            return {
              text: transcription.text,
              language: transcription.language,
              duration: transcription.duration,
              segments: transcription.segments || [],
              cost: estimatedCost,
            };

  } catch (error) {
    console.error('❌ Transcription error:', error.message);

    // Check for connection/network errors
    if (error.message.includes('Connection error') || 
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT') {
      // If TEST_MODE is enabled, use mock transcription
      if (process.env.TEST_MODE === 'true') {
        console.log('⚠️ TEST_MODE enabled - using mock transcription due to connection error');
        return generateMockTranscription(audioPath);
      }
      throw new Error('Cannot connect to OpenAI API. This could be due to network issues on the server. Please try again in a few moments, or enable TEST_MODE for offline testing.');
    }

    // Check for API key issues
    if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
      // If TEST_MODE is enabled, return mock transcription instead of failing
      if (process.env.TEST_MODE === 'true') {
        console.log('⚠️ TEST_MODE enabled - using mock transcription');
        return generateMockTranscription(audioPath);
      }
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
  } finally {
    // Clean up compressed file if it was created
    if (compressedPath && fs.existsSync(compressedPath)) {
      try {
        fs.unlinkSync(compressedPath);
        console.log('🗑️ Cleaned up compressed audio file');
      } catch (err) {
        console.error('⚠️ Failed to clean up compressed file:', err.message);
      }
    }
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

