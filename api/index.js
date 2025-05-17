// This file serves as the API route handler for Vercel serverless functions
const app = require('../server/index.js');

// Export the express app as a serverless function
module.exports = app; 