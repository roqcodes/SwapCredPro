const path = require('path');

// Load environment variables with better error handling
try {
  require('dotenv').config();
  console.log('Environment variables loaded');
} catch (error) {
  console.error('Error loading environment variables:', error.message);
}

// Check required environment variables
const requiredEnvVars = [
  'SHOPIFY_STORE_URL', 
  'SHOPIFY_ACCESS_TOKEN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('\u26A0\uFE0F Missing required environment variables:', missingVars.join(', '));
  console.error('Please add these to your environment or Vercel project settings');
}

const express = require('express');
const cors = require('cors');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase collections
const { initializeCollections } = require('./utils/ensureCollections');
// Run in the background to avoid blocking server startup
(async () => {
  try {
    await initializeCollections();
    console.log('Firebase collections successfully initialized');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
})();

// Import our new request tracking middleware and logger
const requestTracker = require('./middleware/requestTracker');
const { logger } = require('./utils/logger');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.printersparekart.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL.replace(/^www\./, '')}`,
      'https://swapcred.vercel.app', 
      'https://swapcredvs.vercel.app',
      // Allow your custom domain if you have one
      process.env.CUSTOM_DOMAIN && `https://${process.env.CUSTOM_DOMAIN}`
    ].filter(Boolean) // Remove undefined values
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

console.log('Allowed CORS origins:', allowedOrigins);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`CORS blocked request from: ${origin}`);
      // Log but allow in production to avoid deployment issues
      if (process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add request tracking middleware - should be after basic middleware but before routes
app.use(requestTracker);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Import routes
const { router: authRouter } = require('./routes/auth');
const exchangeRoutes = require('./routes/exchange');
const adminRoutes = require('./routes/admin');
const shopifyRoutes = require('./routes/shopify');
const uploadRoutes = require('./routes/upload');

// Use routes
// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// For Vercel, add a root handler
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  // Log error details to our structured logger
  if (req.logger) {
    req.logger.error(`Server error: ${err.message}`, { 
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  } else {
    logger.error(`Server error: ${err.message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  }
  
  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).send({ error: 'Server error occurred' });
  } else {
    res.status(500).send({ error: err.message || 'Server error', stack: err.stack });
  }
});

// For Vercel serverless functions, we need to export the app
module.exports = app; 