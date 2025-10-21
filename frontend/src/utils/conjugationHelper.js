/**
 * Helper functions for Japanese verb/adjective conjugation forms
 * Maps Kuromoji conjugation data to user-friendly terms
 */

/**
 * Identify conjugation form from Kuromoji data
 * @param {string} conjugationForm - Kuromoji's conjugated_form (e.g., "連用形", "仮定形")
 * @param {string} matchedText - The actual text that appeared
 * @param {string} basicForm - Dictionary form
 * @returns {string} User-friendly conjugation name
 */
export function getConjugationName(conjugationForm, matchedText, basicForm) {
  if (!conjugationForm || conjugationForm === '*') {
    // No conjugation info, try to infer from the text
    if (matchedText === basicForm) {
      return 'Dictionary Form';
    }
    return null;
  }

  // Map Japanese conjugation forms to English
  const formMap = {
    '連用形': 'Masu Stem', // 連用形 - used for ます form
    '未然形': 'Nai Form Base', // 未然形 - used for ない form
    '仮定形': 'Ba Form', // 仮定形 - conditional (~ば)
    '命令形': 'Command Form', // 命令形 - imperative
    '基本形': 'Dictionary Form', // 基本形 - plain/dictionary
    '体言接続': 'Noun-Modifying', // 体言接続 - modifies nouns
    '連用タ接続': 'Ta Form Base', // 連用タ接続 - た form base
    '連用テ接続': 'Te Form Base', // 連用テ接続 - て form base
    '仮定縮約１': 'Conditional', // Conditional variations
    '音便基本形': 'Sound Change Form', // Sound change variations
  };

  const baseName = formMap[conjugationForm] || conjugationForm;

  // Now check the actual ending to be more specific
  if (matchedText) {
    if (matchedText.endsWith('ます') || matchedText.endsWith('ました')) {
      return 'Masu Form';
    }
    if (matchedText.endsWith('て') || matchedText.endsWith('で')) {
      return 'Te Form';
    }
    if (matchedText.endsWith('た') || matchedText.endsWith('だ')) {
      return 'Ta Form (Past)';
    }
    if (matchedText.endsWith('ない')) {
      return 'Nai Form (Negative)';
    }
    if (matchedText.endsWith('なかった')) {
      return 'Past Negative';
    }
    if (matchedText.endsWith('られる') || matchedText.endsWith('れる')) {
      return 'Potential/Passive';
    }
    if (matchedText.endsWith('ている') || matchedText.endsWith('でいる')) {
      return 'Te-iru Form';
    }
    if (matchedText.endsWith('ません') || matchedText.endsWith('ませんでした')) {
      return 'Masen Form (Polite Negative)';
    }
  }

  return baseName;
}

/**
 * Get color scheme for conjugation form
 */
export function getConjugationColor(formName) {
  if (!formName) return 'bg-gray-100 text-gray-600 border-gray-200';

  const colorMap = {
    'Dictionary Form': 'bg-blue-50 text-blue-700 border-blue-200',
    'Masu Form': 'bg-green-50 text-green-700 border-green-200',
    'Masu Stem': 'bg-green-50 text-green-700 border-green-200',
    'Te Form': 'bg-purple-50 text-purple-700 border-purple-200',
    'Te Form Base': 'bg-purple-50 text-purple-700 border-purple-200',
    'Ta Form (Past)': 'bg-orange-50 text-orange-700 border-orange-200',
    'Ta Form Base': 'bg-orange-50 text-orange-700 border-orange-200',
    'Nai Form (Negative)': 'bg-red-50 text-red-700 border-red-200',
    'Nai Form Base': 'bg-red-50 text-red-700 border-red-200',
    'Past Negative': 'bg-red-50 text-red-700 border-red-200',
    'Te-iru Form': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Masen Form (Polite Negative)': 'bg-pink-50 text-pink-700 border-pink-200',
    'Ba Form': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Command Form': 'bg-red-100 text-red-800 border-red-300',
    'Potential/Passive': 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return colorMap[formName] || 'bg-gray-100 text-gray-600 border-gray-200';
}

/**
 * Get emoji icon for conjugation form
 */
export function getConjugationIcon(formName) {
  if (!formName) return '';

  const iconMap = {
    'Dictionary Form': '📖',
    'Masu Form': '✨',
    'Masu Stem': '✨',
    'Te Form': '🔗',
    'Te Form Base': '🔗',
    'Ta Form (Past)': '⏮️',
    'Ta Form Base': '⏮️',
    'Nai Form (Negative)': '🚫',
    'Nai Form Base': '🚫',
    'Past Negative': '❌',
    'Te-iru Form': '⏳',
    'Masen Form (Polite Negative)': '🙅',
    'Ba Form': '❓',
    'Command Form': '❗',
    'Potential/Passive': '💪',
  };

  return iconMap[formName] || '💬';
}

/**
 * Check if this is a verb form worth highlighting
 */
export function isVerbForm(posCategory) {
  return posCategory === 'Verb' || posCategory === 'Auxiliary';
}

/**
 * Group occurrences by conjugation form
 */
export function groupByConjugation(occurrences, basicForm) {
  const grouped = {};
  
  occurrences.forEach(occ => {
    const formName = getConjugationName(
      occ.conjugation_form,
      occ.matched_text,
      basicForm || occ.basic_form
    );
    
    if (!grouped[formName]) {
      grouped[formName] = [];
    }
    grouped[formName].push(occ);
  });
  
  return grouped;
}

/**
 * Get explanation for conjugation form
 */
export function getConjugationExplanation(formName) {
  const explanations = {
    'Dictionary Form': 'Plain, unconjugated form found in dictionaries',
    'Masu Form': 'Polite present/future tense (～ます)',
    'Masu Stem': 'Stem form used to create masu form',
    'Te Form': 'Connecting form (～て/～で)',
    'Ta Form (Past)': 'Plain past tense (～た/～だ)',
    'Nai Form (Negative)': 'Plain negative (～ない)',
    'Past Negative': 'Plain past negative (～なかった)',
    'Te-iru Form': 'Progressive/continuous (～ている)',
    'Masen Form (Polite Negative)': 'Polite negative (～ません)',
    'Ba Form': 'Conditional "if" form (～ば)',
    'Command Form': 'Imperative/command form',
    'Potential/Passive': 'Can do / is done (～られる/～れる)',
  };
  
  return explanations[formName] || 'Conjugated form';
}

