# 🔑 API Keys Setup Guide for Saflair FDC Integration

## Required API Keys

### 1. Aviation Stack API Key (FREE - Recommended to start)
```bash
# 🌐 Visit: https://aviationstack.com/
# 1. Click "Get Free Access"
# 2. Sign up with email
# 3. Verify email
# 4. Go to Dashboard → API Access
# 5. Copy your API key

# Free Tier Limits:
# - 1,000 requests/month
# - Real-time flight data
# - Perfect for testing FDC integration
```

### 2. Flare Wallet Private Key (Testnet)
```bash
# Option A: Create New Wallet
# 1. Use MetaMask or any Web3 wallet
# 2. Create new account
# 3. Switch to Flare Coston2 Testnet
# 4. Get private key from wallet settings

# Option B: Use existing wallet
# 1. Export private key (keep secure!)
# 2. Get testnet FLR from faucet

# 🚰 Coston2 Testnet Faucet:
# Visit: https://coston2-faucet.towolabs.com/
# Enter your wallet address to get free FLR for testing
```

### 3. Optional APIs (For production redundancy)
```bash
# FlightAware API (Premium - Most reliable)
# Visit: https://www.flightaware.com/commercial/aeroapi/
# Paid plans start at $99/month for real-time data

# OpenSky Network (Free - Basic data)
# Visit: https://opensky-network.org/
# Create account for free access
```

## Setup Instructions

### Step 1: Copy Environment File
```bash
cd backend
cp .env.example .env
```

### Step 2: Edit .env File
Open `backend/.env` in your editor and replace:

```env
# Replace these with your actual keys:
FLARE_PRIVATE_KEY=YOUR_ACTUAL_PRIVATE_KEY_HERE
AVIATIONSTACK_API_KEY=YOUR_ACTUAL_API_KEY_HERE

# Example (don't use these dummy values):
# FLARE_PRIVATE_KEY=0x1234567890abcdef...
# AVIATIONSTACK_API_KEY=abc123def456ghi789...
```

### Step 3: Test Configuration
```bash
cd backend
node test-fdc.js
```

## Network Configuration

### Flare Coston2 Testnet Details:
```
Network Name: Flare Testnet Coston2
RPC URL: https://coston2-api.flare.network/ext/C/rpc
Chain ID: 114
Currency Symbol: C2FLR
Block Explorer: https://coston2-explorer.flare.network/
```

### Add to MetaMask:
1. Open MetaMask
2. Click network dropdown
3. "Add Network" → "Add Network Manually"
4. Enter details above
5. Save

## Security Notes

### 🔒 Important Security Tips:
- **NEVER** commit your `.env` file to git
- Use a separate wallet for testing (not your main wallet)
- Keep private keys secure and backed up
- Use testnet tokens only for development
- Rotate API keys regularly

### 🧪 Testing Checklist:
- [ ] Aviation Stack API key working
- [ ] Flare wallet has testnet FLR
- [ ] FDC test script runs successfully
- [ ] Flight data attestation works
- [ ] Smart contract integration functional

## Troubleshooting

### Common Issues:
```bash
# Issue: "FLARE_PRIVATE_KEY not configured"
# Solution: Add private key to .env file

# Issue: "Aviation Stack API error"
# Solution: Check API key and quota limits

# Issue: "Insufficient funds for gas"
# Solution: Get more testnet FLR from faucet
```

## Next Steps After Setup:
1. Test FDC integration: `node test-fdc.js`
2. Deploy smart contract: `npm run deploy-contract`
3. Test real flight data: Use API endpoints
4. Run full integration test
5. Move to mainnet when ready

Happy coding! 🚀 