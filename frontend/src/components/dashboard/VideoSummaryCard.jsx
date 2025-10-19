export default function VideoSummaryCard({ video, analysis, onExport }) {
  const stats = analysis.stats || analysis.summary;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{video.original_name}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span>⏱️ Duration: {formatDuration(video.duration)}</span>
              <span className="h-1 w-1 bg-white rounded-full"></span>
              <span>✅ Status: Analyzed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 N5 Content Analysis</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-700">{stats.n5_word_unique || 0}</div>
            <div className="text-sm text-yellow-600 mt-1">Unique N5 Words</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{stats.n5_grammar_unique || 0}</div>
            <div className="text-sm text-green-600 mt-1">Grammar Patterns</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.study_time_estimate || 0} min</div>
            <div className="text-sm text-blue-600 mt-1">Study Time</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.n5_density || 0}%</div>
            <div className="text-sm text-purple-600 mt-1">N5 Density</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onExport('vocabulary', 'csv')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Export Vocabulary (CSV)</span>
          </button>
          
          <button
            onClick={() => onExport('vocabulary', 'anki')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🃏</span>
            <span>Export for Anki</span>
          </button>
          
          <button
            onClick={() => onExport('grammar', 'csv')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>📝</span>
            <span>Export Grammar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

