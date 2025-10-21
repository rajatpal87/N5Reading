# N5 Reading - JLPT N5 Video Learning Platform

> Transform YouTube videos into powerful Japanese language learning tools with AI-powered N5 vocabulary and grammar analysis.

## 🎯 Overview

N5 Reading is an intelligent Japanese language learning platform that analyzes Japanese videos, identifies N5-level vocabulary and grammar patterns, and creates interactive learning experiences. Perfect for JLPT N5 students who want to learn through authentic Japanese content.

## ✨ Key Features

### 📊 Enhanced Vocabulary Analysis
- **718 N5 Words** from official JLPT vocabulary lists
- **Advanced Tokenization** using Kuromoji for accurate word detection
- **Rich Linguistic Data**: Part-of-speech, readings, conjugation forms
- **Smart Matching**: Detects dictionary forms even in conjugated text
- **All Word Forms**: See every variation (masu, te, ta, nai forms, etc.)

### 🎨 Interactive Learning Dashboard
- **Video Timeline**: Visual representation of N5 content density
- **Best Segments**: Automatically identified learning moments
- **Expandable Vocabulary Cards**: Click to see detailed information
- **Timestamp Navigation**: Jump directly to any word's usage in video
- **Color-Coded Categories**: Visual organization by word type

### 🔤 Word Categorization
- **Automatic POS Tagging**: Verbs, Nouns, Adjectives, Particles, etc.
- **Smart Filtering**: View only verbs, only nouns, or any category
- **Sort by Type**: Organize vocabulary by grammatical category
- **Color-Coded Badges**: Each word type has unique color and icon

### 📝 Vocabulary Card Details
For each word, see:
- **Main Information**: Kanji, Hiragana, English meaning
- **Word Type**: Verb, Noun, Adjective, etc. (color-coded)
- **All Forms Found**: Every variation that appeared in video
- **Readings**: Hiragana, Katakana, Romaji
- **Usage Frequency**: How many times it appeared
- **Clickable Timestamps**: Jump to each occurrence
- **Conjugation Details**: For verbs and adjectives
- **JLPT Chapter**: Chapter organization

### 📥 Export Features
- **CSV Format**: Open in Excel/Google Sheets
- **Anki Format**: Direct import to flashcard app

### 🎬 Video Processing
- **YouTube Integration**: Paste any YouTube URL
- **Local Upload**: Upload your own MP4 files
- **Automatic Transcription**: Using Whisper AI
- **Translation**: Japanese → English via DeepL
- **Progress Tracking**: See processing status in real-time

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Transcription**: OpenAI Whisper
- **Translation**: DeepL API
- **Tokenization**: Kuromoji (Japanese NLP)
- **Analysis**: Custom N5 detection engine

### Frontend (React + Vite)
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State**: Local component state
- **UI**: Responsive design, mobile-friendly

### Key Technologies
- **Kuromoji**: Advanced Japanese tokenization with POS tagging
- **Whisper**: State-of-the-art speech recognition
- **DeepL**: High-quality translation
- **yt-dlp**: Reliable YouTube video downloading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for Whisper)
- FFmpeg (for audio processing)
- DeepL API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd N5Reading
```

2. **Backend Setup**
```bash
cd backend
npm install
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
# Create .env file in backend/
DEEPL_AUTH_KEY=your_deepl_key_here
DATABASE_URL=your_postgres_url_for_production  # Optional
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### First Use

1. Open http://localhost:5173
2. Upload a Japanese video or paste a YouTube URL
3. Wait for transcription and analysis (takes a few minutes)
4. Explore the dashboard with interactive vocabulary cards!

## 📖 Usage Guide

### Uploading Videos

**Option 1: YouTube URL**
1. Go to "Add Video"
2. Paste any Japanese YouTube URL
3. Click "Download & Process"

**Option 2: Local File**
1. Go to "Add Video"
2. Click "Upload Local Video"
3. Select MP4 file
4. Processing starts automatically

### Using the Dashboard

**Video Player**
- Play/pause the video
- Player floats when you scroll down
- Click timestamps to jump to specific words

**N5 Content Timeline**
- Visual bars show N5 content density
- Stars ⭐ mark best learning segments
- Click any segment to jump there

**Vocabulary Section**
- **Filter by Type**: Show only verbs, nouns, etc.
- **Filter by Chapter**: Focus on specific JLPT chapters
- **Sort Options**: Frequency, alphabetical, type, chapter
- **Search**: Find specific words

**Vocabulary Cards**
- Click any card to expand
- See all forms and conjugations
- Click timestamps to jump to video
- View readings and explanations

### Export Options

**CSV Export**
```
Word | Reading | English | Type | Frequency | First Appears
食べる | たべる | to eat | Verb | 5 | 1:23
```

**Anki Export**
- Optimized for flashcard learning
- Includes all metadata
- Ready to import

## 🗄️ Database Schema

### Main Tables
- **videos**: Video metadata and processing status
- **transcriptions**: Whisper transcription output
- **jlpt_vocabulary**: 718 N5 words with metadata
- **vocabulary_instances**: Every word occurrence with linguistic data
- **grammar_patterns**: N5 grammar patterns (50 patterns)
- **detected_grammar**: Grammar occurrences in videos

### Enhanced Metadata (New!)
Each vocabulary instance now includes:
- `pos`: Part of speech (動詞, 名詞, etc.)
- `basic_form`: Dictionary form
- `reading`: Katakana reading
- `conjugation_type`: Verb conjugation type
- `conjugation_form`: Specific form (連用形, 未然形, etc.)

## 🔧 Key Components

### Backend Services
- `analysisService.js`: Core N5 analysis with Kuromoji
- `transcriptionService.js`: Whisper integration
- `translationService.js`: DeepL integration
- `youtubeService.js`: Video downloading

### Frontend Components
- `Dashboard.jsx`: Main learning interface
- `VideoPlayer.jsx`: Video playback with transcription
- `EnhancedVocabularyCard.jsx`: Rich vocabulary display
- `VocabularyTable.jsx`: Filterable vocabulary list
- `N5Timeline.jsx`: Visual content density

### Utilities
- `posHelper.js`: Part-of-speech categorization
- `conjugationHelper.js`: Verb conjugation analysis

## 📚 Documentation

- `ENHANCED_VOCABULARY_IMPLEMENTATION.md`: Technical details of vocabulary system
- `POS_CATEGORIZATION.md`: How word type detection works
- `CONJUGATION_FORMS.md`: Verb conjugation display
- `MOCKUPS.md`: UI design mockups
- `SESSION_SUMMARY.md`: Recent development summary

## 🧪 Testing

**Re-analyze a Video**
```bash
curl -X POST http://localhost:3000/api/videos/{VIDEO_ID}/analyze
```

**Check API Health**
```bash
curl http://localhost:3000/api/health
```

**Test Database**
```bash
curl http://localhost:3000/api/test-db
```

## 📦 Deployment

### Production (Render.com)

**Backend**
- Automatically deploys from main branch
- Uses PostgreSQL database
- Environment variables in Render dashboard

**Frontend**
- Deploy to Vercel/Netlify
- Set `VITE_API_URL` to production backend URL

### Migrations
All database migrations run automatically on startup:
- Progress tracking columns
- Grammar timestamps
- Vocabulary metadata (POS, conjugations)

### Seeding
Database automatically seeds N5 vocabulary and grammar on first run.

## 🎓 Learning Flow

1. **Upload Video** → System processes
2. **View Dashboard** → See N5 content summary
3. **Filter Vocabulary** → Focus on word types
4. **Expand Cards** → Study individual words
5. **Click Timestamps** → Hear pronunciation in context
6. **Export for Review** → Create flashcards

## 🔮 Future Enhancements

- [ ] User accounts and progress tracking
- [ ] Spaced repetition system integration
- [ ] N4/N3/N2 level support
- [ ] Pronunciation practice
- [ ] Community-shared playlists
- [ ] Mobile app
- [ ] Improved grammar pattern recognition

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- **Kuromoji**: Japanese morphological analyzer
- **OpenAI Whisper**: Speech recognition
- **DeepL**: Translation API
- **JLPT Resources**: Vocabulary and grammar data

## 📞 Support

For issues or questions, please check the documentation files in this repository.

---

**Built with ❤️ for Japanese language learners**

*Current Status: ✅ Production Ready*
*Last Updated: October 2025*
