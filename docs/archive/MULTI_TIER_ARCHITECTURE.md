# 🏗️ Multi-Tier JLPT Architecture

## Overview

The platform is designed from the ground up to support **progressive JLPT level subscriptions** (N5 → N4 → N3 → N2 → N1), even though the MVP will only implement N5.

---

## Key Design Principles

### 1. **Database Tables are Level-Agnostic**

Instead of separate tables per level, we use a single table with a `jlpt_level` column:

```sql
-- ✅ GOOD: Extensible design
CREATE TABLE jlpt_vocabulary (
  id INTEGER PRIMARY KEY,
  kanji TEXT,
  hiragana TEXT,
  english TEXT,
  jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
  -- ... other fields
);

-- ❌ BAD: Would require 5 separate tables
-- n5_vocabulary, n4_vocabulary, n3_vocabulary, n2_vocabulary, n1_vocabulary
```

**Benefits:**
- Add new levels by inserting data with `jlpt_level = 4`, `jlpt_level = 3`, etc.
- No schema changes required for N4, N3, N2, N1
- Single query can search across all levels user has access to

---

### 2. **User Subscription Tier Controls Access**

Users have a `max_jlpt_level` field that determines what content they can access:

```sql
CREATE TABLE users (
  -- ...
  subscription_tier TEXT CHECK(subscription_tier IN 
    ('trial', 'free', 'n5_monthly', 'n5_annual', 'n4_monthly', 'n4_annual', 
     'n3_monthly', 'n3_annual', 'n2_monthly', 'n2_annual', 'n1_monthly', 'n1_annual')),
  max_jlpt_level INTEGER DEFAULT 5 CHECK(max_jlpt_level IN (5, 4, 3, 2, 1)),
  -- 5=N5, 4=N4, 3=N3, 2=N2, 1=N1 (lower number = higher level)
);
```

**Access Logic:**
```javascript
// N4 subscriber (max_jlpt_level = 4) can access N5 + N4
function canAccessLevel(user, contentLevel) {
  return user.max_jlpt_level <= contentLevel;
}

// Examples for N4 subscriber:
canAccessLevel(user, 5); // true (N5 content)
canAccessLevel(user, 4); // true (N4 content)
canAccessLevel(user, 3); // false (N3 requires upgrade)
```

---

### 3. **Progressive Pricing Tiers**

Each subscription tier grants access to **all previous levels**:

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | N5 only (2 videos/month) |
| N5 Learner | $9.99 | N5 (unlimited) |
| N4 Learner | $14.99 | N5 + N4 |
| N3 Learner | $19.99 | N5 + N4 + N3 |
| N2 Learner | $24.99 | N5 + N4 + N3 + N2 |
| N1 Master | $29.99 | All levels (N5 → N1) |

**Why This Works:**
- Natural upgrade path as users learn
- Clear value at each tier
- Higher tiers = more content + advanced analysis
- Cumulative access prevents downgrade frustration

---

### 4. **Progress Tracking by Level**

Separate progress tracking for each JLPT level:

```sql
CREATE TABLE user_jlpt_progress (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
  words_encountered INTEGER DEFAULT 0,
  words_learning INTEGER DEFAULT 0,
  words_known INTEGER DEFAULT 0,
  total_words_in_level INTEGER NOT NULL,
  -- Calculate mastery: (words_known / total_words_in_level) * 100
  UNIQUE(user_id, jlpt_level)
);
```

**Use Cases:**
- Show progress per level: "N5: 450/800 words mastered (56%)"
- Trigger upgrade prompts: "You've mastered 70% of N5! Ready for N4?"
- Analytics: Track which level users are actively studying

---

### 5. **Analysis Engine Filtering**

The detection engine respects user subscription tier:

```javascript
// Detect vocabulary based on user's subscription
async function detectVocabulary(transcription, user) {
  const tokens = tokenize(transcription.text);
  
  // Only search for words at levels user has access to
  const detectedWords = await db.query(`
    SELECT * FROM jlpt_vocabulary 
    WHERE jlpt_level >= ?   -- 5 >= 5 (N5), 5 >= 4 (N4), etc.
    AND (kanji IN (?) OR hiragana IN (?))
  `, [user.max_jlpt_level, tokens, tokens]);
  
  return detectedWords;
}
```

**Benefits:**
- Free users: Only see N5 words
- N4 subscribers: See N5 + N4 words
- N3 subscribers: See N5 + N4 + N3 words
- Automatic filtering by tier

---

### 6. **Stripe Product Structure**

```javascript
// Stripe products (setup in Phase 8)
const stripeProducts = {
  n5_monthly: {
    price: '$9.99',
    interval: 'month',
    features: ['N5 analysis', 'Unlimited videos'],
    max_jlpt_level: 5
  },
  n5_annual: {
    price: '$99',
    interval: 'year',
    features: ['N5 analysis', 'Unlimited videos', 'Save $20'],
    max_jlpt_level: 5
  },
  n4_monthly: {
    price: '$14.99',
    interval: 'month',
    features: ['N5 + N4 analysis', 'Unlimited videos'],
    max_jlpt_level: 4
  },
  n4_annual: {
    price: '$149',
    interval: 'year',
    features: ['N5 + N4 analysis', 'Unlimited videos', 'Save $30'],
    max_jlpt_level: 4
  },
  // ... N3, N2, N1 products
};
```

**Upgrade Flow:**
1. User masters 70% of current level
2. System shows upgrade prompt
3. User clicks "Upgrade to N4"
4. Stripe handles prorated billing
5. User's `max_jlpt_level` updates to 4
6. Immediately access N4 content

---

## MVP Implementation (Phases 0-6)

### What We Build Now:
- ✅ Database schema supports all levels
- ✅ `jlpt_vocabulary` table (only N5 data seeded)
- ✅ `grammar_patterns` table (only N5 patterns seeded)
- ✅ Analysis engine respects `jlpt_level` filtering
- ✅ No payment integration yet (everyone has full access)

### What We Don't Build Yet:
- ❌ N4, N3, N2, N1 data (add in Phases 11-13)
- ❌ User authentication (Phase 8)
- ❌ Subscription tiers (Phase 8)
- ❌ Upgrade prompts (Phase 11)
- ❌ Multi-level simultaneous detection UI (Phase 11)

---

## Phase 8: Add Payments (N5 Only)

- Implement user authentication
- Add Stripe integration
- Launch N5 subscription tier ($9.99/month)
- Set `max_jlpt_level = 5` for paid users
- Free tier: 2 videos/month

**No Multi-Tier Yet** - Just validate single-tier monetization

---

## Phase 11: Add N4 Level

### Data Preparation:
```javascript
// Extract N4 vocabulary from PDFs
const n4Vocab = [
  { kanji: '勉強', hiragana: 'べんきょう', english: 'study', jlpt_level: 4 },
  { kanji: '大切', hiragana: 'たいせつ', english: 'important', jlpt_level: 4 },
  // ... ~1,500 N4 words
];

// Seed database
await db.insertMany('jlpt_vocabulary', n4Vocab);
```

### Update Stripe:
```javascript
// Add N4 products to Stripe
stripe.products.create({
  name: 'N4 Learner - Monthly',
  description: 'N5 + N4 level analysis',
  prices: [{ amount: 1499, currency: 'usd', interval: 'month' }]
});
```

### Upgrade Flow:
```javascript
// Check if user is ready for upgrade
const n5Mastery = await getUserMastery(userId, 5);

if (n5Mastery >= 70 && user.max_jlpt_level === 5) {
  // Show upgrade modal
  showUpgradePrompt({
    currentTier: 'N5 Learner',
    nextTier: 'N4 Learner',
    newPrice: '$14.99/month',
    additionalValue: 'N4 level analysis (1,500+ new words)'
  });
}
```

---

## Phase 12: Add N3 Level

- Extract N3 vocabulary (~3,000 words)
- Seed `jlpt_level = 3`
- Add N3 Stripe products
- Update UI to show 3 levels simultaneously
- Performance optimization (more vocab = slower matching)

---

## Future: N2 & N1 Levels

- Same pattern: Extract data → Seed DB → Add Stripe products
- No schema changes needed
- Just add data with `jlpt_level = 2` and `jlpt_level = 1`

---

## Key Queries for Multi-Tier

### Get User's Accessible Vocabulary:
```sql
SELECT * FROM jlpt_vocabulary
WHERE jlpt_level >= (SELECT max_jlpt_level FROM users WHERE id = ?)
ORDER BY jlpt_level DESC;
```

### Calculate Mastery by Level:
```sql
SELECT 
  jlpt_level,
  COUNT(*) as total_words,
  SUM(CASE WHEN status = 'known' THEN 1 ELSE 0 END) as known_words,
  ROUND(100.0 * SUM(CASE WHEN status = 'known' THEN 1 ELSE 0 END) / COUNT(*), 2) as mastery_percent
FROM user_vocabulary
WHERE user_id = ?
GROUP BY jlpt_level;
```

### Track Tier Upgrades:
```sql
INSERT INTO subscription_events (user_id, event_type, from_tier, to_tier, from_jlpt_level, to_jlpt_level)
VALUES (?, 'upgraded', 'n5_monthly', 'n4_monthly', 5, 4);
```

---

## Revenue Impact

### Single-Tier (N5 only):
- 1,000 users × $9.99/month = $9,990/month
- Average LTV: $120 (12 months × $9.99)

### Multi-Tier (N5 + N4 + N3):
- 700 N5 × $9.99 = $6,993
- 500 N4 × $14.99 = $7,495
- 400 N3 × $19.99 = $7,996
- **Total: $22,484/month** (1,600 users)
- **Average revenue per user: $14.05** (+41%)
- **Average LTV: $400-800** (2-4 year journey)

**2.25x revenue with fewer users!**

---

## Testing Multi-Tier Access

```javascript
// Test cases for access control
describe('Multi-Tier Access Control', () => {
  it('Free user can only access N5', () => {
    const user = { subscription_tier: 'free', max_jlpt_level: 5 };
    expect(canAccessLevel(user, 5)).toBe(true);  // N5 ✅
    expect(canAccessLevel(user, 4)).toBe(false); // N4 ❌
  });

  it('N4 subscriber can access N5 and N4', () => {
    const user = { subscription_tier: 'n4_monthly', max_jlpt_level: 4 };
    expect(canAccessLevel(user, 5)).toBe(true);  // N5 ✅
    expect(canAccessLevel(user, 4)).toBe(true);  // N4 ✅
    expect(canAccessLevel(user, 3)).toBe(false); // N3 ❌
  });

  it('N1 Master can access all levels', () => {
    const user = { subscription_tier: 'n1_monthly', max_jlpt_level: 1 };
    expect(canAccessLevel(user, 5)).toBe(true); // N5 ✅
    expect(canAccessLevel(user, 4)).toBe(true); // N4 ✅
    expect(canAccessLevel(user, 3)).toBe(true); // N3 ✅
    expect(canAccessLevel(user, 2)).toBe(true); // N2 ✅
    expect(canAccessLevel(user, 1)).toBe(true); // N1 ✅
  });
});
```

---

## Summary

### ✅ Architecture Benefits:

1. **Extensible**: Add new levels without schema changes
2. **Efficient**: Single query can search all accessible levels
3. **Scalable**: Progressive pricing increases revenue per user
4. **User-Friendly**: Natural upgrade path aligned with learning journey
5. **Business-Smart**: Higher LTV, lower churn, better retention

### 🎯 Next Steps:

1. **Phase 0**: Extract N5 data from PDFs
2. **Phases 1-6**: Build MVP with N5 analysis only
3. **Phase 8**: Add authentication + N5 subscriptions
4. **Phase 11**: Launch N4 tier (first multi-tier expansion)
5. **Phase 12**: Launch N3 tier (prove the model)
6. **Future**: Complete N2 and N1 for full JLPT coverage

---

**Version**: 2.0  
**Last Updated**: October 19, 2025  
**Status**: Architecture Finalized - Ready for Implementation

