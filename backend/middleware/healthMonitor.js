// Production Health Monitoring for Saflair
// Monitors API health, database connectivity, and external services

const logger = require('./logger');

class HealthMonitor {
  constructor() {
    this.services = {
      database: { status: 'unknown', lastCheck: null, responseTime: null },
      flightAware: { status: 'unknown', lastCheck: null, responseTime: null },
      aviationStack: { status: 'unknown', lastCheck: null, responseTime: null },
      flareNetwork: { status: 'unknown', lastCheck: null, responseTime: null }
    };
    
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  // Database Health Check
  async checkDatabase(db) {
    const start = Date.now();
    try {
      return new Promise((resolve) => {
        db.get('SELECT 1 as health', (err) => {
          const responseTime = Date.now() - start;
          
          if (err) {
            this.services.database = {
              status: 'unhealthy',
              lastCheck: new Date().toISOString(),
              responseTime: `${responseTime}ms`,
              error: err.message
            };
            logger.error('Database health check failed', { error: err.message, responseTime });
            resolve(false);
          } else {
            this.services.database = {
              status: 'healthy',
              lastCheck: new Date().toISOString(),
              responseTime: `${responseTime}ms`
            };
            resolve(true);
          }
        });
      });
    } catch (error) {
      this.services.database.status = 'unhealthy';
      logger.error('Database health check error', { error: error.message });
      return false;
    }
  }

  // Flight API Health Check
  async checkFlightAPI(apiName, url, headers = {}) {
    const start = Date.now();
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        headers,
        timeout: 5000 
      });
      
      const responseTime = Date.now() - start;
      const status = response.ok ? 'healthy' : 'degraded';
      
      this.services[apiName] = {
        status,
        lastCheck: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        statusCode: response.status
      };
      
      logger.info(`${apiName} health check completed`, {
        status,
        responseTime: `${responseTime}ms`,
        statusCode: response.status
      });
      
      return response.ok;
    } catch (error) {
      const responseTime = Date.now() - start;
      
      this.services[apiName] = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message
      };
      
      logger.error(`${apiName} health check failed`, { 
        error: error.message, 
        responseTime: `${responseTime}ms` 
      });
      
      return false;
    }
  }

  // Flare Network Health Check
  async checkFlareNetwork() {
    const rpcUrl = process.env.FLARE_RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc';
    const start = Date.now();
    
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }),
        timeout: 5000
      });
      
      const responseTime = Date.now() - start;
      const data = await response.json();
      const status = data.result ? 'healthy' : 'degraded';
      
      this.services.flareNetwork = {
        status,
        lastCheck: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        blockNumber: data.result
      };
      
      logger.info('Flare Network health check completed', {
        status,
        responseTime: `${responseTime}ms`,
        blockNumber: data.result
      });
      
      return !!data.result;
    } catch (error) {
      const responseTime = Date.now() - start;
      
      this.services.flareNetwork = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message
      };
      
      logger.error('Flare Network health check failed', { 
        error: error.message, 
        responseTime: `${responseTime}ms` 
      });
      
      return false;
    }
  }

  // Start periodic health checks (every 60 seconds)
  startHealthChecks() {
    setInterval(async () => {
      logger.info('Starting periodic health checks...');
      
      // Check flight APIs if configured
      if (process.env.FLIGHTAWARE_API_KEY) {
        await this.checkFlightAPI(
          'flightAware',
          'https://aeroapi.flightaware.com/aeroapi/operators',
          { 'x-apikey': process.env.FLIGHTAWARE_API_KEY }
        );
      }
      
      if (process.env.AVIATIONSTACK_API_KEY) {
        await this.checkFlightAPI(
          'aviationStack',
          `https://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&limit=1`
        );
      }
      
      // Check Flare Network
      await this.checkFlareNetwork();
      
    }, 60000); // Every 60 seconds
  }

  // Get comprehensive health status
  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    
    const overallStatus = this.calculateOverallStatus();
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        human: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
      },
      services: this.services,
      metrics: {
        totalRequests: this.requestCount,
        totalErrors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) + '%' : '0%'
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  calculateOverallStatus() {
    const statuses = Object.values(this.services).map(service => service.status);
    
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('degraded')) return 'degraded';
    if (statuses.includes('healthy')) return 'healthy';
    
    return 'unknown';
  }

  // Increment request counter
  incrementRequests() {
    this.requestCount++;
  }

  // Increment error counter
  incrementErrors() {
    this.errorCount++;
  }

  // Get system metrics
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        usage: process.cpuUsage()
      },
      platform: process.platform,
      version: process.version,
      pid: process.pid
    };
  }
}

module.exports = HealthMonitor; 