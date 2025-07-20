import React from 'react';
import { TrendingUp, Award, Target, Calendar, Crown, Star, Flame, Zap, Trophy, Coins } from 'lucide-react';
import { SentimentData, User } from '../App';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

interface SentimentDashboardProps {
  sentimentData: SentimentData;
  user: User;
}

const SentimentDashboard: React.FC<SentimentDashboardProps> = ({ sentimentData, user }) => {
  const leaderboardData = [
    { id: 1, name: 'CryptoSage', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1', accuracy: 94.2, votes: 156, streak: 28, flrEarned: 425.5 },
    { id: 2, name: 'BlockchainBull', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1', accuracy: 91.8, votes: 143, streak: 22, flrEarned: 389.2 },
    { id: 3, name: 'DefiDeep', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1', accuracy: 89.5, votes: 134, streak: 19, flrEarned: 356.8 },
    { id: 4, name: 'Alex Chen', avatar: user.avatar, accuracy: user.accuracy, votes: user.totalVotes, streak: user.dailyStreak, flrEarned: user.flrBalance },
    { id: 5, name: 'MoonTrader', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1', accuracy: 85.3, votes: 112, streak: 15, flrEarned: 298.4 }
  ];

  const sentimentHistory = [
    { date: '2025-01-08', bullish: 38.2, bearish: 35.8, neutral: 26.0, userVote: 'bearish', actual: 'bearish', correct: true },
    { date: '2025-01-09', bullish: 41.5, bearish: 33.2, neutral: 25.3, userVote: 'bullish', actual: 'neutral', correct: false },
    { date: '2025-01-10', bullish: 42.3, bearish: 31.2, neutral: 26.5, userVote: 'bullish', actual: 'bullish', correct: true },
    { date: '2025-01-11', bullish: 45.8, bearish: 29.1, neutral: 25.1, userVote: 'bullish', actual: 'bullish', correct: true },
    { date: '2025-01-12', bullish: 48.2, bearish: 26.8, neutral: 25.0, userVote: 'neutral', actual: 'bearish', correct: false },
    { date: '2025-01-13', bullish: 44.6, bearish: 30.2, neutral: 25.2, userVote: 'bearish', actual: 'bearish', correct: true },
    { date: '2025-01-14', bullish: sentimentData.bullish, bearish: sentimentData.bearish, neutral: sentimentData.neutral, userVote: 'pending', actual: 'pending', correct: null }
  ];

  const achievements = [
    { id: 'first-vote', name: 'First Vote', description: 'Cast your first sentiment vote', icon: '🗳️', unlocked: true, rarity: 'common' },
    { id: 'week-streak', name: 'Week Warrior', description: '7-day voting streak', icon: '🔥', unlocked: user.dailyStreak >= 7, rarity: 'rare' },
    { id: 'accuracy-master', name: 'Oracle Prophet', description: '80%+ accuracy over 30 votes', icon: '🔮', unlocked: user.accuracy >= 80 && user.totalVotes >= 30, rarity: 'epic' },
    { id: 'community-leader', name: 'Community Leader', description: 'Top 10 on leaderboard', icon: '👑', unlocked: true, rarity: 'legendary' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'First 1000 users', icon: '🚀', unlocked: true, rarity: 'legendary' },
    { id: 'streak-legend', name: 'Streak Legend', description: '30-day voting streak', icon: '⚡', unlocked: user.dailyStreak >= 30, rarity: 'mythic' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-400/10';
      case 'rare': return 'text-blue-400 bg-blue-400/10';
              case 'epic': return 'text-teal-400 bg-teal-400/10';
      case 'legendary': return 'text-orange-400 bg-orange-400/10';
      case 'mythic': return 'text-pink-400 bg-pink-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-pink-400';
    if (streak >= 14) return 'text-orange-400';
    if (streak >= 7) return 'text-teal-400';
    if (streak >= 3) return 'text-blue-400';
    return 'text-gray-400';
  };

  const nextMilestone = user.dailyStreak >= 30 ? 60 : user.dailyStreak >= 14 ? 30 : user.dailyStreak >= 7 ? 14 : 7;
  const daysToMilestone = nextMilestone - user.dailyStreak;

  return (
    <div className="space-y-8">
      {/* Header with Enhanced Streak Display */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Sentiment Dashboard
        </h1>
        <p className="text-gray-300">Track your crypto prediction skills</p>
        
        {/* Streak Showcase */}
        <div className="mt-6 p-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-2xl border border-orange-400/20">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Flame className={`h-12 w-12 ${getStreakColor(user.dailyStreak)} animate-pulse`} />
            <div>
              <div className={`text-4xl font-bold ${getStreakColor(user.dailyStreak)}`}>
                {user.dailyStreak} Day Streak
              </div>
              <div className="text-sm text-gray-400">
                {daysToMilestone > 0 ? `${daysToMilestone} days to next milestone` : 'Milestone achieved! 🎉'}
              </div>
            </div>
            <Flame className={`h-12 w-12 ${getStreakColor(user.dailyStreak)} animate-pulse`} />
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                user.dailyStreak >= 30 ? 'bg-gradient-to-r from-pink-400 to-purple-600' :
                user.dailyStreak >= 14 ? 'bg-gradient-to-r from-orange-400 to-pink-600' :
                user.dailyStreak >= 7 ? 'bg-gradient-to-r from-purple-400 to-blue-600' :
                'bg-gradient-to-r from-blue-400 to-cyan-600'
              }`}
              style={{ width: `${Math.min(100, (user.dailyStreak / nextMilestone) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Enhanced Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-3">
            <Calendar className="h-8 w-8 text-cyan-400 mr-2" />
            {user.dailyStreak >= 7 && <Crown className="h-6 w-6 text-yellow-400" />}
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            <AnimatedCounter value={user.dailyStreak} />
          </div>
          <div className="text-sm text-gray-400">Day Streak</div>
          {user.dailyStreak >= 7 && (
            <div className="text-xs text-yellow-400 mt-1">🔥 On Fire!</div>
          )}
        </GlassCard>
        
        <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-3">
            <Target className="h-8 w-8 text-green-400 mr-2" />
            {user.accuracy >= 80 && <Star className="h-6 w-6 text-yellow-400" />}
          </div>
          <div className="text-3xl font-bold text-green-400">
            <AnimatedCounter value={user.accuracy} decimals={1} />%
          </div>
          <div className="text-sm text-gray-400">Accuracy</div>
          {user.accuracy >= 80 && (
            <div className="text-xs text-yellow-400 mt-1">🎯 Sharp!</div>
          )}
        </GlassCard>
        
        <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-3">
            <TrendingUp className="h-8 w-8 text-purple-400 mr-2" />
            {user.totalVotes >= 100 && <Trophy className="h-6 w-6 text-yellow-400" />}
          </div>
          <div className="text-3xl font-bold text-purple-400">
            <AnimatedCounter value={user.totalVotes} />
          </div>
          <div className="text-sm text-gray-400">Total Votes</div>
          {user.totalVotes >= 100 && (
            <div className="text-xs text-yellow-400 mt-1">💯 Century!</div>
          )}
        </GlassCard>
        
        <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-3">
            <Coins className="h-8 w-8 text-yellow-400 mr-2" />
            <Zap className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            <AnimatedCounter value={user.flrBalance} decimals={0} />
          </div>
          <div className="text-sm text-gray-400">FLR Earned</div>
          <div className="text-xs text-green-400 mt-1">
            +{(user.totalVotes * 2.5).toFixed(1)} from votes
          </div>
        </GlassCard>
      </div>

      {/* Personal Voting History with Results */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-bold mb-6">Your Prediction History</h3>
        <div className="space-y-3">
          {sentimentHistory.map((day, index) => (
            <div key={day.date} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 w-16">{day.date.slice(5)}</div>
                <div className="flex space-x-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-600 h-4 rounded transition-all duration-1000"
                    style={{ width: `${day.bullish * 2}px` }}
                  ></div>
                  <div 
                    className="bg-gradient-to-r from-red-400 to-rose-600 h-4 rounded transition-all duration-1000"
                    style={{ width: `${day.bearish * 2}px` }}
                  ></div>
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-600 h-4 rounded transition-all duration-1000"
                    style={{ width: `${day.neutral * 2}px` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Your Vote</div>
                  <div className={`font-semibold ${
                    day.userVote === 'bullish' ? 'text-green-400' :
                    day.userVote === 'bearish' ? 'text-red-400' :
                    day.userVote === 'neutral' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {day.userVote === 'pending' ? '⏳' : 
                     day.userVote === 'bullish' ? '🚀' :
                     day.userVote === 'bearish' ? '🐻' : '😐'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Actual</div>
                  <div className={`font-semibold ${
                    day.actual === 'bullish' ? 'text-green-400' :
                    day.actual === 'bearish' ? 'text-red-400' :
                    day.actual === 'neutral' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {day.actual === 'pending' ? '⏳' : 
                     day.actual === 'bullish' ? '🚀' :
                     day.actual === 'bearish' ? '🐻' : '😐'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Result</div>
                  <div className="text-2xl">
                    {day.correct === null ? '⏳' : day.correct ? '✅' : '❌'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Reward</div>
                  <div className={`font-semibold ${day.correct ? 'text-green-400' : day.correct === false ? 'text-red-400' : 'text-gray-400'}`}>
                    {day.correct === null ? 'TBD' : day.correct ? '+3.5 FLR' : '+1.0 FLR'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl">
          <div className="text-center">
            <div className="text-lg font-semibold text-cyan-400 mb-1">Weekly Accuracy: 71.4%</div>
            <div className="text-sm text-gray-400">5 correct predictions out of 7 votes</div>
            <div className="text-xs text-green-400 mt-1">Bonus multiplier: 1.2x next week! 🎯</div>
          </div>
        </div>
      </GlassCard>

      {/* Enhanced Leaderboard */}
      <GlassCard className="p-8">
        <div className="flex items-center justify-center mb-6">
          <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
          <h3 className="text-2xl font-bold">Prediction Masters</h3>
          <Crown className="h-8 w-8 text-yellow-400 ml-3" />
        </div>
        <div className="space-y-4">
          {leaderboardData.map((player, index) => (
            <div key={player.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
              player.name === user.name 
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 ring-2 ring-cyan-400/50 scale-105' 
                : 'bg-white/5 hover:bg-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-cyan-400'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <img 
                  src={player.avatar} 
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400/30"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className={`font-semibold ${player.name === user.name ? 'text-cyan-400' : 'text-white'}`}>
                    {player.name}
                  </div>
                  {player.name === user.name && <Star className="h-4 w-4 text-yellow-400" />}
                  {player.streak >= 14 && <Flame className="h-4 w-4 text-orange-400" />}
                </div>
                <div className="text-sm text-gray-400">{player.votes} votes • {player.streak} day streak</div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="font-bold text-green-400">{player.accuracy}%</div>
                <div className="text-sm text-yellow-400">{player.flrEarned.toFixed(0)} FLR</div>
              </div>
              
              {index < 3 && (
                <div className="ml-2">
                  {index === 0 && <Crown className="h-6 w-6 text-yellow-400 animate-pulse" />}
                  {index === 1 && <Award className="h-6 w-6 text-gray-300" />}
                  {index === 2 && <Award className="h-6 w-6 text-orange-400" />}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl text-center">
          <div className="text-lg font-semibold text-yellow-400 mb-1">🏆 Weekly Competition</div>
          <div className="text-sm text-gray-300">
            Top 3 players this week win bonus FLR rewards!
          </div>
          <div className="text-xs text-orange-400 mt-1">
            Prize pool: 500 FLR • Ends in 3 days 14h
          </div>
        </div>
      </GlassCard>

      {/* Achievement Gallery */}
      <GlassCard className="p-8">
        <div className="flex items-center justify-center mb-6">
          <Award className="h-8 w-8 text-purple-400 mr-3" />
          <h3 className="text-2xl font-bold">Achievement Gallery</h3>
          <Star className="h-8 w-8 text-yellow-400 ml-3" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`p-4 rounded-xl border transition-all duration-300 ${
              achievement.unlocked 
                ? 'bg-gradient-to-r from-white/10 to-white/5 border-green-400/30 hover:scale-105' 
                : 'bg-white/5 border-gray-600/30 opacity-60'
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className={`font-semibold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-400 mb-2">{achievement.description}</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.toUpperCase()}
                </div>
                {achievement.unlocked && (
                  <div className="text-xs text-green-400 mt-1">✓ Unlocked</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400">
            {achievements.filter(a => a.unlocked).length} of {achievements.length} achievements unlocked
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SentimentDashboard;