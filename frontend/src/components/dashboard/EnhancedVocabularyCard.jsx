import { useState } from 'react';
import PropTypes from 'prop-types';
import { getPosCategory, getPosCategoryColor, getPosCategoryIcon } from '../../utils/posHelper';
import { 
  getConjugationName, 
  getConjugationColor, 
  getConjugationIcon,
  isVerbForm,
  groupByConjugation,
  getConjugationExplanation
} from '../../utils/conjugationHelper';

/**
 * Enhanced Vocabulary Card Component
 * Displays vocabulary with rich Kuromoji metadata:
 * - All forms that appeared
 * - Readings (hiragana, katakana, romaji)
 * - Part of speech
 * - Conjugation details for each occurrence
 */
export default function EnhancedVocabularyCard({ word, onTimestampClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get POS category from first occurrence or part_of_speech field
  const posTag = word.occurrences?.[0]?.pos || word.part_of_speech || '';
  const posCategory = getPosCategory(posTag);
  const posCategoryColor = getPosCategoryColor(posCategory);
  const posCategoryIcon = getPosCategoryIcon(posCategory);
  
  // Check if this is a verb/adjective to show conjugation info
  const showConjugations = isVerbForm(posCategory) && word.occurrences;

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to convert katakana to romaji (simplified)
  const toRomaji = (kana) => {
    // This is a simplified version - you might want to use a library like wanakana
    if (!kana) return '';
    // For now, just return the reading as-is
    // TODO: Implement proper katakana to romaji conversion
    return kana;
  };

  // Get the display text (kanji if available, otherwise hiragana)
  const displayText = word.kanji || word.hiragana;
  
  // Get unique forms
  const uniqueForms = word.forms || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Main Word */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{displayText}</span>
              {word.kanji && word.hiragana && (
                <span className="text-lg text-gray-500">({word.hiragana})</span>
              )}
            </div>

            {/* English Meaning */}
            <div className="text-base text-gray-700 mb-2">{word.english}</div>

            {/* Quick Info Tags */}
            <div className="flex flex-wrap gap-2">
              {/* POS Category Badge - Prominent */}
              <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${posCategoryColor}`}>
                {posCategoryIcon} {posCategory}
              </span>
              
              {word.frequency && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  {word.frequency}× used
                </span>
              )}
              {uniqueForms.length > 1 && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  {uniqueForms.length} forms
                </span>
              )}
              {word.chapter && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                  {word.chapter}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className="flex-shrink-0">
            <svg 
              className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* Readings Section */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📖 Readings</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-20">Hiragana:</span>
                <span className="text-base text-gray-900">{word.hiragana || 'N/A'}</span>
              </div>
              {word.occurrences && word.occurrences.length > 0 && word.occurrences[0].reading && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Katakana:</span>
                    <span className="text-base text-gray-900">{word.occurrences[0].reading}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Romaji:</span>
                    <span className="text-base text-gray-600">{toRomaji(word.occurrences[0].reading)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Forms Section */}
          {uniqueForms.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                🔤 Forms Found ({uniqueForms.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueForms.map((form, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-medium"
                  >
                    {form}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conjugation Forms Section (for Verbs/Adjectives) */}
          {showConjugations && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                🔄 Conjugation Forms Used ({word.frequency || word.occurrences.length} times)
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(() => {
                  const grouped = groupByConjugation(word.occurrences, word.kanji || word.hiragana);
                  return Object.entries(grouped).map(([formName, occurrences]) => {
                    const formColor = getConjugationColor(formName);
                    const formIcon = getConjugationIcon(formName);
                    const explanation = getConjugationExplanation(formName);
                    
                    return (
                      <div key={formName} className="border-l-4 border-indigo-200 pl-3">
                        {/* Form Header with Badge */}
                        <div className="mb-2">
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded border ${formColor}`}>
                            {formIcon} {formName}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{explanation}</div>
                        </div>
                        
                        {/* Occurrences for this form */}
                        <div className="space-y-1.5 ml-2">
                          {occurrences.map((occ, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded cursor-pointer group transition-colors"
                              onClick={() => onTimestampClick?.(occ.start_time)}
                            >
                              <span className="inline-block px-2 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded group-hover:bg-blue-200">
                                {formatTime(occ.start_time)}
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {occ.matched_text}
                              </span>
                              <span className="text-xs text-gray-400 ml-auto">
                                {occurrences.length > 1 && `(${idx + 1}/${occurrences.length})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Regular Occurrences Section (for non-verbs) */}
          {!showConjugations && word.occurrences && word.occurrences.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                📍 Occurrences ({word.frequency || word.occurrences.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {word.occurrences.map((occ, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group"
                    onClick={() => onTimestampClick?.(occ.start_time)}
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-block px-2 py-1 text-xs font-mono bg-blue-100 text-blue-700 rounded group-hover:bg-blue-200">
                        {formatTime(occ.start_time)}
                      </span>
                    </div>
                    <div className="flex-1 text-sm text-gray-700">
                      <span className="font-medium">{occ.matched_text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

EnhancedVocabularyCard.propTypes = {
  word: PropTypes.shape({
    word_id: PropTypes.number,
    kanji: PropTypes.string,
    hiragana: PropTypes.string,
    english: PropTypes.string,
    part_of_speech: PropTypes.string,
    chapter: PropTypes.string,
    frequency: PropTypes.number,
    forms: PropTypes.arrayOf(PropTypes.string),
    occurrences: PropTypes.arrayOf(PropTypes.shape({
      start_time: PropTypes.number,
      end_time: PropTypes.number,
      matched_text: PropTypes.string,
      pos: PropTypes.string,
      basic_form: PropTypes.string,
      reading: PropTypes.string,
      conjugation_type: PropTypes.string,
      conjugation_form: PropTypes.string,
    })),
  }).isRequired,
  onTimestampClick: PropTypes.func,
};

