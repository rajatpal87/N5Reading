# 📊 Phase 5: Learning Dashboard & Analytics - Implementation Plan

**Timeline:** 2-3 days  
**Status:** 🚧 IN PROGRESS  
**Goal:** Create a comprehensive learning dashboard that helps users understand and track their N5 learning progress

---

## 🎯 Overview

Phase 5 builds on top of the working video player (Phase 4) to add detailed analytics, vocabulary lists, and learning tools. This phase focuses on helping users:

1. **Understand** what N5 content is in their video
2. **Navigate** quickly to N5-rich segments
3. **Export** vocabulary for external study tools (Anki, flashcards)
4. **Track** their progress through the content

---

## ✅ What We Already Have (from Phase 4)

### Backend
- ✅ N5 analysis service (`analysisService.js`)
- ✅ API endpoint: `GET /api/videos/:id/analysis`
- ✅ Data available:
  - Summary statistics (total words, N5 count, density, study time)
  - All vocabulary instances with timestamps
  - All grammar instances with timestamps
  - Detailed word and grammar information

### Frontend
- ✅ Video player page showing analysis in sidebar
- ✅ Basic statistics display
- ✅ Vocabulary and grammar lists in right panel
- ✅ Click-to-jump functionality

---

## 🎨 What We'll Build (Phase 5)

### 1. Enhanced Dashboard Component
**Location:** New page at `/dashboard/:id` (separate from video player)

**Purpose:** Dedicated analytics and study planning page

**Features:**
- Video summary card with key statistics
- Detailed N5 vocabulary table (sortable, filterable)
- Grammar patterns list with examples
- Interactive N5 timeline (visual representation)
- Export functionality (CSV, Anki format)
- Study recommendations

### 2. Video Summary Card
```
┌──────────────────────────────────────────────┐
│  📹 Video Title                              │
│  Duration: 5:12  |  Status: ✅ Analyzed     │
├──────────────────────────────────────────────┤
│  📊 N5 Content Analysis                      │
│                                               │
│  🟡 29 Unique N5 Words                       │
│  📝 17 Grammar Patterns                      │
│  ⏱️  Study Time: ~6 minutes                  │
│  📈 N5 Density: 42%                          │
│                                               │
│  [🎥 Watch Video] [📥 Export Vocabulary]    │
└──────────────────────────────────────────────┘
```

### 3. N5 Vocabulary Table
```
┌─────────────────────────────────────────────────────────────┐
│  🟡 N5 Vocabulary Found (29 words)                          │
│  [Filter by Chapter ▼] [Sort by: Frequency ▼] [Search...]  │
├──────────┬──────────┬─────────────┬────────┬──────┬────────┤
│ Japanese │ Reading  │ English     │ Chapter│ Count│ First  │
├──────────┼──────────┼─────────────┼────────┼──────┼────────┤
│ これ     │ これ     │ this        │ Ch. 1  │  15  │ 0:07   │
│ です     │ です     │ is/am/are   │ Ch. 1  │  12  │ 0:09   │
│ わたし   │ わたし   │ I/me        │ Ch. 1  │   8  │ 0:15   │
│ ...      │ ...      │ ...         │ ...    │  ... │ ...    │
└──────────┴──────────┴─────────────┴────────┴──────┴────────┘
                                      29 words total | Page 1 of 1
```

**Features:**
- ✅ Sortable columns (frequency, alphabetical, chapter, first appearance)
- ✅ Filterable by chapter
- ✅ Search functionality
- ✅ Click timestamp → Jump to video at that moment
- ✅ Click word → Show all occurrences in video
- ✅ Export selection to CSV/Anki

### 4. Grammar Patterns List
```
┌─────────────────────────────────────────────────────────────┐
│  📝 Grammar Patterns Detected (17 patterns)                 │
│  [Filter by Chapter ▼]                                       │
├─────────────────────────────────────────────────────────────┤
│  1. ～は～です (X は Y です) - Topic marker + copula        │
│     "This is X" / "As for X, it is Y"                       │
│     📖 Chapter 1  |  ✅ Found 8 times                        │
│     Examples:                                                │
│     • これは ペンです (0:15) → "This is a pen"              │
│     • わたしは 学生です (0:32) → "I am a student"           │
│     [See all instances]                                      │
│                                                              │
│  2. ～を～ます (Object を Verb ます) - Object marker        │
│     "Do [verb] to [object]"                                 │
│     📖 Chapter 6  |  ✅ Found 5 times                        │
│     Examples:                                                │
│     • コーヒーを 飲みます (1:42) → "Drink coffee"           │
│     • 本を 読みます (2:15) → "Read a book"                  │
│     [See all instances]                                      │
│                                                              │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Collapsible pattern cards
- ✅ Pattern explanation with English translation
- ✅ Example sentences from the actual video
- ✅ Click timestamp → Jump to video
- ✅ "See all instances" → Shows timeline of all occurrences
- ✅ Filter by chapter

### 5. Interactive N5 Timeline
```
┌─────────────────────────────────────────────────────────────┐
│  🎯 N5 Content Timeline - Where to Focus Your Study         │
├─────────────────────────────────────────────────────────────┤
│  Legend: █ High N5  ▓ Medium N5  ░ Low N5                  │
│                                                              │
│  0:00 ███░░▓▓███░░░▓███████░░▓▓▓███░░░░░ 5:12             │
│       ↑   ↑     ↑         ↑     ↑                           │
│    Click any segment to jump to that point in video         │
│                                                              │
│  🎯 Best segments for N5 study:                             │
│  • 0:00-0:45  (Dense: 65%) - Introduction, self-intro       │
│  • 1:30-2:15  (Dense: 58%) - Daily routine discussion       │
│  • 3:00-3:45  (Dense: 72%) - Food and preferences           │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Visual timeline showing N5 density across video
- ✅ Color-coded segments (high/medium/low N5 content)
- ✅ Click segment → Jump to video player at that time
- ✅ List of "best segments" for focused study
- ✅ Hover segment → Show preview of content

### 6. Export Functionality
**Formats:**
- **CSV** - For Excel, Google Sheets
- **Anki CSV** - For importing into Anki flashcards
- **PDF** - Printable vocabulary list (future)

**CSV Format:**
```csv
Japanese,Reading,English,Chapter,First Appears,Frequency,Example Sentence
これ,これ,this,Chapter 1,0:07,15,"これは ペンです"
です,です,is/am/are,Chapter 1,0:09,12,"これは ペンです"
わたし,わたし,I/me,Chapter 1,0:15,8,"わたしは 学生です"
```

**Anki CSV Format (front/back cards):**
```csv
これ,this (kore),Chapter 1 - これは ペンです (This is a pen)
です,is/am/are (desu),Chapter 1 - これは ペンです (This is a pen)
```

---

## 🛠️ Technical Implementation

### Backend Changes

#### 1. New API Endpoints (Optional - can use existing)
```javascript
// Already have this, may enhance:
GET /api/videos/:id/analysis

// New endpoints if needed:
GET /api/videos/:id/timeline         // Timeline data with N5 density per segment
GET /api/videos/:id/vocabulary/export // CSV download
GET /api/videos/:id/vocabulary/anki   // Anki CSV download
```

#### 2. Timeline Data Generation
**File:** `backend/src/services/analysisService.js`

Add function to calculate N5 density per time segment:
```javascript
export async function getN5Timeline(videoId) {
  // 1. Divide video into 15-second segments
  // 2. Calculate N5 word count per segment
  // 3. Calculate density percentage
  // 4. Return array of { start, end, density, words, grammar }
}
```

#### 3. Export Service
**File:** `backend/src/services/exportService.js` (NEW)

```javascript
export function generateCSV(vocabularyData) {
  // Convert to CSV format
}

export function generateAnkiCSV(vocabularyData) {
  // Convert to Anki-compatible CSV
}
```

### Frontend Changes

#### 1. New Dashboard Page
**File:** `frontend/src/pages/Dashboard.jsx` (NEW)

Main dashboard component integrating all sub-components.

#### 2. Components to Create
```
frontend/src/components/
├── dashboard/
│   ├── VideoSummaryCard.jsx        - Summary statistics
│   ├── VocabularyTable.jsx         - Sortable vocabulary table
│   ├── GrammarPatternsList.jsx     - Grammar patterns display
│   ├── N5Timeline.jsx              - Interactive timeline
│   └── ExportButton.jsx            - Export dropdown menu
```

#### 3. Update Routing
**File:** `frontend/src/App.jsx`

```jsx
<Route path="/dashboard/:id" element={<Dashboard />} />
```

#### 4. Navigation Flow
```
Home (Video List)
  → Click "📊 Dashboard" button
    → Dashboard page (/dashboard/:id)
      → [🎥 Watch Video] button → Video Player (/video/:id)
```

---

## 📋 Step-by-Step Implementation Plan

### Step 1: Backend - Timeline Data (30 min)
- [ ] Add `getN5Timeline()` function to `analysisService.js`
- [ ] Create timeline API endpoint
- [ ] Test with existing video

### Step 2: Backend - Export Service (45 min)
- [ ] Create `exportService.js`
- [ ] Implement CSV generation
- [ ] Implement Anki CSV generation
- [ ] Create export API endpoints
- [ ] Test downloads

### Step 3: Frontend - Dashboard Page Structure (1 hour)
- [ ] Create `Dashboard.jsx` page
- [ ] Add route in `App.jsx`
- [ ] Fetch analysis data on load
- [ ] Create basic layout with sections

### Step 4: Frontend - Video Summary Card (45 min)
- [ ] Create `VideoSummaryCard.jsx` component
- [ ] Display all statistics
- [ ] Add navigation buttons
- [ ] Style with Tailwind

### Step 5: Frontend - Vocabulary Table (1.5 hours)
- [ ] Create `VocabularyTable.jsx` component
- [ ] Implement sorting (by frequency, alphabetical, chapter)
- [ ] Implement filtering (by chapter)
- [ ] Implement search
- [ ] Add pagination (if > 50 words)
- [ ] Make timestamps clickable
- [ ] Style table

### Step 6: Frontend - Grammar Patterns List (1 hour)
- [ ] Create `GrammarPatternsList.jsx` component
- [ ] Display patterns with examples
- [ ] Make collapsible cards
- [ ] Link to video timestamps
- [ ] Filter by chapter

### Step 7: Frontend - N5 Timeline (1.5 hours)
- [ ] Create `N5Timeline.jsx` component
- [ ] Fetch timeline data
- [ ] Render visual timeline bar
- [ ] Implement click-to-jump
- [ ] Add hover previews
- [ ] List recommended segments

### Step 8: Frontend - Export Functionality (45 min)
- [ ] Create `ExportButton.jsx` component
- [ ] Implement CSV download
- [ ] Implement Anki CSV download
- [ ] Add dropdown menu for format selection
- [ ] Handle download errors

### Step 9: Integration & Polish (1 hour)
- [ ] Add "📊 Dashboard" button to video list cards
- [ ] Add "Dashboard" link in video player
- [ ] Test full flow: Home → Dashboard → Video Player → Back
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling

### Step 10: Testing (1 hour)
- [ ] Test with multiple videos
- [ ] Test sorting/filtering
- [ ] Test export functionality
- [ ] Test timeline interaction
- [ ] Test navigation between pages
- [ ] Cross-browser testing

---

## 🎨 UI/UX Design Principles

### Dashboard Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Videos]                    [🎥 Watch Video]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────┐                     │
│  │  Video Summary Card                │                     │
│  │  (Statistics, Export button)       │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  N5 Timeline (Interactive)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📚 Vocabulary Table (Sortable, Filterable)          │  │
│  │                                                       │  │
│  │  [29 rows shown]                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📝 Grammar Patterns (Collapsible cards)             │  │
│  │                                                       │  │
│  │  [17 patterns shown]                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)
```
┌─────────────────────┐
│ [← Back] [Watch]    │
├─────────────────────┤
│ Video Summary       │
│ (Compact)           │
├─────────────────────┤
│ Timeline            │
│ (Simplified)        │
├─────────────────────┤
│ Vocabulary          │
│ (Compact table)     │
├─────────────────────┤
│ Grammar             │
│ (Accordion)         │
└─────────────────────┘
```

---

## 📊 Success Metrics

**Phase 5 Complete When:**
- [ ] Dashboard page accessible from video list
- [ ] All statistics display correctly
- [ ] Vocabulary table is sortable and filterable
- [ ] Grammar patterns display with examples
- [ ] Timeline is interactive and clickable
- [ ] CSV export works for vocabulary
- [ ] Anki CSV export works
- [ ] Navigation flows work (Home ↔ Dashboard ↔ Video Player)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Loading states implemented
- [ ] Error handling in place

---

## 🚀 Let's Begin!

Starting with **Step 1: Backend - Timeline Data**...

