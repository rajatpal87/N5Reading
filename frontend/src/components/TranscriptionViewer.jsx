import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function TranscriptionViewer({ videoId, isOpen, onClose }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && videoId) {
      fetchTranscription();
    }
  }, [isOpen, videoId]);

  const fetchTranscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/videos/${videoId}/transcription`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching transcription:', err);
      setError(err.response?.data?.error || 'Failed to load transcription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-green-50">
          <h2 className="text-xl font-bold text-gray-800">📝 Transcription & Translation</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading transcription...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="font-semibold mb-2">Error Loading Transcription</div>
              <div className="text-sm text-gray-600">{error}</div>
              <button 
                onClick={fetchTranscription}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Japanese Side */}
            <div className="w-1/2 border-r flex flex-col">
              <div className="p-3 bg-blue-50 border-b font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-xl">🇯🇵</span>
                <span>Japanese</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {data?.segments?.length || 0} segments
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {data?.segments?.map((segment, idx) => (
                  <div key={idx} className="border-l-2 border-blue-300 pl-3 hover:bg-blue-50 transition-colors rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {formatTime(segment.start)}
                      </span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {formatTime(segment.end)}
                      </span>
                    </div>
                    <p className="text-gray-900 text-base leading-relaxed">{segment.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* English Side */}
            <div className="w-1/2 flex flex-col">
              <div className="p-3 bg-green-50 border-b font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-xl">🇺🇸</span>
                <span>English Translation</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {data?.segments?.map((segment, idx) => (
                  <div key={idx} className="border-l-2 border-green-300 pl-3 hover:bg-green-50 transition-colors rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {formatTime(segment.start)}
                      </span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {formatTime(segment.end)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {segment.translated_text || segment.translation || 'No translation available'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        {!loading && !error && data && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>📊 Total Segments: <strong>{data.segments?.length || 0}</strong></span>
                <span>🎤 Language: <strong>Japanese → English</strong></span>
              </div>
              <button
                onClick={() => {
                  navigate(`/video/${videoId}`);
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>🎥</span>
                <span>Watch with Analysis</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

