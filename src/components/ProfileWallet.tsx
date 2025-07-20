import React from 'react';
import { Wallet, TrendingUp, Award, Users, Calendar, Target, Star } from 'lucide-react';
import { User } from '../App';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

interface ProfileWalletProps {
  user: User;
}

const ProfileWallet: React.FC<ProfileWalletProps> = ({ user }) => {
  const transactions = [
    { id: 1, type: 'vote', amount: 2.5, date: '2025-01-14', description: 'Daily sentiment vote' },
    { id: 2, type: 'insurance', amount: -25, date: '2025-01-13', description: 'Flight insurance premium' },
    { id: 3, type: 'vote', amount: 2.5, date: '2025-01-13', description: 'Daily sentiment vote' },
    { id: 4, type: 'bonus', amount: 10, date: '2025-01-12', description: 'Weekly accuracy bonus' },
    { id: 5, type: 'vote', amount: 2.5, date: '2025-01-12', description: 'Daily sentiment vote' }
  ];

  const achievements = [
    { id: 'early-adopter', name: 'Early Adopter', icon: '🚀', description: 'One of the first 1000 users', unlocked: true },
    { id: 'accuracy-master', name: 'Accuracy Master', icon: '🎯', description: '75%+ accuracy for 7 days', unlocked: true },
    { id: 'streak-legend', name: 'Streak Legend', icon: '🔥', description: '10+ day voting streak', unlocked: true },
    { id: 'whale-watcher', name: 'Whale Watcher', icon: '🐋', description: 'Vote during major market moves', unlocked: false },
    { id: 'insurance-expert', name: 'Insurance Expert', icon: '🛡️', description: 'Purchase 10+ policies', unlocked: false },
    { id: 'community-leader', name: 'Community Leader', icon: '👑', description: 'Top 100 on leaderboard', unlocked: false }
  ];

  const referralStats = {
    totalReferred: 12,
    activeReferrals: 8,
    bonusEarned: 120.5
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'vote':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'insurance':
        return <Target className="h-5 w-5 text-blue-400" />;
      case 'bonus':
        return <Award className="h-5 w-5 text-yellow-400" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Profile & Wallet
        </h1>
                    <p className="text-gray-300">Manage your Saflair account</p>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-8">
        <div className="flex items-center space-x-6 mb-6">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-cyan-400/50"
          />
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-gray-400">Member since Jan 2025</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">{user.accuracy}% accuracy</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">{user.dailyStreak} day streak</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl">
            <div className="text-2xl font-bold text-cyan-400">
              <AnimatedCounter value={user.flrBalance} decimals={2} />
            </div>
            <div className="text-sm text-gray-400">FLR Balance</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
            <div className="text-2xl font-bold text-green-400">
              <AnimatedCounter value={user.totalVotes} />
            </div>
            <div className="text-sm text-gray-400">Total Votes</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
            <div className="text-2xl font-bold text-purple-400">
              <AnimatedCounter value={user.accuracy} decimals={1} />%
            </div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl">
            <div className="text-2xl font-bold text-yellow-400">
              <AnimatedCounter value={user.dailyStreak} />
            </div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
        </div>
      </GlassCard>

      {/* Transaction History */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-4">
                {getTransactionIcon(tx.type)}
                <div>
                  <div className="font-semibold">{tx.description}</div>
                  <div className="text-sm text-gray-400">{tx.date}</div>
                </div>
              </div>
              <div className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} FLR
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Achievements */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-bold mb-6">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`p-4 rounded-xl transition-all duration-300 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50' 
                  : 'bg-white/5 border border-gray-600/50 opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-lg">{achievement.name}</div>
                <div className="text-sm text-gray-400">{achievement.description}</div>
                {achievement.unlocked && (
                  <div className="text-xs text-yellow-400 mt-2">✓ Unlocked</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Referral System */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-bold mb-6">Referral Program</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">
              <AnimatedCounter value={referralStats.totalReferred} />
            </div>
            <div className="text-sm text-gray-400">Total Referred</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">
              <AnimatedCounter value={referralStats.activeReferrals} />
            </div>
            <div className="text-sm text-gray-400">Active Referrals</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
            <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">
              <AnimatedCounter value={referralStats.bonusEarned} decimals={1} />
            </div>
            <div className="text-sm text-gray-400">Bonus Earned</div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl">
          <div className="text-center">
            <p className="text-gray-300 mb-4">Share your referral link and earn 10% of your friends' rewards!</p>
            <div className="flex items-center space-x-4 bg-white/10 rounded-lg p-3">
              <input 
                type="text" 
                                  value="https://saflair.com/ref/alex-chen" 
                readOnly 
                className="flex-1 bg-transparent text-cyan-400 font-mono text-sm"
              />
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                Copy
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfileWallet;