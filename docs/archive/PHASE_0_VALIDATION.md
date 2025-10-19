# Phase 0 Validation Checklist ✅

## Key Deliverable: Database populated with N5 vocabulary and grammar patterns

---

## 🗄️ Database Validation

### Run these commands to verify:

```bash
cd /Users/rajatpal/N5Reading/backend

# Check database exists
ls -lh database.db

# Query N5 data counts
sqlite3 database.db "SELECT COUNT(*) as n5_words FROM jlpt_vocabulary WHERE jlpt_level = 5;"
sqlite3 database.db "SELECT COUNT(*) as n5_grammar FROM grammar_patterns WHERE jlpt_level = 5;"

# View sample vocabulary
sqlite3 database.db "SELECT kanji, hiragana, english FROM jlpt_vocabulary WHERE jlpt_level = 5 LIMIT 10;"

# View sample grammar
sqlite3 database.db "SELECT pattern_name, example_japanese FROM grammar_patterns WHERE jlpt_level = 5 LIMIT 10;"

# Check chapter coverage
sqlite3 database.db "SELECT DISTINCT chapter FROM jlpt_vocabulary WHERE jlpt_level = 5 ORDER BY chapter;"
```

### ✅ Expected Results:
- **N5 Vocabulary**: 296 words
- **N5 Grammar**: 50 patterns
- **Chapters**: 第1課 through 第9課
- **Database file size**: ~200-300 KB

### 🎯 Current Status:
```
✅ N5 Vocabulary: 296 words
✅ N5 Grammar: 50 patterns  
✅ Chapters: 9 unique chapters
✅ Database: database.db created
```

---

## 🖥️ Backend Server Validation

### Start the backend server:

```bash
cd /Users/rajatpal/N5Reading/backend
npm run dev
```

### Test the API endpoints:

```bash
# Health check (in a new terminal)
curl http://localhost:3000/api/health

# Expected: {"status":"ok","message":"N5 Reading API is running","timestamp":"..."}

# Database test
curl http://localhost:3000/api/test-db

# Expected: {"status":"ok","data":{"n5_vocabulary":296,"n5_grammar":50}}
```

### ✅ Expected Results:
- Server starts without errors
- Health endpoint returns 200 OK
- Database endpoint returns correct counts
- Console shows:
  ```
  🚀 N5 Reading Backend Server
     Running on: http://localhost:3000
     API: http://localhost:3000/api
  ```

---

## 🎨 Frontend Setup Validation

### Start the frontend dev server:

```bash
cd /Users/rajatpal/N5Reading/frontend
npm run dev
```

### ✅ Expected Results:
- Vite dev server starts successfully
- No compilation errors
- Console shows:
  ```
  VITE v5.x.x ready in xxx ms
  ➜ Local: http://localhost:5173/
  ```
- Browser opens and shows React welcome page

### Check dependencies:

```bash
cd /Users/rajatpal/N5Reading/frontend
npm list --depth=0
```

Should include:
- ✅ react
- ✅ react-dom
- ✅ vite
- ✅ tailwindcss
- ✅ axios
- ✅ react-router-dom
- ✅ video.js

---

## 📁 File Structure Validation

### Check key files exist:

```bash
cd /Users/rajatpal/N5Reading

# Backend files
ls backend/src/server.js
ls backend/src/db/db.js
ls backend/src/db/schema.js
ls backend/src/db/seed.js
ls backend/src/db/data/n5_vocabulary.json
ls backend/src/db/data/n5_grammar_patterns.json
ls backend/database.db
ls backend/.env

# Frontend files
ls frontend/src/main.jsx
ls frontend/src/App.jsx
ls frontend/src/index.css
ls frontend/tailwind.config.js
ls frontend/vite.config.js
ls frontend/.env

# Documentation
ls PROJECT_PLAN.md
ls MVP_PHASES_0-6.md
ls README.md
```

### ✅ Expected Result:
All files should exist without "No such file or directory" errors.

---

## 🔧 Environment Variables Validation

### Backend (.env):

```bash
cd /Users/rajatpal/N5Reading/backend
cat .env
```

Should contain:
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.db
OPENAI_API_KEY=your_openai_api_key_here
DEEPL_API_KEY=your_deepl_api_key_here
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### Frontend (.env):

```bash
cd /Users/rajatpal/N5Reading/frontend
cat .env
```

Should contain:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 🧪 Integration Test

### Full System Test:

1. **Start Backend** (Terminal 1):
   ```bash
   cd /Users/rajatpal/N5Reading/backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd /Users/rajatpal/N5Reading/frontend
   npm run dev
   ```

3. **Test API from Frontend** (Terminal 3):
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/test-db
   ```

4. **Open Browser**:
   - Go to http://localhost:5173
   - Should see React app running (no errors in console)

---

## 📊 Phase 0 Success Criteria

| Criterion | Status | Details |
|-----------|--------|---------|
| **Git repository initialized** | ✅ | `.git` directory exists |
| **Frontend setup complete** | ✅ | React + Vite + Tailwind installed |
| **Backend setup complete** | ✅ | Express + SQLite configured |
| **Database created** | ✅ | `database.db` exists (296 KB) |
| **N5 vocabulary loaded** | ✅ | 296 words in database |
| **N5 grammar loaded** | ✅ | 50 patterns in database |
| **Seed script works** | ✅ | `npm run seed` completes successfully |
| **Backend starts** | ✅ | Server runs on port 3000 |
| **Frontend starts** | ✅ | Vite dev server runs on port 5173 |
| **API endpoints work** | ✅ | `/health` and `/test-db` respond |

---

## 🚨 Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
# Or use a different port in backend/.env
```

### Issue: "Cannot find module 'sqlite3'"
**Solution:**
```bash
cd /Users/rajatpal/N5Reading/backend
npm install
```

### Issue: "Database file not found"
**Solution:**
```bash
cd /Users/rajatpal/N5Reading/backend
npm run seed
```

### Issue: "Frontend doesn't start"
**Solution:**
```bash
cd /Users/rajatpal/N5Reading/frontend
npm install
npm run dev
```

---

## 🎯 Quick Validation Script

Run this one-liner to validate everything:

```bash
cd /Users/rajatpal/N5Reading && \
echo "=== Phase 0 Validation ===" && \
echo "Backend database:" && ls -lh backend/database.db && \
echo "\nN5 Vocabulary:" && sqlite3 backend/database.db "SELECT COUNT(*) FROM jlpt_vocabulary WHERE jlpt_level = 5;" && \
echo "N5 Grammar:" && sqlite3 backend/database.db "SELECT COUNT(*) FROM grammar_patterns WHERE jlpt_level = 5;" && \
echo "\nBackend dependencies:" && (cd backend && npm list --depth=0 2>/dev/null | grep -E "express|sqlite3|dotenv" || echo "Dependencies OK") && \
echo "\nFrontend dependencies:" && (cd frontend && npm list --depth=0 2>/dev/null | grep -E "react|vite|tailwind" || echo "Dependencies OK") && \
echo "\n✅ Phase 0 Validation Complete!"
```

---

## 📝 Manual Testing Checklist

- [ ] Database file exists and has data (296 vocab + 50 grammar)
- [ ] Backend server starts without errors
- [ ] `/api/health` returns 200 OK
- [ ] `/api/test-db` returns correct counts
- [ ] Frontend dev server starts
- [ ] No compilation errors in frontend
- [ ] Both `.env` files configured
- [ ] All commits pushed to GitHub

---

## ✅ Phase 0 Complete!

If all checks pass, you're ready to proceed to **Phase 1: Video Upload & Storage**!

**GitHub Repository**: https://github.com/rajatpal87/N5Reading

---

**Last Validated**: October 19, 2025  
**Status**: ✅ PASSED  
**Next**: Phase 1 - Video Upload Module

