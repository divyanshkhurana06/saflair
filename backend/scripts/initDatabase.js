const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '..', 'flightpulse.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Initializing FlightPulse Database...');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      wallet_address TEXT,
      flr_balance REAL DEFAULT 0,
      daily_streak INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      accuracy_score REAL DEFAULT 0,
      last_vote_date TEXT,
      achievements TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sentiment votes table
  db.run(`
    CREATE TABLE IF NOT EXISTS sentiment_votes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK(vote_type IN ('bullish', 'bearish', 'neutral')),
      vote_date DATE NOT NULL,
      reward_amount REAL DEFAULT 2.5,
      is_correct BOOLEAN,
      multiplier REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, vote_date)
    )
  `);

  // Daily sentiment data
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_sentiment (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      bullish_votes INTEGER DEFAULT 0,
      bearish_votes INTEGER DEFAULT 0,
      neutral_votes INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      bullish_percentage REAL DEFAULT 0,
      bearish_percentage REAL DEFAULT 0,
      neutral_percentage REAL DEFAULT 0,
      reward_pool REAL DEFAULT 0,
      actual_outcome TEXT CHECK(actual_outcome IN ('bullish', 'bearish', 'neutral')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Flight policies table
  db.run(`
    CREATE TABLE IF NOT EXISTS flight_policies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      flight_number TEXT NOT NULL,
      route TEXT NOT NULL,
      departure_date DATE NOT NULL,
      coverage_amount REAL NOT NULL,
      premium_paid REAL NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'claimed', 'expired', 'cancelled')),
      oracle_verified BOOLEAN DEFAULT FALSE,
      delay_minutes INTEGER DEFAULT 0,
      payout_amount REAL DEFAULT 0,
      payout_tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Flight data from oracle
  db.run(`
    CREATE TABLE IF NOT EXISTS flight_data (
      id TEXT PRIMARY KEY,
      flight_number TEXT NOT NULL,
      route TEXT NOT NULL,
      scheduled_departure DATETIME NOT NULL,
      actual_departure DATETIME,
      delay_minutes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'delayed', 'cancelled', 'departed', 'arrived')),
      confidence_score REAL DEFAULT 95.0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insurance statistics for platform
  db.run(`
    CREATE TABLE IF NOT EXISTS insurance_stats (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      total_policies INTEGER DEFAULT 0,
      total_premiums REAL DEFAULT 0,
      total_payouts REAL DEFAULT 0,
      active_policies INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 0,
      avg_response_time REAL DEFAULT 2.3,
      reward_pool_contribution REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Real-time events for websockets
  db.run(`
    CREATE TABLE IF NOT EXISTS platform_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System configuration
  db.run(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default system configuration
  const defaultConfigs = [
    ['daily_vote_reward', '2.5', 'Base FLR reward for daily sentiment votes'],
    ['accuracy_bonus_multiplier', '1.5', 'Multiplier for correct predictions'],
    ['insurance_reward_percentage', '30', 'Percentage of premiums that go to reward pool'],
    ['minimum_delay_payout', '120', 'Minimum delay in minutes for automatic payout'],
    ['platform_fee_percentage', '10', 'Platform fee percentage on insurance premiums'],
    ['max_daily_votes', '1', 'Maximum votes per user per day'],
    ['streak_bonus_threshold', '7', 'Minimum streak for bonus rewards']
  ];

  const configStmt = db.prepare(`
    INSERT OR IGNORE INTO system_config (key, value, description) 
    VALUES (?, ?, ?)
  `);

  defaultConfigs.forEach(config => {
    configStmt.run(config);
  });
  configStmt.finalize();

  // Insert sample data for development
  console.log('📊 Inserting sample data...');

  // Sample users
  const users = [
    ['user1', 'CryptoSage', 'sage@flightpulse.io', '$2a$10$hash1', '0x123...abc', 425.5, 28, 156, 94.2],
    ['user2', 'BlockchainBull', 'bull@flightpulse.io', '$2a$10$hash2', '0x456...def', 389.2, 22, 143, 91.8],
    ['user3', 'DefiDeep', 'deep@flightpulse.io', '$2a$10$hash3', '0x789...ghi', 356.8, 19, 134, 89.5],
    ['user4', 'MoonTrader', 'moon@flightpulse.io', '$2a$10$hash4', '0xabc...123', 298.4, 15, 112, 85.3]
  ];

  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users 
    (id, username, email, password_hash, wallet_address, flr_balance, daily_streak, total_votes, accuracy_score) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  users.forEach(user => {
    userStmt.run(user);
  });
  userStmt.finalize();

  // Sample flight data
  const flights = [
    ['flight1', 'AA1234', 'JFK → LAX', '2025-01-15T08:00:00Z', null, 0, 'scheduled', 98.5],
    ['flight2', 'UA5678', 'SFO → ORD', '2025-01-15T10:30:00Z', '2025-01-15T10:45:00Z', 15, 'delayed', 92.1],
    ['flight3', 'DL9012', 'ATL → MIA', '2025-01-15T14:00:00Z', '2025-01-15T16:00:00Z', 120, 'delayed', 99.8],
    ['flight4', 'SW2468', 'LAX → DEN', '2025-01-15T16:30:00Z', null, 0, 'scheduled', 95.3]
  ];

  const flightStmt = db.prepare(`
    INSERT OR IGNORE INTO flight_data 
    (id, flight_number, route, scheduled_departure, actual_departure, delay_minutes, status, confidence_score) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  flights.forEach(flight => {
    flightStmt.run(flight);
  });
  flightStmt.finalize();

  // Sample daily sentiment for current date
  const today = new Date().toISOString().split('T')[0];
  db.run(`
    INSERT OR IGNORE INTO daily_sentiment 
    (id, date, bullish_votes, bearish_votes, neutral_votes, total_votes, bullish_percentage, bearish_percentage, neutral_percentage, reward_pool) 
    VALUES ('today', ?, 7234, 4567, 4046, 15847, 45.6, 28.8, 25.6, 475.0)
  `, [today]);

  // Sample insurance stats for today
  db.run(`
    INSERT OR IGNORE INTO insurance_stats 
    (id, date, total_policies, total_premiums, total_payouts, active_policies, success_rate, avg_response_time, reward_pool_contribution) 
    VALUES ('today', ?, 12847, 452800, 89600, 8934, 99.1, 2.3, 135840)
  `, [today]);

  console.log('✅ Database initialized successfully!');
  console.log('📍 Database location:', dbPath);
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('🔒 Database connection closed.');
    }
  });
});

module.exports = db; 