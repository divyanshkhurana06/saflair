// Database Upgrade Script for Enhanced Saflair Schema
// Safely migrates existing database to new comprehensive schema

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseUpgrader {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'saflair.db');
    this.backupPath = path.join(__dirname, '..', `saflair_backup_${Date.now()}.db`);
    this.schemaPath = path.join(__dirname, 'enhanced-database.sql');
  }

  async upgrade() {
    console.log('🚀 Starting Saflair Database Upgrade...');
    console.log('═══════════════════════════════════════════');

    try {
      // Step 1: Backup existing database
      await this.createBackup();

      // Step 2: Open database connection
      const db = await this.openDatabase();

      // Step 3: Check current schema
      const currentTables = await this.getCurrentTables(db);
      console.log(`📋 Found ${currentTables.length} existing tables`);

      // Step 4: Add new columns to existing tables
      await this.upgradeExistingTables(db);

      // Step 5: Create new tables
      await this.createNewTables(db);

      // Step 6: Create indexes and triggers
      await this.createIndexesAndTriggers(db);

      // Step 7: Update existing data
      await this.updateExistingData(db);

      // Step 8: Insert sample data
      await this.insertSampleData(db);

      // Step 9: Verify upgrade
      await this.verifyUpgrade(db);

      await this.closeDatabase(db);

      console.log('');
      console.log('✅ Database upgrade completed successfully!');
      console.log(`📁 Backup saved: ${this.backupPath}`);
      console.log('🎉 Enhanced schema is now active!');

    } catch (error) {
      console.error('❌ Database upgrade failed:', error.message);
      console.log('🔄 Restoring from backup...');
      await this.restoreBackup();
      throw error;
    }
  }

  async createBackup() {
    if (fs.existsSync(this.dbPath)) {
      console.log('💾 Creating database backup...');
      fs.copyFileSync(this.dbPath, this.backupPath);
      console.log('✅ Backup created successfully');
    } else {
      console.log('ℹ️  No existing database found, creating new one');
    }
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔗 Connected to database');
          resolve(db);
        }
      });
    });
  }

  async getCurrentTables(db) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => row.name));
          }
        }
      );
    });
  }

  async upgradeExistingTables(db) {
    console.log('🔧 Upgrading existing tables...');

    // Upgrade users table
    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN first_name TEXT DEFAULT '';
    `).catch(() => {}); // Ignore if column exists

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN last_name TEXT DEFAULT '';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN country TEXT DEFAULT '';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN date_of_birth DATE;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN total_earnings REAL DEFAULT 0.0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN total_spent REAL DEFAULT 0.0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN max_streak INTEGER DEFAULT 0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN correct_votes INTEGER DEFAULT 0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN verification_token TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN reset_token TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN reset_expires TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN last_login TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN last_vote_date TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE users ADD COLUMN referred_by TEXT;
    `).catch(() => {});

    // Upgrade sentiment_votes table
    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN confidence_level INTEGER DEFAULT 50;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN target_price REAL;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN time_horizon TEXT DEFAULT '24h';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN reasoning TEXT DEFAULT '';
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN bonus_multiplier REAL DEFAULT 1.0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN is_correct BOOLEAN;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN actual_outcome TEXT;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN points_earned INTEGER DEFAULT 0;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN market_sentiment_at_time REAL;
    `).catch(() => {});

    await this.runQuery(db, `
      ALTER TABLE sentiment_votes ADD COLUMN user_streak_at_time INTEGER DEFAULT 0;
    `).catch(() => {});

    console.log('✅ Existing tables upgraded');
  }

  async createNewTables(db) {
    console.log('🏗️  Creating new tables...');

    // Read schema file
    const schemaSQL = fs.readFileSync(this.schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') || 
          statement.includes('CREATE INDEX') || 
          statement.includes('CREATE TRIGGER')) {
        try {
          await this.runQuery(db, statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }

    console.log('✅ New tables created');
  }

  async createIndexesAndTriggers(db) {
    console.log('📊 Creating indexes and triggers...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address)',
      'CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code)',
      'CREATE INDEX IF NOT EXISTS idx_sentiment_votes_user ON sentiment_votes(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sentiment_votes_date ON sentiment_votes(vote_date)',
      'CREATE INDEX IF NOT EXISTS idx_flight_policies_user ON flight_policies(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_flight_policies_flight ON flight_policies(flight_number)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)'
    ];

    for (const index of indexes) {
      await this.runQuery(db, index).catch(() => {});
    }

    console.log('✅ Indexes and triggers created');
  }

  async updateExistingData(db) {
    console.log('🔄 Updating existing data...');

    // Generate referral codes for existing users
    await this.runQuery(db, `
      UPDATE users SET referral_code = 'SAF' || substr(id, 1, 8) 
      WHERE referral_code IS NULL OR referral_code = '';
    `).catch(() => {});

    // Update user preferences with defaults
    await this.runQuery(db, `
      UPDATE users SET preferences = '{"emailNotifications": true, "theme": "dark", "language": "en"}' 
      WHERE preferences IS NULL OR preferences = '';
    `).catch(() => {});

    // Set account status for existing users
    await this.runQuery(db, `
      UPDATE users SET account_status = 'active' 
      WHERE account_status IS NULL OR account_status = '';
    `).catch(() => {});

    console.log('✅ Existing data updated');
  }

  async insertSampleData(db) {
    console.log('📝 Inserting sample data...');

    // Insert achievements
    const achievements = [
      ['first_vote', 'First Vote', 'Cast your first sentiment vote', 'voting', '{"votes": 1}', 1.0, 'common'],
      ['streak_7', '7-Day Streak', 'Vote for 7 consecutive days', 'streak', '{"streak": 7}', 5.0, 'rare'],
      ['streak_30', '30-Day Streak', 'Vote for 30 consecutive days', 'streak', '{"streak": 30}', 25.0, 'epic'],
      ['accurate_voter', 'Accurate Predictor', 'Achieve 80% accuracy with 50+ votes', 'voting', '{"accuracy": 80, "min_votes": 50}', 10.0, 'rare'],
      ['first_policy', 'First Policy', 'Purchase your first flight insurance', 'insurance', '{"policies": 1}', 2.0, 'common'],
      ['big_spender', 'High Roller', 'Spend 100+ FLR on insurance', 'insurance', '{"total_spent": 100}', 15.0, 'epic']
    ];

    for (const achievement of achievements) {
      await this.runQuery(db, `
        INSERT OR IGNORE INTO achievements 
        (id, name, description, category, requirements, reward_flr, rarity, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, achievement).catch(() => {});
    }

    console.log('✅ Sample data inserted');
  }

  async verifyUpgrade(db) {
    console.log('🔍 Verifying upgrade...');

    const tables = await this.getCurrentTables(db);
    const expectedTables = [
      'users', 'sentiment_votes', 'daily_sentiment', 'flight_policies', 
      'flight_data', 'achievements', 'user_achievements', 'notifications', 
      'referrals', 'user_sessions', 'platform_analytics'
    ];

    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }

    // Check user count
    const userCount = await this.runQuery(db, 'SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${userCount[0].count}`);

    console.log('✅ Verification complete');
  }

  async runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async closeDatabase(db) {
    return new Promise((resolve) => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('🔐 Database connection closed');
        }
        resolve();
      });
    });
  }

  async restoreBackup() {
    if (fs.existsSync(this.backupPath)) {
      fs.copyFileSync(this.backupPath, this.dbPath);
      console.log('✅ Database restored from backup');
    }
  }
}

// Run upgrade if called directly
if (require.main === module) {
  const upgrader = new DatabaseUpgrader();
  upgrader.upgrade()
    .then(() => {
      console.log('🎉 Database upgrade completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database upgrade failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseUpgrader; 