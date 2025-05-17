const { v4: uuidv4 } = require('uuid');
const { createRequestLogger } = require('../utils/logger');

// Middleware to generate request ID and attach logger to request object
const requestTracker = (req, res, next) => {
  // Generate a unique request ID
  const requestId = uuidv4();
  
  // Attach request ID to response headers
  res.setHeader('X-Request-Id', requestId);
  
  // Add Vercel request ID if present
  if (req.headers['x-vercel-id']) {
    req.id = req.headers['x-vercel-id'];
  } else {
    req.id = requestId;
  }
  
  // Create a request-scoped logger and attach to request object
  req.logger = createRequestLogger(req);
  
  // Log the incoming request
  req.logger.info(`${req.method} ${req.originalUrl.split('?')[0]}`);
  
  // Log response when it's sent
  const startTime = Date.now();
  
  // Use on('finish') event instead of overriding send
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log with appropriate level based on status code
    if (statusCode >= 500) {
      req.logger.error(`Response ${statusCode}`, { responseTime, statusCode });
    } else if (statusCode >= 400) {
      req.logger.warn(`Response ${statusCode}`, { responseTime, statusCode });
    } else {
      req.logger.info(`Response ${statusCode}`, { responseTime, statusCode });
    }
  });
  
  next();
};

module.exports = requestTracker;
