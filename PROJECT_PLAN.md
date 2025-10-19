# JLPT N5 Video Coach - Project Plan

## Executive Summary

A web-based platform that helps Japanese learners study authentic video content by automatically transcribing, analyzing, and highlighting JLPT N5 level vocabulary and grammar patterns with synchronized translations.

**Core Value Proposition**: Transform any Japanese video into an interactive N5 learning experience with vocabulary highlighting, grammar pattern detection, and clickable timestamps.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Monetization Strategy](#monetization-strategy)
4. [Database Schema](#database-schema)
5. [Development Phases](#development-phases)
6. [File Structure](#file-structure)
7. [Key Technical Decisions](#key-technical-decisions)
8. [Japanese Text Processing](#japanese-text-processing)
9. [Kanji Handling Strategy](#kanji-handling-strategy)
10. [Data Sources](#data-sources)
11. [External Services & Costs](#external-services--costs)
12. [Revenue Projections](#revenue-projections)
13. [Future Enhancements](#future-enhancements)

---

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
  - Fast, modern development experience
  - Hot module replacement (HMR)
  - Optimized production builds
- **Video Player**: React Player or Video.js
  - HTML5 video with custom controls
  - Timestamp synchronization
  - Segment navigation
- **Styling**: Tailwind CSS
  - Rapid UI development
  - Utility-first approach
  - Mobile responsive by default
- **State Management**: React Context API
  - Simple, built-in solution
  - No Redux needed for MVP
  - Easy to understand and maintain

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
  - Lightweight and flexible
  - Large ecosystem
  - Easy API development
- **Language**: JavaScript/TypeScript
  - Consistency across stack
  - Strong typing with TypeScript (optional)
- **Security Middleware**: ✅ Implemented
  - `express-rate-limit`: Rate limiting (100 req/15min)
  - `helmet`: Security headers (CSP, XSS protection)
  - `morgan`: Request logging
  - `express-validator`: Input validation & sanitization
  - `cors`: CORS restrictions
- **File Storage**: Local filesystem for MVP
  - Cloud storage (S3/CloudFlare R2) for production
- **Database**: 
  - **MVP**: SQLite (easy setup, no configuration)
  - **Production**: PostgreSQL (easy migration path)

### Processing & Background Jobs
- **Background Jobs**: Bull queue with Redis
  - Reliable job processing
  - Progress tracking
  - Retry mechanisms
- **Video Processing**: FFmpeg
  - Extract audio from video
  - Video segmentation
  - Format conversion

### External APIs
- **Transcription**: OpenAI Whisper API
  - Excellent Japanese speech-to-text
  - Timestamp support
  - Cost: $0.006/minute
- **Translation**: DeepL API or Google Cloud Translation
  - High-quality Japanese to English
  - DeepL: 500K chars/month free tier
- **Video Download**: yt-dlp library
  - Download from YouTube/Vimeo
  - Multiple format support

### Japanese Text Processing
- **Tokenizer**: TinySegmenter or Kuromoji.js
  - **TinySegmenter**: Lightweight, client-side capable
  - **Kuromoji.js**: More accurate, Node.js
  - Handles kanji/hiragana/katakana
  - No spaces needed

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (React SPA)               │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐   │
│  │ Upload  │  │ Video   │  │ Dashboard    │   │
│  │ Page    │  │ Player  │  │ Analytics    │   │
│  └─────────┘  └─────────┘  └──────────────┘   │
└─────────────────────────────────────────────────┘
                     │ REST API
┌─────────────────────────────────────────────────┐
│           BACKEND (Express Server)              │
│  ┌──────────────┐  ┌─────────────────────┐     │
│  │  API Routes  │  │  Processing Queue   │     │
│  │              │  │  (Background Jobs)  │     │
│  └──────────────┘  └─────────────────────┘     │
│  ┌──────────────────────────────────────────┐  │
│  │         N5 Analysis Engine               │  │
│  │  (Vocabulary + Grammar Pattern Matching) │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           │                    │
    ┌──────┴─────┐       ┌─────┴────────┐
    │  Database  │       │ File Storage │
    │  (SQLite)  │       │  (uploads/)  │
    └────────────┘       └──────────────┘
           │
    ┌──────┴────────┐
    │ External APIs │
    │ Whisper/DeepL │
    └───────────────┘
```

### Architecture Type
**Simple Monolith** - Single application server handling all responsibilities
- ✅ Easy to develop and deploy
- ✅ No network latency between services
- ✅ Simple debugging and testing
- ✅ Can be split into microservices later if needed

---

## Monetization Strategy

### Business Model Overview - Multi-Tier JLPT Level Subscriptions

```
┌─────────────────────────────────────────────────────────┐
│ PROGRESSIVE JLPT LEVEL PRICING STRATEGY                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🎁 7-DAY FREE TRIAL                                     │
│    - No credit card required                             │
│    - Full access to N5 analysis (MVP feature)           │
│    - Process unlimited videos                            │
│                                                          │
│ 🆓 FREE TIER (After Trial)                              │
│    - 2 videos/month                                      │
│    - N5 analysis only                                    │
│    - View old videos                                     │
│    - Basic features                                      │
│                                                          │
│ 🥉 N5 LEARNER ($9.99/month)                             │
│    - Unlimited videos                                    │
│    - N5 level analysis                                   │
│    - All core features                                   │
│    - Perfect for beginners                               │
│                                                          │
│ 🥈 N4 LEARNER ($14.99/month) [Phase 11]                │
│    - Everything in N5 Learner                           │
│    - + N4 level analysis                                 │
│    - Dual-level learning                                 │
│    - For intermediate learners                           │
│                                                          │
│ 🥇 N3 LEARNER ($19.99/month) [Phase 12]                │
│    - Everything in N4 Learner                           │
│    - + N3 level analysis                                 │
│    - N5 + N4 + N3 coverage                              │
│    - For advanced intermediate                           │
│                                                          │
│ 💎 N2 LEARNER ($24.99/month) [Future]                  │
│    - Everything in N3 Learner                           │
│    - + N2 level analysis                                 │
│    - N5 + N4 + N3 + N2 coverage                         │
│                                                          │
│ 👑 N1 MASTER ($29.99/month) [Future]                   │
│    - ALL JLPT levels (N5 → N1)                          │
│    - Complete Japanese analysis                          │
│    - Priority support                                    │
│    - API access included                                 │
│                                                          │
│ 💰 ANNUAL BILLING (Phase 10)                            │
│    - N5: $99/year (save $20)                            │
│    - N4: $149/year (save $30)                           │
│    - N3: $199/year (save $40)                           │
│    - N2: $249/year (save $50)                           │
│    - N1: $299/year (save $60)                           │
└─────────────────────────────────────────────────────────┘
```

### Monetization Timeline

#### **MVP (Phases 0-6): No Payments**
- Build core features first
- Focus on product quality
- No payment integration
- All users have full access
- Goal: Validate the concept

#### **Phase 8 (Week 9-10): Add Payments**
- Integrate Stripe
- Implement trial tracking
- Add subscription management
- Enable Pro tier purchases
- Cost: Stripe fees (2.9% + $0.30)

#### **Phase 10 (Week 13-14): Annual Billing**
- Add annual plan ($99/year)
- 17% discount vs monthly
- Reduce churn
- Better cash flow

### Feature Gating Strategy by Subscription Tier

| Feature | Free | N5 ($9.99) | N4 ($14.99) | N3 ($19.99) | N2 ($24.99) | N1 ($29.99) |
|---------|------|------------|-------------|-------------|-------------|-------------|
| **Videos/Month** | 2 | ∞ | ∞ | ∞ | ∞ | ∞ |
| **N5 Analysis** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **N4 Analysis** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **N3 Analysis** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **N2 Analysis** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **N1 Analysis** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Export (Anki/CSV)** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Progress Tracking** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **YouTube Import** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Flashcards** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Progressive Learning Path Strategy

**Why This Works:**
1. **Natural Upgrade Path**: Users advance from N5 → N4 → N3 → N2 → N1 as they learn
2. **Value Alignment**: Advanced learners get more value, pay more
3. **Reduced Churn**: Users stay subscribed as they progress through levels
4. **Clear Differentiation**: Each tier has obvious value (new JLPT level)
5. **Higher LTV**: Average subscription duration increases with learning journey (2-4 years)

**User Journey:**
```
Month 1-6:   N5 Learner ($9.99/mo)  → Master N5 basics
Month 7-12:  Upgrade to N4 ($14.99/mo) → Learn intermediate
Month 13-24: Upgrade to N3 ($19.99/mo) → Advanced intermediate
Month 25-36: Upgrade to N2 ($24.99/mo) → Pre-advanced
Month 37+:   Upgrade to N1 ($29.99/mo) → Mastery
```

**Average Customer Lifetime Value:**
- N5 only: $9.99 × 12 months = $119.88
- Progressive learner: ($9.99×6) + ($14.99×6) + ($19.99×12) = **$389.76** (2 years)
- Dedicated learner: Full journey (3-4 years) = **$600-800 LTV**

### Value Proposition by Tier

#### **Free Tier Value:**
- "Try the platform risk-free"
- "Process 2 Japanese videos every month"
- "Perfect for casual learners"
- **Cost to us**: ~$0.12/month (2 videos × 5 min × $0.006)

#### **Pro Tier Value:**
- "Learn from unlimited content"
- "Export to your favorite tools"
- "Track your progress over time"
- **Value**: Saves 10+ hours/month of manual work
- **Pricing**: Less than 1 textbook ($9.99 vs $30+)

### Conversion Funnel

```
100 Signups (7-day trial)
  ↓
70 Process 1+ videos (70% activation)
  ↓
50 Process 3+ videos (50% engagement)
  ↓
30 Complete trial week (30% retention)
  ↓
10-15 Convert to paid (10-15% conversion)
```

### Revenue Model

**Target Metrics (Month 12):**
- 2,000 total users
- 400 paid subscribers (20% conversion)
- Revenue: 400 × $9.99 = **$3,996/month**
- Costs: ~$800/month
- Net: **$3,200/month** (~80% margin)

### Payment Integration (Phase 8)

**Technology: Stripe**
- Industry standard for SaaS
- Handles subscriptions automatically
- PCI compliance included
- Supports trials, coupons, invoices
- Cost: 2.9% + $0.30 per transaction

**Implementation:**
```javascript
// Stripe subscription plans
const plans = {
  free: {
    price: 0,
    videos_per_month: 2,
    features: ['basic_analysis', 'dashboard']
  },
  pro_monthly: {
    price: 9.99,
    videos_per_month: Infinity,
    features: ['all']
  },
  pro_annual: {
    price: 99,
    videos_per_month: Infinity,
    features: ['all'],
    save: 20
  }
};
```

### Why This Monetization Strategy?

**✅ User-Friendly:**
- No credit card for trial
- Can use free tier forever
- Clear upgrade path

**✅ Sustainable:**
- Free tier costs ~$0.12/user/month
- Pro tier revenue ~$9.99/user/month
- 80%+ profit margin

**✅ Fair Value Exchange:**
- Users see full capability (7 days)
- Free tier provides real value (2 videos/month)
- Pro tier unlocks convenience, not core features

**✅ Scalable:**
- API costs scale linearly
- Stripe handles payment complexity
- Can add more tiers later (Teacher, API access)

---

## Database Schema

### User Management Tables (Added in Phase 8)

```sql
-- Users table (JLPT-level aware)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'trial' CHECK(subscription_tier IN 
    ('trial', 'free', 'n5_monthly', 'n5_annual', 'n4_monthly', 'n4_annual', 
     'n3_monthly', 'n3_annual', 'n2_monthly', 'n2_annual', 'n1_monthly', 'n1_annual')),
  subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'cancelled', 'expired', 'past_due')),
  -- JLPT level access (cumulative: N4 includes N5, N3 includes N5+N4, etc.)
  max_jlpt_level INTEGER DEFAULT 5 CHECK(max_jlpt_level IN (5, 4, 3, 2, 1)), -- 5=N5, 4=N4, 3=N3, 2=N2, 1=N1
  trial_start_date DATETIME,
  trial_end_date DATETIME,
  subscription_start_date DATETIME,
  subscription_end_date DATETIME,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  videos_processed_this_month INTEGER DEFAULT 0,
  monthly_reset_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick tier lookups
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_max_jlpt_level ON users(max_jlpt_level);

-- User progress tracking (JLPT-level aware)
CREATE TABLE user_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  word_id INTEGER NOT NULL,
  jlpt_level INTEGER NOT NULL,  -- Track which level this word belongs to
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'learning', 'known')),
  times_encountered INTEGER DEFAULT 0,
  last_reviewed DATETIME,
  next_review DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES jlpt_vocabulary(id)
);

CREATE INDEX idx_user_vocab_user ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocab_level ON user_vocabulary(user_id, jlpt_level);
CREATE INDEX idx_user_vocab_status ON user_vocabulary(user_id, status);

-- Watch history
CREATE TABLE watch_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  last_position REAL DEFAULT 0, -- seconds
  completed BOOLEAN DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  last_watched DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Subscription events (for analytics)
CREATE TABLE subscription_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT CHECK(event_type IN ('trial_started', 'trial_ended', 'subscribed', 'cancelled', 'renewed', 'upgraded', 'downgraded')),
  from_tier TEXT,
  to_tier TEXT,
  from_jlpt_level INTEGER,  -- Track JLPT level changes
  to_jlpt_level INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX idx_sub_events_type ON subscription_events(event_type);

-- User JLPT level progress (for analytics & recommendations)
CREATE TABLE user_jlpt_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
  words_encountered INTEGER DEFAULT 0,
  words_learning INTEGER DEFAULT 0,
  words_known INTEGER DEFAULT 0,
  total_words_in_level INTEGER NOT NULL,  -- For percentage calculation
  grammar_patterns_encountered INTEGER DEFAULT 0,
  total_patterns_in_level INTEGER NOT NULL,
  videos_processed INTEGER DEFAULT 0,
  last_activity DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, jlpt_level)
);

CREATE INDEX idx_jlpt_progress_user ON user_jlpt_progress(user_id);

-- Calculate mastery percentage: (words_known / total_words_in_level) * 100
-- Trigger upgrade suggestions when user hits 70%+ mastery
```

### Updated Videos Table (Add user ownership)

```sql
-- Add user_id to videos table in Phase 8
ALTER TABLE videos ADD COLUMN user_id INTEGER REFERENCES users(id);

### Videos Table
```sql
CREATE TABLE videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  source TEXT CHECK(source IN ('upload', 'youtube', 'vimeo')),
  source_url TEXT,
  duration INTEGER,  -- in seconds
  status TEXT CHECK(status IN ('processing', 'completed', 'failed')),
  n5_vocab_count INTEGER DEFAULT 0,
  n5_grammar_count INTEGER DEFAULT 0,
  n5_coverage_percentage REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transcriptions Table
```sql
CREATE TABLE transcriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  start_time REAL NOT NULL,  -- seconds
  end_time REAL NOT NULL,    -- seconds
  japanese_text TEXT NOT NULL,
  english_text TEXT,
  has_n5_content BOOLEAN DEFAULT 0,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
```

### JLPT Vocabulary Table (Multi-Level Reference Data)
```sql
-- Renamed from n5_vocabulary to jlpt_vocabulary for extensibility
CREATE TABLE jlpt_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kanji TEXT,
  hiragana TEXT NOT NULL,
  romaji TEXT,
  english TEXT NOT NULL,
  part_of_speech TEXT,
  jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)), -- N5=5, N4=4, N3=3, N2=2, N1=1
  chapter TEXT,  -- Chapter reference (varies by level)
  variants TEXT,  -- JSON array: ["私", "わたし"]
  reading TEXT,   -- Primary reading
  frequency_rank INTEGER,  -- How common the word is (1 = most common)
  pdf_page INTEGER,
  pdf_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX idx_jlpt_level ON jlpt_vocabulary(jlpt_level);
CREATE INDEX idx_variants ON jlpt_vocabulary(variants);
CREATE INDEX idx_kanji ON jlpt_vocabulary(kanji);
CREATE INDEX idx_hiragana ON jlpt_vocabulary(hiragana);
CREATE INDEX idx_jlpt_kanji ON jlpt_vocabulary(jlpt_level, kanji);

-- For MVP: Populate with N5 data only
-- For Phase 11: Add N4 data
-- For Phase 12: Add N3 data
-- Future: Add N2 and N1 data
```

### Vocabulary Instances Table
```sql
CREATE TABLE vocabulary_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transcription_id INTEGER NOT NULL,
  word_id INTEGER NOT NULL,
  position_in_text INTEGER,
  matched_form TEXT,  -- Actual form found in text
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES n5_vocabulary(id)
);
```

### Grammar Patterns Table (Reference Data)
```sql
CREATE TABLE grammar_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_name TEXT NOT NULL,
  pattern_structure TEXT,
  pattern_regex TEXT NOT NULL,
  jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)), -- N5=5, N4=4, N3=3, N2=2, N1=1
  english_explanation TEXT,
  example_japanese TEXT,
  example_english TEXT,
  chapter TEXT,
  difficulty_rank INTEGER,  -- Order within level
  pdf_page INTEGER,
  pdf_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grammar_jlpt_level ON grammar_patterns(jlpt_level);
CREATE INDEX idx_grammar_pattern_name ON grammar_patterns(pattern_name);

-- For MVP: Populate with N5 patterns only
-- For Phase 11: Add N4 patterns
-- For Phase 12: Add N3 patterns
-- Future: Add N2 and N1 patterns
```

### Detected Grammar Table
```sql
CREATE TABLE detected_grammar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transcription_id INTEGER NOT NULL,
  pattern_id INTEGER NOT NULL,
  matched_text TEXT NOT NULL,
  position_in_text INTEGER,
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (pattern_id) REFERENCES grammar_patterns(id)
);
```

---

## Development Phases

### Phase 0: Setup & Data Preparation (1-2 days) ✅ COMPLETE
- [x] Initialize Git repository
- [x] Set up frontend (React + Vite + Tailwind)
- [x] Set up backend (Express + SQLite)
- [x] Extract N5 data from PDFs
- [x] Create JLPT N5 reference database:
  - N5 vocabulary list (296 words)
  - N5 grammar patterns (50 patterns with regex)
- [x] Seed database with reference data

### Phase 1: Video Upload & Storage (2-3 days) ✅ COMPLETE
- [x] Build upload UI with drag-and-drop
- [x] Implement file validation (size, format, type)
- [x] Create video storage system
- [x] Extract video metadata (duration, format, codec)
- [x] Display upload progress bar
- [x] Basic video list page with thumbnails
- [x] Error handling for unsupported formats

### Phase 1B: Security Hardening (1 day) ✅ COMPLETE
- [x] Rate limiting (100 requests/15min per IP)
- [x] Upload rate limiting (10 uploads/15min per IP)
- [x] Security headers (Helmet.js with CSP)
- [x] Request logging (Morgan)
- [x] CORS restrictions (whitelist origins)
- [x] Input validation & sanitization
- [x] Error response sanitization
- [x] Request size limits (10MB JSON, 100MB uploads)
- [x] XSS prevention
- [x] SQL injection protection
- [x] Path traversal prevention
- [x] Comprehensive security documentation

### Phase 2: Transcription Pipeline (3-4 days)
- [ ] Integrate OpenAI Whisper API
  - Send audio to Whisper
  - Receive timestamped transcription
  - Handle API errors and retries
- [ ] Integrate DeepL API for translation
  - Translate each segment
  - Handle character limits
- [ ] Store transcription segments in database
- [ ] Create background job processing system (Bull + Redis)
- [ ] Status updates (queued → processing → completed)
- [ ] WebSocket for real-time progress updates
- [ ] Error recovery and retry logic

### Phase 3: N5 Analysis Engine (4-5 days)
**Vocabulary Detection:**
- [ ] Integrate Japanese tokenizer (TinySegmenter/Kuromoji)
- [ ] Tokenize Japanese text
- [ ] Match tokens against N5 vocabulary database
- [ ] Handle hiragana/kanji variations (e.g., 私/わたし)
- [ ] Store vocabulary instances in database
- [ ] Calculate vocabulary density per segment

**Grammar Pattern Recognition:**
- [ ] Create regex patterns for N5 grammar:
  - です/ます forms
  - Particles (は/が/を/に/へ/で)
  - Verb conjugations (～たい, ～ない, ～た)
  - Basic sentence patterns
- [ ] Match patterns in transcription segments
- [ ] Store detected grammar in database
- [ ] Handle false positives

**Segment Classification:**
- [ ] Calculate N5 density per segment
- [ ] Flag segments with >50% N5 content
- [ ] Calculate overall video N5 coverage

### Phase 4: Interactive Video Player (4-5 days)
- [ ] Build custom video player UI
- [ ] Synchronize transcription display with playback
- [ ] Implement real-time highlighting:
  - Current segment highlighted
  - N5 vocabulary highlighted in yellow
  - Grammar patterns highlighted in green
- [ ] Click-to-seek functionality (timestamp → video position)
- [ ] Dual-pane layout (Japanese | English)
- [ ] Segment navigation controls (prev/next N5 segment)
- [ ] Playback speed control
- [ ] Keyboard shortcuts
- [ ] Furigana display for kanji

### Phase 5: Learning Dashboard (2-3 days)
- [ ] Video summary card with statistics:
  - Total N5 vocabulary count
  - N5 grammar patterns found
  - Study time estimate
  - N5 content coverage percentage
- [ ] N5 vocabulary table with:
  - Word (kanji), reading (hiragana), meaning
  - Chapter reference
  - First appearance timestamp (clickable)
  - Frequency in video
- [ ] Grammar patterns list with examples
- [ ] Interactive timeline showing N5 segments
- [ ] Export vocabulary list (CSV/PDF)
- [ ] Spaced repetition suggestions

### Phase 6: Polish & Testing (2-3 days)
- [ ] Error handling and user feedback
- [ ] Loading states and animations
- [ ] Mobile responsive design
- [ ] Performance optimization (lazy loading, caching)
- [ ] User testing with sample videos
- [ ] Browser compatibility testing
- [ ] Accessibility improvements

**Total Estimated Time: 3-4 weeks for MVP**

---

## File Structure

```
n5-video-coach/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUpload.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── TranscriptionPanel.jsx
│   │   │   ├── VocabularyList.jsx
│   │   │   ├── GrammarList.jsx
│   │   │   ├── VideoSummary.jsx
│   │   │   ├── Timeline.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   └── VideoDetailPage.jsx
│   │   ├── hooks/
│   │   │   ├── useVideoPlayer.js
│   │   │   ├── useTranscription.js
│   │   │   └── useN5Analysis.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── formatTime.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── videos.js
│   │   │   ├── transcriptions.js
│   │   │   ├── analysis.js
│   │   │   ├── vocabulary.js
│   │   │   ├── auth.js               // Added in Phase 8
│   │   │   ├── users.js              // Added in Phase 8
│   │   │   └── subscriptions.js      // Added in Phase 8
│   │   ├── services/
│   │   │   ├── transcriptionService.js
│   │   │   ├── translationService.js
│   │   │   ├── n5AnalysisService.js
│   │   │   ├── videoProcessingService.js
│   │   │   ├── tokenizerService.js
│   │   │   ├── authService.js        // Added in Phase 8
│   │   │   ├── subscriptionService.js // Added in Phase 8
│   │   │   └── stripeService.js      // Added in Phase 8
│   │   ├── jobs/
│   │   │   ├── processVideoJob.js
│   │   │   ├── transcribeJob.js
│   │   │   └── analyzeJob.js
│   │   ├── database/
│   │   │   ├── db.js
│   │   │   ├── schema.sql
│   │   │   ├── seed.js
│   │   │   └── migrations/
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   ├── fileUpload.js
│   │   │   ├── auth.js              // Added in Phase 8
│   │   │   └── subscriptionCheck.js // Added in Phase 8
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── constants.js
│   │   └── server.js
│   ├── data/
│   │   ├── n5_vocabulary.json
│   │   └── n5_grammar_patterns.json
│   ├── uploads/
│   │   ├── videos/
│   │   └── audio/
│   ├── package.json
│   └── .env.example
│
├── scripts/
│   ├── csvToJson.js
│   ├── extractPdfData.js
│   └── testTokenizer.js
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
│
├── .gitignore
├── README.md
└── PROJECT_PLAN.md (this file)
```

---

## Key Technical Decisions

### 1. Japanese Text Processing

**Challenge**: Japanese has no spaces between words.

**Solution**: Use a Japanese tokenizer:
- **TinySegmenter** (lightweight, client-side capable, pure JS)
- **Kuromoji.js** (more accurate, Node.js, dictionary-based)

**How it works**:
```javascript
// Input: "私は学生です"
tokenize("私は学生です") 
→ ["私", "は", "学生", "です"]

// Now we can match each token against N5 database
"私" → ✅ Found in N5 (watashi - I)
"は" → ✅ Found in N5 (particle)
"学生" → ✅ Found in N5 (gakusei - student)
"です" → ✅ Found in N5 (desu - copula)
```

### 2. Vocabulary Matching Strategy

```javascript
// Step 1: Tokenize
const tokens = tokenizer.segment("私は学生です");
// → ["私", "は", "学生", "です"]

// Step 2: Match each token against N5 database (including variants)
const n5Words = [];
for (const token of tokens) {
  const word = n5Database.find(w => w.variants.includes(token));
  if (word) {
    n5Words.push({
      token,
      n5Word: word
    });
  }
}

// Step 3: Return matched words with metadata
// Result: 4 N5 words detected! 100% N5 content
```

### 3. Grammar Pattern Matching

Use regex patterns with Japanese-aware boundaries:

```javascript
const grammarPatterns = [
  {
    id: 1,
    pattern_name: "X は Y です",
    pattern_regex: "は.*です",
    chapter: "1"
  },
  {
    id: 2,
    pattern_name: "X を Y ます",
    pattern_regex: "を\\s*\\w+ます",
    chapter: "3"
  },
  // ... more patterns
];

// Match against transcription
for (const pattern of grammarPatterns) {
  const regex = new RegExp(pattern.pattern_regex, 'g');
  const matches = transcription.match(regex);
  if (matches) {
    // Store detected grammar
  }
}
```

### 4. Video Processing Flow

```
1. Upload received → Save file → Return video_id
   ↓
2. Background job starts:
   a. Extract audio (FFmpeg: video.mp4 → audio.mp3)
   b. Send to Whisper API → Get timestamped text
      Response: [
        { start: 0.0, end: 2.5, text: "私は学生です" },
        { start: 2.5, end: 5.0, text: "東京に住んでいます" }
      ]
   c. Send each segment to DeepL → Get translations
   d. Run N5 analysis on each segment:
      - Tokenize Japanese text
      - Match vocabulary
      - Detect grammar patterns
      - Calculate N5 density
   e. Update database with results
   f. Mark video as "completed"
   ↓
3. Frontend polls status or uses WebSocket for updates
```

### 5. Real-time Updates

**Options**:
- **Polling**: Frontend checks `/api/videos/:id/status` every 2 seconds
- **WebSocket**: Server pushes updates to connected clients (better UX)

**Recommendation**: Start with polling (simpler), add WebSocket later if needed.

---

## Japanese Text Processing

### Why Tokenization is Critical

**Without Tokenization**:
```javascript
// Input: "私はコーヒーを飲みます"
// Simple string matching fails:
text.includes("飲みます") // ❌ Might work by luck
text.includes("飲") // ✅ But this matches too many things!
```

**With Tokenization**:
```javascript
// Input: "私はコーヒーを飲みます"
tokenize("私はコーヒーを飲みます")
→ ["私", "は", "コーヒー", "を", "飲みます"]

// Now accurately match each word:
"私" → N5 ✅
"は" → N5 ✅
"コーヒー" → N5 ✅
"を" → N5 ✅
"飲みます" → N5 ✅
```

### Tokenizer Comparison

| Feature | TinySegmenter | Kuromoji.js |
|---------|---------------|-------------|
| Accuracy | Good (~95%) | Excellent (~98%) |
| Speed | Very Fast | Fast |
| Size | 35KB | 2MB (with dict) |
| Environment | Browser + Node | Node.js only |
| Installation | `npm install tiny-segmenter` | `npm install kuromoji` |

**Recommendation**: Use **Kuromoji.js** for backend analysis (better accuracy), optionally use **TinySegmenter** for client-side preview.

---

## Kanji Handling Strategy

### The Challenge

Same word, multiple written forms:
```
"私" (kanji) = "わたし" (hiragana) = same word (I/me)
"学生" (kanji) = "がくせい" (hiragana) = same word (student)
```

Whisper might transcribe in either form!

### Solution: Variants Array

Store all possible written forms in the database:

```json
{
  "id": 1,
  "kanji": "私",
  "hiragana": "わたし",
  "romaji": "watashi",
  "english": "I, me",
  "variants": ["私", "わたし"],  // ← Match ANY form!
  "part_of_speech": "pronoun"
}
```

### Matching Algorithm

```javascript
function matchN5Words(tokens, n5Database) {
  const matches = [];
  
  for (const token of tokens) {
    // Try to match token against ALL variants
    const found = n5Database.find(word => 
      word.variants.includes(token)
    );
    
    if (found) {
      matches.push({
        token: token,              // What was in the text
        n5Word: found,             // Full N5 entry
        displayForm: found.kanji,  // Prefer kanji for display
        reading: found.hiragana    // Show reading (furigana)
      });
    }
  }
  
  return matches;
}
```

### Real Example

```javascript
// Video transcription: "私はがくせいです"
// (Mixed kanji + hiragana)

const tokens = tokenize("私はがくせいです");
// → ["私", "は", "がくせい", "です"]

const matches = matchN5Words(tokens, n5Database);
// Results:
// ✅ "私" matched (variant of わたし)
// ✅ "は" matched
// ✅ "がくせい" matched (variant of 学生)
// ✅ "です" matched

// Display in UI:
わたし     がくせい
 私   は   学生   です
^^^^       ^^^^^
(N5)       (N5)
```

---

## Data Sources

### Extracting N5 Data from Your PDFs

You have three PDFs:
1. `kanji n5.pdf` - N5 kanji reference
2. `Minna no Nihongo I - Translations & Grammatical Notes` - Grammar and translations
3. `minna no nihongo renshuu book latest for N5.pdf` - Practice exercises

### Extraction Strategy

**Option 1: Use Claude in Your Other Project (Recommended)**

In your other Claude Pro project where the PDFs are uploaded, ask:
```
Extract all JLPT N5 vocabulary and format as JSON with this structure:
[
  {
    "kanji": "私",
    "hiragana": "わたし",
    "romaji": "watashi",
    "english": "I, me",
    "part_of_speech": "pronoun",
    "chapter": "1"
  }
]

Then extract grammar patterns:
[
  {
    "pattern_name": "X は Y です",
    "pattern_structure": "Noun は Noun です",
    "english_explanation": "X is Y",
    "example_japanese": "私は学生です",
    "example_english": "I am a student",
    "chapter": "1"
  }
]
```

**Option 2: Manual CSV Creation**

1. Open PDF in reader
2. Copy vocabulary sections
3. Paste into Google Sheets
4. Export as CSV
5. Convert to JSON using script

### Data Format

**Vocabulary**:
```json
{
  "kanji": "今日",
  "hiragana": "きょう",
  "romaji": "kyou",
  "english": "today",
  "variants": ["今日", "きょう"],
  "part_of_speech": "noun",
  "chapter": "3"
}
```

**Grammar**:
```json
{
  "pattern_name": "X を Y ます",
  "pattern_structure": "Noun を Verb",
  "pattern_regex": "を\\s*\\w+ます",
  "english_explanation": "Do action to object",
  "example_japanese": "コーヒーを飲みます",
  "example_english": "I drink coffee",
  "chapter": "3"
}
```

---

## External Services & Costs

| Service | Purpose | Free Tier | Paid Cost | Notes |
|---------|---------|-----------|-----------|-------|
| **OpenAI Whisper** | Japanese Speech-to-Text | No | $0.006/minute | Excellent Japanese accuracy |
| **DeepL API** | Japanese→English Translation | 500K chars/month | $5.49/month | High quality translations |
| **Stripe** | Payment Processing (Phase 8) | No | 2.9% + $0.30/transaction | Industry standard for SaaS |
| **Vercel/Netlify** | Frontend Hosting | Yes (generous) | Free for MVP | Auto-deploy from Git |
| **Railway/Render** | Backend Hosting | Limited free | $5-10/month | Easy Node.js deployment |
| **Redis Cloud** | Job Queue | 30MB free | $5/month | For Bull queue |

### Cost Estimates

**Development (per month)**:
- DeepL: Free tier (500K chars)
- Whisper: $1-2 (testing ~200 minutes)
- Hosting: Free tiers
- **Total: ~$2/month**

**Production (100 videos/month, avg 5 min each)**:
- Whisper: 500 min × $0.006 = $3.00
- DeepL: Likely still in free tier
- Backend hosting: $5-10
- Redis: $5
- **Total: ~$15-20/month**

**Production with Revenue (Phase 8+)**:
- Costs: $15-20/month
- Revenue: Variable (see Revenue Projections)
- Stripe fees: 2.9% + $0.30 per transaction

---

## Revenue Projections

### Unit Economics by Tier

**Per Free User:**
- Monthly cost: ~$0.12 (2 videos × 5 min × $0.006)
- Monthly revenue: $0
- Net: -$0.12 (acceptable loss for conversion funnel)

**Per N5 Learner ($9.99/month):**
- Monthly cost: ~$3-6 (varies by usage, 10-20 videos, N5 analysis only)
- Monthly revenue: $9.99
- Stripe fee: -$0.59 (2.9% + $0.30)
- Net profit: **$3.40-$6.99** (55-70% margin)

**Per N4 Learner ($14.99/month):** [Phase 11+]
- Monthly cost: ~$4-8 (N5 + N4 analysis, ~15 videos)
- Monthly revenue: $14.99
- Stripe fee: -$0.74
- Net profit: **$6.25-$10.25** (60-68% margin)

**Per N3 Learner ($19.99/month):** [Phase 12+]
- Monthly cost: ~$5-10 (N5+N4+N3 analysis, ~12 videos, more complex)
- Monthly revenue: $19.99
- Stripe fee: -$0.88
- Net profit: **$9.11-$14.11** (62-71% margin)

**Per N2 Learner ($24.99/month):** [Future]
- Monthly cost: ~$6-12 (multi-level analysis)
- Monthly revenue: $24.99
- Stripe fee: -$1.03
- Net profit: **$11.96-$17.96** (65-72% margin)

**Per N1 Master ($29.99/month):** [Future]
- Monthly cost: ~$8-15 (comprehensive analysis, all levels)
- Monthly revenue: $29.99
- Stripe fee: -$1.17
- Net profit: **$13.82-$20.82** (66-71% margin)

**Key Insight:** Higher tiers have better absolute profit (~$14-21) vs N5 (~$3-7) while maintaining similar margins. Advanced learners provide more stable, higher-value revenue with lower churn.

### Conservative Projections (N5 Only - MVP)

#### **Month 1-2 (Beta Testing)**
```
Users: 50 signups
Conversion: 10% → 5 paid users
Revenue: 5 × $9.99 = $50/month
Costs: $20/month
Stripe fees: $3
Net: $27/month
```

#### **Month 3-6 (Early Growth)**
```
Users: 500 total signups
Paid: 75 users (15% conversion)
Revenue: 75 × $9.99 = $749/month
Costs: $150/month
Stripe fees: $44
Net: $555/month
```

#### **Month 12 (Established)**
```
Users: 2,000 total signups
Paid: 400 users (20% conversion)
Revenue: 400 × $9.99 = $3,996/month
Costs: $800/month
Stripe fees: $235
Net: $2,961/month (~74% margin)
```

### Optimistic Projections (with annual billing)

#### **Month 12 (With 40% annual subscribers)**
```
Users: 2,000 total
Paid: 600 users (30% conversion)
  - 240 monthly ($9.99) = $2,398/month
  - 360 annual ($99/year) = $2,970/month avg
Total Revenue: $5,368/month
Costs: $1,200/month
Stripe fees: $316
Net: $3,852/month (~72% margin)

Annual Revenue: $64,416
```

### Multi-Tier Projections (After N4 & N3 Launch)

#### **Month 18 (N5 + N4 + N3 available)**
Assumes natural progression of existing users + new signups at all levels

```
Total Users: 3,500
Paid Subscribers: 1,050 (30% conversion)

Tier Distribution:
  N5 Learners:  500 users × $9.99  = $4,995/month
  N4 Learners:  300 users × $14.99 = $4,497/month
  N3 Learners:  200 users × $19.99 = $3,998/month
  N2 Learners:   30 users × $24.99 =   $750/month (beta)
  N1 Masters:    20 users × $29.99 =   $600/month (beta)

Total MRR: $14,840/month
Annual Revenue: ~$178,000

Costs: $2,500/month
Stripe fees: ~$875
Net Profit: $11,465/month (~77% margin)
```

**Why This Works:**
- Natural upgrade path: 40% of N5 users upgrade to N4 after 6 months
- 30% of N4 users upgrade to N3 after 6 months
- Average LTV increases from $120 to $400-800 (3-4 year journey)
- Churn drops from 5% to 2% (commitment to learning journey)

#### **Month 24 (Mature Multi-Tier Platform)**
```
Total Users: 6,000
Paid Subscribers: 1,800 (30% conversion)

Tier Distribution:
  N5 Learners:  700 users × $9.99  = $6,993/month
  N4 Learners:  500 users × $14.99 = $7,495/month
  N3 Learners:  400 users × $19.99 = $7,996/month
  N2 Learners:  150 users × $24.99 = $3,749/month
  N1 Masters:    50 users × $29.99 = $1,500/month

Total MRR: $27,733/month
Annual Revenue: ~$333,000

Costs: $4,500/month
Stripe fees: ~$1,635
Net Profit: $21,598/month (~78% margin)
```

**Additional Revenue Streams (Year 2):**
- Teacher Licenses: 20 schools × $99 = $1,980/month
- API Access: 15 devs × $49 = $735/month
- White Label: 5 clients × $299 = $1,495/month
- **Total Additional: ~$4,210/month**

**Total MRR (Year 2): $31,943/month** ($383,316/year)

### Revenue Milestones

#### N5 Only (Phases 8-10)
| Milestone | Paid Users | Monthly Revenue | Annual Revenue | Notes |
|-----------|-----------|----------------|----------------|-------|
| **Launch** | 5 | $50 | $600 | Validate pricing |
| **Break Even** | 20 | $200 | $2,400 | Cover all costs |
| **Sustainable** | 100 | $1,000 | $12,000 | Part-time viable |
| **Full-Time** | 400 | $4,000 | $48,000 | Quit day job |
| **Scale** | 1,000 | $10,000 | $120,000 | Hire team |

#### Multi-Tier (Phases 11-12+)
| Milestone | Mixed Subs | Monthly Revenue | Annual Revenue | Notes |
|-----------|-----------|----------------|----------------|-------|
| **N4 Launch** | 600 | $8,000 | $96,000 | Phase 11 |
| **N3 Launch** | 1,050 | $14,840 | $178,000 | Phase 12 |
| **Maturity** | 1,800 | $27,733 | $333,000 | Year 2 |
| **Expansion** | 3,000 | $45,000+ | $540,000+ | Additional revenue streams |

### Conversion Funnel Economics

```
1,000 Website Visitors
  ↓ (30% signup rate)
300 Trial Signups
  ↓ (70% activation)
210 Active Trial Users (processed 1+ video)
  ↓ (50% engagement)
105 Engaged Users (processed 3+ videos)
  ↓ (20% conversion)
21 Paid Subscribers
  
Cost to Acquire: $0 (organic/free)
Lifetime Value (LTV): $9.99 × 12 months = $119.88 (if 1-year retention)
LTV:CAC ratio: Infinite (no paid acquisition)
```

### Churn Assumptions

- **Monthly churn**: 5% (typical for SaaS)
- **Annual churn**: 3% (lower due to commitment)
- **Average customer lifetime**: 20 months (monthly), 33 months (annual)

**Lifetime Value Calculations:**
- Monthly subscriber: $9.99 × 20 months = **$199.80 LTV**
- Annual subscriber: $99 × 2.75 years = **$272.25 LTV**

### Revenue Diversification (Future)

Beyond core subscriptions, additional revenue streams:

1. **Teacher/School Licenses** ($99/month)
   - Target: 20 schools by year 2
   - Additional revenue: $1,980/month

2. **API Access** ($49/month)
   - Target: 10 developers by year 2
   - Additional revenue: $490/month

3. **Affiliate Revenue** (4-8% commission)
   - Japanese textbook recommendations
   - Target: $200/month passive income

4. **White Label** ($299/month)
   - Custom branded instances for schools
   - Target: 3 clients by year 2
   - Additional revenue: $897/month

**Total Year 2 Revenue Potential:**
- Core subscriptions: $5,000-10,000/month
- Additional streams: $3,500-4,000/month
- **Total: $8,500-14,000/month**

---

## Post-MVP Development Phases

### Phase 7: Beta Testing & Feedback (1-2 weeks)
**Goal**: Validate core product with real users

- [ ] Recruit 20-50 beta testers
- [ ] Set up feedback collection system
- [ ] Monitor usage analytics
- [ ] Fix critical bugs
- [ ] Iterate on UX based on feedback
- [ ] Measure conversion intent
- [ ] A/B test pricing messaging

**Success Criteria:**
- 70%+ activation rate (process 1+ video)
- 50%+ engagement (3+ videos)
- >80% would pay after trial
- NPS score > 40

---

### Phase 8: User Authentication & Subscriptions (2 weeks)
**Goal**: Monetize the platform with tiered subscriptions

#### User Authentication
- [ ] Implement JWT-based auth
- [ ] Email/password signup and login
- [ ] Password reset flow
- [ ] Email verification
- [ ] User profile management

#### Subscription System
- [ ] Integrate Stripe Checkout
- [ ] Implement 7-day free trial (no credit card)
- [ ] Set up subscription plans (Free, N5 monthly/annual)
- [ ] Video processing limits by tier
- [ ] Stripe webhook handlers (payment success, subscription cancelled, etc.)
- [ ] Subscription management UI
- [ ] Billing portal integration

#### Database Updates
- [ ] Implement all user-related tables
- [ ] Add user_id to videos table
- [ ] Track video processing counts per month
- [ ] Implement monthly reset logic

#### Access Control
- [ ] Middleware to check subscription tier
- [ ] Enforce video processing limits
- [ ] JLPT level access control (N5 only for now)
- [ ] Graceful upgrade prompts

**Success Criteria:**
- 15%+ trial-to-paid conversion
- Payment success rate > 95%
- Zero payment security issues

---

### Phase 9: YouTube URL Import (1 week)
**Goal**: Allow users to import YouTube videos directly

- [ ] Integrate yt-dlp library
- [ ] YouTube URL validation
- [ ] Extract video metadata (title, duration, thumbnail)
- [ ] Download video/audio from YouTube
- [ ] Handle age-restricted content
- [ ] Error handling for unavailable videos
- [ ] Queue-based processing (avoid timeouts)

**Success Criteria:**
- 90%+ success rate for YouTube imports
- Average download time < 2 minutes

---

### Phase 10: Advanced Features & Annual Billing (2 weeks)
**Goal**: Increase LTV with premium features and annual plans

#### Premium Features
- [ ] Export vocabulary to Anki (CSV)
- [ ] Built-in flashcard system with spaced repetition
- [ ] Progress tracking dashboard by JLPT level
- [ ] Personal vocabulary lists (new, learning, known)
- [ ] Study reminders and notifications
- [ ] Watch history and continue watching

#### Annual Billing
- [ ] Add annual plan option ($99/year for N5)
- [ ] 17% discount vs monthly
- [ ] Upgrade/downgrade flows
- [ ] Prorated billing

#### Analytics
- [ ] User engagement metrics
- [ ] Cohort analysis
- [ ] Churn prediction
- [ ] Revenue dashboard

**Success Criteria:**
- 30%+ of new subs choose annual
- Churn rate < 5%/month
- Feature adoption > 60%

---

### Phase 11: N4 Level Support (3-4 weeks)
**Goal**: Expand to N4 learners, enable tier upgrades

#### Data Preparation
- [ ] Extract N4 vocabulary (~1,500 words) from PDFs
- [ ] Extract N4 grammar patterns (~100 patterns)
- [ ] Seed database with N4 data (jlpt_level = 4)
- [ ] Create N4-specific regex patterns

#### Analysis Engine Updates
- [ ] Update detection logic to support multiple JLPT levels
- [ ] Filter analysis by user's max_jlpt_level
- [ ] Multi-level highlighting in video player
- [ ] Level-specific statistics

#### Subscription Tier
- [ ] Add N4 subscription tier ($14.99/month)
- [ ] Update Stripe products and pricing
- [ ] Implement tier upgrade flow
- [ ] Upgrade prompts when user has 70%+ N5 mastery
- [ ] Display N4 analysis only to N4+ subscribers

#### UI Updates
- [ ] JLPT level selector in dashboard
- [ ] Multi-level progress tracking
- [ ] Vocabulary filtered by level
- [ ] Level-based recommendations

**Success Criteria:**
- 25%+ of N5 users upgrade to N4 within 6 months
- N4 detection accuracy > 90%
- Revenue increase by 40%+

---

### Phase 12: N3 Level Support (3-4 weeks)
**Goal**: Target intermediate learners, increase ARPU

#### Data Preparation
- [ ] Extract N3 vocabulary (~3,000 words)
- [ ] Extract N3 grammar patterns (~200 patterns)
- [ ] Seed database with N3 data (jlpt_level = 3)
- [ ] Create N3-specific regex patterns

#### Analysis Engine Updates
- [ ] Support N5 + N4 + N3 simultaneous detection
- [ ] Performance optimization (more vocab to match)
- [ ] Caching improvements

#### Subscription Tier
- [ ] Add N3 subscription tier ($19.99/month)
- [ ] Update upgrade flows
- [ ] Priority support for N3+ users

#### Advanced Features for N3+
- [ ] Kanji breakdown and analysis
- [ ] Pitch accent indicators
- [ ] Related word suggestions
- [ ] Context-aware translations

**Success Criteria:**
- 20%+ of N4 users upgrade to N3
- N3 detection accuracy > 85%
- Average LTV increases to $400+

---

### Phase 13+: Future Expansion

#### N2 & N1 Levels (4-6 weeks each)
- Full JLPT coverage (beginner → mastery)
- N2: $24.99/month (~6,000 words)
- N1: $29.99/month (~10,000 words)
- Complete learning journey platform

#### Community Features (3-4 weeks)
- Share videos with other learners
- Community-submitted videos
- Comments and discussions
- Recommended videos
- Leaderboards and achievements

#### Mobile Apps (8-12 weeks)
- iOS/Android native apps
- Offline mode
- Download videos for offline study
- Push notifications

#### Browser Extension (2-3 weeks)
- YouTube integration
- Analyze any video on the web
- Quick vocabulary lookup
- One-click processing

#### Teacher/Classroom Features (4-6 weeks)
- Teacher licenses ($99/month)
- Create assignments
- Student progress tracking
- Custom vocabulary sets
- Classroom management

#### AI Study Assistant (6-8 weeks)
- Personalized recommendations
- Adaptive learning paths
- Quiz generation
- Conversation practice

#### Audio-only Mode (2 weeks)
- Support for podcasts
- MP3 upload
- Audio-first learning

---

## Success Metrics

### MVP Success Criteria

- [ ] Successfully process 10+ test videos
- [ ] >90% accuracy in N5 word detection
- [ ] <5 min processing time for 5-min video
- [ ] Works on mobile devices
- [ ] Positive feedback from 5+ beta testers

### Key Performance Indicators (KPIs)

**Technical**:
- Video processing success rate > 95%
- Average processing time < 2× video length
- API uptime > 99%
- Page load time < 3 seconds

**User Engagement**:
- Average session duration > 10 minutes
- Videos per user > 3
- Return user rate > 40%

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Whisper API downtime | High | Cache transcriptions, implement retry logic |
| Poor transcription quality | Medium | Allow manual editing of transcriptions |
| High API costs | Medium | Set usage limits, optimize processing |
| Complex videos (movies) | Low | Start with simpler content (vlogs, lessons) |
| User uploads copyrighted content | High | Terms of service, DMCA compliance |

---

## Next Steps

### Immediate Actions

1. **Extract N5 data from PDFs** (using Claude in your other project)
2. **Initialize project structure** (create folders, package.json)
3. **Set up database** (SQLite + seed data)
4. **Build basic upload page** (Phase 1)
5. **Test Whisper API** (simple transcription test)

### Before Starting Development

- [ ] Review and approve this plan
- [ ] Set up development environment
- [ ] Create GitHub repository
- [ ] Get API keys (OpenAI, DeepL)
- [ ] Extract N5 data from PDFs

---

## Questions & Decisions Needed

### Technical Decisions
- [ ] Preferred tokenizer: TinySegmenter or Kuromoji?
- [ ] Hosting preference: Vercel + Railway or other?
- [ ] TypeScript or JavaScript?
- [ ] Maximum video length limit for MVP? (Recommend: 100MB / 10 min)

### Business Decisions (Resolved)
- ✅ **User authentication in MVP?** No - Added in Phase 8
- ✅ **Monetization strategy?** 7-day trial → Free tier (2 videos/month) → Pro ($9.99/month)
- ✅ **Payment provider?** Stripe (industry standard)
- ✅ **Pricing validation?** Will test during beta (Week 7)

---

## Resources & References

### Documentation
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [DeepL API Docs](https://www.deepl.com/docs-api)
- [Stripe API Docs](https://stripe.com/docs/api) - Payment processing (Phase 8)
- [Kuromoji.js](https://github.com/takuyaa/kuromoji.js)
- [TinySegmenter](http://chasen.org/~taku/software/TinySegmenter/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

### Learning Resources
- JLPT N5 Vocabulary Lists
- Minna no Nihongo I Textbook
- Japanese Text Analysis Research Papers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-19 | Initial project plan created |
| 1.1 | 2025-10-19 | Added comprehensive monetization strategy, revenue projections, user management schema, payment integration (Phase 8), updated file structure with auth/subscription services |
| 2.0 | 2025-10-19 | **MAJOR UPDATE**: Redesigned for multi-tier JLPT level subscriptions (N5→N1). Updated database schema to support all JLPT levels, renamed tables to be level-agnostic (jlpt_vocabulary, grammar_patterns with jlpt_level column), added user_jlpt_progress table, added progressive pricing ($9.99-$29.99), updated revenue projections with multi-tier model ($333K Year 2 potential), added Phases 11-12 for N4/N3 support, added upgrade path analytics |

---

## Contact & Support

For questions or issues during development, refer to:
- This document for high-level decisions
- `/docs/API.md` for API specifications
- `/docs/DEPLOYMENT.md` for deployment instructions

---

**Last Updated**: October 19, 2025  
**Status**: Planning Phase  
**Next Milestone**: Phase 0 - Setup & Data Preparation

