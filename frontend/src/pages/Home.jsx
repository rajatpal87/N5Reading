import { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

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
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Phase 1: Upload
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
              Upload a Video
            </h2>
            <VideoUpload onUploadSuccess={handleUploadSuccess} />
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

