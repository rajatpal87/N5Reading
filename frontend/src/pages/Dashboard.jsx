import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoSummaryCard from '../components/dashboard/VideoSummaryCard';
import VocabularyTable from '../components/dashboard/VocabularyTable';
import GrammarPatternsList from '../components/dashboard/GrammarPatternsList';
import N5Timeline from '../components/dashboard/N5Timeline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoFloating, setIsVideoFloating] = useState(false);
  
  const mainVideoContainerRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  // Detect scroll to float video player
  useEffect(() => {
    const handleScroll = () => {
      if (mainVideoContainerRef.current) {
        const rect = mainVideoContainerRef.current.getBoundingClientRect();
        // Float video when main player scrolls out of view (top < 0)
        setIsVideoFloating(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch video details
      const videoRes = await axios.get(`${API_URL}/videos/${id}`);
      setVideo(videoRes.data.video);

      // Fetch analysis data (trigger if not exists)
      let analysisRes;
      try {
        analysisRes = await axios.get(`${API_URL}/videos/${id}/analysis`);
      } catch (analysisErr) {
        if (analysisErr.response?.status === 404 || analysisErr.response?.status === 500) {
          console.log('Analysis not found, triggering new analysis...');
          await axios.post(`${API_URL}/videos/${id}/analyze`);
          analysisRes = await axios.get(`${API_URL}/videos/${id}/analysis`);
        } else {
          throw analysisErr;
        }
      }
      console.log('✅ Analysis data:', analysisRes.data);
      setAnalysis(analysisRes.data);

      // Fetch timeline data
      const timelineRes = await axios.get(`${API_URL}/videos/${id}/timeline`);
      console.log('✅ Timeline data:', timelineRes.data);
      setTimeline(timelineRes.data);

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format = 'csv') => {
    try {
      const url = `${API_URL}/videos/${id}/export/${type}${format === 'anki' ? '?format=anki' : ''}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  // Jump to specific time in video
  const jumpToTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      // Scroll video player into view
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle time update from video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600 p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="font-semibold text-xl mb-2">Error Loading Dashboard</div>
          <div className="text-sm text-gray-700">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!video || !analysis || !timeline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Dashboard data not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Videos
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Learning Dashboard</h1>
                <p className="text-sm text-gray-500">{video.original_name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/video/${id}`)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>🎥</span>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Horizontal Layout */}
      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Row: Video + Timeline Side by Side */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Left Side: Video Player + Stats */}
          <div className="lg:w-[60%] flex flex-col space-y-3">
            {/* Video Player */}
            <div ref={mainVideoContainerRef} className="bg-white rounded-lg shadow-md flex flex-col" style={{ maxHeight: '400px' }}>
              <div className="flex-1 relative bg-black" style={{ minHeight: 0, maxHeight: '350px' }}>
                <video
                  ref={videoRef}
                  src={`${API_URL.replace('/api', '')}/uploads/${video.filename}`}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  style={{ objectFit: 'contain' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">🎥 {video.original_name}</span>
                  <button
                    onClick={() => navigate(`/video/${id}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-2 flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Full</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                📊 N5 Content Analysis
                <span className="text-xs font-normal text-gray-500">• Learning Metrics</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">📚</span>
                    <div className="text-xl font-bold text-yellow-800">{analysis?.stats?.n5_word_unique || analysis?.summary?.n5_word_unique || analysis?.vocabulary?.unique_count || 0}</div>
                  </div>
                  <div className="text-xs font-semibold text-yellow-700">N5 Vocabulary</div>
                  <div className="text-xs text-yellow-600">Unique words</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">📝</span>
                    <div className="text-xl font-bold text-green-800">{analysis?.stats?.n5_grammar_unique || analysis?.summary?.n5_grammar_unique || analysis?.grammar?.unique_count || 0}</div>
                  </div>
                  <div className="text-xs font-semibold text-green-700">Grammar Patterns</div>
                  <div className="text-xs text-green-600">N5 structures</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">⏱️</span>
                    <div className="text-xl font-bold text-blue-800">{analysis?.stats?.study_time_estimate || analysis?.summary?.study_time_estimate || 0}m</div>
                  </div>
                  <div className="text-xs font-semibold text-blue-700">Study Time</div>
                  <div className="text-xs text-blue-600">Est. duration</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">🎯</span>
                    <div className="text-xl font-bold text-purple-800">{analysis?.stats?.n5_density || analysis?.summary?.n5_density || 0}%</div>
                  </div>
                  <div className="text-xs font-semibold text-purple-700">N5 Density</div>
                  <div className="text-xs text-purple-600">Difficulty</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-1.5">📤 Export</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('vocabulary', 'csv')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors shadow-sm hover:shadow flex items-center justify-center gap-1"
                    title="Download vocabulary as CSV spreadsheet"
                  >
                    <span>📥</span>
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('vocabulary', 'anki')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors shadow-sm hover:shadow flex items-center justify-center gap-1"
                    title="Download for Anki flashcard app"
                  >
                    <span>🃏</span>
                    <span>Anki</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Timeline + Best Segments */}
          <div className="lg:w-[40%] flex flex-col" style={{ maxHeight: '700px' }}>
            {/* Timeline */}
            <N5Timeline
              timeline={timeline}
              onSegmentClick={jumpToTime}
              currentTime={currentTime}
            />
          </div>
        </div>

        {/* Bottom Section: Vocabulary & Grammar Side-by-Side */}
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: '600px' }}>
          {/* Vocabulary Table */}
          <div className="lg:w-1/2 h-full">
            <VocabularyTable
              vocabulary={analysis.vocabulary}
              onTimestampClick={jumpToTime}
            />
          </div>

          {/* Grammar Patterns List */}
          <div className="lg:w-1/2 h-full">
            <GrammarPatternsList
              grammar={analysis.grammar}
              onTimestampClick={jumpToTime}
            />
          </div>
        </div>
      </main>

      {/* Floating Video Player (Picture-in-Picture) */}
      {isVideoFloating && video && (
        <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl rounded-lg overflow-hidden border-4 border-blue-500 bg-black">
          <div className="relative">
            <video
              src={`${API_URL.replace('/api', '')}/uploads/${video.filename}`}
              controls
              controlsList="nodownload"
              className="w-full"
              style={{ maxHeight: '240px', objectFit: 'contain' }}
              onTimeUpdate={(e) => {
                if (videoRef.current) {
                  // Keep main video in sync
                  if (Math.abs(videoRef.current.currentTime - e.target.currentTime) > 0.5) {
                    videoRef.current.currentTime = e.target.currentTime;
                  }
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
              title="Scroll to main player"
            >
              ✕
            </button>
          </div>
          <div className="bg-gray-900 px-3 py-2">
            <p className="text-white text-xs truncate">{video.original_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

