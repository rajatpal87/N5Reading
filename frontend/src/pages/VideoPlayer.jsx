import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VocabularyListCard from '../components/dashboard/VocabularyListCard';
import VocabularyDetailPanel from '../components/dashboard/VocabularyDetailPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const secondFoldRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDownCTA, setShowDownCTA] = useState(true);
  const [showUpCTA, setShowUpCTA] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  
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

  // Floating CTA visibility logic based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const viewportH = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const secondFoldTop = secondFoldRef.current?.offsetTop ?? viewportH;

      // Show "View Vocabulary" when we're above the second fold
      setShowDownCTA(scrollY < secondFoldTop - 100);
      // Show "Back to Video" when we've reached/passed the second fold
      setShowUpCTA(scrollY >= secondFoldTop - 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSecondFold = () => {
    const top = secondFoldRef.current?.offsetTop ?? window.innerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const scrollToFirstFold = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              </div>
            </div>
            <button
              onClick={() => navigate(`/dashboard/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* First Fold: Video + Summary + Transcription */}
        <div className="min-h-screen relative flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4">
          {/* Left Column: Video Player + N5 Summary */}
          <div className="lg:w-1/2 flex flex-col gap-4" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden flex-shrink-0" style={{ height: '45%' }}>
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
                style={{ objectFit: 'contain' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* N5 Analysis Section */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
              {analyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing N5 content...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      🎯 N5 Content Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{analysis.stats.n5_word_unique}</div>
                        <div className="text-xs text-gray-600 mt-1">Words</div>
                      </div>
                      {/* Grammar - Temporarily Hidden for Enhanced Vocabulary Focus */}
                      {/* <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{analysis.stats.n5_grammar_unique}</div>
                        <div className="text-xs text-gray-600 mt-1">Grammar</div>
                      </div> */}
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{analysis.stats.study_time_estimate}</div>
                        <div className="text-xs text-gray-600 mt-1">Minutes</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Segment */}
                  {currentSegment && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-blue-900">📖 Now Playing</h3>
                        <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{currentSegment.text}</p>
                      <p className="text-gray-700 text-sm">{currentSegment.translated_text}</p>
                    </div>
                  )}
                </div>
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

          {/* Right Column: Transcription (Scrollable) */}
          <div className="lg:w-1/2 flex flex-col bg-white rounded-lg shadow-sm" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📝 Transcription
                <span className="text-sm text-gray-500 font-normal">
                  ({transcription.segments.length} segments)
                </span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {transcription.segments.map((segment, idx) => {
                  const isActive = idx === currentSegmentIndex;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      onClick={() => jumpToTime(segment.start)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 font-mono flex-shrink-0 mt-1 bg-white px-2 py-1 rounded">
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

        </div>

        )}

        {/* Second Fold: Vocabulary Master-Detail View */}
        {analysis && analysis.vocabulary?.words?.length > 0 && (
          <div ref={secondFoldRef} className="min-h-screen relative bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 pt-16">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                  {/* Left Side: Vocabulary List */}
                  <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4 space-y-2">
                    <div className="mb-4 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        🟡 N5 Vocabulary
                        <span className="text-sm font-normal text-gray-500">({analysis.vocabulary.unique_count})</span>
                      </h3>
                    </div>
                    {analysis.vocabulary.words.map((word, idx) => (
                      <VocabularyListCard
                        key={idx}
                        word={word}
                        isSelected={selectedWord?.kanji === word.kanji && selectedWord?.hiragana === word.hiragana}
                        onClick={() => setSelectedWord(word)}
                      />
                    ))}
                  </div>

                  {/* Right Side: Detail Panel */}
                  <div className="flex-1 overflow-y-auto">
                    <VocabularyDetailPanel
                      word={selectedWord}
                      onTimestampClick={jumpToTime}
                      onClose={() => setSelectedWord(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating bottom-right CTA (hover-expand, switches based on scroll position) */}
      {analysis && analysis.vocabulary?.words?.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          {showDownCTA && (
            <button
              onClick={scrollToSecondFold}
              className="group bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 pr-4 pl-3 py-3"
              title="View Vocabulary"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all whitespace-nowrap">View Vocabulary</span>
            </button>
          )}
          {showUpCTA && (
            <button
              onClick={scrollToFirstFold}
              className="group bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-all flex items-center gap-2 pr-4 pl-3 py-3"
              title="Back to Video"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all whitespace-nowrap">Back to Video</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

