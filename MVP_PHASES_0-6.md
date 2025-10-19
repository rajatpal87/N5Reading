# 📸 MVP Development Phases 0-6 - Quick Reference

## Overview
**Timeline**: 3-4 weeks  
**Goal**: Build core N5 video analysis platform  
**Status**: No payments, no auth - Focus on product quality first  
**End Result**: Working platform that auto-transcribes videos and detects N5 content

---

## Phase 0: Setup & Data Preparation (1-2 days) ✅ COMPLETE

### Tasks
- [x] Initialize Git repository
- [x] Set up frontend: React + Vite + Tailwind CSS
- [x] Set up backend: Node.js + Express + SQLite
- [x] **Extract N5 data from PDFs** (use Claude in other project)
  - [x] 296 N5 vocabulary words
  - [x] 50 N5 grammar patterns with regex
- [x] Create database schema
- [x] Seed database with N5 reference data

### File Structure Setup
```
N5Reading/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   ├── database.db
│   └── package.json
└── README.md
```

### Key Deliverable
✅ Database populated with N5 vocabulary and grammar patterns

---

## Phase 1: Video Upload & Storage (2-3 days) ✅ COMPLETE

### Frontend Tasks
- [x] Build drag-and-drop upload UI
- [x] File validation (MP4, AVI, MOV, max 100MB)
- [x] Upload progress bar
- [x] Video list page with thumbnails
- [x] Basic video metadata display (title, duration, size)

### Backend Tasks
- [x] Install Multer for file uploads
- [x] Create video upload endpoint (`POST /api/videos/upload`)
- [x] Store videos in local filesystem
- [x] Extract video metadata using FFmpeg
- [x] Create `videos` table in SQLite
- [x] Store video records in database

### API Endpoints
```
POST   /api/videos/upload   - Upload video file
GET    /api/videos          - List all videos
GET    /api/videos/:id      - Get video details
DELETE /api/videos/:id      - Delete video
```

### Key Deliverable
✅ Users can upload videos and see them in a list

---

## Phase 1B: Security Hardening (1 day) ✅ COMPLETE

### Security Features Added
- [x] Rate limiting (100 req/15min global, 10 uploads/15min)
- [x] Security headers (Helmet.js with CSP)
- [x] Request logging (Morgan)
- [x] CORS restrictions (whitelist origins)
- [x] Input validation (express-validator)
- [x] Error sanitization (hide internals)
- [x] Request size limits (10MB JSON, 100MB uploads)
- [x] XSS prevention (script tag stripping)
- [x] SQL injection protection (parameterized queries)
- [x] Path traversal prevention (filename sanitization)

### Files Created
```
backend/src/middleware/security.js    - Rate limiting, helmet, CORS
backend/src/middleware/validation.js  - Input validation
SECURITY.md                            - Security documentation
```

### Key Deliverable
✅ Production-ready security baseline (FREE, no paid services)

---

## Phase 2: Transcription Pipeline (3-4 days)

### Backend Tasks
- [ ] Install FFmpeg (system dependency)
- [ ] Create audio extraction service
  - [ ] Extract audio from video → WAV format
- [ ] Integrate OpenAI Whisper API
  - [ ] Get API key
  - [ ] Japanese speech-to-text with timestamps
  - [ ] Handle word-level and segment-level timestamps
- [ ] Integrate DeepL API (or Azure Translator)
  - [ ] Get API key
  - [ ] Japanese → English translation
- [ ] Set up Bull queue + Redis for background jobs
- [ ] Create job processor for video analysis
- [ ] Store transcriptions and translations in database

### Database Tables
```sql
transcriptions (
  video_id, 
  language, 
  full_text, 
  segments (JSON with timestamps)
)

translations (
  transcription_id,
  english_text,
  segments (JSON)
)
```

### Frontend Tasks
- [ ] Show processing status indicator
- [ ] Display queue position
- [ ] Show success/error notifications
- [ ] Auto-refresh when processing complete

### Key Deliverable
✅ Videos automatically transcribed and translated in background

---

## Phase 3: N5 Analysis Engine (4-5 days)

### Backend Tasks
- [ ] Install Japanese tokenizer (TinySegmenter or Kuromoji.js)
- [ ] Create N5 vocabulary detection service
  - [ ] Tokenize Japanese text
  - [ ] Match tokens against `jlpt_vocabulary` (where jlpt_level=5)
  - [ ] Handle kanji/hiragana/katakana variants
  - [ ] Link detected words to timestamps
  - [ ] Store in `vocabulary_instances` table
- [ ] Create N5 grammar pattern detection service
  - [ ] Run regex patterns from `grammar_patterns` table
  - [ ] Match against transcription text
  - [ ] Store in `detected_grammar` table
- [ ] Calculate N5 content density per segment
  - [ ] % of words that are N5 level
  - [ ] Mark segments with high N5 content

### Analysis Algorithm
```javascript
1. Tokenize Japanese transcription
2. For each token:
   - Check if matches N5 vocabulary (kanji or hiragana)
   - If match, store with timestamp
3. For each grammar pattern:
   - Run regex against full text
   - If match, store with position
4. Calculate segment-level N5 density
5. Generate summary statistics
```

### Key Deliverable
✅ Automatic N5 vocabulary and grammar detection with 90%+ accuracy

---

## Phase 4: Interactive Video Player (4-5 days)

### Frontend Tasks
- [ ] Install Video.js or React Player
- [ ] Create video player component
- [ ] Implement synchronized transcription display
  - [ ] Split screen: Japanese (left) | English (right)
  - [ ] Auto-scroll transcription as video plays
  - [ ] Highlight current phrase/segment
- [ ] Add N5 word highlighting (yellow background)
- [ ] Make timestamps clickable (jump to video position)
- [ ] Make N5 words clickable (show definition tooltip)
- [ ] Add playback controls
- [ ] Mobile-responsive layout

### Layout Design
```
┌─────────────────────────────────────────────┐
│           Video Player                      │
│           (Video.js)                        │
└─────────────────────────────────────────────┘

┌──────────────────────┬─────────────────────┐
│ Japanese             │ English             │
│ これは N5 の         │ This is an N5       │
│ ビデオです。         │ video.              │
│ (N5 words yellow)    │                     │
└──────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────┐
│ N5 Vocabulary | Grammar Patterns            │
└─────────────────────────────────────────────┘
```

### Features
- Click timestamp → video jumps to that moment
- Hover N5 word → see definition
- Toggle transcription visibility
- Playback speed control
- Keyboard shortcuts (space = play/pause, arrow keys = skip)

### Key Deliverable
✅ Beautiful, synchronized video learning experience

---

## Phase 5: Learning Dashboard (2-3 days)

### Frontend Tasks
- [ ] Create dashboard page for each video
- [ ] Video summary card
  - [ ] Total N5 vocabulary count
  - [ ] N5 grammar patterns found
  - [ ] Estimated study time
  - [ ] N5 content coverage percentage
- [ ] N5 segments timeline (visual + clickable)
  ```
  0:00 ──●══●════●════●──── 5:00
       ↑  ↑    ↑    ↑
       N5-rich segments (click to jump)
  ```
- [ ] Vocabulary list table
  - [ ] Columns: Japanese | Reading | English | Chapter | First Appears
  - [ ] Sortable and filterable
  - [ ] Timestamps are clickable
- [ ] Grammar patterns list
  - [ ] Pattern name | Example sentence | Chapter
  - [ ] Click to see all instances in video

### Backend Tasks
- [ ] Create dashboard aggregation endpoint
- [ ] Calculate statistics
  - [ ] Count unique N5 words
  - [ ] Count grammar pattern occurrences
  - [ ] Identify high-density N5 segments
- [ ] Generate timeline data

### API Endpoints
```
GET /api/videos/:id/dashboard    - Get complete dashboard data
GET /api/videos/:id/vocabulary   - Get all detected N5 words
GET /api/videos/:id/grammar      - Get all detected grammar
GET /api/videos/:id/segments     - Get N5-rich segments
```

### Key Deliverable
✅ Comprehensive learning dashboard showing all N5 content

---

## Phase 6: Polish & Testing (2-3 days)

### Testing Tasks
- [ ] Test with 10+ different videos
  - [ ] Different speakers (male, female, different accents)
  - [ ] Different video qualities
  - [ ] Different topics (vlogs, lessons, anime, news)
- [ ] Test edge cases
  - [ ] Video with no N5 content
  - [ ] Heavy dialect or casual speech
  - [ ] Background noise or music
  - [ ] Very long videos (30+ min)
  - [ ] Very short videos (<1 min)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test error scenarios
  - [ ] Whisper API fails
  - [ ] DeepL API fails
  - [ ] Upload fails
  - [ ] Invalid file format

### Polish Tasks
- [ ] Add loading states and skeleton screens
- [ ] Add smooth animations and transitions
- [ ] Improve error messages (user-friendly)
- [ ] Add helpful tooltips and hints
- [ ] Create onboarding flow (first-time user)
- [ ] Optimize performance
  - [ ] Lazy load video thumbnails
  - [ ] Paginate vocabulary lists if > 100 words
  - [ ] Database query optimization (add indexes)
  - [ ] Video streaming optimization
- [ ] Accessibility improvements
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] ARIA labels

### Documentation Tasks
- [ ] Write user guide (how to use the platform)
- [ ] Document known limitations
- [ ] Create troubleshooting guide
- [ ] Write developer setup instructions

### Key Deliverable
✅ Production-ready MVP, tested and polished

---

## 🎯 End of Phase 6 - What You'll Have

### ✅ Working Platform
- Users upload videos
- System auto-transcribes (Japanese + English)
- System detects all N5 vocabulary and grammar
- Interactive video player with synchronized transcriptions
- Learning dashboard with N5 content analysis

### ✅ Core Features
- Japanese/English synchronized transcription
- N5 vocabulary highlighting (yellow)
- N5 grammar pattern detection
- Clickable timestamps (jump to video moment)
- Clickable words (see definitions)
- Learning dashboard with statistics
- N5 segments timeline
- Vocabulary and grammar lists

### ✅ Technical Stack
- **Frontend**: React + Vite + Tailwind CSS + Video.js
- **Backend**: Node.js + Express + SQLite + Bull + Redis
- **APIs**: OpenAI Whisper + DeepL (or Azure Translator)
- **Processing**: FFmpeg + TinySegmenter/Kuromoji

### ❌ Not Built Yet
- User accounts / authentication
- Payment system
- Subscription tiers
- YouTube URL import
- Flashcards / spaced repetition
- Export features (Anki, CSV)
- Progress tracking per user
- N4, N3, N2, N1 levels

---

## 📊 Success Criteria for MVP

After Phase 6, you should achieve:

- [ ] **Performance**: Process 5-min video in < 10 minutes
- [ ] **Accuracy**: 90%+ N5 word detection accuracy
- [ ] **Sync**: Transcription perfectly synced with video
- [ ] **Responsive**: Works on mobile devices
- [ ] **Reliable**: 95%+ success rate on video processing
- [ ] **User Feedback**: 5+ beta testers give positive feedback
- [ ] **Page Load**: < 3 seconds initial load
- [ ] **No Crashes**: Platform stable for 1 hour continuous use

---

## 💰 What Comes Next (Phases 7-12)

### Phase 7: Beta Testing (1-2 weeks)
- Recruit 20-50 beta testers
- Collect feedback and iterate
- Measure conversion intent

### Phase 8: Payments & Auth (2 weeks)
- Add user authentication (JWT)
- Integrate Stripe subscriptions
- Launch N5 tier ($9.99/month)
- 7-day free trial

### Phase 9: YouTube Import (1 week)
- Integrate yt-dlp
- Allow YouTube URL input
- Auto-download and process

### Phase 10: Premium Features (2 weeks)
- Flashcards with spaced repetition
- Export to Anki/CSV
- Progress tracking
- Annual billing ($99/year)

### Phase 11: N4 Level Support (3-4 weeks)
- Extract N4 data from PDFs
- Seed N4 vocabulary (~1,500 words)
- Launch N4 tier ($14.99/month)
- Upgrade prompts for N5 users

### Phase 12: N3 Level Support (3-4 weeks)
- Extract N3 data (~3,000 words)
- Launch N3 tier ($19.99/month)
- Multi-level analysis optimization

---

## 🔧 Development Setup Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Redis installed (for Bull queue)
- [ ] FFmpeg installed (for audio extraction)
- [ ] Git installed

### API Keys Needed
- [ ] OpenAI API key (Whisper)
- [ ] DeepL API key (or Azure Translator)

### Environment Variables
```bash
# Backend .env file
OPENAI_API_KEY=sk-...
DEEPL_API_KEY=...
REDIS_URL=redis://localhost:6379
PORT=3000

# Frontend .env file
VITE_API_URL=http://localhost:3000/api
```

---

## 📈 Estimated Effort

| Phase | Days | Complexity | Risk |
|-------|------|-----------|------|
| Phase 0 | 1-2 | Low | Low |
| Phase 1 | 2-3 | Low | Low |
| Phase 2 | 3-4 | Medium | Medium (API dependencies) |
| Phase 3 | 4-5 | High | Medium (Japanese NLP) |
| Phase 4 | 4-5 | Medium | Low |
| Phase 5 | 2-3 | Low | Low |
| Phase 6 | 2-3 | Low | Low |
| **Total** | **18-25 days** | | |

**Calendar Time**: 3-4 weeks (accounting for learning curve and iterations)

---

## 🚀 Ready to Start?

### Immediate Next Action
1. **Extract N5 data from PDFs** using Claude in your other project
2. Get JSON with:
   - N5 vocabulary: `{ kanji, hiragana, romaji, english, chapter }`
   - N5 grammar: `{ pattern, name, example, chapter, regex }`
3. **Paste JSON here** → I'll help you set up Phase 0

---

## 📚 Related Documentation

- **Full Project Plan**: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- **Multi-Tier Architecture**: [MULTI_TIER_ARCHITECTURE.md](./MULTI_TIER_ARCHITECTURE.md)
- **Monetization Strategy**: [MONETIZATION_SUMMARY.md](./MONETIZATION_SUMMARY.md)
- **Quick Overview**: [README.md](./README.md)

---

**Version**: 1.0  
**Last Updated**: October 19, 2025  
**Status**: Ready to Build  
**Next Step**: Extract N5 data from PDFs

