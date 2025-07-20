# 🛫 Saflair - Next-Gen Flight Insurance & Crypto Sentiment Platform

**Saflair** combines **real-time crypto sentiment voting** with **oracle-verified flight insurance** to create a gamified DeFi platform that rewards users for accurate market predictions while providing automated flight delay protection.

---

## 🚀 **Key Features**

### 💰 **Dual Revenue Streams**
- **Daily Sentiment Voting**: Earn FLR tokens for accurate crypto market predictions
- **Flight Insurance**: Get automatic payouts for delayed flights verified by blockchain oracles

### 🔗 **Blockchain Integration**
- **Flare Data Connector (FDC)**: Oracle-verified flight data on-chain
- **Smart Contract Payouts**: Automatic insurance payouts for delays ≥2 hours
- **Real-time Updates**: WebSocket connections for live sentiment & flight tracking

### 🎮 **Gamification**
- **Daily Streaks**: Consecutive voting bonuses
- **Leaderboards**: Compete for accuracy and earnings
- **Achievement System**: Unlock rewards for platform engagement

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for modern UI design
- **Real-time WebSocket** updates
- **Professional airport dropdown** with search

### **Backend**
- **Node.js** + **Express** server
- **SQLite** database with real-time updates
- **JWT Authentication** & bcrypt security
- **Cron jobs** for automated oracle updates

### **Blockchain**
- **Flare Network** (Coston2 testnet)
- **FDC Integration** for oracle verification
- **Smart Contracts** in Solidity
- **Web3.js** for blockchain interactions

### **Flight Data APIs**
- **FlightAware API** (Premium - Real-time data)
- **Aviation Stack API** (Free tier available)
- **Smart fallback system** ensures 99.9% uptime

---

## 📦 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Git
- API Keys (see setup guide below)

### **1. Clone & Install**
```bash
git clone https://github.com/divyanshkhurana06/saflair.git
cd saflair

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### **2. Environment Setup**
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit with your API keys
nano backend/.env
```

### **3. Get FREE API Keys**

#### **Aviation Stack API (FREE)**
1. Visit: https://aviationstack.com/
2. Sign up → Get API key
3. Add to `.env`: `AVIATIONSTACK_API_KEY=your_key_here`

#### **Flare Wallet (Testnet)**
1. Create MetaMask wallet
2. Add Flare Coston2 network
3. Get testnet FLR: https://coston2-faucet.towolabs.com/
4. Add private key to `.env`

### **4. Start the Application**
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend  
cd ..
npm run dev
```

### **5. Access the App**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🎯 **How Saflair Works**

### **Daily Sentiment Voting**
1. **Vote daily** on crypto market direction (Bullish/Bearish/Neutral)
2. **Earn 2.5 FLR** per vote + streak bonuses
3. **Compete** on accuracy leaderboards
4. **30% of insurance premiums** added to reward pool

### **Flight Insurance**
1. **Search real flights** using airport dropdown
2. **Validate via FlightAware/Aviation Stack** APIs
3. **Purchase coverage** with FLR tokens
4. **Automatic payouts** for delays ≥120 minutes
5. **Oracle verification** via Flare Data Connector

---

## 🔧 **Configuration**

### **Environment Variables**
```env
# Server
PORT=3001
JWT_SECRET=your_jwt_secret

# Flight APIs
FLIGHTAWARE_API_KEY=your_flightaware_key
AVIATIONSTACK_API_KEY=your_aviationstack_key

# Blockchain
FLARE_PRIVATE_KEY=your_wallet_private_key
FLARE_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
```

### **Network Configuration**
- **Flare Coston2 Testnet**
- **Chain ID**: 114
- **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
- **Currency**: C2FLR

---

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Sentiment Voting**
- `GET /api/sentiment/current` - Current voting stats
- `POST /api/sentiment/vote` - Submit daily vote

### **Flight Insurance**
- `POST /api/flights/validate` - Validate flight with real APIs
- `POST /api/insurance/purchase` - Purchase insurance policy
- `GET /api/insurance/policies` - Get user policies

### **Oracle Integration**
- `POST /api/oracle/request-attestation` - FDC attestation request
- `POST /api/oracle/get-flight-data` - Oracle-verified flight data

---

## 🚀 **Smart Contract Deployment**

```bash
# Deploy to Flare Coston2
cd backend
node deploy-contract.js

# Test FDC integration
node test-fdc.js
```

---

## 🏗️ **Project Structure**

```
saflair/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/          # API services
│   └── types/             # TypeScript definitions
├── backend/               # Node.js backend
│   ├── contracts/         # Smart contracts
│   ├── services/          # Oracle services
│   └── scripts/           # Database & deployment
├── public/                # Static assets
└── docs/                  # Documentation
```

---

## 🔐 **Security Features**

- **JWT Authentication** with secure token storage
- **bcrypt Password Hashing** (12 rounds)
- **API Rate Limiting** (15 requests/15 minutes)
- **Input Validation** & SQL injection protection
- **Environment Variables** for sensitive data
- **CORS & Helmet** security headers

---

## 🌟 **Roadmap**

### **Phase 1: Current**
- ✅ Real flight data integration
- ✅ FDC oracle verification
- ✅ Sentiment voting rewards
- ✅ Professional UI/UX

### **Phase 2: Coming Soon**
- 🔄 Mainnet deployment
- 🔄 Mobile app (React Native)
- 🔄 Advanced trading signals
- 🔄 Insurance pool staking

### **Phase 3: Future**
- 🔮 Multi-chain support
- 🔮 AI-powered predictions
- 🔮 Institutional partnerships
- 🔮 Global flight coverage

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 **Links**

- **GitHub**: https://github.com/divyanshkhurana06/saflair
- **Live Demo**: Coming Soon
- **Documentation**: https://github.com/divyanshkhurana06/saflair/wiki
- **Issues**: https://github.com/divyanshkhurana06/saflair/issues

---

## 💬 **Support**

Need help? 
- 📧 Email: support@saflair.com
- 💬 Discord: Coming Soon
- 🐛 Issues: GitHub Issues
- 📖 Docs: Project Wiki

---

**Built with ❤️ by the Saflair Team** 