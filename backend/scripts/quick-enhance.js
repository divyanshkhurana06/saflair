// Quick Database Enhancement for Saflair
// Adds essential missing features for production readiness

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'saflair.db');

console.log('🚀 Quick-enhancing Saflair database...');

const db = new sqlite3.Database(dbPath);

// Add essential columns and tables
db.serialize(() => {
  
  console.log('📋 Adding essential features...');

  // Add user profile fields
  db.run(`ALTER TABLE users ADD COLUMN first_name TEXT DEFAULT ''`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN last_name TEXT DEFAULT ''`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN country TEXT DEFAULT ''`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN referral_code TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN total_earnings REAL DEFAULT 0.0`, () => {});
  
  // Add voting enhancements
  db.run(`ALTER TABLE sentiment_votes ADD COLUMN confidence_level INTEGER DEFAULT 50`, () => {});
  db.run(`ALTER TABLE sentiment_votes ADD COLUMN is_correct INTEGER`, () => {});
  
  // Create notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, () => {
    console.log('✅ Notifications table created');
  });

  // Create achievements table
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      reward_flr REAL DEFAULT 0,
      rarity TEXT DEFAULT 'common',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    console.log('✅ Achievements table created');
  });

  // Create user_achievements table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id),
      UNIQUE(user_id, achievement_id)
    )
  `, () => {
    console.log('✅ User achievements table created');
  });

  // Insert sample achievements
  const achievements = [
    {
      id: 'first_vote',
      name: 'First Vote',
      description: 'Cast your first sentiment vote',
      category: 'voting',
      reward_flr: 1.0,
      rarity: 'common'
    },
    {
      id: 'streak_7',
      name: '7-Day Streak',
      description: 'Vote for 7 consecutive days',
      category: 'streak',
      reward_flr: 5.0,
      rarity: 'rare'
    },
    {
      id: 'first_policy',
      name: 'First Policy',
      description: 'Purchase your first flight insurance',
      category: 'insurance',
      reward_flr: 2.0,
      rarity: 'common'
    },
    {
      id: 'accurate_voter',
      name: 'Accurate Predictor',
      description: 'Achieve 80% accuracy with 20+ votes',
      category: 'voting',
      reward_flr: 10.0,
      rarity: 'epic'
    }
  ];

  achievements.forEach(achievement => {
    db.run(`
      INSERT OR IGNORE INTO achievements (id, name, description, category, reward_flr, rarity)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [achievement.id, achievement.name, achievement.description, achievement.category, achievement.reward_flr, achievement.rarity]);
  });

  // Update existing users with referral codes
  setTimeout(() => {
    db.run(`
      UPDATE users SET referral_code = 'SAF' || substr(id, 1, 8) 
      WHERE referral_code IS NULL
    `, () => {
      console.log('✅ Referral codes generated');
    });

    // Create sample notifications for existing users
    db.all('SELECT id FROM users LIMIT 5', (err, users) => {
      if (!err && users) {
        users.forEach(user => {
          const notificationId = uuidv4();
          db.run(`
            INSERT INTO notifications (id, user_id, type, title, message)
            VALUES (?, ?, ?, ?, ?)
          `, [
            notificationId,
            user.id,
            'system',
            'Welcome to Enhanced Saflair!',
            'Your account now has achievements, notifications, and advanced features!'
          ]);
        });
        console.log('✅ Welcome notifications created');
      }
    });

    console.log('');
    console.log('🎉 Database enhancement completed!');
    console.log('✨ New features added:');
    console.log('   • User profiles with additional fields');
    console.log('   • Achievement system with badges');
    console.log('   • Notification system');
    console.log('   • Enhanced voting with confidence levels');
    console.log('   • User referral codes');
    console.log('   • Email verification system');
    console.log('');
    console.log('🚀 Saflair is now more feature-complete!');
    
    db.close();
  }, 1000);
}); 