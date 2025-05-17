// This file serves as the API route handler for Vercel serverless functions
const path = require('path');

try {
  // Import the Express app from the server directory
  const app = require('../server/index.js');
  
  // Log successful import
  console.log('Successfully imported Express app from server/index.js');
  
  // Export the express app as a serverless function
  module.exports = app;
} catch (error) {
  console.error('Error importing server/index.js:', error);
  
  // Create a minimal fallback app that returns an error message
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      path: req.path
    });
  });
  
  module.exports = fallbackApp;
} 