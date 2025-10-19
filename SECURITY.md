# 🔒 Security Documentation

## Security Measures Implemented

This document outlines all security measures implemented in the N5 Reading platform.

---

## ✅ Implemented Security Features

### 1. Rate Limiting

**Purpose:** Prevent abuse, spam, and DDoS attacks

**Implementation:**
- Global rate limit: 100 requests per 15 minutes per IP
- Upload rate limit: 10 uploads per 15 minutes per IP
- Middleware: `express-rate-limit`

**Configuration:**
```javascript
// Global limiter
windowMs: 15 * 60 * 1000 (15 minutes)
max: 100 requests per IP

// Upload limiter
windowMs: 15 * 60 * 1000 (15 minutes)
max: 10 requests per IP
```

**Response on limit exceeded:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

### 2. Security Headers (Helmet.js)

**Purpose:** Protect against common web vulnerabilities

**Headers Set:**
- `Content-Security-Policy` - Prevent XSS attacks
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - Enable browser XSS filter
- `Strict-Transport-Security` - Enforce HTTPS (production)

**CSP Configuration:**
```javascript
defaultSrc: ["'self'"]
styleSrc: ["'self'", "'unsafe-inline'"]
scriptSrc: ["'self'"]
imgSrc: ["'self'", "data:", "https:"]
```

---

### 3. CORS Protection

**Purpose:** Control which domains can access the API

**Allowed Origins:**
- `http://localhost:5173` (Frontend dev)
- `http://localhost:3000` (Backend dev)
- Production frontend URL (when deployed)
- Development mode: all origins allowed

**Configuration:**
```javascript
credentials: true
optionsSuccessStatus: 200
```

---

### 4. Input Validation & Sanitization

**Purpose:** Prevent injection attacks and malicious input

**Implemented:**
- File upload validation (type, size, content)
- Video ID validation (integer, positive)
- Filename sanitization (remove special chars, prevent path traversal)
- XSS prevention (strip script tags, javascript: protocol, event handlers)

**Validation Examples:**
```javascript
// File upload
- Max size: 100MB
- Allowed types: MP4, AVI, MOV, MKV, WEBM
- Filename sanitization: remove path separators

// Video ID
- Must be positive integer
- Validated before database queries
```

---

### 5. Request Size Limits

**Purpose:** Prevent memory exhaustion attacks

**Limits:**
- JSON payload: 10MB
- URL-encoded payload: 10MB
- File upload: 100MB

---

### 6. Error Sanitization

**Purpose:** Prevent information disclosure

**Behavior:**
- Development: Full error details + stack trace
- Production: Generic error message only
- All errors logged server-side for debugging
- No internal paths or database details exposed

**Example Responses:**

Development:
```json
{
  "error": "Database connection failed",
  "stack": "Error: Connection timeout at..."
}
```

Production:
```json
{
  "error": "An unexpected error occurred"
}
```

---

### 7. Request Logging

**Purpose:** Track suspicious activity and debug issues

**Implementation:**
- Middleware: `morgan`
- Development: 'dev' format (colored, concise)
- Production: 'combined' format (Apache standard)

**Logged Information:**
- IP address
- HTTP method
- URL path
- Status code
- Response time
- User agent

---

### 8. SQL Injection Protection

**Purpose:** Prevent database attacks

**Implementation:**
- ✅ Parameterized queries (no string concatenation)
- ✅ Input validation before queries
- ✅ Type checking (integers, strings)

**Example:**
```javascript
// SAFE
db.query('SELECT * FROM videos WHERE id = ?', [id])

// UNSAFE (not used)
db.query('SELECT * FROM videos WHERE id = ' + id)
```

---

### 9. XSS Protection

**Purpose:** Prevent cross-site scripting attacks

**Implementation:**
- Input sanitization (remove script tags)
- CSP headers (block inline scripts)
- HTML entity encoding (future frontend implementation)

---

### 10. File Upload Security

**Purpose:** Prevent malicious file uploads

**Protections:**
- File type whitelist (video formats only)
- File size limit (100MB)
- Filename sanitization
- Unique filename generation (timestamp-based)
- Disk storage (not memory)
- Upload rate limiting (10 per 15 min)

---

## 🔐 Security Best Practices Followed

### Code Security
- ✅ No hardcoded secrets
- ✅ Environment variables for config
- ✅ Parameterized database queries
- ✅ Input validation on all endpoints
- ✅ Error handling with sanitization
- ✅ Secure file handling

### Infrastructure Security
- ✅ Rate limiting per IP
- ✅ Request size limits
- ✅ CORS restrictions
- ✅ Security headers
- ✅ Request logging

### Authentication (Phase 8)
- ⏳ JWT tokens (planned)
- ⏳ Password hashing with bcrypt (planned)
- ⏳ Session management (planned)
- ⏳ Email verification (planned)

---

## 🚨 Known Limitations (To Address Later)

### Current Gaps:
1. **No Authentication** - Anyone can upload (Phase 8)
2. **No User-Based Rate Limiting** - Only IP-based
3. **No IP Blacklisting** - Can't permanently ban IPs
4. **No Captcha** - Bots can still spam
5. **No File Content Scanning** - Only checks file type, not content
6. **No Virus Scanning** - Malware detection not implemented

### Will Be Added:
- Phase 8: User authentication & authorization
- Phase 9: Advanced rate limiting (user-based)
- Phase 9: IP blacklisting system
- Phase 10: Captcha for anonymous users
- Phase 10: Virus scanning integration

---

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
NODE_ENV=development|production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Security-Related:**
```bash
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # 100 requests per window

# Upload limits
UPLOAD_RATE_LIMIT_MAX=10     # 10 uploads per window
MAX_FILE_SIZE=104857600      # 100MB
```

---

## 🧪 Testing Security

### Test Rate Limiting
```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3000/api/health
done

# Expected: 429 Too Many Requests after 100
```

### Test File Upload Validation
```bash
# Try uploading non-video file
curl -F "video=@test.txt" http://localhost:3000/api/videos/upload
# Expected: 400 Invalid file type

# Try uploading oversized file
curl -F "video=@huge.mp4" http://localhost:3000/api/videos/upload
# Expected: 400 File too large
```

### Test CORS
```bash
# Request from unauthorized origin
curl -H "Origin: http://malicious.com" http://localhost:3000/api/health
# Expected: CORS error
```

### Test Input Validation
```bash
# Try invalid video ID
curl http://localhost:3000/api/videos/abc
# Expected: 400 Validation failed

curl http://localhost:3000/api/videos/-1
# Expected: 400 Validation failed
```

---

## 📊 Security Monitoring

### What to Monitor:
1. **Rate limit hits** - Unusual spike = potential attack
2. **Failed validations** - Pattern of invalid requests
3. **Error rates** - High errors = potential probe
4. **Upload patterns** - Unusual upload frequency
5. **IP addresses** - Geographic patterns

### Recommended Tools (Future):
- Sentry (error monitoring)
- LogRocket (session replay)
- Datadog (infrastructure monitoring)
- Cloudflare Analytics (traffic analysis)

---

## 🆘 Incident Response

### If Attack Detected:

1. **Identify the attack type**
   - Check logs for patterns
   - Look at IP addresses
   - Review error messages

2. **Immediate actions**
   - Add IP to manual block list (future feature)
   - Reduce rate limits temporarily
   - Enable Cloudflare "Under Attack" mode (when deployed)

3. **Investigation**
   - Review server logs
   - Check database for tampering
   - Verify file integrity

4. **Recovery**
   - Remove malicious data
   - Restore from backup if needed
   - Patch vulnerability

---

## 🔗 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

---

## 📝 Security Checklist

### Pre-Deployment:
- [x] Rate limiting enabled
- [x] Security headers configured
- [x] Input validation implemented
- [x] Error sanitization working
- [x] CORS restricted
- [x] Request logging enabled
- [x] File upload security
- [ ] HTTPS enforced (production)
- [ ] Authentication implemented (Phase 8)
- [ ] API keys protected (Phase 8)

### Production:
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Incident response plan
- [ ] Security audit completed

---

**Last Updated:** Phase 1B - Security Implementation  
**Status:** ✅ Basic security measures complete  
**Next:** Phase 8 - Authentication & Authorization

