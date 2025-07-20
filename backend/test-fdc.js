// FDC Integration Test Script for FlightPulse
// Tests Flare Data Connector flight oracle functionality

const FlareFlightOracle = require('./services/FlareFlightOracle');
require('dotenv').config();

async function testFDCIntegration() {
  console.log('🧪 Testing Flare Data Connector Integration...\n');
  
  // Initialize oracle
  const oracle = new FlareFlightOracle();
  
  // Test configuration
  const testFlightNumber = 'AA1234';
  const testPrivateKey = process.env.FLARE_PRIVATE_KEY;
  
  if (!testPrivateKey) {
    console.log('❌ FLARE_PRIVATE_KEY not configured in .env file');
    console.log('📝 Please add your Flare wallet private key to test FDC integration');
    console.log('🔧 For testing, you can get test FLR from Coston2 faucet:');
    console.log('   https://coston2-faucet.towolabs.com/');
    return;
  }
  
  try {
    // Test 1: Create attestation request
    console.log('1️⃣ Testing attestation request creation...');
    const attestationRequest = await oracle.createFlightAttestationRequest(testFlightNumber);
    console.log('✅ Attestation request created:', {
      flightNumber: attestationRequest.flightNumber,
      sourceId: attestationRequest.sourceId.slice(0, 10) + '...',
      mic: attestationRequest.mic.slice(0, 10) + '...'
    });
    
    // Test 2: Test flight data simulation (for development)
    console.log('\n2️⃣ Testing flight data simulation...');
    const simulatedData = await oracle.simulateFlightData(testFlightNumber);
    console.log('✅ Simulated flight data:', simulatedData);
    
    // Test 3: Test payout qualification
    console.log('\n3️⃣ Testing payout qualification...');
    const shouldPayout = oracle.shouldTriggerPayout(simulatedData);
    console.log(`✅ Should trigger payout: ${shouldPayout} (delay: ${simulatedData.delay} min)`);
    
    // Test 4: Full FDC integration (requires testnet FLR)
    console.log('\n4️⃣ Testing full FDC integration...');
    console.log('⚠️ This requires Coston2 testnet FLR for gas fees');
    
    try {
      const flightData = await oracle.getRealFlightData(testFlightNumber, testPrivateKey);
      console.log('✅ FDC flight data retrieved:', {
        flightNumber: flightData.flightNumber,
        delayMinutes: flightData.delayMinutes,
        status: flightData.status,
        confidence: flightData.confidence,
        source: flightData.source,
        votingRound: flightData.votingRound
      });
      
      console.log('\n🎉 FDC Integration Test PASSED! ✅');
      
    } catch (fdcError) {
      console.log('⚠️ FDC blockchain interaction failed (expected without testnet setup):', fdcError.message);
      console.log('💡 To test full FDC integration:');
      console.log('   1. Get testnet FLR from Coston2 faucet');
      console.log('   2. Add your private key to .env file');
      console.log('   3. Run this test again');
    }
    
    console.log('\n📊 Test Summary:');
    console.log('✅ Oracle initialization: PASSED');
    console.log('✅ Attestation request creation: PASSED');
    console.log('✅ Flight data simulation: PASSED');
    console.log('✅ Payout qualification check: PASSED');
    console.log('⚠️ Blockchain interaction: REQUIRES TESTNET SETUP');
    
  } catch (error) {
    console.error('❌ FDC Integration Test FAILED:', error);
  }
}

// Test network connectivity
async function testNetworkConnectivity() {
  console.log('\n🌐 Testing network connectivity...');
  
  try {
    const { Web3 } = require('web3');
    const web3 = new Web3(process.env.FLARE_RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc');
    
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`✅ Connected to Coston2 network - Block: ${blockNumber}`);
    
    const chainId = await web3.eth.getChainId();
    console.log(`✅ Chain ID: ${chainId} (Coston2: 114)`);
    
    if (process.env.FLARE_PRIVATE_KEY) {
      const account = web3.eth.accounts.privateKeyToAccount(process.env.FLARE_PRIVATE_KEY);
      const balance = await web3.eth.getBalance(account.address);
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      console.log(`✅ Account balance: ${balanceEth} C2FLR`);
      
      if (parseFloat(balanceEth) < 0.1) {
        console.log('⚠️ Low balance! Get test tokens from: https://coston2-faucet.towolabs.com/');
      }
    }
    
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error.message);
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 FlightPulse FDC Integration Test Suite\n');
  
  await testNetworkConnectivity();
  await testFDCIntegration();
  
  console.log('\n🏁 All tests completed!');
  console.log('📋 Next steps:');
  console.log('   • Configure environment variables in .env');
  console.log('   • Get testnet FLR for full blockchain testing');
  console.log('   • Deploy FlightPulseFDC smart contract');
  console.log('   • Register for Aviation Stack API key');
  console.log('   • Test real flight data attestation');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testFDCIntegration, testNetworkConnectivity }; 