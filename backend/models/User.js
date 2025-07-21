// Advanced User Model for Saflair
// Comprehensive user management with profiles, preferences, and analytics

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(db) {
    this.db = db;
  }

  // Create comprehensive user profile
  async createUser({
    username,
    email,
    password,
    firstName = '',
    lastName = '',
    country = '',
    timezone = 'UTC',
    preferences = {}
  }) {
    try {
      // Validate input
      if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
      }

      // Check if user already exists
      const existingUser = await this.findByEmailOrUsername(email, username);
      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Generate user ID and wallet
      const userId = uuidv4();
      const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Default preferences
      const defaultPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        dailyReminders: true,
        language: 'en',
        currency: 'USD',
        theme: 'dark',
        analytics: true,
        ...preferences
      };

      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT INTO users (
            id, username, email, password_hash, first_name, last_name,
            country, timezone, wallet_address, flr_balance, 
            email_verified, account_status, preferences, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, username, email, hashedPassword, firstName, lastName,
            country, timezone, walletAddress, 10.0, // Starting FLR balance
            false, 'active', JSON.stringify(defaultPreferences), new Date().toISOString()
          ],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: userId,
                username,
                email,
                firstName,
                lastName,
                walletAddress,
                flrBalance: 10.0,
                preferences: defaultPreferences
              });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Enhanced login with analytics
  async loginUser(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.updateLastLogin(user.id);
      
      // Return safe user data
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        walletAddress: user.wallet_address,
        flrBalance: user.flr_balance,
        dailyStreak: user.daily_streak,
        totalVotes: user.total_votes,
        accuracyScore: user.accuracy_score,
        preferences: JSON.parse(user.preferences || '{}'),
        accountStatus: user.account_status,
        emailVerified: user.email_verified,
        lastLogin: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, updates) {
    const allowedFields = [
      'first_name', 'last_name', 'country', 'timezone', 
      'preferences', 'avatar_url'
    ];
    
    const setClause = [];
    const values = [];
    
    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field)) {
        setClause.push(`${field} = ?`);
        values.push(
          field === 'preferences' ? JSON.stringify(updates[field]) : updates[field]
        );
      }
    });
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(userId);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET ${setClause.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, new Date().toISOString()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0 });
          }
        }
      );
    });
  }

  // Get user analytics
  async getUserAnalytics(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          u.*,
          COUNT(sv.id) as total_votes_count,
          COUNT(fp.id) as total_policies_count,
          SUM(fp.premium_paid) as total_premiums_paid,
          SUM(fp.payout_amount) as total_payouts_received,
          AVG(CASE WHEN sv.is_correct = 1 THEN 1.0 ELSE 0.0 END) as vote_accuracy
        FROM users u
        LEFT JOIN sentiment_votes sv ON u.id = sv.user_id
        LEFT JOIN flight_policies fp ON u.id = fp.user_id
        WHERE u.id = ?
        GROUP BY u.id`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Get user leaderboard position
  async getLeaderboardPosition(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          position,
          total_score,
          percentile
        FROM (
          SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY accuracy_score DESC, total_votes DESC) as position,
            accuracy_score as total_score,
            PERCENT_RANK() OVER (ORDER BY accuracy_score DESC, total_votes DESC) as percentile
          FROM users
          WHERE account_status = 'active'
        ) ranked
        WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || { position: null, total_score: 0, percentile: 1.0 });
          }
        }
      );
    });
  }

  // Helper methods
  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async findByEmailOrUsername(email, username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ? OR username = ?', 
        [email, username], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET last_login = ?, login_count = login_count + 1 WHERE id = ?',
        [new Date().toISOString(), userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Password reset functionality
  async requestPasswordReset(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [resetToken, resetExpires, user.id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ resetToken, email: user.email });
          }
        }
      );
    });
  }

  async resetPassword(resetToken, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET 
         password_hash = ?, 
         reset_token = NULL, 
         reset_expires = NULL,
         updated_at = ?
         WHERE reset_token = ? AND reset_expires > ?`,
        [hashedPassword, new Date().toISOString(), resetToken, new Date().toISOString()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0 });
          }
        }
      );
    });
  }

  // Email verification
  async sendEmailVerification(userId) {
    const verificationToken = uuidv4();
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET verification_token = ? WHERE id = ?',
        [verificationToken, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ verificationToken });
          }
        }
      );
    });
  }

  async verifyEmail(verificationToken) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE verification_token = ?',
        [verificationToken],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ verified: this.changes > 0 });
          }
        }
      );
    });
  }
}

module.exports = User; 