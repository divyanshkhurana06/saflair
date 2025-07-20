import React, { useState, useEffect } from 'react';
import { Plane, Wallet, TrendingUp, Home, User, Bell } from 'lucide-react';
import LandingPage from './components/LandingPage';
import SentimentDashboard from './components/SentimentDashboard';
import FlightInsurance from './components/FlightInsurance';
import ProfileWallet from './components/ProfileWallet';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import Toast from './components/Toast';

export interface User {
  id: string;
  name: string;
  avatar: string;
  flrBalance: number;
  dailyStreak: number;
  totalVotes: number;
  accuracy: number;
  achievements: string[];
}

export interface SentimentData {
  bullish: number;
  bearish: number;
  neutral: number;
  totalVotes: number;
}

export interface FlightPolicy {
  id: string;
  flightNumber: string;
  route: string;
  date: string;
  coverage: number;
  premium: number;
  status: 'active' | 'claimed' | 'expired';
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    flrBalance: 2847.58,
    dailyStreak: 12,
    totalVotes: 89,
    accuracy: 76.4,
    achievements: ['early-adopter', 'accuracy-master', 'streak-legend']
  });
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    bullish: 45.2,
    bearish: 28.6,
    neutral: 26.2,
    totalVotes: 15847
  });
  const [userVote, setUserVote] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flightPolicies, setFlightPolicies] = useState<FlightPolicy[]>([
    {
      id: '1',
      flightNumber: 'AA1234',
      route: 'JFK → LAX',
      date: '2025-01-15',
      coverage: 500,
      premium: 25,
      status: 'active'
    },
    {
      id: '2',
      flightNumber: 'UA5678',
      route: 'SFO → ORD',
      date: '2025-01-20',
      coverage: 750,
      premium: 37.5,
      status: 'active'
    }
  ]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVote = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    if (userVote) {
      showToast('You have already voted today!');
      return;
    }

    setUserVote(sentiment);
    
    // Simulate real-time update
    setSentimentData(prev => {
      const increment = 1;
      const newTotal = prev.totalVotes + 1;
      const newData = { ...prev, totalVotes: newTotal };
      
      if (sentiment === 'bullish') {
        newData.bullish = ((prev.bullish * prev.totalVotes / 100) + increment) / newTotal * 100;
        newData.bearish = (prev.bearish * prev.totalVotes / 100) / newTotal * 100;
        newData.neutral = (prev.neutral * prev.totalVotes / 100) / newTotal * 100;
      } else if (sentiment === 'bearish') {
        newData.bearish = ((prev.bearish * prev.totalVotes / 100) + increment) / newTotal * 100;
        newData.bullish = (prev.bullish * prev.totalVotes / 100) / newTotal * 100;
        newData.neutral = (prev.neutral * prev.totalVotes / 100) / newTotal * 100;
      } else {
        newData.neutral = ((prev.neutral * prev.totalVotes / 100) + increment) / newTotal * 100;
        newData.bullish = (prev.bullish * prev.totalVotes / 100) / newTotal * 100;
        newData.bearish = (prev.bearish * prev.totalVotes / 100) / newTotal * 100;
      }
      
      return newData;
    });

    // Update user stats
    setUser(prev => ({
      ...prev,
      flrBalance: prev.flrBalance + 2.5,
      totalVotes: prev.totalVotes + 1
    }));

    showToast(`Vote cast! +2.5 FLR earned`);
  };

  const connectWallet = () => {
    setIsWalletConnected(true);
    showToast('Wallet connected successfully!');
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentData(prev => ({
        ...prev,
        totalVotes: prev.totalVotes + Math.floor(Math.random() * 3),
        bullish: Math.max(20, Math.min(60, prev.bullish + (Math.random() - 0.5) * 2)),
        bearish: Math.max(15, Math.min(50, prev.bearish + (Math.random() - 0.5) * 2)),
        neutral: Math.max(15, Math.min(40, prev.neutral + (Math.random() - 0.5) * 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <LandingPage
            sentimentData={sentimentData}
            userVote={userVote}
            onVote={handleVote}
            flightPolicies={flightPolicies}
            isWalletConnected={isWalletConnected}
            onConnectWallet={connectWallet}
          />
        );
      case 'dashboard':
        return <SentimentDashboard sentimentData={sentimentData} user={user} />;
      case 'insurance':
        return (
          <FlightInsurance
            flightPolicies={flightPolicies}
            setFlightPolicies={setFlightPolicies}
            user={user}
            setUser={setUser}
            showToast={showToast}
          />
        );
      case 'profile':
        return <ProfileWallet user={user} />;
      default:
        return null;
    }
  };

  return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isWalletConnected={isWalletConnected}
          onConnectWallet={connectWallet}
          user={user}
        />
        
        <main className="container mx-auto px-4 py-8">
          {renderCurrentPage()}
        </main>
      </div>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default App;