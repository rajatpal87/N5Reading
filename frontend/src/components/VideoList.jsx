import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoList({ refreshTrigger }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/videos`);
      setVideos(response.data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/videos/${id}`);
      // Remove from local state
      setVideos(videos.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video. Please try again.');
    }
  };

  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process video (extract audio)
  const handleProcess = async (id) => {
    try {
      // Update local state optimistically
      setVideos(videos.map(v => v.id === id ? { ...v, status: 'processing' } : v));
      
      await axios.post(`${API_URL}/videos/${id}/process`);
      
      // Refresh video list after processing
      await fetchVideos();
      
    } catch (err) {
      console.error('Error processing video:', err);
      alert(err.response?.data?.error || 'Failed to process video. Please try again.');
      // Refresh to get actual status
      await fetchVideos();
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 animate-pulse';
      case 'audio_extracted':
        return 'bg-purple-100 text-purple-800';
      case 'transcribing':
        return 'bg-orange-100 text-orange-800 animate-pulse';
      case 'translating':
        return 'bg-indigo-100 text-indigo-800 animate-pulse';
      case 'analyzing':
        return 'bg-cyan-100 text-cyan-800 animate-pulse';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded': return '✅ Uploaded';
      case 'processing': return '⏳ Processing...';
      case 'audio_extracted': return '🎵 Audio Extracted';
      case 'transcribing': return '📝 Transcribing...';
      case 'translating': return '🌏 Translating...';
      case 'analyzing': return '🔍 Analyzing...';
      case 'completed': return '✨ Complete';
      case 'error': return '❌ Error';
      default: return status;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchVideos}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-600 text-lg">No videos uploaded yet</p>
        <p className="text-gray-500 text-sm mt-2">Upload your first video to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Your Videos ({videos.length})
        </h2>
        <button
          onClick={fetchVideos}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Video Thumbnail Placeholder */}
            <div className="bg-gray-800 aspect-video flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate" title={video.original_name}>
                {video.original_name}
              </h3>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{formatDuration(video.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{formatFileSize(video.file_size)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium text-xs">{formatDate(video.created_at)}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(video.status)}`}>
                  {getStatusText(video.status)}
                </span>
              </div>

              {/* YouTube Badge */}
              {video.youtube_url && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-red-50 text-red-700 rounded flex items-center gap-1 w-fit">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </span>
                </div>
              )}

              {/* Error Message */}
              {video.status === 'error' && video.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {video.error_message}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {video.status === 'uploaded' && (
                  <button
                    onClick={() => handleProcess(video.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    🎵 Extract Audio
                  </button>
                )}
                {video.status === 'completed' && (
                  <button
                    onClick={() => {/* TODO: Navigate to video analysis page */}}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    View Analysis
                  </button>
                )}
                {(video.status === 'processing' || video.status === 'transcribing' || video.status === 'translating' || video.status === 'analyzing') && (
                  <button
                    disabled
                    className="flex-1 bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded cursor-not-allowed"
                  >
                    Processing...
                  </button>
                )}
                <button
                  onClick={() => handleDelete(video.id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                  title="Delete video"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

