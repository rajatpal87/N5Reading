import PropTypes from 'prop-types';
import { getPosCategory, getPosCategoryColor, getPosCategoryIcon } from '../../utils/posHelper';
import { 
  getConjugationName, 
  getConjugationColor,
  groupByConjugation 
} from '../../utils/conjugationHelper';
import { conjugateVerb, isVerb, getVerbGroup } from '../../utils/verbConjugator';

/**
 * Vocabulary Detail Panel Component
 * Shows detailed information about a selected vocabulary word
 */
export default function VocabularyDetailPanel({ word, onTimestampClick, onClose }) {
  if (!word) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg font-medium">Select a word</p>
          <p className="text-sm mt-2">Click on a vocabulary card to see details</p>
        </div>
      </div>
    );
  }

  const posTag = word.occurrences?.[0]?.pos || word.part_of_speech || '';
  const posCategory = getPosCategory(posTag);
  const posCategoryColor = getPosCategoryColor(posCategory);
  const posCategoryIcon = getPosCategoryIcon(posCategory);

  // Get verb conjugations if this is a verb
  const conjugationType = word.occurrences?.[0]?.conjugation_type || '';
  const basicForm = word.occurrences?.[0]?.basic_form || word.kanji || word.hiragana;
  const verbForms = isVerb(posTag) ? conjugateVerb(basicForm, conjugationType) : null;
  const verbGroup = getVerbGroup(conjugationType);

  // Group conjugations from occurrences (for showing what was actually found)
  const groupedConjugations = word.occurrences ? groupByConjugation(word.occurrences) : {};

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-900">Word Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-lg transition-colors"
          title="Close detail panel"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main Word Display */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {word.kanji || word.hiragana}
              </div>
              <div className="text-xl text-gray-600 mb-1">
                {word.hiragana}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${posCategoryColor}`}>
              {posCategoryIcon} {posCategory}
            </span>
          </div>
          <div className="text-lg text-gray-700 font-medium">
            {word.english}
          </div>
        </div>

        {/* Verb Conjugation Forms */}
        {verbForms && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Verb Conjugations {verbGroup && <span className="text-sm text-gray-500">(Group {verbGroup})</span>}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Dictionary Form</div>
                <div className="text-lg font-semibold text-gray-900">{verbForms.dictionary}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1 font-semibold">Masu Form (ます)</div>
                <div className="text-lg font-semibold text-blue-900">{verbForms.masu}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-xs text-green-700 mb-1 font-semibold">Te Form (て)</div>
                <div className="text-lg font-semibold text-green-900">{verbForms.te}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-xs text-purple-700 mb-1 font-semibold">Ta Form (た)</div>
                <div className="text-lg font-semibold text-purple-900">{verbForms.ta}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-xs text-red-700 mb-1 font-semibold">Nai Form (ない)</div>
                <div className="text-lg font-semibold text-red-900">{verbForms.nai}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-xs text-orange-700 mb-1 font-semibold">Nakatta Form (なかった)</div>
                <div className="text-lg font-semibold text-orange-900">{verbForms.nakatta}</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-xs text-indigo-700 mb-1 font-semibold">Potential (can)</div>
                <div className="text-lg font-semibold text-indigo-900">{verbForms.potential}</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <div className="text-xs text-pink-700 mb-1 font-semibold">Volitional (let's)</div>
                <div className="text-lg font-semibold text-pink-900">{verbForms.volitional}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-xs text-yellow-700 mb-1 font-semibold">Conditional (if)</div>
                <div className="text-lg font-semibold text-yellow-900">{verbForms.conditional}</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="text-xs text-teal-700 mb-1 font-semibold">Imperative (command)</div>
                <div className="text-lg font-semibold text-teal-900">{verbForms.imperative}</div>
              </div>
            </div>
          </div>
        )}

        {/* All Forms Found */}
        {word.forms && word.forms.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Forms Found in Video
            </h3>
            <div className="flex flex-wrap gap-2">
              {word.forms.map((form, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                >
                  {form}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        {word.occurrences && word.occurrences.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Appears in Video ({word.frequency || word.occurrences.length}x)
            </h3>
            <div className="flex flex-wrap gap-2">
              {word.occurrences.slice(0, 20).map((occ, idx) => (
                <button
                  key={idx}
                  onClick={() => onTimestampClick && onTimestampClick(occ.start_time)}
                  className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200 hover:bg-purple-100 transition-colors"
                  title={`${occ.matched_text} - Click to jump`}
                >
                  {Math.floor(occ.start_time / 60)}:{(occ.start_time % 60).toFixed(0).padStart(2, '0')}
                </button>
              ))}
              {word.occurrences.length > 20 && (
                <span className="px-3 py-1 text-gray-500 text-sm">
                  +{word.occurrences.length - 20} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <dl className="space-y-3">
            <div className="flex items-start gap-4">
              <dt className="text-sm text-gray-500 font-medium w-32">JLPT Level:</dt>
              <dd className="text-sm text-gray-900 font-semibold">
                N{word.jlpt_level || 5}
              </dd>
            </div>
            {word.chapter && (
              <div className="flex items-start gap-4">
                <dt className="text-sm text-gray-500 font-medium w-32">Chapter:</dt>
                <dd className="text-sm text-gray-900">{word.chapter}</dd>
              </div>
            )}
            {word.occurrences?.[0]?.pos && (
              <div className="flex items-start gap-4">
                <dt className="text-sm text-gray-500 font-medium w-32">Part of Speech:</dt>
                <dd className="text-sm text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                  {word.occurrences[0].pos}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

VocabularyDetailPanel.propTypes = {
  word: PropTypes.object,
  onTimestampClick: PropTypes.func,
  onClose: PropTypes.func,
};

