import React, { useState } from 'react';
import { Plane, Search, Shield, Clock, CheckCircle, AlertTriangle, Zap, Globe, Wifi, Database, DollarSign, TrendingUp } from 'lucide-react';
import { FlightPolicy, User } from '../App';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';
import FDCStatus from './FDCStatus';
import AirportDropdown from './AirportDropdown';

interface FlightInsuranceProps {
  flightPolicies: FlightPolicy[];
  setFlightPolicies: React.Dispatch<React.SetStateAction<FlightPolicy[]>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  showToast: (message: string) => void;
}

const FlightInsurance: React.FC<FlightInsuranceProps> = ({
  flightPolicies,
  setFlightPolicies,
  user,
  setUser,
  showToast
}) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    flightNumber: ''
  });
  const [showPurchase, setShowPurchase] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [validatedFlight, setValidatedFlight] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time flight data simulation
  const realtimeFlights = [
    { flight: 'AA1234', route: 'JFK → LAX', delay: 0, confidence: 98.5, premium: 25, coverage: 500 },
    { flight: 'UA5678', route: 'SFO → ORD', delay: 15, confidence: 92.1, premium: 35, coverage: 750 },
    { flight: 'DL9012', route: 'ATL → MIA', delay: 120, confidence: 99.8, premium: 15, coverage: 400 },
    { flight: 'SW2468', route: 'LAX → DEN', delay: 0, confidence: 95.3, premium: 20, coverage: 300 },
  ];

  const insuranceStats = {
    totalPolicies: 12847,
    totalCoverage: 45280000,
    payoutsToday: 127,
    avgResponseTime: 2.3,
    successRate: 99.1
  };

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.date || !searchData.flightNumber) {
      showToast('Please fill in all fields including flight number');
      return;
    }
    
    setIsSearching(true);
    setValidationError(null);
    setValidatedFlight(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3001/api/flights/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          flightNumber: searchData.flightNumber,
          from: searchData.from,
          to: searchData.to,
          date: searchData.date
        })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setValidatedFlight(data.flight);
        setShowPurchase(true);
        showToast(`✅ Flight ${data.flight.flightNumber} validated successfully!`);
      } else {
        setValidationError(data.message || 'Flight not found');
        showToast(`❌ ${data.message || 'Flight validation failed'}`);
        setShowPurchase(false);
      }
      
    } catch (error) {
      console.error('Flight validation error:', error);
      setValidationError('Unable to validate flight. Please check your connection.');
      showToast('❌ Flight validation failed');
      setShowPurchase(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchase = (coverage: number, premium: number) => {
    const newPolicy: FlightPolicy = {
      id: Date.now().toString(),
      flightNumber: searchData.flightNumber || `FL${Math.floor(Math.random() * 9999)}`,
      route: `${searchData.from} → ${searchData.to}`,
      date: searchData.date,
      coverage,
      premium,
      status: 'active'
    };

    setFlightPolicies(prev => [...prev, newPolicy]);
    setUser(prev => ({ ...prev, flrBalance: prev.flrBalance - premium }));
    showToast(`Insurance active! Oracle monitoring flight ${newPolicy.flightNumber}`);
    setShowPurchase(false);
    setSearchData({ from: '', to: '', date: '', flightNumber: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'claimed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-400 bg-blue-400/10';
      case 'claimed':
        return 'text-green-400 bg-green-400/10';
      case 'expired':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getDelayRisk = (delay: number) => {
    if (delay === 0) return { risk: 'Low', color: 'text-green-400', bg: 'bg-green-400/10' };
    if (delay < 60) return { risk: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { risk: 'High', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  return (
    <div className="space-y-8">
      {/* Header with Real-time Stats */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Oracle-Verified Flight Insurance
        </h1>
        <p className="text-gray-300 mb-6">Instant protection • Automatic payouts • Zero paperwork</p>
        
        {/* Live Oracle Status */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <Wifi className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Flare Oracle Active</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 rounded-full">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Real-time Flight Data</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-full">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Auto-Payouts</span>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      {/* Live FDC Oracle Dashboard */}
      <GlassCard className="p-6 mb-8 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="text-xl font-bold text-white">🔗 Live FDC Oracle Dashboard</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
            <Database className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Contract: 0xF1CF...7DE4</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {realtimeFlights.map((flight, index) => (
            <div key={flight.flight} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-cyan-400">{flight.flight}</span>
                <div className={`w-2 h-2 rounded-full ${flight.delay > 120 ? 'bg-red-400' : flight.delay > 0 ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
              </div>
              <div className="text-sm text-slate-400 mb-2">{flight.route}</div>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-medium ${flight.delay > 120 ? 'text-red-400' : flight.delay > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {flight.delay > 0 ? `${flight.delay}m delay` : 'On time'}
                </span>
                <span className="text-cyan-400 font-bold">{flight.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-cyan-400">
            <AnimatedCounter value={insuranceStats.totalPolicies} />
          </div>
          <div className="text-xs text-gray-400">Active Policies</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-green-400">
            $<AnimatedCounter value={insuranceStats.totalCoverage / 1000000} decimals={1} />M
          </div>
          <div className="text-xs text-gray-400">Total Coverage</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-purple-400">
            <AnimatedCounter value={insuranceStats.payoutsToday} />
          </div>
          <div className="text-xs text-gray-400">Payouts Today</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-yellow-400">
            <AnimatedCounter value={insuranceStats.avgResponseTime} decimals={1} />s
          </div>
          <div className="text-xs text-gray-400">Avg Response</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-orange-400">
            <AnimatedCounter value={insuranceStats.successRate} decimals={1} />%
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </GlassCard>
      </div>

      {/* Enhanced Search Section */}
      <GlassCard className="p-8 ring-1 ring-cyan-400/20">
        <div className="flex items-center mb-6">
          <Search className="h-6 w-6 text-cyan-400 mr-3" />
          <h3 className="text-2xl font-bold">Find & Protect Your Flight</h3>
          <div className="ml-auto flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 rounded-full">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">Live Oracle Data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Airport</label>
            <AirportDropdown
              value={searchData.from}
              onChange={(value) => setSearchData(prev => ({ ...prev, from: value }))}
              placeholder="Select departure airport..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To Airport</label>
            <AirportDropdown
              value={searchData.to}
              onChange={(value) => setSearchData(prev => ({ ...prev, to: value }))}
              placeholder="Select arrival airport..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={searchData.date}
              onChange={(e) => setSearchData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Flight Number *</label>
            <input
              type="text"
              placeholder="AA1234, UA5678..."
              value={searchData.flightNumber}
              onChange={(e) => setSearchData(prev => ({ ...prev, flightNumber: e.target.value.toUpperCase() }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder-slate-400"
            />
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              isSearching 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105'
            }`}
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Validating Flight...</span>
              </div>
            ) : (
              '🔍 Validate Flight'
            )}
          </button>
        </div>
        
        {/* Flight Validation Status */}
        {validationError && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-red-400 font-medium">Flight Validation Failed</div>
                <div className="text-red-300 text-sm mt-1">{validationError}</div>
              </div>
            </div>
          </div>
        )}
        
        {validatedFlight && (
          <div className="mt-4 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <div className="text-green-400 font-semibold text-lg">✅ Flight Validated Successfully</div>
                <div className="text-green-300 text-sm">Oracle confidence: {validatedFlight.confidence}%</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 font-medium">Flight Details</label>
                  <div className="text-white font-bold text-lg">{validatedFlight.flightNumber}</div>
                  <div className="text-slate-300">{validatedFlight.airline}</div>
                  <div className="text-cyan-400 font-medium">{validatedFlight.route}</div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 font-medium">Status</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    validatedFlight.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    validatedFlight.status === 'delayed' ? 'bg-yellow-500/20 text-yellow-400' :
                    validatedFlight.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {validatedFlight.status.charAt(0).toUpperCase() + validatedFlight.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 font-medium">Departure</label>
                  <div className="text-white">{validatedFlight.departure.airport}</div>
                  <div className="text-slate-300 text-sm">
                    {new Date(validatedFlight.departure.scheduled).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 font-medium">Data Source</label>
                  <div className="text-cyan-400 font-medium">{validatedFlight.source}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Flight Monitor */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-400 mr-2" />
            Live Flight Monitor
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realtimeFlights.map((flight, index) => {
              const riskInfo = getDelayRisk(flight.delay);
              return (
                <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold text-cyan-400">{flight.flight}</div>
                      <div className="text-sm text-gray-400">{flight.route}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${riskInfo.bg} ${riskInfo.color}`}>
                      {riskInfo.risk} Risk
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-400">Oracle Confidence: </span>
                      <span className="text-green-400 font-semibold">{flight.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Premium: </span>
                      <span className="text-yellow-400 font-semibold">${flight.premium}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* FDC Oracle Verification */}
      {showPurchase && validatedFlight && (
        <FDCStatus 
          flightNumber={validatedFlight.flightNumber}
          className="mb-6"
        />
      )}

      {/* Enhanced Insurance Purchase Cards */}
      {showPurchase && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300 ring-1 ring-cyan-400/30">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-cyan-400 mr-2" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h4 className="text-xl font-bold mb-2">Smart Basic</h4>
            <div className="text-3xl font-bold text-cyan-400 mb-2">$500</div>
            <div className="text-sm text-gray-400 mb-4">Coverage Amount</div>
            <div className="text-lg font-semibold text-green-400 mb-4">$25 Premium</div>
            <div className="text-xs text-cyan-400 mb-4">✓ Oracle-verified payouts</div>
            <div className="text-xs text-cyan-400 mb-4">✓ 2+ hour delay coverage</div>
            <button
              onClick={() => handlePurchase(500, 25)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Activate Protection
            </button>
          </GlassCard>
          
          <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300 ring-2 ring-purple-400 scale-105">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-purple-400 mr-2" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h4 className="text-xl font-bold mb-2">Smart Premium</h4>
            <div className="text-3xl font-bold text-purple-400 mb-2">$1,000</div>
            <div className="text-sm text-gray-400 mb-4">Coverage Amount</div>
            <div className="text-lg font-semibold text-green-400 mb-4">$50 Premium</div>
            <div className="text-xs text-purple-400 mb-2">⭐ Most Popular</div>
            <div className="text-xs text-cyan-400 mb-2">✓ All Basic features</div>
            <div className="text-xs text-cyan-400 mb-2">✓ 1+ hour delay coverage</div>
            <div className="text-xs text-cyan-400 mb-4">✓ Weather delay protection</div>
            <button
              onClick={() => handlePurchase(1000, 50)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Activate Protection
            </button>
          </GlassCard>
          
          <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300 ring-1 ring-yellow-400/30">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-yellow-400 mr-2" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h4 className="text-xl font-bold mb-2">Smart Ultimate</h4>
            <div className="text-3xl font-bold text-yellow-400 mb-2">$2,000</div>
            <div className="text-sm text-gray-400 mb-4">Coverage Amount</div>
            <div className="text-lg font-semibold text-green-400 mb-4">$100 Premium</div>
            <div className="text-xs text-cyan-400 mb-2">✓ All Premium features</div>
            <div className="text-xs text-cyan-400 mb-2">✓ 30min+ delay coverage</div>
            <div className="text-xs text-cyan-400 mb-2">✓ Baggage delay protection</div>
            <div className="text-xs text-cyan-400 mb-4">✓ Missed connection coverage</div>
            <button
              onClick={() => handlePurchase(2000, 100)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Activate Protection
            </button>
          </GlassCard>
        </div>
      )}

      {/* Active Policies with Enhanced Status */}
      <GlassCard className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 text-cyan-400 mr-2" />
            Your Protected Flights
          </h3>
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Oracle Monitoring</span>
          </div>
        </div>
        
        {flightPolicies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-xl font-semibold mb-2">No Protected Flights Yet</h4>
            <p className="mb-4">Start protecting your travels with oracle-verified insurance</p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Instant payouts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4 text-cyan-400" />
                <span>Oracle verified</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No paperwork</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {flightPolicies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">✈️</div>
                  <div>
                    <div className="font-semibold text-lg">{policy.flightNumber}</div>
                    <div className="text-sm text-gray-400">{policy.route}</div>
                    <div className="text-sm text-gray-400">{policy.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-bold text-cyan-400 text-lg">${policy.coverage}</div>
                    <div className="text-xs text-gray-400">Coverage</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-bold text-green-400 text-lg">${policy.premium}</div>
                    <div className="text-xs text-gray-400">Premium</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Monitoring</span>
                    </div>
                    <div className="text-xs text-gray-400">Oracle Active</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(policy.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(policy.status)}`}>
                      {policy.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Economic Impact Visualization */}
      <GlassCard className="p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <h3 className="text-2xl font-bold text-center mb-8">Insurance Impact on Saflair Economy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-cyan-400">Premiums Collected</h4>
            <div className="text-3xl font-bold text-cyan-400">
              ${flightPolicies.reduce((sum, p) => sum + p.premium, 0).toFixed(0)}
            </div>
            <p className="text-gray-300 text-sm">
              From your purchased policies
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-purple-400">Funding Sentiment Rewards</h4>
            <div className="text-3xl font-bold text-purple-400">
              ${(flightPolicies.reduce((sum, p) => sum + p.premium, 0) * 0.3).toFixed(0)}
            </div>
            <p className="text-gray-300 text-sm">
              30% goes to daily reward pool
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-green-400">Oracle-Powered Protection</h4>
            <div className="text-3xl font-bold text-green-400">
              <AnimatedCounter value={99.1} decimals={1} />%
            </div>
            <p className="text-gray-300 text-sm">
              Automatic payout success rate
            </p>
          </div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl">
          <h4 className="text-xl font-semibold text-yellow-400 mb-2">🚀 The Future of Travel Insurance</h4>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            No more filing claims, waiting weeks for approval, or dealing with paperwork. 
            Our oracle-verified system detects flight delays in real-time and automatically sends compensation to your wallet within minutes.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default FlightInsurance;