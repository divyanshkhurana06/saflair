-- Enhanced Saflair Database Schema
-- Comprehensive database design for production-ready application

-- =======================
-- USERS TABLE (Enhanced)
-- =======================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Profile Information
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  country TEXT DEFAULT '',
  timezone TEXT DEFAULT 'UTC',
  date_of_birth DATE,
  
  -- Wallet & Balance
  wallet_address TEXT UNIQUE NOT NULL,
  flr_balance REAL DEFAULT 10.0,
  total_earnings REAL DEFAULT 0.0,
  total_spent REAL DEFAULT 0.0,
  
  -- Voting Stats
  daily_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  correct_votes INTEGER DEFAULT 0,
  accuracy_score REAL DEFAULT 0.0,
  
  -- Account Management
  account_status TEXT DEFAULT 'active' CHECK(account_status IN ('active', 'suspended', 'banned', 'inactive')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  reset_token TEXT,
  reset_expires TEXT,
  
  -- Preferences (JSON)
  preferences TEXT DEFAULT '{}',
  
  -- Analytics
  login_count INTEGER DEFAULT 0,
  last_login TEXT,
  last_vote_date TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- SENTIMENT VOTING (Enhanced)
-- =======================
CREATE TABLE IF NOT EXISTS sentiment_votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('bullish', 'bearish', 'neutral')),
  vote_date TEXT NOT NULL,
  
  -- Prediction Details
  confidence_level INTEGER DEFAULT 50 CHECK(confidence_level BETWEEN 1 AND 100),
  target_price REAL,
  time_horizon TEXT DEFAULT '24h' CHECK(time_horizon IN ('1h', '4h', '24h', '7d')),
  reasoning TEXT DEFAULT '',
  
  -- Reward & Accuracy
  reward_amount REAL DEFAULT 2.5,
  bonus_multiplier REAL DEFAULT 1.0,
  is_correct BOOLEAN,
  actual_outcome TEXT,
  points_earned INTEGER DEFAULT 0,
  
  -- Analytics
  market_sentiment_at_time REAL,
  user_streak_at_time INTEGER DEFAULT 0,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================
-- DAILY SENTIMENT (Enhanced)
-- =======================
CREATE TABLE IF NOT EXISTS daily_sentiment (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  
  -- Vote Counts
  bullish_votes INTEGER DEFAULT 0,
  bearish_votes INTEGER DEFAULT 0,
  neutral_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  
  -- Percentages
  bullish_percentage REAL DEFAULT 0,
  bearish_percentage REAL DEFAULT 0,
  neutral_percentage REAL DEFAULT 0,
  
  -- Economic Data
  reward_pool REAL DEFAULT 0,
  total_distributed REAL DEFAULT 0,
  average_confidence REAL DEFAULT 0,
  
  -- Market Data (for accuracy calculation)
  opening_price REAL,
  closing_price REAL,
  high_price REAL,
  low_price REAL,
  volume REAL,
  actual_movement REAL,
  
  -- Analytics
  participation_rate REAL DEFAULT 0,
  new_users_count INTEGER DEFAULT 0,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- FLIGHT POLICIES (Enhanced)
-- =======================
CREATE TABLE IF NOT EXISTS flight_policies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Flight Information
  flight_number TEXT NOT NULL,
  airline_code TEXT,
  airline_name TEXT,
  route TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  scheduled_departure TEXT,
  scheduled_arrival TEXT,
  
  -- Policy Details
  policy_type TEXT DEFAULT 'delay' CHECK(policy_type IN ('delay', 'cancellation', 'comprehensive')),
  coverage_amount REAL NOT NULL,
  premium_paid REAL NOT NULL,
  currency TEXT DEFAULT 'FLR',
  
  -- Thresholds
  delay_threshold_minutes INTEGER DEFAULT 120,
  cancellation_coverage BOOLEAN DEFAULT FALSE,
  baggage_coverage BOOLEAN DEFAULT FALSE,
  
  -- Status & Outcomes
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'claimed', 'expired', 'cancelled')),
  actual_departure TEXT,
  actual_arrival TEXT,
  delay_minutes INTEGER DEFAULT 0,
  payout_amount REAL DEFAULT 0,
  claim_reason TEXT,
  
  -- Oracle & Verification
  oracle_verified BOOLEAN DEFAULT FALSE,
  oracle_source TEXT,
  verification_hash TEXT,
  voting_round INTEGER,
  confidence_score REAL DEFAULT 0,
  
  -- Processing
  auto_processed BOOLEAN DEFAULT FALSE,
  processed_at TEXT,
  payout_tx_hash TEXT,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================
-- FLIGHT DATA (Enhanced)
-- =======================
CREATE TABLE IF NOT EXISTS flight_data (
  id TEXT PRIMARY KEY,
  flight_number TEXT NOT NULL,
  date TEXT NOT NULL,
  
  -- Schedule Information
  scheduled_departure TEXT,
  scheduled_arrival TEXT,
  actual_departure TEXT,
  actual_arrival TEXT,
  
  -- Airport Information
  departure_airport TEXT,
  departure_terminal TEXT,
  departure_gate TEXT,
  arrival_airport TEXT,
  arrival_terminal TEXT,
  arrival_gate TEXT,
  
  -- Airline Information
  airline_code TEXT,
  airline_name TEXT,
  aircraft_type TEXT,
  registration TEXT,
  
  -- Status & Delays
  flight_status TEXT DEFAULT 'scheduled',
  delay_minutes INTEGER DEFAULT 0,
  cancellation_reason TEXT,
  diversion_airport TEXT,
  
  -- Oracle & Verification
  data_source TEXT DEFAULT 'api',
  confidence_score REAL DEFAULT 95.0,
  oracle_verified BOOLEAN DEFAULT FALSE,
  verification_timestamp TEXT,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(flight_number, date)
);

-- =======================
-- ACHIEVEMENTS & BADGES
-- =======================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('voting', 'insurance', 'streak', 'earnings', 'social')),
  icon_url TEXT,
  requirements TEXT, -- JSON of requirements
  reward_flr REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  rarity TEXT DEFAULT 'common' CHECK(rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress_data TEXT DEFAULT '{}', -- JSON for tracking progress
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

-- =======================
-- NOTIFICATIONS
-- =======================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('payout', 'vote_reminder', 'achievement', 'policy_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}', -- JSON for additional data
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  action_url TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================
-- REFERRALS SYSTEM
-- =======================
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referred_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'expired')),
  reward_amount REAL DEFAULT 5.0,
  referrer_reward REAL DEFAULT 5.0,
  conditions_met BOOLEAN DEFAULT FALSE,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- =======================
-- ANALYTICS TABLES
-- =======================
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  duration_seconds INTEGER,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_analytics (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  
  -- User Metrics
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  
  -- Voting Metrics
  total_votes INTEGER DEFAULT 0,
  accuracy_rate REAL DEFAULT 0,
  reward_pool REAL DEFAULT 0,
  rewards_distributed REAL DEFAULT 0,
  
  -- Insurance Metrics
  total_policies INTEGER DEFAULT 0,
  total_premiums REAL DEFAULT 0,
  total_payouts REAL DEFAULT 0,
  claim_rate REAL DEFAULT 0,
  
  -- Financial Metrics
  platform_revenue REAL DEFAULT 0,
  user_earnings REAL DEFAULT 0,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);

CREATE INDEX IF NOT EXISTS idx_sentiment_votes_user ON sentiment_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_votes_date ON sentiment_votes(vote_date);
CREATE INDEX IF NOT EXISTS idx_sentiment_votes_type ON sentiment_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_flight_policies_user ON flight_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_policies_flight ON flight_policies(flight_number);
CREATE INDEX IF NOT EXISTS idx_flight_policies_status ON flight_policies(status);
CREATE INDEX IF NOT EXISTS idx_flight_policies_date ON flight_policies(departure_date);

CREATE INDEX IF NOT EXISTS idx_flight_data_flight ON flight_data(flight_number);
CREATE INDEX IF NOT EXISTS idx_flight_data_date ON flight_data(date);
CREATE INDEX IF NOT EXISTS idx_flight_data_status ON flight_data(flight_status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- =======================
-- TRIGGERS FOR AUTO-UPDATES
-- =======================

-- Update user accuracy when vote result is determined
CREATE TRIGGER IF NOT EXISTS update_user_accuracy 
AFTER UPDATE OF is_correct ON sentiment_votes
WHEN NEW.is_correct IS NOT NULL AND OLD.is_correct IS NULL
BEGIN
  UPDATE users SET 
    correct_votes = (
      SELECT COUNT(*) FROM sentiment_votes 
      WHERE user_id = NEW.user_id AND is_correct = 1
    ),
    accuracy_score = (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(CASE WHEN is_correct = 1 THEN 1 END) * 100.0 / COUNT(*))
      END
      FROM sentiment_votes 
      WHERE user_id = NEW.user_id AND is_correct IS NOT NULL
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.user_id;
END;

-- Update user balance on payout
CREATE TRIGGER IF NOT EXISTS update_balance_on_payout 
AFTER UPDATE OF payout_amount ON flight_policies
WHEN NEW.payout_amount > 0 AND OLD.payout_amount = 0
BEGIN
  UPDATE users SET 
    flr_balance = flr_balance + NEW.payout_amount,
    total_earnings = total_earnings + NEW.payout_amount,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.user_id;
END;

-- =======================
-- SAMPLE ACHIEVEMENTS DATA
-- =======================
INSERT OR IGNORE INTO achievements (id, name, description, category, requirements, reward_flr, rarity) VALUES
('first_vote', 'First Vote', 'Cast your first sentiment vote', 'voting', '{"votes": 1}', 1.0, 'common'),
('streak_7', '7-Day Streak', 'Vote for 7 consecutive days', 'streak', '{"streak": 7}', 5.0, 'rare'),
('streak_30', '30-Day Streak', 'Vote for 30 consecutive days', 'streak', '{"streak": 30}', 25.0, 'epic'),
('accurate_voter', 'Accurate Predictor', 'Achieve 80% accuracy with 50+ votes', 'voting', '{"accuracy": 80, "min_votes": 50}', 10.0, 'rare'),
('first_policy', 'First Policy', 'Purchase your first flight insurance', 'insurance', '{"policies": 1}', 2.0, 'common'),
('big_spender', 'High Roller', 'Spend 100+ FLR on insurance', 'insurance', '{"total_spent": 100}', 15.0, 'epic'),
('profitable', 'Profitable', 'Earn more from payouts than spent on premiums', 'earnings', '{"profit": 1}', 20.0, 'legendary'),
('social_butterfly', 'Referral Master', 'Refer 10 friends successfully', 'social', '{"referrals": 10}', 50.0, 'legendary');

-- =======================
-- INITIAL ADMIN USER
-- =======================
INSERT OR IGNORE INTO users (
  id, username, email, password_hash, first_name, last_name, 
  wallet_address, flr_balance, account_status, email_verified,
  referral_code, created_at
) VALUES (
  'admin_001', 
  'admin', 
  'admin@saflair.com', 
  '$2a$12$rQv8Q8Q8Q8Q8Q8Q8Q8Q8Q8', -- placeholder hash
  'Saflair',
  'Admin',
  '0xadmin000000000000000000000000000000000000',
  1000.0,
  'active',
  1,
  'SAFLAIR_ADMIN',
  CURRENT_TIMESTAMP
); 