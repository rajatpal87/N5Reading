/**
 * Helper functions for Japanese Part-of-Speech (POS) classification
 * Based on Kuromoji's POS tagging system
 */

/**
 * Map Kuromoji POS tags to user-friendly categories
 * Kuromoji format: "品詞,品詞細分類1,品詞細分類2,品詞細分類3"
 * Example: "動詞,自立,*,*" = Verb, Independent
 */
export function getPosCategory(posTag) {
  if (!posTag || posTag === '*') return 'Other';
  
  // Kuromoji POS is comma-separated
  const parts = posTag.split(',');
  const mainPos = parts[0];
  
  // Map Japanese POS to English categories
  const posMap = {
    '動詞': 'Verb',           // Verb
    '形容詞': 'Adjective',    // i-Adjective
    '形容動詞': 'Na-Adjective', // na-Adjective
    '名詞': 'Noun',           // Noun
    '副詞': 'Adverb',         // Adverb
    '助詞': 'Particle',       // Particle
    '助動詞': 'Auxiliary',    // Auxiliary verb
    '接続詞': 'Conjunction',  // Conjunction
    '連体詞': 'Adnominal',    // Adnominal (modifies nouns)
    '接頭詞': 'Prefix',       // Prefix
    '接尾': 'Suffix',         // Suffix
    '感動詞': 'Interjection', // Interjection
    '記号': 'Symbol',         // Symbol
    'フィラー': 'Filler',     // Filler words
  };
  
  return posMap[mainPos] || 'Other';
}

/**
 * Get color scheme for POS category
 */
export function getPosCategoryColor(category) {
  const colors = {
    'Verb': 'bg-blue-100 text-blue-700 border-blue-200',
    'Adjective': 'bg-green-100 text-green-700 border-green-200',
    'Na-Adjective': 'bg-teal-100 text-teal-700 border-teal-200',
    'Noun': 'bg-purple-100 text-purple-700 border-purple-200',
    'Adverb': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Particle': 'bg-gray-100 text-gray-700 border-gray-200',
    'Auxiliary': 'bg-pink-100 text-pink-700 border-pink-200',
    'Conjunction': 'bg-orange-100 text-orange-700 border-orange-200',
    'Adnominal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Interjection': 'bg-red-100 text-red-700 border-red-200',
    'Other': 'bg-gray-100 text-gray-600 border-gray-200',
  };
  
  return colors[category] || colors['Other'];
}

/**
 * Get emoji icon for POS category
 */
export function getPosCategoryIcon(category) {
  const icons = {
    'Verb': '🏃',           // Action
    'Adjective': '🎨',      // Descriptive
    'Na-Adjective': '✨',   // Descriptive
    'Noun': '📦',           // Thing
    'Adverb': '⚡',         // Modifier
    'Particle': '🔗',       // Connector
    'Auxiliary': '🔧',      // Helper
    'Conjunction': '➕',     // Connector
    'Adnominal': '👉',      // Pointer
    'Interjection': '💬',   // Expression
    'Other': '❓',
  };
  
  return icons[category] || icons['Other'];
}

/**
 * Get all POS categories for filtering
 */
export function getAllPosCategories() {
  return [
    'Verb',
    'Adjective',
    'Na-Adjective',
    'Noun',
    'Adverb',
    'Particle',
    'Auxiliary',
    'Conjunction',
    'Other'
  ];
}

/**
 * Get detailed POS explanation
 */
export function getPosExplanation(category) {
  const explanations = {
    'Verb': 'Action or state word (e.g., 食べる, 行く, いる)',
    'Adjective': 'i-Adjective describing qualities (e.g., 大きい, 楽しい)',
    'Na-Adjective': 'na-Adjective describing qualities (e.g., 便利, 静か)',
    'Noun': 'Person, place, thing, or concept (e.g., 本, 人, 時間)',
    'Adverb': 'Modifies verbs or adjectives (e.g., とても, ゆっくり)',
    'Particle': 'Grammatical marker (e.g., は, を, に, が)',
    'Auxiliary': 'Helper verb (e.g., ます, です, た)',
    'Conjunction': 'Connects sentences (e.g., そして, でも, だから)',
    'Other': 'Other grammatical elements',
  };
  
  return explanations[category] || 'Grammatical element';
}


