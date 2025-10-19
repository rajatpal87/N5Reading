import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // Fetch video data
  useEffect(() => {
    fetchVideoData();
  }, [id]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      
      // Get video info
      const videoRes = await axios.get(`${API_URL}/videos`);
      const videoData = videoRes.data.videos.find(v => v.id === parseInt(id));
      
      if (!videoData) {
        setError('Video not found');
        return;
      }
      
      setVideo(videoData);

      // Get transcription
      const transcriptionRes = await axios.get(`${API_URL}/videos/${id}/transcription`);
      setTranscription(transcriptionRes.data);

      // Try to get analysis (might not exist yet)
      try {
        const analysisRes = await axios.get(`${API_URL}/videos/${id}/analysis`);
        setAnalysis(analysisRes.data);
      } catch (err) {
        console.log('No analysis yet, will trigger analysis');
        // No analysis yet - trigger it
        triggerAnalysis();
      }

    } catch (err) {
      console.error('Error loading video data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      console.log('📊 Triggering N5 analysis...');
      
      const response = await axios.post(`${API_URL}/videos/${id}/analyze`);
      setAnalysis(response.data.analysis);
      
      console.log('✅ Analysis complete');
    } catch (err) {
      console.error('Error analyzing video:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Update current segment based on playback time
  useEffect(() => {
    if (!transcription?.segments) return;

    const currentSegment = transcription.segments.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );

    if (currentSegment !== -1 && currentSegment !== currentSegmentIndex) {
      setCurrentSegmentIndex(currentSegment);
    }
  }, [currentTime, transcription]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log('Video loaded, duration:', videoRef.current.duration);
      setDuration(videoRef.current.duration);
    }
  };

  // Jump to specific time
  const jumpToTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!video || !transcription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Video data not available</p>
      </div>
    );
  }

  const currentSegment = transcription.segments[currentSegmentIndex];
  // Construct proper video URL - browser will handle special characters
  const videoUrl = `${API_URL.replace('/api', '')}/uploads/${video.filename}`;

  // Debug log
  console.log('Video URL:', videoUrl);
  console.log('Video object:', video);
  console.log('Testing video fetch...');
  
  // Test if video is accessible
  fetch(videoUrl, { method: 'HEAD' })
    .then(res => console.log('Video accessible:', res.ok, res.status))
    .catch(err => console.error('Video fetch failed:', err));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{video.original_name}</h1>
                <p className="text-sm text-gray-500">JLPT N5 Video Analysis</p>
                <p className="text-xs text-gray-400 font-mono">Debug: {videoUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left Pane: Video Player + Transcription */}
        <div className="lg:w-2/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Video Player */}
          <div className="relative bg-black aspect-video flex-shrink-0">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={(e) => {
                console.error('Video error:', e);
                alert(`Video playback error: ${e.target.error?.message || 'Unknown error'}`);
              }}
              style={{ maxHeight: '100%', objectFit: 'contain' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Transcription Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📝 Transcription
              <span className="text-sm text-gray-500 font-normal">
                ({formatTime(currentTime)} / {formatTime(duration)})
              </span>
            </h2>

            <div className="space-y-3">
              {transcription.segments.map((segment, idx) => {
                const isActive = idx === currentSegmentIndex;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => jumpToTime(segment.start)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 font-mono flex-shrink-0 mt-1">
                        {formatTime(segment.start)}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{segment.text}</p>
                        <p className="text-gray-600 text-sm mt-1">{segment.translated_text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Analysis */}
        <div className="lg:w-1/3 bg-gray-50 flex flex-col overflow-y-auto">
          <div className="p-6">
            {analyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing N5 content...</p>
              </div>
            ) : analysis ? (
              <>
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🎯 N5 Content Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unique N5 Words:</span>
                      <span className="font-semibold text-gray-900">{analysis.stats.n5_word_unique}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grammar Patterns:</span>
                      <span className="font-semibold text-gray-900">{analysis.stats.n5_grammar_unique}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Study Time:</span>
                      <span className="font-semibold text-gray-900">{analysis.stats.study_time_estimate} min</span>
                    </div>
                  </div>
                </div>

                {/* Current Segment */}
                {currentSegment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">📖 Current Segment</h3>
                    <p className="text-gray-900 font-medium mb-2">{currentSegment.text}</p>
                    <p className="text-gray-700 text-sm">{currentSegment.translated_text}</p>
                  </div>
                )}

                {/* Vocabulary List */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🟡 N5 Vocabulary ({analysis.vocabulary.unique_count})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analysis.vocabulary.words.map((word, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-lg font-semibold text-gray-900">{word.kanji || word.hiragana}</span>
                            {word.kanji && (
                              <span className="text-sm text-gray-500 ml-2">({word.hiragana})</span>
                            )}
                            <p className="text-sm text-gray-600">{word.english}</p>
                            {word.chapter && (
                              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1">
                                {word.chapter}
                              </span>
                            )}
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ×{word.occurrences.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grammar Patterns */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    📝 Grammar Patterns ({analysis.grammar.unique_count})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analysis.grammar.patterns.map((pattern, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                        <h4 className="font-semibold text-gray-900">{pattern.pattern_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{pattern.pattern_structure}</p>
                        {pattern.english_explanation && (
                          <p className="text-xs text-gray-500 mt-1">{pattern.english_explanation}</p>
                        )}
                        {pattern.chapter && (
                          <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1">
                            {pattern.chapter}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No analysis available</p>
                <button
                  onClick={triggerAnalysis}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Analyze Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

