import { useState, useMemo } from 'react';

export default function VocabularyTable({ vocabulary, onTimestampClick }) {
  const [sortBy, setSortBy] = useState('frequency'); // 'frequency', 'alphabetical', 'chapter'
  const [filterChapter, setFilterChapter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const words = vocabulary?.words || [];
  const uniqueCount = vocabulary?.unique_count || words.length;

  // Get unique chapters
  const chapters = useMemo(() => {
    const chapterSet = new Set(words.map(w => w.chapter).filter(Boolean));
    return Array.from(chapterSet).sort();
  }, [words]);

  // Sort and filter words
  const sortedWords = useMemo(() => {
    let filtered = [...words];

    // Filter by chapter
    if (filterChapter !== 'all') {
      filtered = filtered.filter(w => w.chapter === filterChapter);
    }

    // Filter by search term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.japanese?.toLowerCase().includes(lower) ||
        w.reading?.toLowerCase().includes(lower) ||
        w.english?.toLowerCase().includes(lower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'frequency') {
        return (b.frequency || 1) - (a.frequency || 1);
      } else if (sortBy === 'alphabetical') {
        return (a.japanese || a.reading || '').localeCompare(b.japanese || b.reading || '');
      } else if (sortBy === 'chapter') {
        return (a.chapter || '').localeCompare(b.chapter || '');
      }
      return 0;
    });

    return filtered;
  }, [words, sortBy, filterChapter, searchTerm]);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            🟡 N5 Vocabulary ({uniqueCount})
          </h3>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="frequency">Sort by: Frequency</option>
            <option value="alphabetical">Sort by: Alphabetical</option>
            <option value="chapter">Sort by: Chapter</option>
          </select>

          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Chapters</option>
            {chapters.map(ch => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[150px] text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Japanese</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Appears</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedWords.map((word, idx) => (
              <tr key={idx} className="hover:bg-yellow-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-sm text-gray-900">{word.japanese || word.kanji}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{word.reading || word.hiragana}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{word.english}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{word.chapter}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {word.frequency || 1}×
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onTimestampClick(word.first_appearance || 0)}
                    className="text-blue-600 hover:text-blue-800 font-mono text-xs hover:underline flex items-center gap-1"
                  >
                    <span>🕐</span>
                    <span>{formatTime(word.first_appearance || 0)}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedWords.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No vocabulary matches your search criteria.
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center flex-shrink-0">
        Showing {sortedWords.length} of {uniqueCount} words
      </div>
    </div>
  );
}

