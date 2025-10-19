import { useState, useMemo } from 'react';

export default function GrammarPatternsList({ grammar, onTimestampClick }) {
  const [expandedPatterns, setExpandedPatterns] = useState(new Set());
  const [sortBy, setSortBy] = useState('frequency'); // 'frequency', 'alphabetical', 'chapter'
  const [filterChapter, setFilterChapter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const patterns = grammar?.patterns || [];
  const uniqueCount = grammar?.unique_count || patterns.length;

  // Get unique chapters
  const chapters = useMemo(() => {
    const chapterSet = new Set(patterns.map(p => p.chapter).filter(Boolean));
    return Array.from(chapterSet).sort();
  }, [patterns]);

  // Sort and filter patterns
  const filteredPatterns = useMemo(() => {
    let filtered = [...patterns];

    // Filter by chapter
    if (filterChapter !== 'all') {
      filtered = filtered.filter(p => p.chapter === filterChapter);
    }

    // Filter by search term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.pattern_name?.toLowerCase().includes(lower) ||
        p.pattern?.toLowerCase().includes(lower) ||
        p.english_explanation?.toLowerCase().includes(lower) ||
        p.explanation?.toLowerCase().includes(lower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'frequency') {
        return (b.frequency || 1) - (a.frequency || 1);
      } else if (sortBy === 'alphabetical') {
        return (a.pattern_name || a.pattern || '').localeCompare(b.pattern_name || b.pattern || '');
      } else if (sortBy === 'chapter') {
        return (a.chapter || '').localeCompare(b.chapter || '');
      }
      return 0;
    });

    return filtered;
  }, [patterns, sortBy, filterChapter, searchTerm]);

  const togglePattern = (patternId) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(patternId)) {
      newExpanded.delete(patternId);
    } else {
      newExpanded.add(patternId);
    }
    setExpandedPatterns(newExpanded);
  };

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
            📝 Grammar Patterns ({uniqueCount})
          </h3>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="frequency">Sort by: Frequency</option>
            <option value="alphabetical">Sort by: Alphabetical</option>
            <option value="chapter">Sort by: Chapter</option>
          </select>

          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="flex-1 min-w-[150px] text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {filteredPatterns.map((pattern, idx) => {
          const isExpanded = expandedPatterns.has(pattern.pattern_id);
          const firstOccurrence = pattern.occurrences?.[0];
          
          return (
            <div key={idx} className="p-4 hover:bg-green-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{pattern.pattern_name || pattern.pattern}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {pattern.frequency || 1}×
                    </span>
                    <span className="text-xs text-gray-500">{pattern.chapter}</span>
                  </div>
                  
                  <p className="text-gray-700 text-xs mb-2">{pattern.explanation || pattern.english_explanation}</p>
                  
                  {/* Occurrence Information */}
                  {pattern.occurrences && pattern.occurrences.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs text-gray-600">
                        Found {pattern.frequency} time{pattern.frequency > 1 ? 's' : ''} in transcript
                      </div>
                      {pattern.frequency > 1 && (
                        <button
                          onClick={() => togglePattern(pattern.pattern_id)}
                          className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"
                        >
                          {isExpanded ? '▼' : '▶'} Show examples
                        </button>
                      )}
                    </div>
                  )}

                  {/* All Occurrences (when expanded) */}
                  {isExpanded && pattern.occurrences && pattern.occurrences.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-xs font-semibold text-green-800 mb-1">Examples:</div>
                      <div className="space-y-1">
                        {pattern.occurrences.slice(0, 3).map((occ, occIdx) => (
                          <div key={occIdx} className="text-xs text-gray-700 italic bg-white px-2 py-1 rounded">
                            "{occ.matched_text}"
                          </div>
                        ))}
                        {pattern.occurrences.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{pattern.occurrences.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {pattern.example_japanese && (
                    <div className="bg-gray-50 border-l-2 border-green-500 p-2 rounded mt-2">
                      <div className="text-xs text-gray-900 font-medium">{pattern.example_japanese}</div>
                      {pattern.english_explanation && (
                        <div className="text-xs text-gray-600 italic mt-1">{pattern.english_explanation}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">
          No grammar patterns match your search criteria.
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center flex-shrink-0">
        Showing {filteredPatterns.length} of {uniqueCount} patterns
      </div>
    </div>
  );
}

