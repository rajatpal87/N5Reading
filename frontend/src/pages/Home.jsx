import { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import YouTubeUpload from '../components/YouTubeUpload';
import VideoList from '../components/VideoList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'youtube'

  const handleUploadSuccess = (video) => {
    console.log('Video uploaded successfully:', video);
    // Trigger video list refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎌 N5 Reading - JLPT Video Coach
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Learn Japanese with authentic video content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Phase 3: Transcription
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Add a Video
            </h2>
            
            {/* Upload Method Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUploadMethod('file')}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${uploadMethod === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                📁 Upload File
              </button>
              <button
                onClick={() => setUploadMethod('youtube')}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${uploadMethod === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                📺 YouTube URL
              </button>
            </div>

            {/* Upload Components */}
            {uploadMethod === 'file' ? (
              <VideoUpload onUploadSuccess={handleUploadSuccess} />
            ) : (
              <YouTubeUpload onUploadSuccess={handleUploadSuccess} />
            )}
          </div>
        </section>

        {/* Video List Section */}
        <section>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <VideoList refreshTrigger={refreshKey} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            JLPT N5 Video Coach • Phase 1 (MVP Development)
          </p>
        </div>
      </footer>
    </div>
  );
}

