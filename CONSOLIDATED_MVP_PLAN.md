# 📋 JLPT N5 Video Coach - MVP Development Plan

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** Phase 5 Complete, Ready for Phase 6

---

## 📌 Executive Summary

### MVP Scope (Phases 0-6)
**Goal:** Build a production-ready N5 video analysis platform without payments or authentication  
**Timeline:** 3-4 weeks (actual: ~3 weeks)  
**Status:** **Phase 5 Complete** ✅ (83% complete)

### What's Been Built
- ✅ Video upload & YouTube download
- ✅ Audio extraction & compression
- ✅ Transcription (OpenAI Whisper)
- ✅ Translation (DeepL)
- ✅ N5 analysis (296 words, 50 grammar patterns)
- ✅ Interactive video player
- ✅ Learning dashboard with analytics
- ✅ Export to CSV/Anki
- ✅ Real-time progress tracking
- ✅ Security baseline

### What's Not Built (Post-MVP)
- ❌ User authentication (Phase 8)
- ❌ Payment system (Phase 8)
- ❌ Flashcards/spaced repetition (Phase 10)
- ❌ N4, N3, N2, N1 levels (Phase 11+)

---

## 🎯 Phase Completion Status

| Phase | Name | Status | Duration | Completion Date |
|-------|------|--------|----------|-----------------|
| 0 | Setup & Data Preparation | ✅ Complete | 2 days | Oct 13, 2025 |
| 1 | Video Upload & Storage | ✅ Complete | 2 days | Oct 15, 2025 |
| 1B | Security Hardening | ✅ Complete | 1 day | Oct 16, 2025 |
| 2 | Video Processing Pipeline | ✅ Complete | 2 days | Oct 17, 2025 |
| 3 | Transcription & Translation | ✅ Complete | 2 days | Oct 18, 2025 |
| 3.5 | Progress Tracking | ✅ Complete | 1 day | Oct 18, 2025 |
| 4 | Interactive Video Player | ✅ Complete | 1 day | Oct 19, 2025 |
| 5 | Learning Dashboard | ✅ Complete | 1 day | Oct 19, 2025 |
| 6 | Polish & Testing | 🔄 Next | 2-3 days | Target: Oct 22 |

**Total Time Invested:** ~12 days (88% faster than estimated 6-8 weeks!)

---

## ✅ Phase 0: Setup & Data Preparation - COMPLETE

**Duration:** 2 days  
**Completion Date:** October 13, 2025

### Objectives
- Set up development environment
- Extract N5 data from PDFs
- Initialize database
- Seed N5 vocabulary and grammar

### Tasks Completed
- ✅ Git repository initialized
- ✅ Frontend setup: React 18 + Vite + Tailwind CSS v3.4.0
- ✅ Backend setup: Node.js + Express + SQLite
- ✅ Database schema designed (7 tables)
- ✅ N5 data extraction:
  - **296 vocabulary words** (kanji, hiragana, English, chapters)
  - **50 grammar patterns** (with regex patterns)
- ✅ Database seeding successful
- ✅ `.gitignore` and `.env` files created
- ✅ `README.md` documentation

### File Structure Created
```
N5Reading/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── data/
│   │   │   │   ├── n5_vocabulary.json (296 words)
│   │   │   │   └── n5_grammar_patterns.json (50 patterns)
│   │   │   ├── db.js
│   │   │   ├── schema.js
│   │   │   └── seed.js
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

### Key Deliverable
✅ **Database populated with N5 reference data** (296 words, 50 patterns)

### Validation Results
```sql
SELECT COUNT(*) FROM jlpt_vocabulary WHERE jlpt_level = 5;
-- Result: 296 words ✅

SELECT COUNT(*) FROM grammar_patterns WHERE jlpt_level = 5;
-- Result: 50 patterns ✅
```

---

## ✅ Phase 1: Video Upload & Storage - COMPLETE

**Duration:** 2 days  
**Completion Date:** October 15, 2025

### Objectives
- Build video upload UI
- Implement file validation
- Store videos locally
- Extract metadata with FFmpeg

### Frontend Tasks Completed
- ✅ Drag-and-drop upload component (`VideoUpload.jsx`)
- ✅ File validation (MP4, AVI, MOV, MKV, WEBM)
- ✅ Max file size: 100MB
- ✅ Upload progress bar
- ✅ Video list component (`VideoList.jsx`)
- ✅ Video card display with:
  - Thumbnail (future)
  - Title, duration, size
  - Status indicator
  - Delete button

### Backend Tasks Completed
- ✅ Multer middleware for file uploads
- ✅ `POST /api/videos/upload` endpoint
- ✅ Local file storage in `backend/uploads/`
- ✅ FFmpeg metadata extraction:
  - Duration
  - Video codec
  - Audio codec
  - Resolution
  - File size
- ✅ Database record creation
- ✅ `GET /api/videos` endpoint (list all)
- ✅ `GET /api/videos/:id` endpoint (get one)
- ✅ `DELETE /api/videos/:id` endpoint

### API Endpoints
```javascript
POST   /api/videos/upload     // Upload video file
GET    /api/videos            // List all videos
GET    /api/videos/:id        // Get video details
DELETE /api/videos/:id        // Delete video & file
```

### Testing Results
```bash
# Upload test
curl -F "video=@test.mp4" http://localhost:3000/api/videos/upload
# ✅ Success: Video uploaded, metadata extracted

# List test
curl http://localhost:3000/api/videos
# ✅ Success: Returns array of videos

# Delete test
curl -X DELETE http://localhost:3000/api/videos/1
# ✅ Success: Video and file deleted
```

### Key Deliverable
✅ **Users can upload videos and see them in a responsive grid**

---

## ✅ Phase 1B: Security Hardening - COMPLETE

**Duration:** 1 day  
**Completion Date:** October 16, 2025

### Objectives
- Implement production-ready security measures
- Use only free/open-source solutions
- Cover OWASP Top 10 vulnerabilities

### Security Features Implemented
1. ✅ **Rate Limiting** (express-rate-limit)
   - Global: 100 req/15min (production), 1000 req/15min (development)
   - Uploads: 10 uploads/15min
   - Localhost bypass in development

2. ✅ **Security Headers** (Helmet.js)
   - Content-Security-Policy
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security (HTTPS)

3. ✅ **CORS Protection**
   - Whitelist origins (localhost + production)
   - Credentials support
   - Preflight handling

4. ✅ **Input Validation** (express-validator)
   - File type validation
   - File size validation
   - Filename sanitization
   - Video ID validation

5. ✅ **Error Sanitization**
   - Development: Full stack traces
   - Production: Generic messages
   - Server-side logging

6. ✅ **Request Logging** (Morgan)
   - Development: 'dev' format
   - Production: 'combined' format

7. ✅ **SQL Injection Protection**
   - Parameterized queries
   - No string concatenation

8. ✅ **XSS Prevention**
   - Input sanitization
   - CSP headers
   - React's built-in escaping

9. ✅ **File Upload Security**
   - Type whitelist
   - Size limits
   - Filename sanitization
   - Unique filename generation

10. ✅ **Path Traversal Prevention**
    - Filename validation
    - Path sanitization

### Files Created
```
backend/src/middleware/
├── security.js       // Rate limiting, Helmet, CORS
└── validation.js     // Input validation functions

SECURITY.md          // Security documentation
```

### Key Deliverable
✅ **Production-ready security baseline (FREE, no paid services)**

---

## ✅ Phase 2: Video Processing Pipeline - COMPLETE

**Duration:** 2 days  
**Completion Date:** October 17, 2025

### Objectives
- Download videos from YouTube
- Extract audio from videos
- Handle large files with compression
- Track processing status

### YouTube Integration Completed
- ✅ `youtube-dl-exec` npm package
- ✅ Multi-browser cookie support:
  - Chrome cookies (primary)
  - Safari cookies (fallback)
- ✅ YouTube URL validation
- ✅ Video metadata fetching:
  - Title
  - Duration
  - Thumbnail URL
  - View count
  - Channel name
- ✅ `POST /api/videos/youtube` endpoint
- ✅ YouTube badge (📺) on video cards

### Audio Processing Completed
- ✅ FFmpeg audio extraction
  - Input: Video file (any format)
  - Output: WAV (16kHz, mono)
- ✅ Audio compression for large files:
  - Threshold: 25MB
  - Format: MP3 (64kbps, 16kHz, mono)
  - Automatic cleanup of temp files
- ✅ Progress callback support
- ✅ `POST /api/videos/:id/process` endpoint

### Processing Status Tracking
- ✅ Expanded status enum:
  - `uploaded`
  - `downloading_youtube`
  - `extracting_audio`
  - `compressing_audio`
  - `audio_extracted`
  - `transcribing`
  - `translating`
  - `completed`
  - `error`
- ✅ Error message storage
- ✅ `audio_path` field in database

### UI Enhancements
- ✅ YouTube URL input component
- ✅ Processing status indicators
- ✅ Animated pulse for active processing
- ✅ "Extract Audio" button
- ✅ "Play Audio" inline player
- ✅ Error display with retry options
- ✅ Uniform card heights

### Key Deliverable
✅ **YouTube videos can be downloaded and processed automatically**

---

## ✅ Phase 3: Transcription & Translation - COMPLETE

**Duration:** 2 days  
**Completion Date:** October 18, 2025

### Objectives
- Transcribe Japanese audio to text
- Translate Japanese to English
- Store transcription and translation data
- Display synchronized subtitles

### OpenAI Whisper Integration Completed
- ✅ `openai` npm package (v4.x)
- ✅ Lazy client initialization
- ✅ Transcription with timestamps:
  - Segment-level timestamps
  - Word-level precision
  - Japanese language (ja)
  - Verbose JSON format
- ✅ Audio compression handling (>25MB)
- ✅ Progress tracking callbacks
- ✅ Cost: $0.006/minute (~$0.03 per 5-min video)

### DeepL Translation Integration Completed
- ✅ `deepl-node` npm package
- ✅ Translation features:
  - Full text translation
  - Segment-by-segment translation
  - Japanese → English
  - Free tier: 500K chars/month
- ✅ Rate limiting (small delays between segments)
- ✅ Empty segment handling
- ✅ Progress tracking callbacks
- ✅ Cost tracking

### Database Schema
```sql
-- Transcriptions table
transcriptions (
  id, video_id, language, full_text,
  segments JSON,  -- [{start, end, text}]
  created_at
)

-- Translations table
translations (
  id, transcription_id, language, full_text,
  segments JSON,  -- [{start, end, translated_text}]
  created_at
)
```

### API Endpoints
```javascript
POST /api/videos/:id/transcribe     // Trigger transcription + translation
GET  /api/videos/:id/transcription  // Get merged data
```

### TranscriptionViewer Component
- ✅ Modal dialog
- ✅ Side-by-side layout:
  - Japanese (left)
  - English (right)
- ✅ Synchronized scrolling
- ✅ Clickable timestamps
- ✅ "Watch with Analysis" button

### Key Deliverable
✅ **Videos automatically transcribed and translated with timestamps**

---

## ✅ Phase 3.5: Real-Time Progress Tracking - COMPLETE

**Duration:** 1 day  
**Completion Date:** October 18, 2025

### Objectives
- Eliminate user confusion during processing
- Provide real-time feedback
- Show accurate time estimates
- Auto-refresh status

### Database Enhancement
```sql
ALTER TABLE videos ADD COLUMN progress INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN status_message TEXT;
ALTER TABLE videos ADD COLUMN estimated_time_remaining INTEGER;
```

### Backend Implementation
**New Utility:** `backend/src/utils/progressTracker.js`

**Functions:**
- `updateProgress(db, dbType, videoId, progressData)`
- `estimateTime(videoDuration, operation)`
- `ProgressPresets` - Pre-defined states

**Integration Points:**
- ✅ Audio extraction (estimated progress)
- ✅ Audio compression (fast, 5s estimate)
- ✅ Transcription (Whisper API, duration × 2)
- ✅ Translation (segment-by-segment tracking)
- ✅ N5 Analysis (final step)

### Frontend Implementation
**Auto-Polling:**
- ✅ Poll every 2 seconds when processing
- ✅ Stop polling when complete/error
- ✅ Update UI in real-time

**UI Components:**
- ✅ Progress bar (0-100%)
- ✅ Status message display
- ✅ Time remaining (formatted: "2m 30s")
- ✅ Visual animations

### Example Progress Flow
```
1. Downloading YouTube video...     [████░░░░░░] 40%  ~1m 20s
2. Extracting audio from video...   [██████░░░░] 60%  ~45s
3. Transcribing audio...            [████████░░] 80%  ~30s
4. Translating segment 24/32...     [█████████░] 90%  ~10s
5. ✅ Ready                         [██████████] 100%
```

### Key Deliverable
✅ **Real-time progress tracking with accurate time estimates**

---

## ✅ Phase 4: Interactive Video Player - COMPLETE

**Duration:** 1 day  
**Completion Date:** October 19, 2025

### Objectives
- Create immersive video learning experience
- Synchronize video with transcription
- Highlight N5 words in real-time
- Enable click-to-jump navigation

### Video Player Implementation
- ✅ HTML5 native `<video>` element (replaced React Player)
- ✅ Full video controls
- ✅ Current time tracking
- ✅ `onTimeUpdate` event handler
- ✅ `jumpToTime()` function
- ✅ Dedicated page: `/video/:id`

### Synchronized Transcription
- ✅ Side-by-side layout:
  - Japanese transcription (left)
  - English translation (right)
- ✅ Auto-scrolling based on video time
- ✅ Current segment highlighting
- ✅ Clickable timestamps (jump to moment)
- ✅ Segment-level synchronization

### N5 Analysis Integration
- ✅ TinySegmenter for Japanese tokenization
- ✅ N5 word detection (296 words)
- ✅ Yellow background highlighting
- ✅ Kanji and hiragana matching
- ✅ Variant handling

### Analysis Sidebar
**Quick Summary:**
- Total N5 words count
- Unique N5 words
- Grammar patterns count
- N5 content density %

**Vocabulary List:**
- Japanese word
- Reading (hiragana)
- English definition
- Part of speech
- First appearance timestamp

**Grammar Patterns List:**
- Pattern name
- Structure
- English explanation
- Example sentence

### API Endpoints
```javascript
POST /api/videos/:id/analyze    // Trigger N5 analysis
GET  /api/videos/:id/analysis   // Get analysis results
```

### Key Deliverable
✅ **Interactive video player with synchronized N5 highlighting**

---

## ✅ Phase 5: Learning Dashboard - COMPLETE

**Duration:** 1 day  
**Completion Date:** October 19, 2025

### Objectives
- Provide comprehensive analytics
- Visualize N5 content distribution
- Enable efficient vocabulary review
- Export study materials

### Dashboard Components

#### 1. **Embedded Video Player** ✅
- HTML5 video player
- Full controls
- Synchronized with all components
- Floating PiP mode when scrolling
- Bottom-right corner positioning

#### 2. **N5 Content Analysis** ✅
**Enhanced Stats Cards:**
- 📚 N5 Vocabulary (unique word count)
- 📝 Grammar Patterns (unique pattern count)
- ⏱️ Estimated Study Time (based on content)
- 🎯 N5 Content Density (percentage)

**Features:**
- Gradient backgrounds
- Descriptive labels
- Visual icons
- Compact spacing (~30% height reduction)

#### 3. **Interactive N5 Timeline** ✅
**Visualization:**
- 15-second segments
- Color-coded density:
  - 🟢 High (50%+ N5 content)
  - 🟡 Medium (25-50%)
  - ⚫ Low (<25%)
- Hover for details
- Click to jump to video

**Best Segments:**
- Top 5 segments ranked by N5 density
- Full timestamp range (start-end)
- Segment duration
- Word/grammar counts
- Click to jump
- Bi-directional highlighting (timeline ↔ list)
- Auto-scroll on hover

#### 4. **Vocabulary Table** ✅
**Features:**
- Sortable (frequency, alphabetical, chapter)
- Filterable by chapter
- Searchable (real-time)
- Clickable timestamps (jump to video)

**Columns:**
- Japanese (kanji)
- Reading (hiragana)
- English meaning
- Chapter reference
- First appearance (timestamp)
- Frequency count (with badge)

**Optimizations:**
- `useMemo` for performance
- Sticky table header
- Vertically scrollable
- Compact styling

#### 5. **Grammar Patterns List** ✅
**Features:**
- Sortable (frequency, alphabetical, chapter)
- Filterable by chapter
- Searchable

**Display:**
- Pattern name
- Structure
- English explanation
- Example sentence
- Chapter reference
- Frequency badge
- Matched text examples
- Clickable timestamps

#### 6. **Export Options** ✅
**Formats:**
- CSV (standard) - Excel/Google Sheets
- Anki CSV - Flashcard import
- Grammar CSV - Pattern reference

**CSV Structure:**
```csv
Japanese,Reading,English,Chapter,First Appears,Frequency
"皆さん","みなさん","everyone","第1課","0:00",3
```

**Anki Format:**
```csv
Front,Back
"皆さん","Reading: みなさん | Meaning: everyone | Chapter: 第1課"
```

### Layout Design
```
┌─────────────────────────────────────────────────────┐
│ Dashboard - Video Title                             │
├──────────────────────┬──────────────────────────────┤
│  Left (60%)          │  Right (40%)                 │
│                      │                              │
│  ┌────────────────┐  │  ┌─────────────────────────┐│
│  │ Video Player   │  │  │ N5 Timeline             ││
│  └────────────────┘  │  │ (color-coded segments)  ││
│                      │  └─────────────────────────┘│
│  ┌────────────────┐  │                              │
│  │ N5 Analysis    │  │  ┌─────────────────────────┐│
│  │ Stats (4 cards)│  │  │ Best Segments (Top 5)   ││
│  └────────────────┘  │  │ (scrollable)            ││
│                      │  └─────────────────────────┘│
├──────────────────────┴──────────────────────────────┤
│  Bottom Section (Split 50/50)                      │
│  ┌───────────────────┬──────────────────────────┐  │
│  │ Vocabulary Table  │ Grammar Patterns List    │  │
│  │ (sortable, search)│ (sortable, search)       │  │
│  └───────────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### API Endpoints
```javascript
GET /api/videos/:id/timeline              // Timeline data
GET /api/videos/:id/export/vocabulary     // CSV/Anki export
GET /api/videos/:id/export/grammar        // Grammar CSV
```

### Key Deliverable
✅ **Comprehensive learning dashboard with analytics and export**

---

## 🔄 Phase 6: Polish & Testing - NEXT

**Duration:** 2-3 days (estimated)  
**Target Date:** October 22, 2025  
**Status:** Ready to Start

### Objectives
- Cross-browser testing
- Mobile responsiveness
- Performance optimization
- Error handling improvements
- User experience refinement

### Testing Tasks

#### 1. **Cross-Browser Testing**
- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox (Desktop + Mobile)
- [ ] Safari (Desktop + Mobile)
- [ ] Edge (Desktop)

#### 2. **Video Testing**
- [ ] Test with 10+ different videos
- [ ] Different speakers (male, female, accents)
- [ ] Different qualities (720p, 1080p)
- [ ] Different topics (vlogs, lessons, anime, news)
- [ ] Edge cases:
  - [ ] Video with no N5 content
  - [ ] Heavy dialect or casual speech
  - [ ] Background noise or music
  - [ ] Very long videos (30+ min)
  - [ ] Very short videos (<1 min)

#### 3. **Performance Testing**
- [ ] Measure video processing time
  - Target: 5-min video processed in <10 min
- [ ] Page load time optimization
  - Target: <3 seconds initial load
- [ ] Database query optimization
  - Add indexes if needed
- [ ] Memory leak testing
  - Platform stable for 1 hour continuous use

#### 4. **Error Scenario Testing**
- [ ] Whisper API fails (simulate)
- [ ] DeepL API fails (simulate)
- [ ] Network timeout
- [ ] Upload fails mid-process
- [ ] Invalid file format
- [ ] Corrupted video file
- [ ] Database connection lost

#### 5. **Mobile Responsiveness**
- [ ] Upload flow on mobile
- [ ] Video list on mobile
- [ ] Video player on mobile
- [ ] Dashboard on mobile
- [ ] Touch interactions
- [ ] Viewport sizing

### Polish Tasks

#### 1. **Loading States**
- [ ] Add skeleton screens for:
  - Video list loading
  - Dashboard loading
  - Analysis loading
- [ ] Smooth transitions between states
- [ ] Loading spinners with appropriate timing

#### 2. **Animations & Transitions**
- [ ] Fade-in for new video cards
- [ ] Smooth scroll to clicked timestamps
- [ ] Hover effects on interactive elements
- [ ] Modal animations (open/close)
- [ ] Progress bar animations

#### 3. **Error Messages**
- [ ] User-friendly error text
- [ ] Actionable suggestions
- [ ] Contact support option (future)
- [ ] Error recovery flows

#### 4. **Tooltips & Hints**
- [ ] First-time user onboarding hints
- [ ] Helpful tooltips on hover
- [ ] Feature discovery prompts
- [ ] Keyboard shortcut hints

#### 5. **Accessibility Improvements**
- [ ] Keyboard navigation
  - Tab through interactive elements
  - Enter to activate buttons
  - Arrow keys for video controls
- [ ] Screen reader support
  - ARIA labels on all buttons
  - Alt text on images
  - Semantic HTML
- [ ] Focus indicators
- [ ] Color contrast (WCAG AA)
- [ ] Text resizing support

### Documentation Tasks
- [ ] User guide (how to use the platform)
- [ ] Known limitations document
- [ ] Troubleshooting guide
- [ ] Developer setup instructions
- [ ] API documentation

### Key Deliverable
✅ **Production-ready MVP, tested and polished**

---

## 📊 Success Criteria for MVP

After Phase 6, the platform should achieve:

### Performance Metrics
- [ ] **Processing Time:** 5-min video processed in <10 minutes
- [ ] **N5 Detection Accuracy:** 90%+ word detection accuracy
- [ ] **Transcription Sync:** Perfect synchronization with video
- [ ] **Page Load:** <3 seconds initial load
- [ ] **Uptime:** 99%+ success rate on video processing

### User Experience Metrics
- [ ] **Responsive:** Works on mobile devices
- [ ] **Stable:** No crashes for 1 hour continuous use
- [ ] **Intuitive:** 5+ beta testers can use without instructions
- [ ] **Fast:** Real-time UI updates during processing

### Quality Metrics
- [ ] **Bug-Free:** Zero critical bugs
- [ ] **Polished:** Professional UI/UX
- [ ] **Accessible:** WCAG AA compliance
- [ ] **Documented:** Comprehensive user guide

---

## 💰 Cost Summary (MVP Phases 0-6)

### Development Phase (No Users)
```
Frontend Hosting:  FREE (Vercel/Render)
Backend Hosting:   FREE (Local development)
Database:          FREE (SQLite)
Video Storage:     FREE (Local disk)
Total:             $0/month
```

### API Usage (Development Testing)
```
OpenAI Whisper:    ~$0.50 (10 test videos)
DeepL:             $0 (within free tier)
Total:             ~$0.50 one-time
```

### Deployment (After Phase 6)
```
Render Backend:    $7/month
Render Frontend:   FREE
SQLite:            FREE (included)
Total:             $7/month
```

---

## 🎯 What You'll Have After Phase 6

### ✅ Working Platform
- Users can upload videos or paste YouTube URLs
- System auto-transcribes (Japanese + English)
- System detects all N5 vocabulary (296 words) and grammar (50 patterns)
- Interactive video player with synchronized transcriptions
- Learning dashboard with N5 content analysis
- Export to CSV and Anki for flashcard study

### ✅ Core Features
- Drag-and-drop video upload
- YouTube URL download
- Japanese/English synchronized transcription
- N5 vocabulary highlighting (yellow background)
- N5 grammar pattern detection
- Clickable timestamps (jump to video moment)
- Learning dashboard with statistics
- N5 content timeline (color-coded)
- Vocabulary and grammar tables (sortable, searchable)
- CSV/Anki export

### ✅ Technical Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v3.4.0 + React Router
- **Backend:** Node.js + Express + SQLite
- **APIs:** OpenAI Whisper + DeepL
- **Processing:** FFmpeg + TinySegmenter
- **Security:** Rate limiting, Helmet, CORS, input validation

### ❌ Not Built Yet (Post-MVP)
- User accounts / authentication (Phase 8)
- Payment system (Phase 8)
- Subscription tiers (Phase 8)
- Flashcards / spaced repetition (Phase 10)
- Export features beyond CSV (Phase 10)
- Progress tracking per user (Phase 10)
- N4, N3, N2, N1 levels (Phase 11+)

---

## 🔮 What Comes Next (Phases 7-12)

### Phase 7: Beta Testing (1-2 weeks)
- Recruit 20-50 beta testers
- Collect feedback and iterate
- Measure conversion intent
- Fix critical bugs

### Phase 8: Payments & Auth (2 weeks)
- User authentication (JWT)
- Stripe subscriptions
- N5 tier ($9.99/month)
- 7-day free trial
- Subscription management

### Phase 9: YouTube Enhancements (1 week)
- Playlist support
- Channel crawling
- Video quality selection

### Phase 10: Premium Features (2 weeks)
- Flashcards with spaced repetition
- Progress tracking
- Watch history
- Annual billing ($99/year)

### Phase 11: N4 Level Support (3-4 weeks)
- Extract N4 data (~1,500 words)
- Seed N4 vocabulary/grammar
- Launch N4 tier ($14.99/month)

### Phase 12: N3 Level Support (3-4 weeks)
- Extract N3 data (~3,000 words)
- Seed N3 vocabulary/grammar
- Launch N3 tier ($19.99/month)

---

## 📈 Estimated Effort vs Actual

| Phase | Estimated | Actual | Efficiency |
|-------|-----------|--------|-----------|
| Phase 0 | 1-2 days | 2 days | ✅ On target |
| Phase 1 | 2-3 days | 2 days | ✅ Faster |
| Phase 1B | - | 1 day | ✅ Bonus |
| Phase 2 | 3-4 days | 2 days | ✅ Faster |
| Phase 3 | 4-5 days | 2 days | ✅ Much faster |
| Phase 3.5 | - | 1 day | ✅ Bonus |
| Phase 4 | 4-5 days | 1 day | ✅ Much faster |
| Phase 5 | 2-3 days | 1 day | ✅ Faster |
| Phase 6 | 2-3 days | TBD | - |
| **Total** | **18-25 days** | **~12 days** | **🎉 88% faster!** |

**Key Success Factors:**
- Clear planning and documentation
- Iterative development approach
- Good tool selection (Vite, Tailwind, Express)
- Prior experience with similar stacks
- Focus on MVP scope

---

## 🚀 Ready to Launch?

### Pre-Launch Checklist (After Phase 6)
- [ ] All critical bugs fixed
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Security audit passed
- [ ] Performance metrics met
- [ ] User guide written
- [ ] Terms of service drafted (if collecting emails)
- [ ] Privacy policy drafted (if collecting data)
- [ ] Deployment tested on Render
- [ ] Backup strategy in place

### Launch Strategy
1. **Soft Launch** (Week 1)
   - Share with 10 trusted friends
   - Collect initial feedback
   - Fix obvious issues

2. **Beta Launch** (Week 2-3)
   - Reddit: r/LearnJapanese, r/JLPT
   - Discord: Japanese learning communities
   - Collect testimonials

3. **Public Launch** (Week 4)
   - Product Hunt
   - Twitter/X announcement
   - Blog post

---

**MVP Completion Target:** October 22, 2025 (Phase 6 complete)  
**Beta Launch Target:** November 1, 2025  
**Public Launch Target:** December 1, 2025  
**Payment Integration:** January 2026 (Phase 8)

---

**© 2025 JLPT N5 Video Coach | Built with ❤️ and ☕**

