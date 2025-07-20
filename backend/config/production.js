// Production Configuration for Saflair
// Environment-specific settings for deployment

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || './saflair.db',
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxConnections: 10
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'saflair_production_secret_change_this',
    jwtExpiration: '24h',
    bcryptRounds: 12,
    cookieSecret: process.env.COOKIE_SECRET || 'saflair_cookie_secret'
  },

  // Flight API Configuration
  apis: {
    flightAware: {
      key: process.env.FLIGHTAWARE_API_KEY,
      baseUrl: process.env.FLIGHTAWARE_BASE_URL || 'https://aeroapi.flightaware.com/aeroapi',
      timeout: 10000,
      retryAttempts: 3
    },
    aviationStack: {
      key: process.env.AVIATIONSTACK_API_KEY,
      baseUrl: process.env.AVIATIONSTACK_BASE_URL || 'https://api.aviationstack.com/v1',
      timeout: 8000,
      retryAttempts: 2
    }
  },

  // Blockchain Configuration
  blockchain: {
    network: 'coston2', // or 'mainnet' for production
    rpcUrl: process.env.FLARE_RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc',
    privateKey: process.env.FLARE_PRIVATE_KEY,
    contracts: {
      fdcHub: process.env.FDC_HUB_ADDRESS || '0x2cA6571Daa15ce734Bbd0Bf27D5C9D16787fc96F',
      fdcVerification: process.env.FDC_VERIFICATION_ADDRESS || '0x3A1b13b8e62E632Cbc6fA3c2C6Ac6E6f86F7D4aF',
      saflair: process.env.SAFLAIR_CONTRACT_ADDRESS
    },
    gasLimit: 200000,
    gasPrice: 'auto'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/saflair.log',
    maxSize: '10m',
    maxFiles: 5,
    datePattern: 'YYYY-MM-DD'
  },

  // Oracle Configuration
  oracle: {
    updateInterval: 2 * 60 * 1000, // 2 minutes
    minimumDelayThreshold: 120, // minutes
    confidenceThreshold: 85, // percentage
    maxRetries: 3,
    timeoutMs: 30000
  },

  // WebSocket Configuration
  websocket: {
    heartbeatInterval: 30000,
    maxConnections: 1000,
    compression: true
  },

  // Email Configuration (for notifications)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@saflair.com'
  },

  // Redis Configuration (for caching)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 300 // 5 minutes default cache
  },

  // Monitoring Configuration
  monitoring: {
    healthCheckInterval: 60000, // 1 minute
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    alertsEnabled: process.env.ALERTS_ENABLED === 'true'
  },

  // Feature Flags
  features: {
    mainnetEnabled: process.env.MAINNET_ENABLED === 'true',
    emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
    advancedAnalytics: process.env.ADVANCED_ANALYTICS === 'true',
    socialLogin: process.env.SOCIAL_LOGIN === 'true'
  },

  // Economic Model
  economy: {
    dailyVoteReward: 2.5, // FLR tokens
    insuranceRewardPercentage: 30, // 30% of premiums go to reward pool
    platformFeePercentage: 10, // 10% platform fee
    minimumPolicyAmount: 50, // FLR
    maximumPolicyAmount: 2000, // FLR
    payoutResponseTime: 3 * 60 * 1000 // 3 minutes for automatic payouts
  },

  // Development/Testing Configuration
  development: {
    mockApiResponses: process.env.MOCK_API_RESPONSES === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true'
  }
};

// Validation function to ensure required environment variables are set
function validateConfig() {
  const required = [];
  
  // Check for production-critical environment variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_this')) {
      required.push('JWT_SECRET must be set for production');
    }
    
    if (!process.env.FLARE_PRIVATE_KEY) {
      required.push('FLARE_PRIVATE_KEY is required for blockchain operations');
    }
    
    if (!process.env.FLIGHTAWARE_API_KEY && !process.env.AVIATIONSTACK_API_KEY) {
      required.push('At least one flight API key (FLIGHTAWARE_API_KEY or AVIATIONSTACK_API_KEY) is required');
    }
  }
  
  if (required.length > 0) {
    console.error('❌ Configuration validation failed:');
    required.forEach(error => console.error(`   • ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
}

// Auto-validate on require
validateConfig();

module.exports.validateConfig = validateConfig; 