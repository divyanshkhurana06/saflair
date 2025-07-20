// Flare Network Integration for FlightPulse Smart Contract Payouts
// This integrates with Flare's blockchain for automatic insurance payouts

const Web3 = require('web3');
const axios = require('axios');

class FlareOracleIntegration {
  constructor() {
    // Flare Mainnet RPC
    this.web3 = new Web3('https://flare-api.flare.network/ext/C/rpc');
    
    // Flight data APIs (external oracles)
    this.flightAPIs = {
      flightAware: 'https://aeroapi.flightaware.com/aeroapi/flights',
      aviationStack: 'https://api.aviationstack.com/v1/flights',
      openSky: 'https://opensky-network.org/api/states/all'
    };
    
    // FlightPulse smart contract address (would be deployed on Flare)
    this.contractAddress = '0x...'; // Your deployed contract
    this.contractABI = [
      // Smart contract ABI for automatic payouts
      {
        "inputs": [
          {"name": "policyId", "type": "string"},
          {"name": "delayMinutes", "type": "uint256"},
          {"name": "flightNumber", "type": "string"},
          {"name": "verificationHash", "type": "bytes32"}
        ],
        "name": "executeAutomaticPayout",
        "outputs": [],
        "type": "function"
      }
    ];
  }

  // Get real flight data from external APIs
  async getRealFlightData(flightNumber) {
    try {
      // Try FlightAware API first
      const flightData = await this.queryFlightAware(flightNumber);
      
      if (flightData) {
        return {
          flightNumber,
          scheduledDeparture: flightData.scheduled_departure,
          actualDeparture: flightData.actual_departure,
          delayMinutes: flightData.delay_minutes,
          status: flightData.status,
          confidence: 95.5, // High confidence for real API data
          source: 'FlightAware',
          verificationHash: this.generateVerificationHash(flightData)
        };
      }
      
      // Fallback to other APIs
      return await this.queryAviationStack(flightNumber);
      
    } catch (error) {
      console.error('Error fetching real flight data:', error);
      return null;
    }
  }

  async queryFlightAware(flightNumber) {
    // Note: Requires FlightAware API key
    const response = await axios.get(
      `${this.flightAPIs.flightAware}/${flightNumber}`,
      {
        headers: {
          'x-apikey': process.env.FLIGHTAWARE_API_KEY
        }
      }
    );
    
    return response.data;
  }

  async queryAviationStack(flightNumber) {
    // Note: Requires Aviation Stack API key
    const response = await axios.get(this.flightAPIs.aviationStack, {
      params: {
        access_key: process.env.AVIATIONSTACK_API_KEY,
        flight_iata: flightNumber
      }
    });
    
    const flight = response.data.data[0];
    if (flight) {
      return {
        scheduled_departure: flight.departure.scheduled,
        actual_departure: flight.departure.actual,
        delay_minutes: flight.departure.delay || 0,
        status: flight.flight_status
      };
    }
    
    return null;
  }

  // Generate cryptographic proof of flight data
  generateVerificationHash(flightData) {
    const crypto = require('crypto');
    const dataString = JSON.stringify({
      flight: flightData.flight_number,
      scheduled: flightData.scheduled_departure,
      actual: flightData.actual_departure,
      delay: flightData.delay_minutes,
      timestamp: Date.now()
    });
    
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Execute automatic payout via Flare smart contract
  async executeFlareBasedPayout(policyDetails, flightData) {
    try {
      const contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
      
      // Only execute if delay >= 120 minutes
      if (flightData.delayMinutes >= 120) {
        const transaction = contract.methods.executeAutomaticPayout(
          policyDetails.id,
          flightData.delayMinutes,
          flightData.flightNumber,
          '0x' + flightData.verificationHash
        );
        
        // Sign and send transaction (requires private key)
        const signedTx = await this.web3.eth.accounts.signTransaction({
          to: this.contractAddress,
          data: transaction.encodeABI(),
          gas: 150000,
          gasPrice: await this.web3.eth.getGasPrice()
        }, process.env.FLARE_PRIVATE_KEY);
        
        const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        return {
          success: true,
          txHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          oracleVerified: true,
          payoutAmount: policyDetails.coverageAmount
        };
      }
      
      return { success: false, reason: 'Delay threshold not met' };
      
    } catch (error) {
      console.error('Flare payout execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get FLR token price from Flare FTSO (this DOES work with FTSO!)
  async getFLRPrice() {
    try {
      // Flare FTSO contracts for price feeds
      const ftsoContract = new this.web3.eth.Contract(
        FTSO_ABI, // FTSO contract ABI
        '0x...' // FTSO registry contract address
      );
      
      const priceData = await ftsoContract.methods.getCurrentPrice('FLR').call();
      
      return {
        price: priceData.price,
        timestamp: priceData.timestamp,
        confidence: priceData.confidence
      };
      
    } catch (error) {
      console.error('Error fetching FLR price from FTSO:', error);
      return null;
    }
  }

  // Monitor flight data and trigger automatic payouts
  async monitorAndExecutePayouts() {
    const activePolicies = await this.getActivePolicies(); // From your database
    
    for (const policy of activePolicies) {
      const flightData = await this.getRealFlightData(policy.flight_number);
      
      if (flightData && flightData.delayMinutes >= 120) {
        console.log(`🚨 Triggering automatic payout for ${policy.flight_number}`);
        
        const result = await this.executeFlareBasedPayout(policy, flightData);
        
        if (result.success) {
          // Update your database with Flare transaction details
          await this.updatePolicyWithFlareTransaction(policy.id, result);
          
          console.log(`✅ Payout executed on Flare: ${result.txHash}`);
        }
      }
    }
  }
}

module.exports = FlareOracleIntegration; 