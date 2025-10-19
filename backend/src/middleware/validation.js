import { body, param, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Video ID validation
export const validateVideoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Video ID must be a positive integer'),
  handleValidationErrors
];

// Sanitize filename to prevent directory traversal
export const sanitizeFilename = (filename) => {
  // Remove any path separators and special characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '_') // Replace multiple dots
    .substring(0, 255); // Limit length
};

// Validate file upload
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Additional file validation
  const file = req.file;
  
  // Check file size (100MB max)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return res.status(400).json({ 
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` 
    });
  }

  // Validate mime type
  const allowedMimeTypes = [
    'video/mp4',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-matroska',
    'video/webm'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ 
      error: 'Invalid file type. Only video files are allowed.' 
    });
  }

  next();
};

// Input sanitization for text fields
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

