// Professional Logging Middleware for Saflair
// Provides structured logging for production monitoring

const fs = require('fs');
const path = require('path');

class SaflairLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.logFile = path.join(this.logDir, 'saflair.log');
    this.errorFile = path.join(this.logDir, 'errors.log');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      meta,
      service: 'saflair-api'
    }) + '\n';
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(`ℹ️  ${message}`);
    this.writeToFile(this.logFile, formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error(`❌ ${message}`);
    this.writeToFile(this.errorFile, formatted);
    this.writeToFile(this.logFile, formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(`⚠️  ${message}`);
    this.writeToFile(this.logFile, formatted);
  }

  success(message, meta = {}) {
    const formatted = this.formatMessage('success', message, meta);
    console.log(`✅ ${message}`);
    this.writeToFile(this.logFile, formatted);
  }

  // API Request Logging Middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('API Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(data) {
        const duration = Date.now() - start;
        
        // Log response
        logger.info('API Response', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }

  // Flight API Monitoring
  flightApiLog(provider, flightNumber, success, responseTime, error = null) {
    const logData = {
      provider,
      flightNumber,
      success,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error;
      this.error(`Flight API Failed: ${provider} - ${flightNumber}`, logData);
    } else {
      this.success(`Flight API Success: ${provider} - ${flightNumber}`, logData);
    }
  }

  // Oracle Transaction Logging
  oracleLog(action, flightNumber, txHash, success, error = null) {
    const logData = {
      action,
      flightNumber,
      txHash,
      success,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error;
      this.error(`Oracle Transaction Failed: ${action}`, logData);
    } else {
      this.success(`Oracle Transaction Success: ${action}`, logData);
    }
  }
}

// Create global logger instance
const logger = new SaflairLogger();

module.exports = logger; 