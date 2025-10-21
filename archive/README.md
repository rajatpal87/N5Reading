# Archive Folder

This folder contains historical files and one-time scripts that were used during development but are no longer actively needed.

## 📁 Contents

### `/tokenizer-comparison/`
**Purpose**: Comparison data between TinySegmenter and Kuromoji tokenizers

Files:
- `tokenizer_comparison.md/json/csv` - TinySegmenter tokenization results
- `tokenizer_comparison_detailed.md` - Side-by-side comparison
- `tokenizer_comparison_full.json/csv` - Complete comparison data

**Why Archived**: 
- Comparison completed
- Kuromoji chosen as the winner
- Data kept for reference

### `/old-scripts/`
**Purpose**: One-time migration and analysis scripts

Files:
- `compareTokenizers.js` - Generated TinySegmenter comparison
- `compareTokenizersSideBySide.js` - Generated full comparison
- `convertCsvToJson.js` - Converted jlpt_vocab.csv to JSON
- `testNewVocabulary.js` - Tested new vocabulary import
- `swapVocabulary.js` - Swapped old vocabulary with new 718 words
- `updateVocabulary.js` - Updated database with new vocabulary

**Why Archived**: 
- One-time use only
- Successfully completed their purpose
- May be useful for reference if similar migrations needed

## 🔄 If You Need These Files

All files are kept intact and can be restored if needed. They represent important milestones in the project's development:

1. **Tokenizer Migration**: The decision to move from TinySegmenter to Kuromoji
2. **Vocabulary Upgrade**: Expansion from 296 to 718 N5 words
3. **Database Evolution**: Schema changes and data migrations

## 📝 Notes

- These files are **not deleted**, just organized for clarity
- They won't be imported or run by the application
- Safe to reference for understanding project history
- Can be restored to active codebase if needed

---

*Archived: October 2025*
*Reason: Code cleanup and organization*

