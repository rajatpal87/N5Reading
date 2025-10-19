import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function YouTubeUpload({ onUploadSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  // Handle YouTube download
  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Invalid YouTube URL. Please enter a valid youtube.com or youtu.be link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/videos/youtube`, { url });

      console.log('YouTube download successful:', response.data);

      // Reset state
      setUrl('');
      setLoading(false);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.video);
      }

    } catch (err) {
      console.error('YouTube download error:', err);
      setError(err.response?.data?.error || 'Failed to download YouTube video. Please try again.');
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleDownload();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* YouTube Input Area */}
      <div className="border-2 border-gray-300 rounded-lg p-8">
        <div className="space-y-4">
          {/* YouTube Icon */}
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">
              Download from YouTube
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Enter a YouTube video URL to download and analyze
            </p>
          </div>

          {/* URL Input */}
          <div className="mt-6">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://www.youtube.com/watch?v=..."
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                text-sm
              "
              disabled={loading}
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="
              w-full bg-red-600 hover:bg-red-700 text-white font-medium
              py-3 px-6 rounded-lg transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading Info */}
      {loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">
            📥 Downloading video from YouTube... This may take a moment depending on the video size.
          </p>
        </div>
      )}
    </div>
  );
}

