import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TranscriptionViewer from './TranscriptionViewer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoList({ refreshTrigger }) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null); // Track which video's audio is playing
  const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

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

  // Process video (extract audio) with error recovery
  const handleProcess = async (id) => {
    try {
      // Update local state optimistically
      setVideos(videos.map(v => 
        v.id === id ? { ...v, status: 'processing', error_message: null } : v
      ));
      
      await axios.post(`${API_URL}/videos/${id}/process`);
      
      // Refresh video list after processing
      await fetchVideos();
      
    } catch (err) {
      console.error('Error processing video:', err);
      
      // ERROR RECOVERY: Set status back to 'error' so retry button appears
      setVideos(videos.map(v => 
        v.id === id ? { 
          ...v, 
          status: 'error',
          error_message: err.response?.data?.error || 'Audio extraction failed'
        } : v
      ));
      
      alert(err.response?.data?.error || 'Failed to extract audio. Click Retry to try again.');
      
      // Refresh to get server state
      await fetchVideos();
    }
  };

  // Transcribe and translate video with error recovery
  const handleTranscribe = async (id) => {
    try {
      console.log('Starting transcription for video:', id);
      
      // Update local state optimistically
      setVideos(videos.map(v => 
        v.id === id ? { ...v, status: 'transcribing', error_message: null } : v
      ));
      
      await axios.post(`${API_URL}/videos/${id}/transcribe`);
      
      // Refresh video list after transcription
      await fetchVideos();
      
    } catch (err) {
      console.error('Error transcribing video:', err);
      
      // ERROR RECOVERY: Set status back to 'error' so retry button appears
      setVideos(videos.map(v => 
        v.id === id ? { 
          ...v, 
          status: 'error',
          error_message: err.response?.data?.details || err.response?.data?.error || 'Transcription failed'
        } : v
      ));
      
      alert(err.response?.data?.error || err.response?.data?.details || 'Failed to transcribe video. Click Retry to try again.');
      
      // Refresh to get server state
      await fetchVideos();
    }
  };

  // Open transcription viewer
  const handleViewTranscription = (id) => {
    setSelectedVideoId(id);
    setTranscriptionModalOpen(true);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'extracting_audio':
      case 'compressing_audio':
        return 'bg-yellow-100 text-yellow-800 animate-pulse';
      case 'audio_extracted':
        return 'bg-purple-100 text-purple-800';
      case 'transcribing':
        return 'bg-orange-100 text-orange-800 animate-pulse';
      case 'translating':
        return 'bg-indigo-100 text-indigo-800 animate-pulse';
      case 'completed':
        return 'bg-green-100 text-green-800';
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
      case 'extracting_audio': return '🎵 Extracting Audio...';
      case 'compressing_audio': return '🗜️ Compressing...';
      case 'audio_extracted': return '🎵 Audio Extracted';
      case 'transcribing': return '📝 Transcribing...';
      case 'translating': return '🌏 Translating...';
      case 'completed': return '✅ Ready';
      case 'error': return '❌ Error';
      default: return status;
    }
  };

  // Format time remaining (seconds to human-readable)
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Check if video is in active processing state
  const isProcessing = (status) => {
    return ['processing', 'extracting_audio', 'compressing_audio', 'transcribing', 'translating'].includes(status);
  };

  // Toggle audio playback
  const toggleAudioPlayback = (videoId) => {
    setPlayingAudio(playingAudio === videoId ? null : videoId);
  };

  // Determine primary action button based on video state
  const getPrimaryAction = (video) => {
    if (video.status === 'uploaded') {
      return {
        label: '🎵 Extract Audio',
        handler: () => handleProcess(video.id),
        color: 'bg-purple-600 hover:bg-purple-700',
        disabled: false
      };
    }

    if (video.status === 'audio_extracted') {
      return {
        label: '📝 Transcribe & Translate',
        handler: () => handleTranscribe(video.id),
        color: 'bg-blue-600 hover:bg-blue-700',
        disabled: false
      };
    }

    if (isProcessing(video.status)) {
      return {
        label: '⏳ Processing...',
        handler: null,
        color: 'bg-gray-400',
        disabled: true
      };
    }

    if (video.status === 'completed') {
      return {
        label: '📄 View Transcription',
        handler: () => handleViewTranscription(video.id),
        color: 'bg-green-600 hover:bg-green-700',
        disabled: false
      };
    }

    if (video.status === 'error') {
      // ERROR RECOVERY: Show appropriate retry button
      if (video.audio_path) {
        // Had audio, transcription failed
        return {
          label: '🔄 Retry Transcribe',
          handler: () => handleTranscribe(video.id),
          color: 'bg-orange-600 hover:bg-orange-700',
          disabled: false
        };
      } else {
        // No audio, extraction failed
        return {
          label: '🔄 Retry Extract',
          handler: () => handleProcess(video.id),
          color: 'bg-orange-600 hover:bg-orange-700',
          disabled: false
        };
      }
    }

    return null;
  };

  // Check if Play Audio button should be visible
  const showPlayAudio = (video) => {
    return video.audio_path !== null && video.audio_path !== undefined;
  };

  // Get properly encoded audio URL
  const getAudioUrl = (audioPath) => {
    if (!audioPath) return '';
    // Split path and encode only the filename part
    const parts = audioPath.split('/');
    const filename = parts[parts.length - 1];
    const encodedFilename = encodeURIComponent(filename);
    const basePath = parts.slice(0, -1).join('/');
    return `${API_URL.replace('/api', '')}${basePath}/${encodedFilename}`;
  };

  // Auto-refresh when videos are processing
  useEffect(() => {
    const hasProcessingVideos = videos.some(v => 
      ['processing', 'extracting_audio', 'compressing_audio', 'transcribing', 'translating'].includes(v.status)
    );
    
    if (hasProcessingVideos) {
      console.log('📊 Auto-polling enabled - videos are processing');
      // Poll every 2 seconds when processing
      const interval = setInterval(() => {
        fetchVideos();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [videos]);

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
    <>
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
          {videos.map((video) => {
            const primaryAction = getPrimaryAction(video);
            
            return (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
              >
                {/* Video Thumbnail Placeholder */}
                <div className="bg-gray-800 aspect-video flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {/* Video Info - Flex grow to fill space */}
                <div className="p-4 flex flex-col flex-grow">
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

                  {/* Progress Bar (for processing states) */}
                  {isProcessing(video.status) && (
                    <div className="mt-3">
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${video.progress || 0}%` }}
                        />
                      </div>

                      {/* Status Message & Progress */}
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span className="flex-1 truncate" title={video.status_message}>
                          {video.status_message || 'Processing...'}
                        </span>
                        <span className="font-medium ml-2">{video.progress || 0}%</span>
                      </div>

                      {/* Time Remaining */}
                      {video.estimated_time_remaining && video.estimated_time_remaining > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ⏱️ ~{formatTimeRemaining(video.estimated_time_remaining)} remaining
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {video.status === 'error' && video.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      ⚠️ {video.error_message}
                    </div>
                  )}

                  {/* Spacer to push actions to bottom */}
                  <div className="flex-grow"></div>

                  {/* Actions - Two-row layout */}
                  <div className="mt-4 space-y-2">
                    {/* Primary Action Row */}
                    <div className="flex gap-2">
                      {/* Dashboard button for completed videos */}
                      {video.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/dashboard/${video.id}`)}
                          className="flex-1 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
                        >
                          📊 Dashboard
                        </button>
                      )}
                      
                      {primaryAction && (
                        <button
                          onClick={primaryAction.handler}
                          disabled={primaryAction.disabled}
                          className={`flex-1 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200 ${primaryAction.color} ${primaryAction.disabled ? 'cursor-not-allowed' : ''}`}
                        >
                          {primaryAction.label}
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

                    {/* Secondary Action Row - Play Audio (always visible if audio exists) */}
                    {showPlayAudio(video) && (
                      <div className="w-full">
                        {playingAudio === video.id ? (
                          <div className="bg-gray-50 border border-gray-200 rounded p-2">
                            <audio
                              controls
                              autoPlay
                              className="w-full"
                              style={{ height: '32px' }}
                              onEnded={() => setPlayingAudio(null)}
                              src={getAudioUrl(video.audio_path)}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleAudioPlayback(video.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                          >
                            🔊 Play Audio
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transcription Viewer Modal */}
      <TranscriptionViewer
        videoId={selectedVideoId}
        isOpen={transcriptionModalOpen}
        onClose={() => {
          setTranscriptionModalOpen(false);
          setSelectedVideoId(null);
        }}
      />
    </>
  );
}
