# 🎨 JLPT N5 Video Coach - UI/UX Design Documentation

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** Phase 5 Complete, Continuously Evolving

---

## 📋 Executive Summary

### Design Philosophy
**"Learn Without Friction"** - Every design decision prioritizes the learning experience over aesthetics.

### Core Principles
1. **Clarity Over Clever** - Clear labels, obvious actions
2. **Feedback is King** - Always show what's happening
3. **Mobile-First Mindset** - Works on all devices
4. **Progressive Disclosure** - Show complexity only when needed
5. **Consistent Patterns** - Same interactions everywhere

### Design System
- **Color Palette:** Blue (primary), Yellow (N5 highlights), Green (success), Red (errors)
- **Typography:** System fonts (fast loading)
- **Spacing:** Tailwind's 4px increments
- **Components:** Reusable, composable, accessible

---

## 🎨 Color System

### Primary Colors

```css
/* Blue - Primary Actions & Navigation */
--color-primary: #3B82F6;        /* Blue-500 */
--color-primary-hover: #2563EB;  /* Blue-600 */
--color-primary-light: #DBEAFE;  /* Blue-100 */

/* Yellow - N5 Vocabulary Highlights */
--color-n5-highlight: #FEF3C7;   /* Amber-100 */
--color-n5-accent: #F59E0B;      /* Amber-500 */

/* Green - Success & High Density */
--color-success: #10B981;         /* Green-500 */
--color-success-light: #D1FAE5;   /* Green-100 */

/* Red - Errors & Warnings */
--color-error: #EF4444;           /* Red-500 */
--color-error-light: #FEE2E2;     /* Red-100 */

/* Gray - Text & Borders */
--color-text-primary: #111827;    /* Gray-900 */
--color-text-secondary: #6B7280;  /* Gray-500 */
--color-border: #E5E7EB;          /* Gray-200 */
--color-bg: #F9FAFB;              /* Gray-50 */
```

### Usage Guidelines

**Blue (Primary):**
- Main CTAs ("Upload Video", "Upgrade")
- Active navigation
- Links
- Progress bars

**Yellow (N5 Highlights):**
- Vocabulary highlighting in transcription
- N5 word badges
- Study focus areas

**Green (Success):**
- High N5 density segments
- Completed actions
- Positive feedback

**Red (Errors):**
- Low N5 density segments
- Error messages
- Delete actions

---

## 📱 Responsive Design Strategy

### Breakpoints (Tailwind Defaults)

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Layout Patterns

#### Home Page

**Mobile (<768px):**
```
┌─────────────────┐
│  Upload Section │
├─────────────────┤
│  Quick Tips     │
├─────────────────┤
│  Video Card 1   │
├─────────────────┤
│  Video Card 2   │
└─────────────────┘
(stacked, scrollable)
```

**Desktop (≥768px):**
```
┌───────────┬─────────────────┐
│  Upload   │   Video Card 1  │
│  Section  ├─────────────────┤
│           │   Video Card 2  │
│  Quick    ├─────────────────┤
│  Tips     │   Video Card 3  │
│  (fixed)  │  (scrollable)   │
└───────────┴─────────────────┘
```

#### Dashboard

**Mobile (<1024px):**
```
┌─────────────────┐
│  Video Player   │
├─────────────────┤
│  N5 Analysis    │
├─────────────────┤
│  Timeline       │
├─────────────────┤
│  Best Segments  │
├─────────────────┤
│  Vocabulary     │
├─────────────────┤
│  Grammar        │
└─────────────────┘
```

**Desktop (≥1024px):**
```
┌──────────────┬────────────┐
│ Video Player │  Timeline  │
│              │            │
│ N5 Analysis  │   Best     │
│              │ Segments   │
├──────────────┴────────────┤
│ Vocabulary   │   Grammar  │
│   Table      │   Patterns │
└──────────────┴────────────┘
```

---

## 🏠 Page-by-Page Design

### 1. Home Page (`/`)

**Purpose:** Video management hub

**Layout:** Side-by-side (desktop), stacked (mobile)

**Components:**
1. **Upload Section (Left - 40% width)**
   - Drag-and-drop zone
   - YouTube URL input
   - Quick tips collapsible
   - Fixed position (no scroll)

2. **Video List (Right - 60% width)**
   - Grid layout (responsive)
   - Video cards with status
   - Action buttons (contextual)
   - Scrollable independent of left section

**Key Features:**
- ✅ Drag-and-drop with hover state
- ✅ Client-side validation feedback
- ✅ Real-time status updates
- ✅ Progress bars during processing
- ✅ Retry buttons on errors

**Design Iterations:**
- **v1.0:** Single column, cluttered
- **v2.0:** Side-by-side for better space usage
- **v2.5:** Compact upload section (reduced by 30%)
- **v3.0:** Uniform card heights with aligned buttons

---

### 2. Video Player Page (`/video/:id`)

**Purpose:** Immersive learning experience

**Layout:**
```
┌───────────────────────────────────────┐
│  ← Back to Home                       │
├───────────────────────────────────────┤
│                                       │
│         Video Player (HTML5)          │
│         (16:9 aspect ratio)           │
│                                       │
├──────────────────┬────────────────────┤
│  Japanese (JP)   │  English (EN)     │
│  ━━━━━━━━━━━━━━ │  ━━━━━━━━━━━━━━  │
│  こんにちは、     │  Hello,           │
│  皆さん。         │  everyone.        │
│  今日は N5 の     │  Today is         │
│  ビデオです。     │  an N5 video.     │
│                  │                    │
│  (auto-scroll,   │  (synchronized)   │
│   highlighted)   │                    │
└──────────────────┴────────────────────┘
      │
      ▼ (scroll down)
┌───────────────────────────────────────┐
│  N5 Analysis Sidebar                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  📊 Quick Summary                     │
│  - 29 N5 words                        │
│  - 17 grammar patterns                │
│  - 10% N5 density                     │
│                                       │
│  📚 Vocabulary                        │
│  - こんにちは (Hello)                 │
│  - 今日 (Today)                       │
│  ...                                  │
│                                       │
│  📝 Grammar                           │
│  - ～は～です (Topic marker)         │
│  ...                                  │
└───────────────────────────────────────┘
```

**Key Features:**
- ✅ Native HTML5 player (reliable)
- ✅ Auto-scrolling transcription (synchronized)
- ✅ N5 word highlighting (yellow background)
- ✅ Clickable timestamps (jump to moment)
- ✅ Current segment emphasis (bold)

**Interaction Patterns:**
- Click timestamp → Video jumps
- Video plays → Transcription auto-scrolls
- Hover N5 word → Future: Show definition tooltip

---

### 3. Dashboard Page (`/dashboard/:id`)

**Purpose:** Learning analytics and study tools

**Layout Philosophy:** "Everything in View"
- Video player visible while reviewing data
- Minimal scrolling required
- Clickable elements jump to video

**Horizontal Split (Desktop):**
```
┌────────────────────────┬────────────────┐
│ Left (60%)             │ Right (40%)    │
│                        │                │
│ ┌────────────────────┐ │ ┌────────────┐│
│ │ Video Player       │ │ │  Timeline  ││
│ │ (max-h: 400px)     │ │ │  (color-   ││
│ └────────────────────┘ │ │   coded)   ││
│                        │ └────────────┘│
│ ┌────────────────────┐ │                │
│ │ N5 Analysis        │ │ ┌────────────┐│
│ │ (4 stat cards)     │ │ │    Best    ││
│ │ (compact: ~120px)  │ │ │  Segments  ││
│ └────────────────────┘ │ │ (scrollable│
│                        │ │  if needed)││
│                        │ └────────────┘│
└────────────────────────┴────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Bottom (Split 50/50)                     │
│ ┌───────────────────┬──────────────────┐│
│ │  Vocabulary Table │ Grammar Patterns ││
│ │  (sortable, search│ (sortable,search)││
│ │   h-[600px])      │  h-[600px])      ││
│ └───────────────────┴──────────────────┘│
└──────────────────────────────────────────┘
```

**Component Breakdown:**

#### A. Video Player (Embedded)
- Full controls
- Synchronized with all components
- **Floating PiP Mode:**
  - Triggers when scrolling past main player
  - Bottom-right corner positioning
  - Smaller size (320×180px)
  - Synchronized playback

#### B. N5 Content Analysis (Enhanced Cards)
```
┌────────────────────────────────────────┐
│  📊 N5 Content Analysis                │
├───────────┬───────────┬───────────────┤
│ 📚 N5     │ 📝 Grammar│ ⏱️ Est.       │
│ Vocabulary│ Patterns  │ Study Time    │
│           │           │               │
│    29     │    17     │   6 mins      │
│ Unique    │ N5 struct.│               │
│ words     │           │               │
├───────────┴───────────┴───────────────┤
│ 🎯 N5 Density: 10%                    │
│ Content: Difficulty: Beginner         │
└────────────────────────────────────────┘
```

**Design Improvements:**
- Compact spacing (p-3, gap-2)
- Smaller text (text-sm, text-xs)
- Simplified labels
- Gradient backgrounds
- Icons for visual recognition

#### C. Interactive N5 Timeline
```
┌────────────────────────────────────────┐
│ 🎯 N5 Content Timeline                │
├────────────────────────────────────────┤
│ 0:00 ██▓▓░░░░██▓▓░░░░██▓░░░░ 5:00     │
│      ▲  ▲    ▲  ▲    ▲  ▲              │
│      │  │    │  │    │  └─ Low (gray) │
│      │  │    │  │    └─── Medium (yellow)│
│      │  │    │  └──────── High (green)│
│      └──┴─────────────────────────────│
│        Clickable segments             │
└────────────────────────────────────────┘
```

**Features:**
- 15-second segment granularity
- Color-coded by N5 density
- Hover shows segment details
- Click jumps to video
- Bi-directional highlighting with best segments

#### D. Best Segments (Ranked List)
```
┌────────────────────────────────────────┐
│  ⭐ Best Segments for Study (Top 5)   │
├────────────────────────────────────────┤
│ #1 ██████████ 75% N5 density          │
│    1:30 - 1:45 (15s) | 12W | 3G       │
├────────────────────────────────────────┤
│ #2 ████████░░ 67% N5 density          │
│    0:15 - 0:30 (15s) | 10W | 2G       │
├────────────────────────────────────────┤
│ ... (scrollable if needed)            │
└────────────────────────────────────────┘
```

**Enhancements:**
- Full timestamp range (start-end)
- Segment duration
- Word count (W) and Grammar count (G)
- Visual progress bars
- Click to jump to video
- Auto-scroll into view on hover

#### E. Vocabulary Table
```
┌────────────────────────────────────────┐
│ 📚 N5 Vocabulary (29 words)            │
├────────────────────────────────────────┤
│ [Sort: Frequency ▼] [Chapter: All ▼]  │
│ [Search...                          ]  │
├────────┬─────────┬──────────┬─────────┤
│Japanese│ Reading │ English  │First App│
├────────┼─────────┼──────────┼─────────┤
│ です   │  です   │ is, am   │🕐 0:00  │
│ こんにち│ こんにち│ hello    │🕐 0:02  │
│ は     │  わ     │          │         │
│ ...    │  ...    │  ...     │  ...    │
└────────┴─────────┴──────────┴─────────┘
```

**Features:**
- Sortable (frequency, alphabetical, chapter)
- Filterable by chapter
- Real-time search
- Sticky header
- Clickable timestamps
- Frequency badge (×3)

#### F. Grammar Patterns List
```
┌────────────────────────────────────────┐
│ 📝 N5 Grammar Patterns (17 patterns)   │
├────────────────────────────────────────┤
│ [Sort: Frequency ▼] [Chapter: All ▼]  │
│ [Search...                          ]  │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐│
│ │ ～は～です (×8)             第1課 ││
│ │ X は Y です - Topic marker        ││
│ │ Example: これは ペンです          ││
│ │ 🕐 0:00, 0:15, 0:30...            ││
│ └────────────────────────────────────┘│
│ ┌────────────────────────────────────┐│
│ │ ～の (×6)                   第2課 ││
│ │ ...                               ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

**Features:**
- Sortable and filterable (like vocabulary)
- Pattern cards with full details
- Clickable timestamp examples
- Matched text examples from video
- Chapter references

---

## 🎭 Interactive States & Feedback

### Video Card States

```
┌────────────────────────────────────────┐
│ State: uploaded                        │
├────────────────────────────────────────┤
│ 📹 video.mp4                           │
│ ⏱️ 5:12  |  📦 45.2 MB                 │
│                                        │
│ [🎵 Extract Audio]              [🗑️]  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ State: extracting_audio (animated)     │
├────────────────────────────────────────┤
│ 📹 video.mp4                           │
│ ⏱️ 5:12  |  📦 45.2 MB                 │
│                                        │
│ ████████░░░░░░░░ 60% Extracting...     │
│ Status: Extracting audio from video    │
│ Est. time: 15s                         │
│ [Processing...] (disabled)      [🗑️]  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ State: completed                       │
├────────────────────────────────────────┤
│ 📹 video.mp4                           │
│ ⏱️ 5:12  |  📦 45.2 MB | ✅ Ready      │
│                                        │
│ [🔊 Play Audio] [📄 View]       [🗑️]  │
│                                        │
│ [📊 Dashboard]                         │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ State: error                           │
├────────────────────────────────────────┤
│ 📹 video.mp4                           │
│ ⏱️ 5:12  |  📦 45.2 MB | ❌ Error      │
│                                        │
│ ⚠️ Audio extraction failed             │
│ Error: FFmpeg not found                │
│                                        │
│ [🔄 Retry Extraction]           [🗑️]  │
└────────────────────────────────────────┘
```

### Button States

```css
/* Default */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded
         hover:bg-blue-600 transition-colors;
}

/* Hover */
.btn-primary:hover {
  @apply bg-blue-600 shadow-md transform scale-105;
}

/* Loading */
.btn-primary.loading {
  @apply opacity-75 cursor-not-allowed;
  /* Add spinner icon */
}

/* Disabled */
.btn-primary:disabled {
  @apply bg-gray-300 cursor-not-allowed;
}
```

### Progress Indicators

**1. Determinate Progress (Known Duration)**
```
████████████████████░░░░ 80%
Status: Translating segment 64/96...
Est. time: 32s
```

**2. Indeterminate Progress (Unknown Duration)**
```
🔄 Processing...
Status: Extracting audio from video...
```

**3. Success Feedback**
```
✅ Transcription complete!
29 N5 words detected.
[View Results]
```

**4. Error Feedback**
```
❌ Transcription failed
Error: API rate limit exceeded
[Retry] [Contact Support]
```

---

## 🎨 Component Library

### Buttons

```jsx
// Primary CTA
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
  Upload Video
</button>

// Secondary Action
<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors">
  Cancel
</button>

// Danger Action
<button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors">
  Delete
</button>

// Icon Button
<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
  🗑️
</button>
```

### Cards

```jsx
// Basic Card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* Content */}
</div>

// Interactive Card (clickable)
<div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all">
  {/* Content */}
</div>

// Stat Card (Dashboard)
<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 flex flex-col items-center gap-1.5">
  <div className="text-2xl">📚</div>
  <div className="text-xl font-bold text-blue-900">29</div>
  <div className="text-xs text-blue-700">N5 Vocabulary</div>
</div>
```

### Inputs

```jsx
// Text Input
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all"
  placeholder="Search vocabulary..."
/>

// File Input (Hidden)
<input
  type="file"
  accept="video/*"
  className="hidden"
  id="video-upload"
/>
<label
  htmlFor="video-upload"
  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
>
  Select Video
</label>
```

### Badges

```jsx
// Status Badge
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  ✅ Ready
</span>

// Frequency Badge
<span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
  ×3
</span>

// Chapter Badge
<span className="text-xs text-gray-500">
  第1課
</span>
```

---

## 🔄 User Flows

### Flow 1: Upload & Process Video

```
1. User arrives on home page
   │
2. Drags video file onto upload zone
   │
3. Green border appears (hover state)
   │
4. Drops file
   │
5. Client-side validation:
   │  ├─ Valid? → Continue
   │  └─ Invalid? → Show error message
   │
6. Upload progress bar (0-100%)
   │
7. Video card appears in list (status: uploaded)
   │
8. User clicks "Extract Audio"
   │
9. Progress bar shows extraction (animated)
   │
10. Status changes to "audio_extracted"
   │
11. "Play Audio" button appears (inline player)
   │
12. User clicks "Transcribe & Translate"
   │
13. Progress updates in real-time:
    │  - Transcribing... (80%, 30s remaining)
    │  - Translating... (95%, 5s remaining)
   │
14. Status changes to "completed"
   │
15. "View Transcription" and "Dashboard" buttons appear
   │
16. User clicks "Dashboard"
   │
17. Full dashboard loads with analysis
```

### Flow 2: Dashboard Learning Flow

```
1. User opens dashboard
   │
2. Video player loads (paused)
   │
3. N5 analysis cards display stats
   │
4. Timeline shows color-coded segments
   │
5. Best segments list recommends study areas
   │
6. User hovers over timeline segment
   │  └─> Corresponding best segment highlights
   │      and scrolls into view
   │
7. User clicks on timeline segment
   │  └─> Video jumps to that timestamp
   │      and starts playing
   │
8. User scrolls down to review vocabulary
   │  └─> Video player floats to bottom-right (PiP)
   │
9. User filters vocabulary by Chapter 2
   │  └─> Table updates instantly
   │
10. User clicks timestamp in vocabulary table
    │  └─> Floating video jumps to that moment
    │
11. User clicks "Export Vocabulary"
    │  └─> CSV file downloads
    │
12. User imports CSV into Anki
    │  └─> Flashcards created for study
```

---

## ♿ Accessibility

### Keyboard Navigation

```
Tab         → Move between interactive elements
Shift+Tab   → Move backwards
Enter       → Activate buttons/links
Space       → Toggle checkboxes, play/pause video
Arrow Keys  → Navigate within components (future)
Esc         → Close modals
```

### Screen Reader Support

**ARIA Labels:**
```jsx
// Button
<button aria-label="Upload video file">
  📤
</button>

// Progress Bar
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Video processing progress"
>
  {progress}%
</div>

// Status
<div aria-live="polite" aria-atomic="true">
  Status: {statusMessage}
</div>
```

### Color Contrast

All text meets WCAG AA standards:
- **Normal text:** 4.5:1 contrast ratio
- **Large text:** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

---

## 📊 Design Metrics

### Efficiency Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| Time to upload video | <30s | ✅ ~15s |
| Time to find vocabulary | <5s | ✅ ~2s (search) |
| Clicks to dashboard | ≤2 | ✅ 1 click |
| Mobile usability score | >90 | 🔄 TBD |

### User Satisfaction

| Metric | Target | Status |
|--------|--------|--------|
| Intuitive navigation | >80% | 🔄 Beta testing |
| Feature discoverability | >70% | 🔄 Beta testing |
| Error recovery success | >90% | ✅ Retry buttons |

---

## 🔮 Future UI/UX Enhancements

### Phase 6+
- [ ] Dark mode support
- [ ] Custom keyboard shortcuts
- [ ] Vocabulary word tooltips on hover
- [ ] Timeline zoom controls
- [ ] Video playback speed controls
- [ ] Bookmark/save favorite segments
- [ ] Comparison view (multiple videos)
- [ ] Onboarding tutorial overlay
- [ ] Interactive feature tour

### Phase 10+
- [ ] Flashcard practice mode (in-app)
- [ ] Spaced repetition scheduling
- [ ] Progress tracking visualization
- [ ] Achievement badges
- [ ] Study streak counter
- [ ] Community-shared videos
- [ ] Video annotations/notes
- [ ] Multi-language UI

---

## 🎓 Design Lessons Learned

### 1. Side-by-Side Layout (Home Page)
**Problem:** Single column was cluttered  
**Solution:** Split into upload (left) + video list (right)  
**Result:** 40% better space utilization, clearer hierarchy

### 2. Compact Spacing (Dashboard)
**Problem:** Too much white space, excessive scrolling  
**Solution:** Reduced padding, tighter gaps, smaller text  
**Result:** 30% height reduction, all content visible

### 3. Floating Video Player
**Problem:** Lost video context when reviewing data  
**Solution:** Picture-in-picture mode on scroll  
**Result:** Better learning flow, no context switching

### 4. Uniform Card Heights
**Problem:** Video cards had misaligned buttons  
**Solution:** Flexbox with equal heights  
**Result:** Professional appearance, easier scanning

### 5. Bi-directional Highlighting
**Problem:** Hard to correlate timeline with segments  
**Solution:** Hover on timeline → highlight segment list  
**Result:** Intuitive navigation, better data exploration

### 6. Real-Time Progress
**Problem:** Users anxious during processing  
**Solution:** Progress bars + time estimates + status messages  
**Result:** Reduced perceived wait time, fewer support questions

---

## 📚 Design System Documentation

### Spacing Scale (Tailwind)
```
0   → 0px
1   → 4px    (0.25rem)
2   → 8px    (0.5rem)
3   → 12px   (0.75rem)
4   → 16px   (1rem)
5   → 20px   (1.25rem)
6   → 24px   (1.5rem)
8   → 32px   (2rem)
10  → 40px   (2.5rem)
12  → 48px   (3rem)
```

### Typography Scale
```
text-xs    → 12px (0.75rem)
text-sm    → 14px (0.875rem)
text-base  → 16px (1rem)
text-lg    → 18px (1.125rem)
text-xl    → 20px (1.25rem)
text-2xl   → 24px (1.5rem)
text-3xl   → 30px (1.875rem)
```

### Border Radius
```
rounded-sm  → 2px
rounded     → 4px
rounded-md  → 6px
rounded-lg  → 8px
rounded-xl  → 12px
rounded-full → 9999px
```

---

**Last Updated:** October 19, 2025  
**Status:** Actively Evolving  
**Next Review:** After Phase 6 (polish & testing)

---

**© 2025 JLPT N5 Video Coach | Designed for Learners, Built with Care**

