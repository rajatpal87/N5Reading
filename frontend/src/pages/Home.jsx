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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
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

      {/* Main Content - Side by Side Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Upload Section (Fixed on Desktop, Stacked on Mobile) */}
        <aside className="lg:w-1/3 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📤 Add a Video
            </h2>
            
            {/* Upload Method Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUploadMethod('file')}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${uploadMethod === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                📁 File
              </button>
              <button
                onClick={() => setUploadMethod('youtube')}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${uploadMethod === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                📺 YouTube
              </button>
            </div>

            {/* Upload Components */}
            {uploadMethod === 'file' ? (
              <VideoUpload onUploadSuccess={handleUploadSuccess} />
            ) : (
              <YouTubeUpload onUploadSuccess={handleUploadSuccess} />
            )}

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xs font-semibold text-blue-900 mb-1.5">💡 Quick Tips</h3>
              <ul className="text-xs text-blue-800 space-y-0.5">
                <li>• Max 100MB (MP4, AVI, MOV)</li>
                <li>• YouTube: Any public video</li>
                <li>• Processing: 1-3 min/video</li>
                <li>• Best with clear audio</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Pane - Video List (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <VideoList refreshTrigger={refreshKey} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-gray-600">
            JLPT N5 Video Coach • MVP Development • Phase 3 Complete ✅
          </p>
        </div>
      </footer>
    </div>
  );
}
