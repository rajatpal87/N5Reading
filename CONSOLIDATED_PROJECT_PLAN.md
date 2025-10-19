# 📋 JLPT N5 Video Coach - Consolidated Project Plan

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** Phase 5 Complete, Production Ready

---

## 📌 Executive Summary

### What We're Building
A web-based platform that transforms any Japanese video into an interactive JLPT N5 learning experience by automatically transcribing, analyzing, and highlighting N5 vocabulary and grammar patterns with synchronized translations.

### Core Value Proposition
- ✅ Upload any Japanese video (or YouTube URL)
- ✅ Automatic transcription (Japanese + English)
- ✅ AI-powered N5 vocabulary detection (296 words)
- ✅ Grammar pattern recognition (50 patterns)
- ✅ Interactive video player with synchronized highlighting
- ✅ Learning dashboard with analytics
- ✅ Export to Anki/CSV for flashcard study

### Current Status
**Completed Phases:**
- ✅ Phase 0: Setup & Data Preparation
- ✅ Phase 1: Video Upload & Storage
- ✅ Phase 1B: Security Hardening
- ✅ Phase 2: Video Processing Pipeline (YouTube + Audio)
- ✅ Phase 3: Transcription & Translation (OpenAI Whisper + DeepL)
- ✅ Phase 3.5: Progress Tracking
- ✅ Phase 4: Interactive Video Player
- ✅ Phase 5: Learning Dashboard

**Next Steps:**
- Phase 6: Polish & Testing
- Phase 7: Beta Testing
- Phase 8: Payments & Authentication

---

## 🎯 Product Vision

### Problem Statement
Japanese language learners struggle to:
- Find authentic content at their level
- Understand native speaker video content
- Track what vocabulary and grammar they know
- Practice with real-world materials

### Solution
An automated video analysis platform that:
1. Identifies all N5-level content in any video
2. Provides synchronized Japanese/English transcription
3. Highlights learnable content with clickable definitions
4. Tracks learning progress
5. Exports vocabulary for spaced repetition

### Target Audience
- **Primary:** JLPT N5 learners (complete beginners)
- **Secondary:** Self-study learners
- **Tertiary:** Japanese language teachers

### Unique Selling Points
1. **Automated Analysis** - No manual work required
2. **Any Video Source** - Upload files or paste YouTube URLs
3. **JLPT-Specific** - Tailored to exam preparation
4. **Export-Friendly** - Works with Anki and other tools
5. **Multi-Tier Growth** - Progressive learning path N5→N4→N3→N2→N1

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS v3.4.0
- **State Management:** React Context API
- **Routing:** React Router v6
- **Video Player:** HTML5 native `<video>` element
- **HTTP Client:** Axios
- **Build Tool:** Vite (fast HMR, optimized builds)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQLite (MVP) → PostgreSQL (Production)
- **File Upload:** Multer
- **Video Processing:** FFmpeg
- **Background Jobs:** Planned (Bull + Redis)
- **Japanese NLP:** TinySegmenter

### External APIs
- **Transcription:** OpenAI Whisper API ($0.006/minute)
- **Translation:** DeepL API (500K chars/month free)
- **Video Download:** `youtube-dl-exec` (yt-dlp wrapper)

### Security
- **Rate Limiting:** express-rate-limit (1000 req/15min dev, 100 req/15min prod)
- **Security Headers:** Helmet.js
- **CORS Protection:** cors middleware
- **Input Validation:** express-validator
- **Request Logging:** Morgan
- **Error Sanitization:** Custom middleware

### Deployment (Planned)
- **Platform:** Render.com
- **Frontend:** Static site (FREE)
- **Backend:** Web service ($7/month)
- **Database:** PostgreSQL ($7/month)
- **Cost:** $13-19/month total
- **SSL:** Free Let's Encrypt
- **Domain:** Custom domain ready

---

## 📊 Current Feature Set

### ✅ Implemented Features

#### 1. Video Management
- Drag-and-drop video upload (MP4, AVI, MOV, MKV, WEBM)
- YouTube URL download with `yt-dlp`
- Multi-browser cookie support (Chrome, Safari) for YouTube
- Video metadata extraction (duration, size, format)
- Video list with thumbnails
- Video deletion

#### 2. Video Processing
- FFmpeg audio extraction (WAV 16kHz mono)
- Audio compression for large files (>25MB → MP3 64kbps)
- Progress tracking with real-time updates
- Status indicators (downloading, extracting, transcribing, translating, analyzing, completed)
- Estimated time remaining
- Error recovery with retry buttons

#### 3. Transcription & Translation
- OpenAI Whisper API integration (Japanese speech-to-text)
- Segment-level timestamps
- DeepL API integration (Japanese → English)
- Lazy API client initialization
- Comprehensive error handling
- Cost tracking

#### 4. N5 Analysis
- TinySegmenter Japanese tokenization
- N5 vocabulary detection (296 words)
  - Kanji and hiragana matching
  - Variant handling
  - Frequency counting
  - First appearance tracking
- N5 grammar pattern detection (50 patterns)
  - Regex-based matching
  - Occurrence tracking
- N5 density calculation
- Timeline generation (15-second segments)

#### 5. Interactive Video Player
- HTML5 video player with full controls
- Synchronized transcription (Japanese + English side-by-side)
- N5 word highlighting (yellow background)
- Auto-scrolling transcription
- Clickable timestamps (jump to moment)
- Current segment tracking
- Analysis sidebar with:
  - Quick summary stats
  - N5 vocabulary list
  - Grammar patterns list

#### 6. Learning Dashboard
- Embedded video player
- N5 Content Analysis stats (descriptive cards):
  - 📚 N5 Vocabulary count
  - 📝 Grammar Patterns count
  - ⏱️ Study Time estimate
  - 🎯 N5 Density percentage
- Interactive N5 Content Timeline:
  - Color-coded segments (low/medium/high N5 density)
  - Clickable segments (jump to video)
  - Bi-directional highlighting with best segments
  - Auto-scroll on hover
- Best Segments for Study:
  - Top 5 segments ranked by N5 density
  - Full timestamp range display
  - Segment duration
  - Word/grammar counts
  - Click to jump to video
- Side-by-side Vocabulary & Grammar Tables:
  - Real-time search/filter/sort
  - Chapter filtering
  - Frequency sorting
  - Clickable timestamps
  - Full N5 data display
- Export Options:
  - CSV format (vocabulary/grammar)
  - Anki deck format

#### 7. UI/UX Enhancements
- Responsive design (mobile + desktop)
- Side-by-side layout (upload left, video list right)
- Compact component spacing
- Loading states with skeleton screens
- Progress bars and spinners
- Error messages with recovery options
- Floating video player (picture-in-picture on scroll)
- Sticky table headers
- Auto-polling for processing status
- Gradient backgrounds for stats
- Hover effects and transitions

#### 8. Security Features
- Rate limiting (development: 1000 req/15min, production: 100 req/15min)
- Security headers (CSP, XSS protection, clickjacking prevention)
- CORS restrictions (whitelist origins)
- Input validation and sanitization
- File upload validation (type, size)
- SQL injection protection (parameterized queries)
- Error sanitization (no stack traces in production)
- Request logging
- Path traversal prevention

---

## 🗄️ Database Schema

### Core Tables (Implemented)

#### videos
```sql
CREATE TABLE videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  duration REAL,
  status TEXT DEFAULT 'uploaded' CHECK(status IN (
    'uploaded', 'processing', 'audio_extracted', 
    'transcribing', 'translating', 'completed', 'error',
    'downloading_youtube', 'extracting_audio', 'compressing_audio'
  )),
  audio_path TEXT,
  youtube_url TEXT,
  error_message TEXT,
  progress INTEGER DEFAULT 0,
  status_message TEXT,
  estimated_time_remaining INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### jlpt_vocabulary
```sql
CREATE TABLE jlpt_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kanji TEXT,
  hiragana TEXT NOT NULL,
  romaji TEXT,
  english TEXT NOT NULL,
  part_of_speech TEXT,
  chapter TEXT,
  jlpt_level INTEGER NOT NULL DEFAULT 5,
  variants TEXT, -- JSON array for alternative forms
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### grammar_patterns
```sql
CREATE TABLE grammar_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_name TEXT NOT NULL,
  pattern_structure TEXT NOT NULL,
  pattern_regex TEXT,
  english_explanation TEXT,
  example_japanese TEXT,
  chapter TEXT,
  jlpt_level INTEGER NOT NULL DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### transcriptions
```sql
CREATE TABLE transcriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  language TEXT DEFAULT 'ja',
  full_text TEXT,
  segments TEXT, -- JSON array of {start, end, text}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
```

#### translations
```sql
CREATE TABLE translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transcription_id INTEGER NOT NULL,
  language TEXT DEFAULT 'en',
  full_text TEXT,
  segments TEXT, -- JSON array of {start, end, translated_text}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE
);
```

#### vocabulary_instances
```sql
CREATE TABLE vocabulary_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transcription_id INTEGER NOT NULL,
  word_id INTEGER NOT NULL,
  matched_text TEXT NOT NULL,
  start_time REAL,
  end_time REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES jlpt_vocabulary(id)
);
```

#### detected_grammar
```sql
CREATE TABLE detected_grammar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transcription_id INTEGER NOT NULL,
  pattern_id INTEGER NOT NULL,
  matched_text TEXT NOT NULL,
  position_in_text INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (pattern_id) REFERENCES grammar_patterns(id)
);
```

### Future Tables (Phase 8+)

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  max_jlpt_level INTEGER DEFAULT 5, -- 5=N5, 4=N4, etc.
  trial_start_date DATETIME,
  trial_end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛣️ Development Roadmap

### Completed Phases

#### Phase 0: Setup & Data Preparation ✅
- Git repository initialization
- Frontend setup (React + Vite + Tailwind)
- Backend setup (Node.js + Express + SQLite)
- Database schema design
- N5 data extraction (296 vocabulary, 50 grammar patterns)
- Database seeding

#### Phase 1: Video Upload & Storage ✅
- Drag-and-drop upload UI
- File validation (type, size)
- Upload progress bar
- Video list page with thumbnails
- Multer integration
- FFmpeg metadata extraction
- Video CRUD operations

#### Phase 1B: Security Hardening ✅
- Rate limiting implementation
- Security headers (Helmet.js)
- CORS protection
- Input validation
- Error sanitization
- Request logging

#### Phase 2: Video Processing Pipeline ✅
- YouTube URL download (yt-dlp)
- Multi-browser cookie support
- FFmpeg audio extraction
- Audio compression for large files
- Processing status tracking
- Error handling

#### Phase 3: Transcription & Translation ✅
- OpenAI Whisper API integration
- Segment-level transcription
- DeepL API integration
- Lazy client initialization
- Comprehensive error handling
- Progress tracking enhancements

#### Phase 3.5: Progress Tracking ✅
- Enhanced polling system
- Progress percentage display
- Status messages
- Estimated time remaining
- Granular status states
- Database migration for progress columns

#### Phase 4: Interactive Video Player ✅
- Dedicated video player page
- HTML5 video player (replaced React Player)
- Synchronized transcription display
- N5 word highlighting
- Auto-scrolling
- Click-to-jump timestamps
- Analysis sidebar

#### Phase 5: Learning Dashboard ✅
- Dashboard page implementation
- Embedded video player
- N5 Content Analysis stats (enhanced cards)
- Interactive timeline with color coding
- Best segments recommendation
- Side-by-side vocabulary/grammar tables
- Search/filter/sort functionality
- CSV/Anki export
- Floating video player (PiP)
- Bi-directional highlighting
- Auto-scroll best segments

### Upcoming Phases

#### Phase 6: Polish & Testing (2-3 days)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Error edge cases
- [ ] Loading state improvements
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] User guide documentation
- [ ] Known limitations documentation

#### Phase 7: Beta Testing (1-2 weeks)
- [ ] Recruit 20-50 beta testers
- [ ] Collect feedback
- [ ] Measure conversion intent
- [ ] Fix critical bugs
- [ ] Improve onboarding

#### Phase 8: Payments & Authentication (2 weeks)
- [ ] User authentication (JWT)
- [ ] Sign up/Login pages
- [ ] Stripe integration
- [ ] Subscription tiers (Free, N5 $9.99/month)
- [ ] Trial tracking (7-day free trial)
- [ ] Payment webhooks
- [ ] Subscription management

#### Phase 9: YouTube Enhancements (1 week)
- [ ] YouTube URL validation
- [ ] Playlist support
- [ ] Channel crawling
- [ ] Video quality selection

#### Phase 10: Premium Features (2 weeks)
- [ ] Flashcard system with spaced repetition
- [ ] Progress tracking per user
- [ ] Watch history
- [ ] Vocabulary mastery tracking
- [ ] Annual billing option ($99/year)
- [ ] Advanced analytics

#### Phase 11: N4 Level Support (3-4 weeks)
- [ ] Extract N4 data from PDFs (~1,500 words)
- [ ] Seed N4 vocabulary and grammar
- [ ] Multi-level analysis
- [ ] N4 tier launch ($14.99/month)
- [ ] Upgrade prompts for N5 users

#### Phase 12: N3 Level Support (3-4 weeks)
- [ ] Extract N3 data (~3,000 words)
- [ ] Seed N3 vocabulary and grammar
- [ ] Performance optimization for multi-level
- [ ] N3 tier launch ($19.99/month)

---

## 💰 Business Model

### Monetization Strategy

#### Multi-Tier JLPT Subscriptions (Progressive Pricing)

**Free Tier (After 7-day trial):**
- 2 videos/month
- N5 analysis only
- View all previously processed videos
- Basic dashboard

**N5 Learner - $9.99/month (Phase 8):**
- Unlimited video processing
- N5 level analysis
- Full dashboard access
- CSV/Anki export
- YouTube URL import
- Priority support

**N4 Learner - $14.99/month (Phase 11):**
- Everything in N5
- N4 level analysis
- Dual-level learning

**N3 Learner - $19.99/month (Phase 12):**
- N5 + N4 + N3 analysis
- Advanced intermediate content
- Priority support

**N2 Learner - $24.99/month (Future):**
- N5 + N4 + N3 + N2 analysis

**N1 Master - $29.99/month (Future):**
- ALL JLPT levels (N5→N1)
- API access
- White-label options

#### Annual Billing (Phase 10)
- 17% discount incentive
- N5: $99/year (save $20)
- N4: $149/year (save $30)
- N3: $199/year (save $40)
- N2: $249/year (save $50)
- N1: $299/year (save $60)

### Revenue Projections

**Month 12 (Conservative):**
- 2,000 signups
- 400 paid users (20% conversion)
- $3,996/month revenue
- $800/month costs
- **$2,961/month profit (74% margin)**

**Month 12 (Optimistic with annual):**
- 2,000 signups
- 600 paid users (30% conversion)
- $5,368/month revenue
- **$3,852/month profit (72% margin)**

**Year 1 Total:**
- Conservative: $35,532/year
- Optimistic: $64,416/year

### Key Milestones

| Milestone | Paid Users | Monthly Revenue | Significance |
|-----------|-----------|----------------|--------------|
| Launch | 5 | $50 | Validate pricing |
| Break Even | 20 | $200 | Cover all costs |
| Sustainable | 100 | $1,000 | Part-time viable |
| Full-Time | 400 | $4,000 | Quit day job |
| Scale | 1,000 | $10,000 | Hire team |

---

## 🚀 Go-to-Market Strategy

### Launch Plan

#### Pre-Launch (During Beta - Phase 7)
1. **Build Community**
   - Reddit: r/LearnJapanese, r/JLPT
   - Discord: Japanese learning servers
   - Facebook: JLPT study groups

2. **Content Marketing**
   - Blog: "How to study with authentic videos"
   - YouTube: Tutorial videos
   - Twitter: Tips and progress updates

3. **Beta Testing**
   - 50 beta testers
   - Collect testimonials
   - Refine onboarding

#### Launch (Phase 8)
1. **Product Hunt Launch**
   - Prepare launch page
   - Schedule for Tuesday/Wednesday
   - Coordinate with community

2. **Social Media Blitz**
   - Reddit posts (organic, no spam)
   - Twitter announcement thread
   - Facebook group posts

3. **Influencer Outreach**
   - Japanese learning YouTubers
   - Language learning bloggers
   - JLPT prep channels

### Marketing Channels

**Organic (Free):**
- Content marketing (blog posts)
- SEO optimization
- Reddit/Discord community engagement
- YouTube tutorial videos
- Word of mouth

**Paid (Later):**
- Google Ads (search: "JLPT N5 study")
- Facebook Ads (target: Japanese learners)
- Reddit Ads (r/LearnJapanese)
- YouTube pre-roll ads

---

## 📏 Success Metrics

### Product Metrics
- **Activation Rate:** 70% (users who process 1+ video)
- **Engagement:** 3+ videos processed during trial
- **Conversion Rate:** 15% (trial to paid)
- **Churn Rate:** <5% per month
- **NPS Score:** >50

### Business Metrics
- **Monthly Recurring Revenue (MRR)**
- **Customer Lifetime Value (LTV):** $400-800 (multi-tier)
- **Customer Acquisition Cost (CAC):** <$20
- **LTV:CAC Ratio:** >3:1
- **Monthly Active Users (MAU)**

### Technical Metrics
- **Processing Time:** <10 minutes for 5-min video
- **N5 Detection Accuracy:** >90%
- **Uptime:** >99%
- **Page Load Time:** <3 seconds
- **API Success Rate:** >95%

---

## 🎓 Key Learnings & Decisions

### Technical Decisions

**1. SQLite → PostgreSQL Migration Path**
- Start with SQLite for simplicity
- Design schema for PostgreSQL compatibility
- Easy migration with minimal code changes

**2. HTML5 Video Player over React Player**
- Better reliability
- Simpler implementation
- Full control over functionality

**3. TinySegmenter for Japanese Tokenization**
- Lightweight (~100KB)
- Client-side capable
- Good enough accuracy for N5 level

**4. Lazy API Client Initialization**
- Prevents startup errors if keys missing
- Better error messages
- Easier development

**5. Development-Friendly Rate Limiting**
- 10x higher limits in development
- Localhost bypass
- Production-ready security

### UI/UX Decisions

**1. Side-by-Side Layout**
- Upload section fixed left
- Video list scrollable right
- Better space utilization

**2. Floating Video Player (PiP)**
- Appears when scrolling past main player
- Keeps learning while reviewing data
- Bottom-right position (non-intrusive)

**3. Enhanced N5 Analysis Cards**
- Descriptive labels
- Gradient backgrounds
- Icons for visual recognition
- Sub-labels for context

**4. Bidirectional Highlighting**
- Timeline ↔ Best Segments
- Improves navigation
- Better learning flow

### Architecture Decisions

**1. Monolith First**
- Simpler development
- Easier debugging
- Can extract microservices later

**2. Multi-Tier from Day One**
- Database designed for all JLPT levels
- Easy to add N4, N3, N2, N1 later
- Higher lifetime value

**3. Progress Tracking Early**
- Better UX during long operations
- Reduces perceived wait time
- Enables future optimizations

---

## 🔮 Future Enhancements

### Product Features
- [ ] Video chapters/bookmarks
- [ ] Personal vocabulary lists
- [ ] Study reminders
- [ ] Mobile app (React Native)
- [ ] Chrome extension for YouTube
- [ ] Subtitle file upload (.srt)
- [ ] Multiple language support
- [ ] Community-shared videos
- [ ] Teacher/classroom features

### Technical Improvements
- [ ] Redis background jobs
- [ ] Caching layer
- [ ] CDN for video delivery
- [ ] WebSocket for real-time updates
- [ ] Database read replicas
- [ ] Multi-region deployment
- [ ] API rate limiting per user
- [ ] Advanced analytics

---

## 📚 Documentation Index

- **This Document:** Overall project plan
- **[CONSOLIDATED_MVP_PLAN.md](./CONSOLIDATED_MVP_PLAN.md):** Detailed phase breakdown
- **[CONSOLIDATED_MONETIZATION.md](./CONSOLIDATED_MONETIZATION.md):** Revenue strategy
- **[CONSOLIDATED_ARCHITECTURE.md](./CONSOLIDATED_ARCHITECTURE.md):** Technical architecture
- **[CONSOLIDATED_UI_UX.md](./CONSOLIDATED_UI_UX.md):** Design decisions
- **[CONSOLIDATED_SECURITY.md](./CONSOLIDATED_SECURITY.md):** Security measures
- **[README.md](./README.md):** Quick start guide

---

## ✅ Next Actions

### Immediate (This Week)
1. Complete Phase 6 polish and testing
2. Fix any remaining bugs
3. Optimize performance
4. Write user documentation

### Short-term (Next 2 Weeks)
1. Recruit beta testers
2. Launch beta program
3. Collect feedback
4. Iterate on UX

### Medium-term (Next Month)
1. Prepare payment integration
2. Create pricing page
3. Set up Stripe account
4. Build authentication system

---

**Project Start Date:** October 19, 2025  
**MVP Completion Target:** November 15, 2025  
**Launch Target:** December 1, 2025  
**Break-Even Target:** January 2026  
**Full-Time Viable:** June 2026

---

**© 2025 JLPT N5 Video Coach | Built with ❤️ for Japanese Learners**

