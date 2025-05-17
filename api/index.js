// This file serves as the API route handler for Vercel serverless functions
const path = require('path');
const express = require('express');

// Define a timeout to ensure functions don't exceed Vercel's time limit
const FUNCTION_TIMEOUT = 50 * 1000; // 50 seconds (Vercel's limit is 60s)

try {
  // Import the Express app from the server directory
  const app = require('../server/index.js');
  
  // Log successful import
  console.log('Successfully imported Express app from server/index.js');
  
  // Add timeout protection middleware
  app.use((req, res, next) => {
    const timeout = setTimeout(() => {
      console.error(`Request to ${req.url} timed out after ${FUNCTION_TIMEOUT}ms`);
      res.status(504).json({ error: 'Gateway Timeout', message: 'Request processing took too long' });
    }, FUNCTION_TIMEOUT);
    
    // Clear timeout when response is sent
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  });
  
  // Export the express app as a serverless function
  module.exports = app;
} catch (error) {
  console.error('Error importing server/index.js:', error);
  
  // Create a minimal fallback app that returns an error message
  const fallbackApp = express();
  
  // Add CORS headers for the error response
  fallbackApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      path: req.path
    });
  });
  
  module.exports = fallbackApp;
} 