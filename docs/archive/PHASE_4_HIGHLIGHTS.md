# 🎥 Phase 4: Interactive Video Player - Highlights

## 📋 Overview
**Duration**: 4-5 days  
**Status**: Ready to start after Phase 3 ✅  
**Goal**: Build the core learning experience - synchronized video player with N5 content highlighting

---

## 🎯 What You'll Build

### The Complete Learning Interface

```
┌─────────────────────────────────────────────────────────────┐
│                    VIDEO PLAYER                              │
│                  (with controls)                             │
│                     [▶️ ⏸️ ⏩ 🔊]                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────┐
│  🇯🇵 Japanese             │  🇺🇸 English                    │
│                          │                                 │
│  これは N5 の           │  This is an N5                 │
│  ビデオです。           │  video.                        │
│  (N5 words highlighted)  │  (synchronized translation)    │
│                          │                                 │
│  [0:05] Auto-scrolling   │  [0:05] Auto-scrolling         │
│  [0:12] Click to jump    │  [0:12] Click to jump          │
└──────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📚 N5 Content Summary                                       │
│  ──────────────────────────────────────────────────────     │
│  Vocabulary: 47 words  |  Grammar: 12 patterns  | 85% N5   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features to Implement

### 1. **Video Player Component** 🎬
- ✅ **Library**: Video.js or React Player
- ✅ **Controls**:
  - Play/Pause
  - Seek bar (scrubbing)
  - Volume control
  - Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
  - Fullscreen toggle
- ✅ **Keyboard Shortcuts**:
  - `Space` = Play/Pause
  - `←/→` = Skip 5 seconds
  - `↑/↓` = Volume
  - `F` = Fullscreen

**Why it matters**: Learners need full control to study at their own pace

---

### 2. **Synchronized Transcription Display** 📝
- ✅ **Split-Screen Layout**: Japanese (left) | English (right)
- ✅ **Auto-Scrolling**: Transcription scrolls as video plays
- ✅ **Current Segment Highlighting**: 
  - Active segment has colored background
  - Previous segments are dimmed
  - Upcoming segments are visible but not highlighted
- ✅ **Timestamp Display**: Each segment shows `[0:15]` timestamp
- ✅ **Click-to-Seek**: Click any timestamp → video jumps to that moment

**Technical**: 
```javascript
// Watch video currentTime, update active segment
useEffect(() => {
  const currentSegment = segments.find(
    s => currentTime >= s.start && currentTime < s.end
  );
  setActiveSegment(currentSegment);
  // Auto-scroll to active segment
  segmentRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [currentTime]);
```

---

### 3. **N5 Vocabulary Highlighting** 🟡
- ✅ **Yellow Background**: All N5 words highlighted
- ✅ **Clickable Words**: Click word → see popup with:
  - Kanji form: 学生
  - Reading: がくせい
  - Meaning: student
  - JLPT chapter reference
  - Example sentence from video
- ✅ **Hover Effect**: Instant preview on hover
- ✅ **Furigana Support**: Show reading above kanji (optional toggle)

**Visual Example**:
```
これは <mark style="background: yellow">学生</mark> です。
        └─ Click for definition
```

---

### 4. **N5 Grammar Pattern Highlighting** 🟢
- ✅ **Green Underline**: Grammar patterns marked
- ✅ **Pattern Popup**: Click pattern → show:
  - Pattern name: ～は～です
  - Structure explanation
  - English meaning: "X is Y"
  - Chapter reference
  - Other instances in video
- ✅ **Multiple Patterns**: Handle overlapping patterns gracefully

**Visual Example**:
```
これ<u style="color: green">は</u>学生<u style="color: green">です</u>。
    └─ particle は        └─ copula です
```

---

### 5. **Segment Navigation** ⏭️
- ✅ **N5 Segment Timeline**: Visual bar showing where N5 content is dense
  ```
  0:00 ──●══●════●════●──── 5:00
       ↑  ↑    ↑    ↑
       N5-rich segments (click to jump)
  ```
- ✅ **Prev/Next Buttons**: Jump to previous/next N5-rich segment
- ✅ **Density Color Coding**:
  - 🟢 Green = High N5 density (>80%)
  - 🟡 Yellow = Medium (50-80%)
  - 🔵 Blue = Low (<50%)

---

### 6. **Mobile-Responsive Layout** 📱
- ✅ **Desktop**: Side-by-side transcription
- ✅ **Tablet**: Stacked layout
- ✅ **Mobile**: 
  - Transcription below video
  - Tabs to switch Japanese ↔ English
  - Touch-friendly controls

---

## 🗄️ Database Schema (Already Exists!)

### Tables You'll Use:
```sql
-- Video info
videos (id, filename, status, audio_path, ...)

-- Transcription segments
transcriptions (id, video_id, full_text, segments)

-- Translations
translations (id, transcription_id, full_text, segments)

-- Detected N5 vocabulary
vocabulary_instances (
  id,
  video_id,
  word_id (FK to jlpt_vocabulary),
  timestamp,
  context_sentence
)

-- Detected grammar patterns
detected_grammar (
  id,
  video_id,
  pattern_id (FK to grammar_patterns),
  matched_text,
  timestamp
)
```

**New Table Needed**:
```sql
CREATE TABLE segment_analysis (
  id INTEGER PRIMARY KEY,
  video_id INTEGER,
  segment_index INTEGER,
  start_time REAL,
  end_time REAL,
  n5_word_count INTEGER,
  total_word_count INTEGER,
  n5_density REAL,  -- percentage
  FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

---

## 🔧 Technical Implementation Plan

### Step 1: Video Player Foundation (Day 1)
- [ ] Install video player library
  ```bash
  npm install video.js react-player
  # or
  npm install video-react
  ```
- [ ] Create `VideoPlayer.jsx` component
- [ ] Implement basic video controls
- [ ] Test with existing uploaded videos
- [ ] Handle video loading states

### Step 2: Transcription Sync (Day 2)
- [ ] Create `TranscriptionPanel.jsx` component
- [ ] Implement split-screen layout
- [ ] Sync transcription with video `currentTime`
- [ ] Auto-scroll to active segment
- [ ] Click timestamp → seek video
- [ ] Test synchronization accuracy

### Step 3: N5 Analysis Backend (Day 2-3)
- [ ] Install Japanese tokenizer
  ```bash
  npm install kuromoji  # or tiny-segmenter
  ```
- [ ] Create `n5AnalysisService.js`:
  - [ ] Tokenize Japanese text
  - [ ] Match tokens against N5 vocabulary database
  - [ ] Detect grammar patterns using regex
  - [ ] Calculate segment-level N5 density
  - [ ] Store results in database
- [ ] Create API endpoints:
  ```
  GET /api/videos/:id/analysis        - Get all N5 analysis
  GET /api/videos/:id/vocabulary      - Get detected N5 words
  GET /api/videos/:id/grammar         - Get detected grammar
  ```

### Step 4: Word & Grammar Highlighting (Day 3-4)
- [ ] Create `HighlightedText.jsx` component
- [ ] Implement N5 word highlighting (yellow)
- [ ] Implement grammar pattern highlighting (green)
- [ ] Create `WordPopup.jsx` for definitions
- [ ] Create `GrammarPopup.jsx` for pattern explanations
- [ ] Handle overlapping highlights

### Step 5: Segment Navigation (Day 4)
- [ ] Create `SegmentTimeline.jsx` component
- [ ] Visualize N5 segment density
- [ ] Implement prev/next N5 segment buttons
- [ ] Color-code timeline by density

### Step 6: Polish & Mobile (Day 5)
- [ ] Mobile responsive layout
- [ ] Touch gesture support
- [ ] Performance optimization (lazy load segments)
- [ ] Loading states and error handling
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (ARIA labels)

---

## 📊 Example User Flow

### Scenario: User Studying N5 Video

1. **User clicks "View Analysis"** on a video card
   → Opens `VideoDetailPage.jsx`

2. **Video loads with transcription below**
   → Both Japanese & English visible side-by-side

3. **User clicks Play ▶️**
   → Video starts
   → Transcription auto-scrolls
   → Current segment highlights in real-time

4. **User sees yellow-highlighted word "学生"**
   → Hovers over it
   → Popup shows: "がくせい (student) - Chapter 1"

5. **User clicks timestamp [0:45]**
   → Video jumps to 0:45
   → That segment is now highlighted

6. **User clicks "Next N5 Segment" button**
   → Video jumps to next high-density segment (e.g., 1:23)
   → Timeline shows current position

7. **User adjusts playback speed to 0.75x**
   → Easier to understand fast speakers
   → Transcription still syncs perfectly

8. **User switches to fullscreen**
   → Transcription overlay appears on video
   → Can study without distraction

---

## 🎨 Component Structure

```
VideoDetailPage.jsx
├── VideoPlayer.jsx
│   ├── video.js controls
│   └── playback state management
│
├── TranscriptionPanel.jsx
│   ├── JapanesePane.jsx
│   │   └── HighlightedText.jsx
│   │       ├── N5WordHighlight (yellow)
│   │       └── GrammarHighlight (green)
│   │
│   └── EnglishPane.jsx
│       └── PlainText (no highlights)
│
├── SegmentTimeline.jsx
│   ├── Timeline bar visualization
│   └── Click-to-seek
│
├── N5Summary.jsx
│   ├── Vocabulary count
│   ├── Grammar count
│   └── N5 density percentage
│
└── NavigationControls.jsx
    ├── Prev N5 Segment
    ├── Next N5 Segment
    └── Playback speed selector
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Video plays without errors
- [ ] Transcription scrolls with video
- [ ] Timestamps are accurate (±0.5s)
- [ ] Click timestamp → video seeks correctly
- [ ] N5 words are highlighted correctly
- [ ] Grammar patterns are detected
- [ ] Popups show correct information
- [ ] Prev/Next segment buttons work
- [ ] Playback speed changes work
- [ ] Keyboard shortcuts work

### Performance Tests
- [ ] Handles 100+ segments smoothly
- [ ] No lag when highlighting many words
- [ ] Smooth scrolling on mobile
- [ ] Video loads within 3 seconds
- [ ] Analysis completes within 10 seconds

### Edge Cases
- [ ] Video with no N5 content
- [ ] Video with 100% N5 content
- [ ] Very long videos (30+ min)
- [ ] Very short videos (<30 sec)
- [ ] Segments with no timestamps
- [ ] Overlapping grammar patterns

---

## 💡 Nice-to-Have Features (Phase 4+)

### Optional Enhancements (if time permits):
1. **Furigana Toggle**: Show/hide readings above kanji
2. **Word Bookmarking**: Save words for later review
3. **Export Vocabulary**: Download detected words as flashcards
4. **Playback Loop**: Repeat current segment N times
5. **Speed Control**: Per-segment speed adjustment
6. **Dark Mode**: Eye-friendly for long study sessions
7. **Screenshot**: Capture current frame with transcription
8. **Share Timestamp**: Generate shareable link to specific moment

---

## 📈 Success Metrics

### By End of Phase 4:
- ✅ **Video Player**: Plays smoothly with all controls working
- ✅ **Transcription Sync**: <1 second latency
- ✅ **N5 Detection**: 90%+ accuracy for vocabulary
- ✅ **Grammar Detection**: 85%+ accuracy for patterns
- ✅ **Mobile Support**: Works on iPhone/Android
- ✅ **User Experience**: Intuitive, no tutorial needed

---

## 🚀 After Phase 4: You'll Have...

### A Complete Learning Platform!

Users can:
1. ✅ Upload any Japanese video
2. ✅ Get automatic transcription & translation
3. ✅ **Watch video with synchronized N5 content highlighting** ⭐ (Phase 4)
4. ✅ Click words for instant definitions
5. ✅ Click timestamps to jump in video
6. ✅ See which segments are best for N5 learning

---

## 🔗 Prerequisites (Already Done!)

- [x] Phase 0: Database with N5 vocabulary & grammar ✅
- [x] Phase 1: Video upload & storage ✅
- [x] Phase 2: YouTube integration & audio extraction ✅
- [x] Phase 3: Transcription & translation ✅
- [x] Phase 3 UI: TranscriptionViewer modal ✅

**You have everything needed to start Phase 4!** 🎉

---

## ⏱️ Estimated Timeline

| Day | Tasks | Deliverable |
|-----|-------|------------|
| **Day 1** | Video player setup, basic controls | Working video player |
| **Day 2** | Transcription sync, click-to-seek | Synchronized transcription |
| **Day 3** | N5 analysis backend, tokenization | N5 vocabulary detection |
| **Day 4** | Word highlighting, grammar detection | Visual N5 highlighting |
| **Day 5** | Timeline, navigation, mobile polish | Complete interactive player |

---

## 🎯 The End Goal

**Phase 4 delivers the CORE VALUE PROPOSITION**:

> "Watch any Japanese video and instantly see all N5 vocabulary and grammar highlighted in real-time, with one-click definitions and perfect synchronization."

This is what makes your platform **unique and valuable** for N5 learners! 🚀

---

**Ready to start Phase 4?** Let me know and I'll begin implementing the video player! 🎬

