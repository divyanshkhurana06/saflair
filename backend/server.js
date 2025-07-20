const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const WebSocket = require('ws');
const http = require('http');
const FlareFlightOracle = require('./services/FlareFlightOracle');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Database connection
const dbPath = path.join(__dirname, 'saflair.db');
const db = new sqlite3.Database(dbPath);

// Initialize Flare Flight Oracle with FDC integration
const flareOracle = new FlareFlightOracle();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'saflair_secret_key_2025';
const PORT = process.env.PORT || 3001;

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🔌 Client connected to WebSocket');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔌 Client disconnected from WebSocket');
  });
});

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to calculate sentiment percentages
function calculateSentimentPercentages(bullish, bearish, neutral) {
  const total = bullish + bearish + neutral;
  if (total === 0) return { bullish: 0, bearish: 0, neutral: 0 };
  
  return {
    bullish: (bullish / total) * 100,
    bearish: (bearish / total) * 100,
    neutral: (neutral / total) * 100
  };
}

// Helper function to get today's date
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// API Routes

// 🏠 Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Saflair API',
    version: '1.0.0'
  });
});

// 👤 User Authentication Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

    db.run(
      `INSERT INTO users (id, username, email, password_hash, wallet_address, flr_balance) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, username, email, hashedPassword, walletAddress, 10.0],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: userId,
            username,
            email,
            walletAddress,
            flrBalance: 10.0
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.wallet_address,
          flrBalance: user.flr_balance,
          dailyStreak: user.daily_streak,
          totalVotes: user.total_votes,
          accuracy: user.accuracy_score
        }
      });
    }
  );
});

// 📊 Sentiment Voting Routes

// Get current sentiment data
app.get('/api/sentiment/current', (req, res) => {
  const today = getTodayDate();
  
  db.get(
    'SELECT * FROM daily_sentiment WHERE date = ?',
    [today],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        // Create today's sentiment entry
        const id = uuidv4();
        db.run(
          'INSERT INTO daily_sentiment (id, date) VALUES (?, ?)',
          [id, today],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
              bullish: 0,
              bearish: 0,
              neutral: 0,
              totalVotes: 0,
              rewardPool: 0
            });
          }
        );
      } else {
        res.json({
          bullish: row.bullish_percentage,
          bearish: row.bearish_percentage,
          neutral: row.neutral_percentage,
          totalVotes: row.total_votes,
          rewardPool: row.reward_pool
        });
      }
    }
  );
});

// Submit sentiment vote
app.post('/api/sentiment/vote', authenticateToken, (req, res) => {
  const { sentiment } = req.body;
  const userId = req.user.userId;
  const today = getTodayDate();
  
  if (!['bullish', 'bearish', 'neutral'].includes(sentiment)) {
    return res.status(400).json({ error: 'Invalid sentiment type' });
  }

  // Check if user already voted today
  db.get(
    'SELECT * FROM sentiment_votes WHERE user_id = ? AND vote_date = ?',
    [userId, today],
    (err, existingVote) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted today' });
      }

      // Record the vote
      const voteId = uuidv4();
      const baseReward = 2.5;
      
      db.run(
        'INSERT INTO sentiment_votes (id, user_id, vote_type, vote_date, reward_amount) VALUES (?, ?, ?, ?, ?)',
        [voteId, userId, sentiment, today, baseReward],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Update user's FLR balance and stats
          db.run(
            `UPDATE users SET 
             flr_balance = flr_balance + ?, 
             total_votes = total_votes + 1,
             last_vote_date = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [baseReward, today, userId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Update daily sentiment counts
              const updateField = `${sentiment}_votes`;
              db.run(
                `UPDATE daily_sentiment SET 
                 ${updateField} = ${updateField} + 1,
                 total_votes = total_votes + 1,
                 reward_pool = reward_pool + ?,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE date = ?`,
                [baseReward, today],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' });
                  }

                  // Recalculate percentages
                  db.get(
                    'SELECT * FROM daily_sentiment WHERE date = ?',
                    [today],
                    (err, sentimentData) => {
                      if (err) {
                        return res.status(500).json({ error: 'Database error' });
                      }

                      const percentages = calculateSentimentPercentages(
                        sentimentData.bullish_votes,
                        sentimentData.bearish_votes,
                        sentimentData.neutral_votes
                      );

                      db.run(
                        `UPDATE daily_sentiment SET 
                         bullish_percentage = ?,
                         bearish_percentage = ?,
                         neutral_percentage = ?
                         WHERE date = ?`,
                        [percentages.bullish, percentages.bearish, percentages.neutral, today],
                        (err) => {
                          if (err) {
                            return res.status(500).json({ error: 'Database error' });
                          }

                          // Broadcast real-time update
                          broadcast({
                            type: 'sentiment_update',
                            data: {
                              bullish: percentages.bullish,
                              bearish: percentages.bearish,
                              neutral: percentages.neutral,
                              totalVotes: sentimentData.total_votes + 1
                            }
                          });

                          res.json({
                            message: 'Vote recorded successfully',
                            reward: baseReward,
                            sentiment: {
                              bullish: percentages.bullish,
                              bearish: percentages.bearish,
                              neutral: percentages.neutral,
                              totalVotes: sentimentData.total_votes + 1
                            }
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// ✈️ Flight Insurance Routes

// Get live flight data
app.get('/api/flights/live', (req, res) => {
  db.all(
    'SELECT * FROM flight_data ORDER BY scheduled_departure ASC LIMIT 10',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const flights = rows.map(row => ({
        id: row.id,
        flightNumber: row.flight_number,
        route: row.route,
        scheduledDeparture: row.scheduled_departure,
        actualDeparture: row.actual_departure,
        delayMinutes: row.delay_minutes,
        status: row.status,
        confidenceScore: row.confidence_score,
        lastUpdated: row.last_updated
      }));

      res.json(flights);
    }
  );
});

// Search flights
app.get('/api/flights/search', (req, res) => {
  const { from, to, date } = req.query;
  
  // Generate realistic flight search results
  const mockFlights = [
    {
      flightNumber: `AA${Math.floor(Math.random() * 9000) + 1000}`,
      route: `${from} → ${to}`,
      departureTime: `${date}T08:00:00Z`,
      estimatedDelay: Math.floor(Math.random() * 60),
      confidence: 95.5 + Math.random() * 4,
      premiums: { basic: 25, premium: 50, ultimate: 100 },
      coverage: { basic: 500, premium: 1000, ultimate: 2000 }
    },
    {
      flightNumber: `UA${Math.floor(Math.random() * 9000) + 1000}`,
      route: `${from} → ${to}`,
      departureTime: `${date}T14:30:00Z`,
      estimatedDelay: Math.floor(Math.random() * 30),
      confidence: 92.1 + Math.random() * 7,
      premiums: { basic: 30, premium: 60, ultimate: 120 },
      coverage: { basic: 500, premium: 1000, ultimate: 2000 }
    }
  ];

  res.json(mockFlights);
});

// Purchase flight insurance
app.post('/api/insurance/purchase', authenticateToken, (req, res) => {
  const { flightNumber, route, departureDate, coverageAmount, premium } = req.body;
  const userId = req.user.userId;

  // Check user's balance
  db.get(
    'SELECT flr_balance FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user.flr_balance < premium) {
        return res.status(400).json({ error: 'Insufficient FLR balance' });
      }

      // Create insurance policy
      const policyId = uuidv4();
      
      db.run(
        `INSERT INTO flight_policies 
         (id, user_id, flight_number, route, departure_date, coverage_amount, premium_paid) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [policyId, userId, flightNumber, route, departureDate, coverageAmount, premium],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Deduct premium from user balance
          db.run(
            'UPDATE users SET flr_balance = flr_balance - ? WHERE id = ?',
            [premium, userId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Add to reward pool (30% of premium)
              const rewardContribution = premium * 0.3;
              const today = getTodayDate();
              
              db.run(
                'UPDATE daily_sentiment SET reward_pool = reward_pool + ? WHERE date = ?',
                [rewardContribution, today],
                (err) => {
                  if (err) {
                    console.error('Error updating reward pool:', err);
                  }
                }
              );

              // Update insurance stats
              db.run(
                `UPDATE insurance_stats SET 
                 total_policies = total_policies + 1,
                 total_premiums = total_premiums + ?,
                 active_policies = active_policies + 1,
                 reward_pool_contribution = reward_pool_contribution + ?
                 WHERE date = ?`,
                [premium, rewardContribution, today],
                (err) => {
                  if (err) {
                    console.error('Error updating insurance stats:', err);
                  }
                }
              );

              broadcast({
                type: 'new_policy',
                data: {
                  flightNumber,
                  route,
                  coverage: coverageAmount,
                  premium
                }
              });

              res.json({
                message: 'Insurance policy created successfully',
                policyId,
                flightNumber,
                coverage: coverageAmount,
                premium,
                status: 'active'
              });
            }
          );
        }
      );
    }
  );
});

// Get user's flight policies
app.get('/api/insurance/policies', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    'SELECT * FROM flight_policies WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const policies = rows.map(row => ({
        id: row.id,
        flightNumber: row.flight_number,
        route: row.route,
        date: row.departure_date,
        coverage: row.coverage_amount,
        premium: row.premium_paid,
        status: row.status,
        delayMinutes: row.delay_minutes,
        payoutAmount: row.payout_amount
      }));

      res.json(policies);
    }
  );
});

// 📈 Platform Statistics Routes

// Get platform stats
app.get('/api/stats/platform', (req, res) => {
  const today = getTodayDate();
  
  db.get(
    'SELECT * FROM insurance_stats WHERE date = ?',
    [today],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        totalPolicies: stats?.total_policies || 12847,
        totalCoverage: stats?.total_premiums * 10 || 45280000,
        payoutsToday: Math.floor(Math.random() * 150) + 100,
        avgResponseTime: stats?.avg_response_time || 2.3,
        successRate: stats?.success_rate || 99.1
      });
    }
  );
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  db.all(
    `SELECT username, accuracy_score, total_votes, daily_streak, flr_balance 
     FROM users 
     ORDER BY accuracy_score DESC, total_votes DESC 
     LIMIT 10`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const leaderboard = rows.map((row, index) => ({
        rank: index + 1,
        username: row.username,
        accuracy: row.accuracy_score,
        totalVotes: row.total_votes,
        streak: row.daily_streak,
        flrEarned: row.flr_balance
      }));

      res.json(leaderboard);
    }
  );
});

// 🔗 FDC Oracle Routes

// Request FDC attestation for flight data
app.post('/api/oracle/request-attestation', authenticateToken, async (req, res) => {
  const { flightNumber } = req.body;
  
  if (!flightNumber) {
    return res.status(400).json({ error: 'Flight number required' });
  }
  
  // Check if we have a private key configured for FDC
  if (!process.env.FLARE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'FDC integration not configured' });
  }
  
  try {
    console.log(`🛫 Requesting FDC attestation for flight ${flightNumber}`);
    
    const attestationResult = await flareOracle.requestFlightAttestation(
      flightNumber,
      process.env.FLARE_PRIVATE_KEY
    );
    
    if (attestationResult.success) {
      res.json({
        message: 'FDC attestation requested successfully',
        txHash: attestationResult.txHash,
        votingRound: attestationResult.votingRound,
        flightNumber
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to request FDC attestation',
        details: attestationResult.error 
      });
    }
    
  } catch (error) {
    console.error('FDC attestation request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real flight data using FDC (for testing)
app.post('/api/oracle/get-flight-data', authenticateToken, async (req, res) => {
  const { flightNumber } = req.body;
  
  if (!flightNumber) {
    return res.status(400).json({ error: 'Flight number required' });
  }
  
  if (!process.env.FLARE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'FDC integration not configured' });
  }
  
  try {
    console.log(`🔍 Getting real flight data for ${flightNumber} via FDC`);
    
    const flightData = await flareOracle.getRealFlightData(
      flightNumber,
      process.env.FLARE_PRIVATE_KEY
    );
    
    res.json({
      message: 'Flight data retrieved via FDC',
      flightData,
      source: 'Flare_Data_Connector'
    });
    
  } catch (error) {
    console.error('FDC flight data retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to get flight data via FDC',
      details: error.message 
    });
  }
});



// 🔄 Cron Jobs for Real-time Updates

// Update flight delays every 5 minutes with FDC verification
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 Updating flight delays via FDC...');
  
  // Check if FDC is configured
  if (!process.env.FLARE_PRIVATE_KEY) {
    console.log('⚠️ FDC not configured, falling back to simulation...');
    // Fallback to simulated data for development
    updateFlightsSimulated();
    return;
  }
  
  try {
    // Get active policies to check their flights
    db.all(
      "SELECT DISTINCT flight_number FROM flight_policies WHERE status = 'active'",
      async (err, activePolicies) => {
        if (err) {
          console.error('Error getting active policies:', err);
          return;
        }

        // Process each unique flight with active policies
        for (const policy of activePolicies) {
          try {
            await verifyFlightWithFDC(policy.flight_number);
          } catch (error) {
            console.error(`Failed to verify flight ${policy.flight_number}:`, error.message);
            // Continue with other flights
          }
        }
      }
    );
  } catch (error) {
    console.error('FDC flight verification error:', error);
  }
});

// FDC flight verification function
async function verifyFlightWithFDC(flightNumber) {
  try {
    console.log(`🛫 Verifying flight ${flightNumber} via FDC...`);
    
    // Get real flight data using FDC
    const flightData = await flareOracle.getRealFlightData(
      flightNumber,
      process.env.FLARE_PRIVATE_KEY
    );
    
    if (!flightData) {
      console.log(`❌ No FDC data available for flight ${flightNumber}`);
      return;
    }
    
    console.log(`✅ FDC verified data for ${flightNumber}:`, {
      delay: flightData.delayMinutes,
      status: flightData.status,
      confidence: flightData.confidence
    });
    
    // Update flight data in database with FDC verification
    db.run(
      `UPDATE flight_data SET 
       delay_minutes = ?, 
       status = ?, 
       confidence_score = ?,
       last_updated = CURRENT_TIMESTAMP 
       WHERE flight_number = ?`,
      [flightData.delayMinutes, flightData.status, flightData.confidence, flightNumber]
    );
    
    // Check for automatic payouts with FDC verification
    if (flareOracle.shouldTriggerPayout(flightData)) {
      await processFDCBasedPayouts(flightNumber, flightData);
    }
    
    // Broadcast FDC-verified flight updates
    broadcast({
      type: 'fdc_flight_update',
      data: {
        flightNumber,
        delayMinutes: flightData.delayMinutes,
        status: flightData.status,
        confidence: flightData.confidence,
        source: 'FDC_Verified',
        votingRound: flightData.votingRound,
        verificationHash: flightData.verificationHash
      }
    });
    
  } catch (error) {
    console.error(`FDC verification failed for ${flightNumber}:`, error.message);
    throw error;
  }
}

// Process FDC-based automatic payouts
async function processFDCBasedPayouts(flightNumber, flightData) {
  db.all(
    'SELECT * FROM flight_policies WHERE flight_number = ? AND status = "active"',
    [flightNumber],
    async (err, policies) => {
      if (err) {
        console.error('Error getting policies for payout:', err);
        return;
      }

      for (const policy of policies) {
        try {
          const payoutAmount = policy.coverage_amount;
          
          // Update policy with FDC verification details
          db.run(
            `UPDATE flight_policies SET 
             status = 'claimed', 
             payout_amount = ?,
             delay_minutes = ?,
             oracle_verified = TRUE
             WHERE id = ?`,
            [payoutAmount, flightData.delayMinutes, policy.id]
          );

          // Credit user account
          db.run(
            'UPDATE users SET flr_balance = flr_balance + ? WHERE id = ?',
            [payoutAmount, policy.user_id]
          );

          console.log(`💰 FDC-based automatic payout: ${payoutAmount} FLR for policy ${policy.id}`);

          // Broadcast FDC-verified payout
          broadcast({
            type: 'fdc_auto_payout',
            data: {
              flightNumber,
              policyId: policy.id,
              payoutAmount,
              delayMinutes: flightData.delayMinutes,
              verificationHash: flightData.verificationHash,
              votingRound: flightData.votingRound,
              confidence: flightData.confidence
            }
          });
          
        } catch (error) {
          console.error(`Failed to process payout for policy ${policy.id}:`, error);
        }
      }
    }
  );
}

// Fallback: Simulated flight updates (for development without FDC)
function updateFlightsSimulated() {
  db.all(
    "SELECT * FROM flight_data WHERE status IN ('scheduled', 'delayed')",
    (err, flights) => {
      if (err) return;

      flights.forEach(flight => {
        // Simulate random delays
        const newDelay = Math.max(0, flight.delay_minutes + (Math.random() - 0.7) * 30);
        const newStatus = newDelay > 0 ? 'delayed' : 'scheduled';
        
        db.run(
          'UPDATE flight_data SET delay_minutes = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
          [Math.floor(newDelay), newStatus, flight.id]
        );

        // Check for automatic payouts (simulated)
        if (newDelay >= 120) {
          db.all(
            'SELECT * FROM flight_policies WHERE flight_number = ? AND status = "active"',
            [flight.flight_number],
            (err, policies) => {
              if (err) return;

              policies.forEach(policy => {
                const payoutAmount = policy.coverage_amount;
                
                db.run(
                  `UPDATE flight_policies SET 
                   status = 'claimed', 
                   payout_amount = ?,
                   delay_minutes = ?,
                   oracle_verified = FALSE
                   WHERE id = ?`,
                  [payoutAmount, Math.floor(newDelay), policy.id]
                );

                // Credit user account
                db.run(
                  'UPDATE users SET flr_balance = flr_balance + ? WHERE id = ?',
                  [payoutAmount, policy.user_id]
                );

                broadcast({
                  type: 'auto_payout',
                  data: {
                    flightNumber: flight.flight_number,
                    payoutAmount,
                    delayMinutes: Math.floor(newDelay)
                  }
                });
              });
            }
          );
        }
      });

      // Broadcast flight updates
      broadcast({
        type: 'flight_updates',
        data: flights.map(f => ({
          flightNumber: f.flight_number,
          delayMinutes: f.delay_minutes,
          status: f.status
        }))
      });
    }
  );
}

// Update sentiment percentages every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  const today = getTodayDate();
  
  db.get(
    'SELECT * FROM daily_sentiment WHERE date = ?',
    [today],
    (err, sentiment) => {
      if (err || !sentiment) return;

      // Simulate small random changes
      const change = (Math.random() - 0.5) * 0.5;
      const newBullish = Math.max(20, Math.min(60, sentiment.bullish_percentage + change));
      const newBearish = Math.max(15, Math.min(50, sentiment.bearish_percentage - change * 0.7));
      const newNeutral = 100 - newBullish - newBearish;

      db.run(
        `UPDATE daily_sentiment SET 
         bullish_percentage = ?,
         bearish_percentage = ?,
         neutral_percentage = ?,
         total_votes = total_votes + ?
         WHERE date = ?`,
        [newBullish, newBearish, newNeutral, Math.floor(Math.random() * 3), today]
      );

      broadcast({
        type: 'sentiment_update',
        data: {
          bullish: newBullish,
          bearish: newBearish,
          neutral: newNeutral,
          totalVotes: sentiment.total_votes + Math.floor(Math.random() * 3)
        }
      });
    }
  );
});

// 🛫 Real Flight Validation using FlightAware API
app.post('/api/flights/validate', async (req, res) => {
  const { flightNumber, from, to, date } = req.body;
  
  console.log(`🔍 Validating flight ${flightNumber} via FlightAware API`);
  
  try {
    // Try Aviation Stack API first (easier authentication)
    if (process.env.AVIATIONSTACK_API_KEY && process.env.AVIATIONSTACK_API_KEY !== 'your_aviationstack_api_key_here') {
      console.log(`🛫 Trying Aviation Stack API for flight ${flightNumber}`);
      
      const aviationResponse = await fetch(
        `${process.env.AVIATIONSTACK_BASE_URL}/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&flight_iata=${flightNumber}&limit=10`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (aviationResponse.ok) {
        const aviationData = await aviationResponse.json();
        
        if (aviationData.data && aviationData.data.length > 0) {
          const flight = aviationData.data[0];
          
          return res.json({
            valid: true,
            flight: {
              flightNumber: flight.flight?.iata || flightNumber.toUpperCase(),
              airline: flight.airline?.name || 'Unknown Airline',
              route: `${flight.departure?.airport || from} → ${flight.arrival?.airport || to}`,
              departure: {
                airport: flight.departure?.airport || `${from} Airport`,
                scheduled: flight.departure?.scheduled || new Date(date + 'T08:00:00Z').toISOString(),
                actual: flight.departure?.actual || null
              },
              arrival: {
                airport: flight.arrival?.airport || `${to} Airport`, 
                scheduled: flight.arrival?.scheduled || new Date(date + 'T12:00:00Z').toISOString(),
                actual: flight.arrival?.actual || null
              },
              status: flight.flight_status || 'scheduled',
              confidence: 96.0, // High confidence for Aviation Stack
              source: 'Aviation_Stack_API',
              verified: true,
              delayMinutes: flight.departure?.delay || 0
            },
            message: 'Flight validated via Aviation Stack!'
          });
        }
      }
    }
    
    // Try FlightAware API as backup (fixed authentication)
    if (process.env.FLIGHTAWARE_API_KEY && process.env.FLIGHTAWARE_API_KEY !== 'your_flightaware_api_key_here') {
      console.log(`🛫 Trying FlightAware API for flight ${flightNumber}`);
      
      const flightAwareResponse = await fetch(
        `${process.env.FLIGHTAWARE_BASE_URL}/flights/${flightNumber}`,
        {
          headers: {
            'x-apikey': process.env.FLIGHTAWARE_API_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      if (flightAwareResponse.ok) {
        const flightData = await flightAwareResponse.json();
        
        if (flightData.flights && flightData.flights.length > 0) {
          const flight = flightData.flights[0];
          
          return res.json({
            valid: true,
            flight: {
              flightNumber: flight.ident || flightNumber.toUpperCase(),
              airline: flight.operator || 'Unknown Airline',
              route: `${flight.origin?.code || from} → ${flight.destination?.code || to}`,
              departure: {
                airport: flight.origin?.airport_name || `${from} Airport`,
                scheduled: flight.scheduled_departure || new Date(date + 'T08:00:00Z').toISOString(),
                actual: flight.actual_departure || null
              },
              arrival: {
                airport: flight.destination?.airport_name || `${to} Airport`,
                scheduled: flight.scheduled_arrival || new Date(date + 'T12:00:00Z').toISOString(),
                actual: flight.actual_arrival || null
              },
              status: flight.status || 'scheduled',
              confidence: 98.5, // High confidence for FlightAware data
              source: 'FlightAware_API',
              verified: true,
              delayMinutes: flight.departure_delay || 0
            },
            message: 'Flight validated via FlightAware!'
          });
        }
      }
    }
    
    // No flight found in any API
    return res.json({
      valid: false,
      error: 'Flight not found',
      message: `Flight ${flightNumber} not found in any flight database for ${date}`
    });
    
  } catch (error) {
    console.error('FlightAware API error:', error.message);
    
    // Fallback to demo mode if API fails
    console.log('📱 Falling back to demo validation...');
    
    const validFlights = ['AA1234', 'AAL1628', 'UA5678', 'DL9012', 'SW2468', 'BA100', 'LH400', 'AF447'];
    const isValid = validFlights.includes(flightNumber?.toUpperCase());
    
    if (isValid) {
      return res.json({
        valid: true,
        flight: {
          flightNumber: flightNumber.toUpperCase(),
          airline: 'Demo Airlines (API Fallback)',
          route: `${from} → ${to}`,
          departure: { airport: `${from} Airport`, scheduled: new Date(date + 'T08:00:00Z').toISOString() },
          arrival: { airport: `${to} Airport`, scheduled: new Date(date + 'T12:00:00Z').toISOString() },
          status: 'scheduled',
          confidence: 85.0, // Lower confidence for fallback
          source: 'Demo_Fallback',
          verified: true
        },
        message: 'Flight validated (demo fallback due to API issue)'
      });
    }
    
    return res.json({
      valid: false,
      error: 'Flight validation failed',
      message: `Could not validate flight ${flightNumber}. API Error: ${error.message}`
    });
  }
});

// 🛫 Demo Flight Validation (Backup)
app.post('/api/flights/validate-demo', async (req, res) => {
  const { flightNumber, from, to, date } = req.body;
  
  console.log(`🔍 Demo validation: ${flightNumber} from ${from} to ${to}`);
  
  // Demo flight list
  const validFlights = ['AA1234', 'AAL1628', 'UA5678', 'DL9012', 'SW2468', 'BA100', 'LH400', 'AF447'];
  const isValid = validFlights.includes(flightNumber?.toUpperCase());
  
  if (isValid) {
    return res.json({
      valid: true,
      flight: {
        flightNumber: flightNumber.toUpperCase(),
        airline: 'Demo Airlines',
        route: `${from} → ${to}`,
        departure: { airport: `${from} Airport`, scheduled: new Date(date + 'T08:00:00Z').toISOString() },
        arrival: { airport: `${to} Airport`, scheduled: new Date(date + 'T12:00:00Z').toISOString() },
        status: 'scheduled',
        confidence: 95.0,
        source: 'Demo Mode',
        verified: true
      },
      message: 'Flight validated!'
    });
  }
  
  return res.json({
    valid: false,
    error: 'Flight not found',
    message: 'Try AA1234, AAL1628, UA5678, DL9012, SW2468, BA100, LH400, or AF447'
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Saflair API Server started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  console.log('💫 Ready to process sentiment votes and flight insurance!');
});

module.exports = app; 