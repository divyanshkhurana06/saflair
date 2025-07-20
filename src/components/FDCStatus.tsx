import React, { useState, useEffect } from 'react';

interface FDCStatusProps {
  flightNumber?: string;
  className?: string;
}

interface FDCData {
  isVerified: boolean;
  confidence: number;
  votingRound?: number;
  verificationHash?: string;
  source: string;
  timestamp?: number;
  txHash?: string;
}

const FDCStatus: React.FC<FDCStatusProps> = ({ flightNumber, className = '' }) => {
  const [fdcData, setFdcData] = useState<FDCData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const requestFDCVerification = async () => {
    if (!flightNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, simulate successful FDC verification
      console.log(`🔍 Simulating FDC verification for flight ${flightNumber}`);
      
      // Show immediate success with mock FDC data
      setFdcData({
        isVerified: true,
        confidence: 95.5,
        votingRound: Math.floor(Date.now() / 180000),
        verificationHash: '0x' + Math.random().toString(16).slice(2, 66),
        source: 'Flare Data Connector',
        timestamp: Date.now(),
        txHash: '0x' + Math.random().toString(16).slice(2, 66)
      });
      setLoading(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request FDC verification');
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-emerald-400';
    if (confidence >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 95) return 'bg-emerald-500/20';
    if (confidence >= 85) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">
            🔗 Flare Data Connector
          </h3>
        </div>
        
        {flightNumber && (
          <button
            onClick={requestFDCVerification}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 
                     border border-cyan-500/30 rounded-lg transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                Verifying...
              </span>
            ) : (
              'Verify Flight'
            )}
          </button>
        )}
      </div>

      {/* FDC Status */}
      {fdcData ? (
        <div className="space-y-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-emerald-400 font-medium">Oracle Verified</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getConfidenceBg(fdcData.confidence)} ${getConfidenceColor(fdcData.confidence)}`}>
              {fdcData.confidence}% Confidence
            </div>
          </div>

          {/* Oracle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 font-medium">Voting Round</label>
                <p className="text-white font-mono text-sm">#{fdcData.votingRound}</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 font-medium">Data Source</label>
                <p className="text-cyan-400 text-sm font-medium">{fdcData.source}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 font-medium">Verification Hash</label>
                <p className="text-white font-mono text-xs break-all">
                  {fdcData.verificationHash?.slice(0, 20)}...
                </p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 font-medium">Timestamp</label>
                <p className="text-white text-sm">
                  {fdcData.timestamp ? new Date(fdcData.timestamp).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Blockchain Links */}
          {fdcData.txHash && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-700/50">
              <a
                href={`https://coston2-explorer.flare.network/tx/${fdcData.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Transaction
              </a>
              
                             <a
                 href={`https://coston2-explorer.flare.network/address/0xF1CF477998fc439e17D5CeDF7444c7e82F557DE4`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
               >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Smart Contract
              </a>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Requesting FDC attestation...</p>
            <p className="text-slate-500 text-xs mt-1">This may take 2-5 minutes</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-red-400 font-medium">Verification Failed</span>
          </div>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">
            {flightNumber ? 'Click "Verify Flight" to request FDC attestation' : 'Enter a flight number to verify'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FDCStatus; 