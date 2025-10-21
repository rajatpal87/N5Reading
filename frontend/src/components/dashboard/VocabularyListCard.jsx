import PropTypes from 'prop-types';
import { getPosCategory, getPosCategoryColor, getPosCategoryIcon } from '../../utils/posHelper';

/**
 * Compact Vocabulary Card for List View
 * Shows essential info and tags
 */
export default function VocabularyListCard({ word, isSelected, onClick }) {
  const posTag = word.occurrences?.[0]?.pos || word.part_of_speech || '';
  const posCategory = getPosCategory(posTag);
  const posCategoryColor = getPosCategoryColor(posCategory);
  const posCategoryIcon = getPosCategoryIcon(posCategory);

  // Get verb group for verbs
  const getVerbGroup = (pos) => {
    if (!pos || !posCategory.includes('Verb')) return '';
    if (pos.includes('五段')) return '1';
    if (pos.includes('一段')) return '2';
    if (pos.includes('サ変')) return '3';
    return '';
  };

  // Get adjective type
  const getAdjectiveType = (pos) => {
    if (!pos || posCategory !== 'Adjective') return '';
    if (pos.includes('形容詞-一般')) return 'i';
    if (pos.includes('形容詞-ナ')) return 'na';
    return '';
  };

  const verbGroup = getVerbGroup(posTag);
  const adjType = getAdjectiveType(posTag);

  // Format timestamps for single line
  const timestamps = word.occurrences?.slice(0, 5).map(occ => {
    const mins = Math.floor(occ.start_time / 60);
    const secs = Math.floor(occ.start_time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }) || [];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Word & Meaning */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {word.kanji || word.hiragana}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {word.hiragana}
            </div>
          </div>
          {/* Frequency badge */}
          <div className="flex-shrink-0 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
            {word.frequency || word.occurrences?.length || 1}x
          </div>
        </div>
        <div className="text-sm text-gray-700 mt-2">
          {word.english}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {/* POS Tag */}
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${posCategoryColor}`}>
          {posCategoryIcon} {posCategory}
          {verbGroup && ` (Group ${verbGroup})`}
          {adjType && ` (${adjType})`}
        </span>
        
        {/* JLPT Level */}
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
          N{word.jlpt_level || 5}
        </span>
      </div>

      {/* Timestamps */}
      {timestamps.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {timestamps.join(', ')}
            {word.occurrences && word.occurrences.length > 5 && ` +${word.occurrences.length - 5}`}
          </span>
        </div>
      )}
    </button>
  );
}

VocabularyListCard.propTypes = {
  word: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};


