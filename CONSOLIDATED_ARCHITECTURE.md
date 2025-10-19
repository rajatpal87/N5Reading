# 🏗️ JLPT N5 Video Coach - System Architecture

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** Production-Ready Architecture

---

## 📋 Executive Summary

### Architecture Type
**Simple Monolith with Service-Oriented Design**

### Key Characteristics
- Single codebase (frontend + backend)
- Clear separation of concerns
- Service layer pattern
- Stateless HTTP APIs
- SQL-based persistence
- File-based video storage

### Why Monolith?
- ✅ Faster development
- ✅ Easier debugging
- ✅ Lower operational complexity
- ✅ Sufficient for 1,000+ users
- ✅ Can extract microservices later

---

## 🎯 High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                    INTERNET / USERS                    │
└─────────────────────┬──────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│   Frontend    │          │    Backend     │
│  (React SPA)  │◄────────►│  (Express API) │
│               │   HTTP   │                │
│  - React 18   │          │  - Node.js     │
│  - Vite       │          │  - Express     │
│  - Tailwind   │          │  - Services    │
└───────────────┘          └────┬───────────┘
                                │
                    ┌───────────┼──────────┐
                    │           │          │
                    ▼           ▼          ▼
              ┌─────────┐  ┌────────┐  ┌──────────┐
              │ SQLite  │  │ FFmpeg │  │  Local   │
              │   DB    │  │ Binary │  │ Storage  │
              └─────────┘  └────────┘  └──────────┘
                    │                        │
                    │                        │
                    ▼                        ▼
              ┌─────────┐              ┌──────────┐
              │External │              │  Video   │
              │  APIs   │              │  Files   │
              │ -Whisper│              │  Audio   │
              │ -DeepL  │              │  Files   │
              └─────────┘              └──────────┘
```

---

## 🗂️ Project Structure

### Complete File Tree

```
N5Reading/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── VideoSummaryCard.jsx
│   │   │   │   ├── VocabularyTable.jsx
│   │   │   │   ├── GrammarPatternsList.jsx
│   │   │   │   └── N5Timeline.jsx
│   │   │   ├── VideoList.jsx
│   │   │   ├── VideoUpload.jsx
│   │   │   ├── YouTubeUpload.jsx
│   │   │   └── TranscriptionViewer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── data/
│   │   │   │   ├── n5_vocabulary.json (296 words)
│   │   │   │   └── n5_grammar_patterns.json (50 patterns)
│   │   │   ├── db.js              # Database connection
│   │   │   ├── schema.js          # Table definitions
│   │   │   ├── seed.js            # Data seeding
│   │   │   ├── migrate.js         # Schema migrations
│   │   │   └── migrateProgress.js # Progress tracking migration
│   │   ├── middleware/
│   │   │   ├── security.js        # Rate limiting, Helmet, CORS
│   │   │   └── validation.js      # Input validation
│   │   ├── routes/
│   │   │   └── videos.js          # All video-related endpoints
│   │   ├── services/
│   │   │   ├── videoService.js    # Video metadata, audio extraction
│   │   │   ├── youtubeService.js  # YouTube download
│   │   │   ├── transcriptionService.js  # Whisper API
│   │   │   ├── translationService.js    # DeepL API
│   │   │   ├── analysisService.js       # N5 detection
│   │   │   └── exportService.js         # CSV generation
│   │   ├── utils/
│   │   │   └── progressTracker.js # Progress tracking
│   │   └── server.js              # Main entry point
│   ├── uploads/                   # Video & audio files
│   ├── database.db                # SQLite database
│   ├── package.json
│   └── .env                       # Environment variables
│
├── CONSOLIDATED_PROJECT_PLAN.md
├── CONSOLIDATED_MVP_PLAN.md
├── CONSOLIDATED_MONETIZATION.md
├── CONSOLIDATED_ARCHITECTURE.md (this file)
├── CONSOLIDATED_UI_UX.md
├── CONSOLIDATED_SECURITY.md
├── NEW_DOCUMENTATION_TRACKING.md
├── README.md
├── render.yaml                    # Render deployment config
├── restart-servers.sh             # Development utility
└── .gitignore
```

---

## 📡 API Endpoints

### Video Management

```javascript
// Upload video file
POST   /api/videos/upload
Content-Type: multipart/form-data
Body: { video: File }
Response: { id, filename, original_name, ... }

// Download from YouTube
POST   /api/videos/youtube
Body: { url: string }
Response: { id, filename, youtube_url, ... }

// List all videos
GET    /api/videos
Response: [ { id, filename, status, ... }, ... ]

// Get single video
GET    /api/videos/:id
Response: { id, filename, status, duration, ... }

// Delete video
DELETE /api/videos/:id
Response: { message: "Video deleted successfully" }
```

### Video Processing

```javascript
// Extract audio from video
POST   /api/videos/:id/process
Response: { message: "Audio extraction started", videoId }

// Transcribe & translate
POST   /api/videos/:id/transcribe
Response: { message: "Transcription started", videoId }

// Get transcription & translation
GET    /api/videos/:id/transcription
Response: {
  transcription: { full_text, segments: [...] },
  translation: { full_text, segments: [...] }
}
```

### N5 Analysis

```javascript
// Trigger N5 analysis
POST   /api/videos/:id/analyze
Response: { message: "Analysis started", videoId }

// Get analysis results
GET    /api/videos/:id/analysis
Response: {
  vocabulary: {
    words: [
      {
        japanese, reading, english, chapter,
        first_appearance, frequency, occurrences: [...]
      },
      ...
    ],
    totalWords, uniqueWords
  },
  grammar: {
    patterns: [
      {
        name, structure, explanation, chapter,
        frequency, occurrences: [...]
      },
      ...
    ],
    totalPatterns, uniquePatterns
  },
  statistics: { n5Density, estimatedStudyTime }
}

// Get N5 timeline
GET    /api/videos/:id/timeline
Response: {
  segments: [
    {
      start, end, n5WordCount, totalWords,
      n5Density, densityLevel
    },
    ...
  ],
  recommendedSegments: [ /* top 5 */ ]
}
```

### Export

```javascript
// Export vocabulary (CSV or Anki)
GET    /api/videos/:id/export/vocabulary?format=csv|anki
Response: CSV file download

// Export grammar
GET    /api/videos/:id/export/grammar
Response: CSV file download
```

### Utility

```javascript
// Health check
GET    /api/health
Response: { status: "OK", timestamp }

// Test database connection
GET    /api/test-db
Response: { message: "Database connected", tables: [...] }
```

---

## 🔄 Data Flow Diagrams

### 1. Video Upload Flow

```
User selects file
        │
        ▼
Frontend validates (type, size)
        │
        ▼
Upload to /api/videos/upload
        │
        ▼
Backend (Multer) saves to disk
        │
        ▼
FFmpeg extracts metadata
        │
        ▼
Database record created (status: 'uploaded')
        │
        ▼
Response sent to frontend
        │
        ▼
Frontend updates video list
```

### 2. YouTube Download Flow

```
User pastes YouTube URL
        │
        ▼
Frontend validates URL format
        │
        ▼
POST to /api/videos/youtube
        │
        ▼
Backend validates URL
        │
        ▼
yt-dlp fetches video info
        │
        ├─ Try Chrome cookies
        ├─ Fallback to Safari cookies
        │
        ▼
Download video to uploads/
        │
        ▼
FFmpeg extracts metadata
        │
        ▼
Database record created
        │
        ▼
Frontend polls for status
```

### 3. Audio Processing Flow

```
User clicks "Extract Audio"
        │
        ▼
POST to /api/videos/:id/process
        │
        ▼
Update status: 'extracting_audio'
        │
        ▼
FFmpeg extracts audio (WAV 16kHz mono)
        │
        ├─ Progress callback updates DB
        │
        ▼
Check file size
        │
        ├─ If > 25MB:
        │   ├─ Update status: 'compressing_audio'
        │   ├─ Compress to MP3 (64kbps)
        │   └─ Delete temp file
        │
        ▼
Update status: 'audio_extracted'
Update audio_path in DB
        │
        ▼
Frontend polls and shows "Play Audio"
```

### 4. Transcription & Translation Flow

```
User clicks "Transcribe & Translate"
        │
        ▼
POST to /api/videos/:id/transcribe
        │
        ▼
Update status: 'transcribing'
        │
        ▼
Check audio file exists
        │
        ▼
Send to OpenAI Whisper API
        │
        ├─ Language: Japanese (ja)
        ├─ Format: verbose_json
        ├─ Get segments with timestamps
        │
        ▼
Save transcription to DB
        │
        ▼
Update status: 'translating'
        │
        ▼
Send to DeepL API
        │
        ├─ Translate full text
        ├─ Translate each segment
        ├─ Small delay between segments
        ├─ Progress tracking per segment
        │
        ▼
Save translation to DB
        │
        ▼
Update status: 'completed'
        │
        ▼
Frontend shows "View Transcription"
```

### 5. N5 Analysis Flow

```
User clicks "Dashboard" or auto-triggered
        │
        ▼
POST to /api/videos/:id/analyze
        │
        ▼
Fetch transcription from DB
        │
        ▼
TinySegmenter tokenizes Japanese text
        │
        ▼
For each token:
        │
        ├─ Query jlpt_vocabulary (kanji/hiragana match)
        ├─ If match found:
        │   ├─ Store in vocabulary_instances
        │   ├─ Track first_appearance
        │   └─ Increment frequency
        │
        ▼
For each grammar pattern:
        │
        ├─ Run regex against full text
        ├─ If match found:
        │   ├─ Store in detected_grammar
        │   └─ Track position
        │
        ▼
Calculate statistics:
        │
        ├─ Total N5 words
        ├─ Unique N5 words
        ├─ N5 density %
        └─ Estimated study time
        │
        ▼
Return analysis results
        │
        ▼
Frontend displays in Dashboard
```

---

## 🗄️ Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     videos      │
├─────────────────┤
│ id (PK)         │
│ filename        │
│ original_name   │
│ file_path       │
│ audio_path      │
│ youtube_url     │
│ status          │───┐
│ progress        │   │
│ status_message  │   │
│ error_message   │   │
│ duration        │   │
│ file_size       │   │
│ created_at      │   │
└─────────────────┘   │
                      │
                      │ 1:N
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌──────────────────┐      ┌──────────────────┐
│ transcriptions   │      │  translations    │
├──────────────────┤      ├──────────────────┤
│ id (PK)          │      │ id (PK)          │
│ video_id (FK)    │──┐   │ transcription_id │
│ language         │  │   │ language         │
│ full_text        │  │   │ full_text        │
│ segments (JSON)  │  │   │ segments (JSON)  │
│ created_at       │  │   │ created_at       │
└──────────────────┘  │   └──────────────────┘
                      │
                      │ 1:N
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌──────────────────┐      ┌──────────────────┐
│vocabulary_       │      │detected_grammar  │
│  instances       │      │                  │
├──────────────────┤      ├──────────────────┤
│ id (PK)          │      │ id (PK)          │
│transcription_id  │      │transcription_id  │
│ word_id (FK)     │──┐   │ pattern_id (FK)  │──┐
│ matched_text     │  │   │ matched_text     │  │
│ start_time       │  │   │ position_in_text │  │
│ end_time         │  │   │ created_at       │  │
│ created_at       │  │   └──────────────────┘  │
└──────────────────┘  │                         │
                      │                         │
                      │ N:1                     │ N:1
                      │                         │
                      ▼                         ▼
┌──────────────────┐            ┌──────────────────┐
│jlpt_vocabulary   │            │grammar_patterns  │
├──────────────────┤            ├──────────────────┤
│ id (PK)          │            │ id (PK)          │
│ kanji            │            │ pattern_name     │
│ hiragana         │            │ pattern_structure│
│ romaji           │            │ pattern_regex    │
│ english          │            │ english_explain  │
│ part_of_speech   │            │ example_japanese │
│ chapter          │            │ example_english  │
│ jlpt_level       │            │ chapter          │
│ variants (JSON)  │            │ jlpt_level       │
│ created_at       │            │ created_at       │
└──────────────────┘            └──────────────────┘
```

### Database Statistics (Current)

```sql
-- N5 Reference Data
jlpt_vocabulary:       296 rows (N5 level)
grammar_patterns:       50 rows (N5 level)

-- User Data (grows with usage)
videos:                 variable
transcriptions:         1:1 with videos
translations:           1:1 with transcriptions
vocabulary_instances:   many per transcription
detected_grammar:       many per transcription
```

---

## 🔧 Service Layer Architecture

### Principle: Single Responsibility

Each service handles one specific domain:

```javascript
services/
├── videoService.js         // Video metadata, audio extraction
├── youtubeService.js       // YouTube download, URL validation
├── transcriptionService.js // OpenAI Whisper API calls
├── translationService.js   // DeepL API calls
├── analysisService.js      // N5 word/grammar detection
└── exportService.js        // CSV/Anki generation
```

### Service Dependencies

```
┌─────────────────────┐
│    videoService     │ ← FFmpeg wrapper
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  youtubeService     │ ← yt-dlp wrapper
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ transcriptionService│ ← OpenAI Whisper
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ translationService  │ ← DeepL API
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  analysisService    │ ← TinySegmenter + DB
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   exportService     │ ← Generate CSV
└─────────────────────┘
```

### Example Service Pattern

```javascript
// services/transcriptionService.js

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Lazy initialization
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

export async function transcribeAudio(audioPath, onProgress) {
  // 1. Validate input
  if (!fs.existsSync(audioPath)) {
    throw new Error('Audio file not found');
  }

  // 2. Get client
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  // 3. Progress callback
  if (onProgress) {
    onProgress({ progress: 10, message: 'Sending to Whisper API...' });
  }

  // 4. API call
  const transcription = await client.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'ja',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  });

  // 5. Return structured data
  return {
    full_text: transcription.text,
    segments: transcription.segments
  };
}
```

---

## 🚀 Deployment Architecture

### Current (Development)

```
┌─────────────────────────────────────────┐
│          Local Machine                  │
├─────────────────────────────────────────┤
│                                         │
│  Terminal 1: Frontend (Vite)           │
│  http://localhost:5173                  │
│                                         │
│  Terminal 2: Backend (Node.js)         │
│  http://localhost:3000                  │
│                                         │
│  SQLite: ./backend/database.db         │
│  Storage: ./backend/uploads/           │
│                                         │
└─────────────────────────────────────────┘
```

### MVP Deployment (Render.com)

```
┌───────────────────────────────────────────┐
│              RENDER.COM                   │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────┐    │
│  │ Static Site (Frontend)   FREE   │    │
│  │ - React build (dist/)            │    │
│  │ - Served via CDN                 │    │
│  │ - Auto-deploy from GitHub        │    │
│  │ - https://n5reading.onrender.com │    │
│  └─────────────────────────────────┘    │
│                 │                         │
│                 │ API Calls               │
│                 ▼                         │
│  ┌─────────────────────────────────┐    │
│  │ Web Service (Backend)  $7/mo    │    │
│  │ - Node.js + Express              │    │
│  │ - SQLite (local disk)            │    │
│  │ - Video storage (local disk)     │    │
│  │ - Auto-deploy from GitHub        │    │
│  │ - https://n5-api.onrender.com    │    │
│  └─────────────────────────────────┘    │
│                                           │
└───────────────────────────────────────────┘
         │                    │
         │ External APIs      │
         ▼                    ▼
┌──────────────┐      ┌──────────────┐
│ OpenAI       │      │ DeepL        │
│ Whisper API  │      │ API          │
└──────────────┘      └──────────────┘
```

### Production (Future - 1,000+ users)

```
┌────────────────────────────────────────────┐
│          CLOUDFLARE / VERCEL               │
├────────────────────────────────────────────┤
│  Frontend CDN (Global)                     │
│  - Edge caching                            │
│  - DDoS protection                         │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│              RENDER / RAILWAY              │
├────────────────────────────────────────────┤
│  Backend Instances (2-3x)                  │
│  - Load balanced                           │
│  - Auto-scaling                            │
│                                            │
│  PostgreSQL Database                       │
│  - Managed instance                        │
│  - Auto-backups                            │
│                                            │
│  Redis (Bull Queue)                        │
│  - Background jobs                         │
│  - Progress tracking                       │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│         CLOUDFLARE R2 / AWS S3             │
├────────────────────────────────────────────┤
│  Video Storage                             │
│  - 10TB capacity                           │
│  - CDN integration                         │
└────────────────────────────────────────────┘
```

---

## 📊 Technology Decisions & Rationale

### Frontend

**React 18 + Vite**
- **Why:** Fast HMR, modern build tool, excellent DX
- **Alternative:** Next.js (overkill for SPA)
- **Trade-off:** Client-side routing (fine for MVP)

**Tailwind CSS v3.4.0**
- **Why:** Rapid UI development, utility-first
- **Alternative:** Styled Components (more JS overhead)
- **Trade-off:** HTML can look verbose

**HTML5 `<video>` Element**
- **Why:** Full control, no dependencies, reliable
- **Alternative:** React Player (had reliability issues)
- **Trade-off:** Manual controls implementation

### Backend

**Node.js + Express**
- **Why:** JavaScript consistency, huge ecosystem
- **Alternative:** Python/Flask (slower for prototyping)
- **Trade-off:** Callback hell (mitigated with async/await)

**SQLite (MVP)**
- **Why:** Zero configuration, file-based, sufficient for MVP
- **Alternative:** PostgreSQL (overhead for dev)
- **Trade-off:** Concurrent write limitations (fine for <100 users)

**PostgreSQL (Production)**
- **Why:** Industry standard, excellent JSON support
- **Alternative:** MongoDB (less ACID guarantees)
- **Trade-off:** More operational complexity

### Processing

**FFmpeg**
- **Why:** Industry standard, powerful, free
- **Alternative:** Cloud video processing (expensive)
- **Trade-off:** Binary dependency

**TinySegmenter**
- **Why:** Lightweight (~100KB), good enough for N5
- **Alternative:** Kuromoji (larger, more accurate)
- **Trade-off:** Accuracy (90% vs 95%)

### APIs

**OpenAI Whisper**
- **Why:** Best-in-class Japanese transcription
- **Alternative:** Google Speech-to-Text (more expensive)
- **Trade-off:** Cost ($0.006/min)

**DeepL**
- **Why:** High-quality translations, generous free tier
- **Alternative:** Google Translate (lower quality)
- **Trade-off:** Free tier limit (500K chars/month)

---

## 🔄 Scaling Strategy

### Phase 0-6 (MVP): 0-100 users
```
Architecture: Monolith
Database: SQLite
Storage: Local disk (100GB)
Processing: Synchronous (inline)
Cost: $7/month
```

### Phase 8-10: 100-500 users
```
Architecture: Monolith
Database: PostgreSQL (managed)
Storage: Local disk → Cloudflare R2
Processing: Async (Bull + Redis)
Cost: $30-50/month
```

### Phase 11+: 500-2,000 users
```
Architecture: Monolith + Workers
Database: PostgreSQL (read replicas)
Storage: R2 (10TB) + CDN
Processing: Dedicated worker instances
Cost: $200-400/month
```

### Scale: 2,000+ users
```
Architecture: Microservices (if needed)
Database: Sharded PostgreSQL
Storage: Multi-region R2
Processing: Serverless functions
Cost: $500-1,000/month
```

---

## 🔌 External Integrations

### Current Integrations

| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **OpenAI Whisper** | Transcription | $0.006/min | ✅ Active |
| **DeepL** | Translation | Free tier | ✅ Active |
| **yt-dlp** | YouTube download | Free | ✅ Active |
| **FFmpeg** | Video/audio processing | Free | ✅ Active |

### Future Integrations (Phase 8+)

| Service | Purpose | Cost | Phase |
|---------|---------|------|-------|
| **Stripe** | Payments | 2.9% + $0.30 | Phase 8 |
| **SendGrid** | Email | $15/mo | Phase 8 |
| **Sentry** | Error tracking | $26/mo | Phase 9 |
| **Google Analytics** | Analytics | Free | Phase 9 |
| **Cloudflare R2** | Video storage | $0.015/GB | Phase 10 |

---

## 📈 Performance Targets

### API Response Times
- **GET /api/videos:** <100ms
- **POST /api/videos/upload:** <5s (100MB file)
- **GET /api/videos/:id/analysis:** <200ms

### Processing Times
- **Audio extraction:** <30s (5-min video)
- **Transcription:** <10 minutes (5-min video)
- **Translation:** <2 minutes (5-min video)
- **N5 analysis:** <5 seconds

### Frontend Performance
- **Initial page load:** <3 seconds
- **Time to Interactive (TTI):** <5 seconds
- **Largest Contentful Paint (LCP):** <2.5 seconds

---

## 🛠️ Development Workflow

### Local Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev  # nodemon src/server.js

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # vite

# Terminal 3: Watch logs
tail -f backend/*.log
```

### Deployment Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: add feature"

# 2. Push to GitHub
git push origin main

# 3. Auto-deploy triggers on Render
# ✅ Frontend rebuilds in ~2 minutes
# ✅ Backend restarts in ~30 seconds

# 4. Verify deployment
curl https://n5-api.onrender.com/api/health
```

---

## 🔮 Future Architecture Considerations

### When to Extract Microservices?

**Don't extract until:**
- 10,000+ users
- Team size > 5 engineers
- Clear performance bottlenecks
- Specific services need independent scaling

**Potential Microservices:**
1. **Video Processing Service**
   - Handles transcription, translation
   - CPU/memory intensive
   - Can scale independently

2. **Analysis Service**
   - N5 detection engine
   - Database-heavy
   - Cacheable results

3. **Export Service**
   - CSV generation
   - Stateless
   - Easy to extract

---

**Last Updated:** October 19, 2025  
**Status:** Production-Ready for MVP  
**Next Review:** After 1,000 users

---

**© 2025 JLPT N5 Video Coach | Simple Architecture, Powerful Results**

