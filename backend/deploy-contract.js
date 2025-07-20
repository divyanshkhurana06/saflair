// FlightPulseFDC Smart Contract Deployment Script
// Deploys FlightPulseFDC contract to Flare Coston2 testnet with FDC integration

const { Web3 } = require('web3');
const solc = require('solc');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ContractDeployer {
  constructor() {
    // Initialize Web3 with Coston2 testnet
    this.web3 = new Web3(process.env.FLARE_RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc');
    
    // Contract addresses for Coston2 testnet
    this.contractAddresses = {
      fdcVerification: process.env.FDC_VERIFICATION_ADDRESS || '0x3A1b13b8e62E632Cbc6fA3c2C6Ac6E6f86F7D4aF',
      flrToken: '0x0000000000000000000000000000000000000000', // Use zero address for native C2FLR
      oracle: null // Will be set to deployer address
    };
    
    console.log('🚀 FlightPulseFDC Contract Deployment');
    console.log('📍 Network: Flare Coston2 Testnet');
    console.log('🔗 RPC:', this.web3.currentProvider.host);
  }

  // Compile the Solidity contract
  async compileContract() {
    console.log('\n📝 Compiling FlightPulseFDC.sol...');
    
    try {
      // Read contract source
      const contractPath = path.join(__dirname, 'contracts', 'FlightPulseFDC.sol');
      const contractSource = fs.readFileSync(contractPath, 'utf8');
      
      // Solidity compiler input
      const input = {
        language: 'Solidity',
        sources: {
          'FlightPulseFDC.sol': {
            content: contractSource
          }
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode']
            }
          },
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      };
      
      // Compile contract
      const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
      
      // Check for compilation errors
      if (compiled.errors) {
        const errors = compiled.errors.filter(error => error.severity === 'error');
        if (errors.length > 0) {
          console.error('❌ Compilation errors:');
          errors.forEach(error => console.error(error.formattedMessage));
          throw new Error('Contract compilation failed');
        }
        
        // Show warnings
        const warnings = compiled.errors.filter(error => error.severity === 'warning');
        if (warnings.length > 0) {
          console.warn('⚠️ Compilation warnings:');
          warnings.forEach(warning => console.warn(warning.formattedMessage));
        }
      }
      
      const contract = compiled.contracts['FlightPulseFDC.sol']['FlightPulseFDC'];
      
      console.log('✅ Contract compiled successfully');
      console.log(`📊 Bytecode size: ${contract.evm.bytecode.object.length / 2} bytes`);
      
      return {
        abi: contract.abi,
        bytecode: '0x' + contract.evm.bytecode.object
      };
      
    } catch (error) {
      console.error('❌ Compilation failed:', error.message);
      throw error;
    }
  }

  // Deploy the contract to Coston2
  async deployContract() {
    try {
      // Check environment setup
      if (!process.env.FLARE_PRIVATE_KEY) {
        throw new Error('FLARE_PRIVATE_KEY not configured in .env file');
      }
      
      // Setup account
      const account = this.web3.eth.accounts.privateKeyToAccount(process.env.FLARE_PRIVATE_KEY);
      this.web3.eth.accounts.wallet.add(account);
      this.contractAddresses.oracle = account.address;
      
      console.log('\n🔑 Deployment Account:', account.address);
      
      // Check balance
      const balance = await this.web3.eth.getBalance(account.address);
      const balanceInFLR = this.web3.utils.fromWei(balance, 'ether');
      console.log(`💰 Account Balance: ${balanceInFLR} C2FLR`);
      
      if (parseFloat(balanceInFLR) < 0.1) {
        console.warn('⚠️ Low balance! Get more C2FLR from: https://coston2-faucet.towolabs.com/');
      }
      
      // Compile contract
      const { abi, bytecode } = await this.compileContract();
      
      // Create contract instance
      const contract = new this.web3.eth.Contract(abi);
      
      console.log('\n🚀 Deploying FlightPulseFDC contract...');
      console.log('📋 Constructor parameters:');
      console.log(`   FDC Verification: ${this.contractAddresses.fdcVerification}`);
      console.log(`   FLR Token: ${this.contractAddresses.flrToken}`);
      console.log(`   Oracle Address: ${this.contractAddresses.oracle}`);
      
      // Estimate gas
      const gasEstimate = await contract.deploy({
        data: bytecode,
        arguments: [
          this.contractAddresses.fdcVerification,
          this.contractAddresses.flrToken,
          this.contractAddresses.oracle
        ]
      }).estimateGas({ from: account.address });
      
      console.log(`⛽ Estimated Gas: ${gasEstimate.toLocaleString()}`);
      
      // Deploy contract
      const deployedContract = await contract.deploy({
        data: bytecode,
        arguments: [
          this.contractAddresses.fdcVerification,
          this.contractAddresses.flrToken,
          this.contractAddresses.oracle
        ]
      }).send({
        from: account.address,
        gas: Math.floor(Number(gasEstimate) * 1.2), // 20% buffer
        gasPrice: await this.web3.eth.getGasPrice()
      });
      
      console.log('\n🎉 Contract deployed successfully!');
      console.log(`📍 Contract Address: ${deployedContract.options.address}`);
      console.log(`🔗 Transaction Hash: ${deployedContract.transactionHash}`);
      console.log(`🌐 Explorer: https://coston2-explorer.flare.network/address/${deployedContract.options.address}`);
      
      // Save deployment info
      const deploymentInfo = {
        contractAddress: deployedContract.options.address,
        transactionHash: deployedContract.transactionHash,
        deployedBy: account.address,
        network: 'Coston2',
        timestamp: new Date().toISOString(),
        constructorArgs: {
          fdcVerification: this.contractAddresses.fdcVerification,
          flrToken: this.contractAddresses.flrToken,
          oracle: this.contractAddresses.oracle
        },
        abi: abi
      };
      
      // Save to file
      fs.writeFileSync(
        path.join(__dirname, 'deployment-info.json'),
        JSON.stringify(deploymentInfo, null, 2)
      );
      
      console.log('💾 Deployment info saved to deployment-info.json');
      
      // Update .env with contract address
      this.updateEnvFile(deployedContract.options.address);
      
      return deploymentInfo;
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  // Update .env file with deployed contract address
  updateEnvFile(contractAddress) {
    try {
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update or add contract address
      const contractAddressLine = `FLIGHTPULSE_CONTRACT_ADDRESS=${contractAddress}`;
      
      if (envContent.includes('FLIGHTPULSE_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /FLIGHTPULSE_CONTRACT_ADDRESS=.*/,
          contractAddressLine
        );
      } else {
        envContent += `\n${contractAddressLine}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env with contract address');
      
    } catch (error) {
      console.warn('⚠️ Could not update .env file:', error.message);
    }
  }

  // Verify deployment
  async verifyDeployment(contractAddress) {
    try {
      console.log('\n🔍 Verifying deployment...');
      
      // Check if contract exists
      const code = await this.web3.eth.getCode(contractAddress);
      if (code === '0x') {
        throw new Error('No contract code found at address');
      }
      
      console.log('✅ Contract code verified on blockchain');
      console.log(`📊 Contract size: ${(code.length - 2) / 2} bytes`);
      
      // Test contract interaction
      const deploymentInfo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'deployment-info.json'), 'utf8')
      );
      
      const contract = new this.web3.eth.Contract(deploymentInfo.abi, contractAddress);
      
      // Check contract stats
      const stats = await contract.methods.getContractStats().call();
      console.log('📈 Contract Stats:');
      console.log(`   Total Policies: ${stats._totalPolicies}`);
      console.log(`   Total Payouts: ${stats._totalPayouts}`);
      console.log(`   Total Premiums: ${stats._totalPremiums}`);
      console.log(`   Contract Balance: ${this.web3.utils.fromWei(stats._balance, 'ether')} FLR`);
      
      console.log('✅ Deployment verification complete!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
  }
}

// Main deployment function
async function deployFlightPulseFDC() {
  const deployer = new ContractDeployer();
  
  try {
    const deploymentInfo = await deployer.deployContract();
    await deployer.verifyDeployment(deploymentInfo.contractAddress);
    
    console.log('\n🏁 Deployment Summary:');
    console.log('================================');
    console.log(`Contract: FlightPulseFDC`);
    console.log(`Address: ${deploymentInfo.contractAddress}`);
    console.log(`Network: Flare Coston2 Testnet`);
    console.log(`Explorer: https://coston2-explorer.flare.network/address/${deploymentInfo.contractAddress}`);
    console.log('✅ Ready for FDC-based flight insurance!');
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  deployFlightPulseFDC().catch(console.error);
}

module.exports = { ContractDeployer, deployFlightPulseFDC }; 