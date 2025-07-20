import React from 'react';
import { TrendingUp, TrendingDown, Minus, Plane, Shield, Zap, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { SentimentData, FlightPolicy } from '../App';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

interface LandingPageProps {
  sentimentData: SentimentData;
  userVote: string | null;
  onVote: (sentiment: 'bullish' | 'bearish' | 'neutral') => void;
  flightPolicies: FlightPolicy[];
  isWalletConnected: boolean;
  onConnectWallet: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  sentimentData,
  userVote,
  onVote,
  flightPolicies,
  isWalletConnected,
  onConnectWallet
}) => {
  const getMoodColor = () => {
    if (sentimentData.bullish > sentimentData.bearish && sentimentData.bullish > sentimentData.neutral) {
      return 'from-green-400 to-emerald-600';
    } else if (sentimentData.bearish > sentimentData.bullish && sentimentData.bearish > sentimentData.neutral) {
      return 'from-red-400 to-rose-600';
    } else {
      return 'from-blue-400 to-cyan-600';
    }
  };

  const activePolicies = flightPolicies.filter(p => p.status === 'active');
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverage, 0);
  const totalPremiums = flightPolicies.reduce((sum, p) => sum + p.premium, 0);
  
  // Real-time flight delays (simulated oracle data)
  const flightDelays = [
    { flight: 'AA1234', route: 'JFK→LAX', delay: 45, status: 'delayed' },
    { flight: 'UA5678', route: 'SFO→ORD', delay: 0, status: 'on-time' },
    { flight: 'DL9012', route: 'ATL→MIA', delay: 120, status: 'delayed' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section with Enhanced Daily Habit Emphasis */}
      <div className="text-center space-y-8">
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className="relative">
            <Zap className="h-16 w-16 text-yellow-400 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full"></div>
          </div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Saflair
          </h1>
          <div className="relative">
            <Plane className="h-16 w-16 text-cyan-400 animate-bounce" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-teal-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-teal-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            <span className="text-cyan-400 font-semibold">Vote daily</span> on crypto sentiment • 
            <span className="text-teal-400 font-semibold"> Earn FLR rewards</span> • 
            <span className="text-pink-400 font-semibold"> Protect your flights</span>
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            The first Web3 app that pays you to build daily habits while protecting your travels
          </p>
        </div>
        
        <div className="flex floating-crypto-icons justify-center space-x-8 py-6">
          <div className="animate-float text-4xl">₿</div>
          <div className="animate-float-delayed text-4xl">Ξ</div>
          <div className="animate-float text-4xl">◊</div>
          <div className="animate-float-delayed text-4xl">✈️</div>
          <div className="animate-float text-4xl">🚀</div>
        </div>
      </div>

      {/* Enhanced Daily Habit Section */}
      <GlassCard className="text-center p-8 ring-2 ring-cyan-400/20">
        <div className="flex items-center justify-center mb-6">
          <Clock className="h-8 w-8 text-cyan-400 mr-3 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Your Daily Check-In
          </h2>
          <Clock className="h-8 w-8 text-cyan-400 ml-3 animate-pulse" />
        </div>
        
                  <div className="mb-8 p-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-xl">
          <div className="text-sm text-gray-300 mb-2">Today's Reward Pool</div>
          <div className="text-3xl font-bold text-yellow-400">
            <AnimatedCounter value={totalPremiums * 0.3} decimals={1} /> FLR
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Funded by flight insurance premiums • <span className="text-cyan-400">{sentimentData.totalVotes} votes today</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onVote('bullish')}
            disabled={!!userVote}
            className={`group relative p-8 rounded-2xl transition-all duration-500 ${
              userVote === 'bullish' 
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-600/30 ring-2 ring-green-400 scale-105' 
                : 'bg-white/5 hover:bg-green-500/20 hover:scale-110 hover:rotate-1'
            } ${userVote && userVote !== 'bullish' ? 'opacity-50 scale-95' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-green-400 group-hover:animate-bounce" />
              <div className="text-5xl mb-3 animate-pulse">🚀</div>
              <div className="text-2xl font-bold text-green-400 mb-2">Bullish</div>
              <div className="text-gray-300 text-base">Markets going up!</div>
              <div className="text-sm text-green-300 mt-2 font-semibold">+2.5 FLR</div>
            </div>
          </button>
          
          <button
            onClick={() => onVote('bearish')}
            disabled={!!userVote}
            className={`group relative p-8 rounded-2xl transition-all duration-500 ${
              userVote === 'bearish' 
                ? 'bg-gradient-to-r from-red-500/30 to-rose-600/30 ring-2 ring-red-400 scale-105' 
                : 'bg-white/5 hover:bg-red-500/20 hover:scale-110 hover:rotate-1'
            } ${userVote && userVote !== 'bearish' ? 'opacity-50 scale-95' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative">
              <TrendingDown className="h-16 w-16 mx-auto mb-4 text-red-400 group-hover:animate-bounce" />
              <div className="text-5xl mb-3 animate-pulse">🐻</div>
              <div className="text-2xl font-bold text-red-400 mb-2">Bearish</div>
              <div className="text-gray-300 text-base">Markets going down</div>
              <div className="text-sm text-red-300 mt-2 font-semibold">+2.5 FLR</div>
            </div>
          </button>
          
          <button
            onClick={() => onVote('neutral')}
            disabled={!!userVote}
            className={`group relative p-8 rounded-2xl transition-all duration-500 ${
              userVote === 'neutral' 
                ? 'bg-gradient-to-r from-blue-500/30 to-cyan-600/30 ring-2 ring-blue-400 scale-105' 
                : 'bg-white/5 hover:bg-blue-500/20 hover:scale-110 hover:rotate-1'
            } ${userVote && userVote !== 'neutral' ? 'opacity-50 scale-95' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative">
              <Minus className="h-16 w-16 mx-auto mb-4 text-blue-400 group-hover:animate-bounce" />
              <div className="text-5xl mb-3 animate-pulse">😐</div>
              <div className="text-2xl font-bold text-blue-400 mb-2">Neutral</div>
              <div className="text-gray-300 text-base">Sideways action</div>
              <div className="text-sm text-blue-300 mt-2 font-semibold">+2.5 FLR</div>
            </div>
          </button>
        </div>
        
        {userVote ? (
          <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
            <div className="text-2xl font-bold text-green-400 mb-2">
              ✅ Daily Vote Complete! +2.5 FLR earned
            </div>
            <div className="text-gray-300 mb-3">
              Come back tomorrow for your next vote and keep your streak alive!
            </div>
            <div className="text-sm text-cyan-400">
              Next vote unlocks in: 18h 42m 15s
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/30">
            <div className="text-lg font-semibold text-yellow-400 mb-1">
              🔥 Don't break your streak!
            </div>
            <div className="text-sm text-gray-300">
              Vote now to maintain your daily habit and earn rewards
            </div>
          </div>
        )}
      </GlassCard>

      {/* Live Sentiment Meter with Enhanced Visuals */}
      <GlassCard className="p-8 ring-1 ring-white/10">
        <div className="flex items-center justify-center mb-6">
                      <Users className="h-8 w-8 text-teal-400 mr-3" />
          <h3 className="text-2xl font-bold">Live Community Pulse</h3>
          <div className="ml-3 px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-400 animate-pulse">
            LIVE
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-green-400 font-medium text-lg">🚀 Bullish</span>
              <div className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-300">
                +{(Math.random() * 0.5).toFixed(1)}%
              </div>
            </div>
            <span className="text-green-400 font-bold text-xl"><AnimatedCounter value={sentimentData.bullish} decimals={1} />%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-600 h-4 rounded-full transition-all duration-1000 relative"
              style={{ width: `${sentimentData.bullish}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-red-400 font-medium text-lg">🐻 Bearish</span>
              <div className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-300">
                -{(Math.random() * 0.3).toFixed(1)}%
              </div>
            </div>
            <span className="text-red-400 font-bold text-xl"><AnimatedCounter value={sentimentData.bearish} decimals={1} />%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-400 to-rose-600 h-4 rounded-full transition-all duration-1000 relative"
              style={{ width: `${sentimentData.bearish}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-blue-400 font-medium text-lg">😐 Neutral</span>
              <div className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                stable
              </div>
            </div>
            <span className="text-blue-400 font-bold text-xl"><AnimatedCounter value={sentimentData.neutral} decimals={1} />%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-600 h-4 rounded-full transition-all duration-1000 relative"
              style={{ width: `${sentimentData.neutral}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="text-center p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-xl">
            <div className="text-3xl font-bold text-teal-400">
              <AnimatedCounter value={sentimentData.totalVotes} />
            </div>
            <div className="text-sm text-gray-400">Total votes today</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl">
            <div className="text-3xl font-bold text-cyan-400">
              <AnimatedCounter value={sentimentData.totalVotes * 2.5} decimals={0} />
            </div>
            <div className="text-sm text-gray-400">FLR distributed today</div>
          </div>
        </div>
      </GlassCard>

      {/* Oracle-Verified Flight Data */}
      <GlassCard className="p-8">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-8 w-8 text-cyan-400 mr-3" />
          <h3 className="text-2xl font-bold">Live Oracle-Verified Flight Data</h3>
          <div className="ml-3 px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400 animate-pulse">
            FLARE ORACLE
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          {flightDelays.map((flight, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <Plane className="h-6 w-6 text-cyan-400" />
                <div>
                  <div className="font-semibold">{flight.flight}</div>
                  <div className="text-sm text-gray-400">{flight.route}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-semibold ${flight.delay > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {flight.delay > 0 ? `+${flight.delay}min` : 'On Time'}
                  </div>
                  <div className="text-xs text-gray-400">Last updated: 2 min ago</div>
                </div>
                
                {flight.delay > 120 ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Auto Payout</span>
                  </div>
                ) : flight.delay > 0 ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-full">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Monitoring</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-500/20 rounded-full">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm font-medium">On Track</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl">
            <div className="text-3xl font-bold text-cyan-400">
              <AnimatedCounter value={activePolicies.length} />
            </div>
            <div className="text-sm text-gray-400">Active Policies</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
            <div className="text-3xl font-bold text-purple-400">
              $<AnimatedCounter value={totalCoverage} />
            </div>
            <div className="text-sm text-gray-400">Total Coverage</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
            <div className="text-3xl font-bold text-green-400">
              <AnimatedCounter value={98.7} decimals={1} />%
            </div>
            <div className="text-sm text-gray-400">Auto-Payout Success</div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-10 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-lg">
            🛡️ Get Instant Flight Protection
          </button>
          <p className="text-sm text-gray-400 mt-2">No paperwork • Instant payouts • Oracle verified</p>
        </div>
      </GlassCard>

      {/* Economic Model Visualization */}
      <GlassCard className="p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <h3 className="text-2xl font-bold text-center mb-8">How Saflair Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Plane className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-cyan-400">Travelers Buy Insurance</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Flight insurance premiums create a sustainable fund that powers the ecosystem
            </p>
            <div className="text-2xl font-bold text-cyan-400">
              ${totalPremiums.toFixed(0)} collected
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-purple-400">30% Funds Daily Rewards</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              A portion of premiums creates the daily reward pool for sentiment voters
            </p>
            <div className="text-2xl font-bold text-purple-400">
              {(totalPremiums * 0.3).toFixed(0)} FLR pool
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-green-400">Community Gets Paid</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Daily voters earn FLR rewards while building valuable sentiment data
            </p>
            <div className="text-2xl font-bold text-green-400">
              {sentimentData.totalVotes} voters today
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl text-center">
          <h4 className="text-xl font-semibold text-yellow-400 mb-2">🔄 Self-Sustaining Ecosystem</h4>
          <p className="text-gray-300 text-sm">
            Most flights are on time, so insurance profits fund community rewards. 
            Everyone wins: travelers get protection, crypto enthusiasts earn daily rewards.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default LandingPage;