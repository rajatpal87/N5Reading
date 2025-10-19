import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for upload endpoint
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per 15 minutes
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet security headers configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow video uploads
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS
});

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Frontend dev
      'http://localhost:3000', // Backend dev
      process.env.FRONTEND_URL, // Production frontend
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Sanitize error responses
export const errorSanitizer = (err, req, res, next) => {
  // Log full error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Send sanitized error to client
  const statusCode = err.statusCode || 500;
  const message = err.isOperational 
    ? err.message 
    : 'An unexpected error occurred';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

