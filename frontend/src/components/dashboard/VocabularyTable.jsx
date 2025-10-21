import { useState, useMemo } from 'react';
import EnhancedVocabularyCard from './EnhancedVocabularyCard';
import { getPosCategory, getAllPosCategories, getPosCategoryIcon } from '../../utils/posHelper';

export default function VocabularyTable({ vocabulary, onTimestampClick }) {
  const [sortBy, setSortBy] = useState('frequency'); // 'frequency', 'alphabetical', 'chapter', 'pos'
  const [filterChapter, setFilterChapter] = useState('all');
  const [filterPos, setFilterPos] = useState('all');
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

    // Filter by POS category
    if (filterPos !== 'all') {
      filtered = filtered.filter(w => {
        // Get POS from first occurrence or part_of_speech field
        const pos = w.occurrences?.[0]?.pos || w.part_of_speech || '';
        const category = getPosCategory(pos);
        return category === filterPos;
      });
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
      } else if (sortBy === 'pos') {
        const posA = getPosCategory(a.occurrences?.[0]?.pos || a.part_of_speech || '');
        const posB = getPosCategory(b.occurrences?.[0]?.pos || b.part_of_speech || '');
        return posA.localeCompare(posB);
      }
      return 0;
    });

    return filtered;
  }, [words, sortBy, filterChapter, filterPos, searchTerm]);

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
            <option value="frequency">Sort: Frequency</option>
            <option value="alphabetical">Sort: Alphabetical</option>
            <option value="pos">Sort: Type</option>
            <option value="chapter">Sort: Chapter</option>
          </select>

          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {getAllPosCategories().map(cat => (
              <option key={cat} value={cat}>
                {getPosCategoryIcon(cat)} {cat}
              </option>
            ))}
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

      {/* Vocabulary Cards Grid */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedWords.map((word, idx) => (
            <EnhancedVocabularyCard
              key={idx}
              word={word}
              onTimestampClick={onTimestampClick}
            />
          ))}
        </div>
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

