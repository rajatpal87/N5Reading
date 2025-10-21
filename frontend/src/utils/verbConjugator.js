/**
 * Verb Conjugation Generator
 * Generates verb forms based on Kuromoji output
 */

/**
 * Generate verb conjugations from Kuromoji data
 * @param {string} basicForm - Dictionary form from Kuromoji
 * @param {string} conjugationType - Conjugation type from Kuromoji (e.g., "五段・サ行", "一段", etc.)
 * @returns {Object} Object with all conjugated forms
 */
export function conjugateVerb(basicForm, conjugationType) {
  if (!basicForm || !conjugationType) {
    return null;
  }

  // Handle irregular verbs first
  if (basicForm === 'する' || conjugationType.includes('サ変')) {
    return conjugateSuruVerb(basicForm);
  }
  
  if (basicForm === 'くる' || basicForm === '来る' || conjugationType.includes('カ変')) {
    return conjugateKuruVerb(basicForm);
  }

  // Ichidan verbs (一段) - Group 2
  if (conjugationType.includes('一段')) {
    return conjugateIchidanVerb(basicForm);
  }

  // Godan verbs (五段) - Group 1
  if (conjugationType.includes('五段')) {
    return conjugateGodanVerb(basicForm, conjugationType);
  }

  return null;
}

/**
 * Conjugate Ichidan (Group 2) verbs
 * Remove る and add endings
 */
function conjugateIchidanVerb(basicForm) {
  const stem = basicForm.slice(0, -1); // Remove る

  return {
    dictionary: basicForm,
    masu: stem + 'ます',
    te: stem + 'て',
    ta: stem + 'た',
    nai: stem + 'ない',
    nakatta: stem + 'なかった',
    potential: stem + 'られる',
    passive: stem + 'られる',
    causative: stem + 'させる',
    imperative: stem + 'ろ',
    volitional: stem + 'よう',
    conditional: stem + 'れば',
  };
}

/**
 * Conjugate Godan (Group 1) verbs
 * More complex due to different endings
 */
function conjugateGodanVerb(basicForm, conjugationType) {
  const lastChar = basicForm.slice(-1);
  const stem = basicForm.slice(0, -1);

  // Determine the verb ending type
  let teForm, taForm, naiForm, potentialForm, conditionalForm;

  // う、つ、る endings → って/った
  if (lastChar === 'う' || lastChar === 'つ' || lastChar === 'る') {
    teForm = stem + convertToIRow(lastChar) + 'って';
    taForm = stem + convertToIRow(lastChar) + 'った';
  }
  // む、ぬ、ぶ endings → んで/んだ
  else if (lastChar === 'む' || lastChar === 'ぬ' || lastChar === 'ぶ') {
    teForm = stem + 'んで';
    taForm = stem + 'んだ';
  }
  // く ending → いて/いた (exception: 行く → 行って)
  else if (lastChar === 'く') {
    if (basicForm === 'いく' || basicForm === '行く') {
      teForm = stem + 'って';
      taForm = stem + 'った';
    } else {
      teForm = stem + 'いて';
      taForm = stem + 'いた';
    }
  }
  // ぐ ending → いで/いだ
  else if (lastChar === 'ぐ') {
    teForm = stem + 'いで';
    taForm = stem + 'いだ';
  }
  // す ending → して/した
  else if (lastChar === 'す') {
    teForm = stem + 'して';
    taForm = stem + 'した';
  }

  // Nai form: convert to あ-row + ない
  const naiStem = stem + convertToARow(lastChar);
  naiForm = naiStem + 'ない';

  // Potential form: convert to え-row + る
  potentialForm = stem + convertToERow(lastChar) + 'る';

  // Conditional: convert to え-row + ば
  conditionalForm = stem + convertToERow(lastChar) + 'ば';

  return {
    dictionary: basicForm,
    masu: stem + convertToIRow(lastChar) + 'ます',
    te: teForm,
    ta: taForm,
    nai: naiForm,
    nakatta: naiStem + 'なかった',
    potential: potentialForm,
    passive: naiStem + 'れる',
    causative: naiStem + 'せる',
    imperative: stem + convertToERow(lastChar),
    volitional: stem + convertToORow(lastChar) + 'う',
    conditional: conditionalForm,
  };
}

/**
 * Conjugate する verb (irregular)
 */
function conjugateSuruVerb(basicForm) {
  const stem = basicForm.replace(/する$/, '');
  
  return {
    dictionary: basicForm,
    masu: stem + 'します',
    te: stem + 'して',
    ta: stem + 'した',
    nai: stem + 'しない',
    nakatta: stem + 'しなかった',
    potential: stem + 'できる',
    passive: stem + 'される',
    causative: stem + 'させる',
    imperative: stem + 'しろ',
    volitional: stem + 'しよう',
    conditional: stem + 'すれば',
  };
}

/**
 * Conjugate 来る verb (irregular)
 */
function conjugateKuruVerb(basicForm) {
  const isKanji = basicForm === '来る';
  
  return {
    dictionary: basicForm,
    masu: isKanji ? '来ます' : 'きます',
    te: isKanji ? '来て' : 'きて',
    ta: isKanji ? '来た' : 'きた',
    nai: isKanji ? '来ない' : 'こない',
    nakatta: isKanji ? '来なかった' : 'こなかった',
    potential: isKanji ? '来られる' : 'こられる',
    passive: isKanji ? '来られる' : 'こられる',
    causative: isKanji ? '来させる' : 'こさせる',
    imperative: isKanji ? '来い' : 'こい',
    volitional: isKanji ? '来よう' : 'こよう',
    conditional: isKanji ? '来れば' : 'くれば',
  };
}

/**
 * Helper functions to convert hiragana characters between rows
 */

// Convert う-row to あ-row (for negative form)
function convertToARow(char) {
  const map = {
    'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た',
    'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら'
  };
  return map[char] || char;
}

// Convert う-row to い-row (for masu stem)
function convertToIRow(char) {
  const map = {
    'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち',
    'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り'
  };
  return map[char] || char;
}

// Convert う-row to え-row (for potential, conditional, imperative)
function convertToERow(char) {
  const map = {
    'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て',
    'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ'
  };
  return map[char] || char;
}

// Convert う-row to お-row (for volitional)
function convertToORow(char) {
  const map = {
    'う': 'お', 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'つ': 'と',
    'ぬ': 'の', 'ぶ': 'ぼ', 'む': 'も', 'る': 'ろ'
  };
  return map[char] || char;
}

/**
 * Get a simplified display of common forms
 */
export function getCommonForms(basicForm, conjugationType) {
  const allForms = conjugateVerb(basicForm, conjugationType);
  
  if (!allForms) return null;

  return {
    dictionary: allForms.dictionary,
    masu: allForms.masu,
    te: allForms.te,
    ta: allForms.ta,
    nai: allForms.nai,
  };
}

/**
 * Test if a word is a verb based on POS
 */
export function isVerb(pos) {
  return pos && pos.includes('動詞');
}

/**
 * Get verb group (1, 2, or 3) from conjugation type
 */
export function getVerbGroup(conjugationType) {
  if (!conjugationType) return null;
  
  if (conjugationType.includes('五段')) return 1;
  if (conjugationType.includes('一段')) return 2;
  if (conjugationType.includes('サ変') || conjugationType.includes('カ変')) return 3;
  
  return null;
}


