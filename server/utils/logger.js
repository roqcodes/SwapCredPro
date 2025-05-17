const winston = require('winston');

// Format function that adds colors and proper formatting
const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length > 0 
    ? ` | ${JSON.stringify(meta)}`
    : '';
  return `[${timestamp}] ${level}: ${message}${metaString}`;
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'swapcred-api' },
  transports: [
    // Always log to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ]
});

// Additional methods for specific log types
const enhancedLogger = {
  // Standard winston methods
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Custom methods for specific events
  login: (email, meta = {}) => {
    logger.info(`Login attempt: ${email}`, {
      event: 'AUTH_ATTEMPT',
      email,
      ...meta
    });
  },
  
  loginSuccess: (email, userId, meta = {}) => {
    logger.info(`Login success: ${email}`, {
      event: 'AUTH_SUCCESS',
      email,
      userId,
      ...meta
    });
  },

  loginFailed: (email, reason, meta = {}) => {
    logger.warn(`Login failed: ${email}`, {
      event: 'AUTH_FAILED',
      email,
      reason,
      ...meta
    });
  },

  apiRequest: (path, method, meta = {}) => {
    logger.debug(`API Request: ${method} ${path}`, {
      event: 'API_REQUEST',
      path,
      method,
      ...meta
    });
  },
  
  apiResponse: (path, method, statusCode, responseTime, meta = {}) => {
    const level = statusCode >= 400 ? 'warn' : 'debug';
    logger[level](`API Response: ${method} ${path} ${statusCode} (${responseTime}ms)`, {
      event: 'API_RESPONSE',
      path,
      method,
      statusCode,
      responseTime,
      ...meta
    });
  },
  
  success: (message, meta = {}) => {
    logger.info(`✅ ${message}`, {
      event: 'SUCCESS',
      ...meta
    });
  },
  
  fail: (message, meta = {}) => {
    logger.warn(`❌ ${message}`, {
      event: 'FAILURE',
      ...meta
    });
  },
  
  audit: (action, userId, meta = {}) => {
    logger.info(`AUDIT: ${action}`, {
      event: 'AUDIT',
      userId,
      action,
      ...meta
    });
  }
};

module.exports = { 
  logger: enhancedLogger,
  // Factory to create a request-specific logger with contextual info
  createRequestLogger: (req) => {
    const reqId = req.id || 'unknown';
    const path = req.originalUrl || req.url || 'unknown';
    const method = req.method || 'unknown';
    const ip = req.ip || 'unknown';
    
    const requestLogger = {
      ...enhancedLogger,
      info: (message, meta = {}) => enhancedLogger.info(message, { 
        reqId, path, method, ip, ...meta 
      }),
      warn: (message, meta = {}) => enhancedLogger.warn(message, { 
        reqId, path, method, ip, ...meta 
      }),
      error: (message, meta = {}) => enhancedLogger.error(message, { 
        reqId, path, method, ip, ...meta 
      }),
      debug: (message, meta = {}) => enhancedLogger.debug(message, { 
        reqId, path, method, ip, ...meta 
      }),
    };
    
    return requestLogger;
  }
};
