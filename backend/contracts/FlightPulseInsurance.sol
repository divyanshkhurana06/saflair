// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Saflair Insurance Smart Contract for Flare Network
// Handles automatic payouts for flight delays verified by external oracles

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SaflairInsurance {
    // FLR token contract (native to Flare)
    IERC20 public immutable flrToken;
    
    address public owner;
    address public oracleAddress;
    
    uint256 public constant MINIMUM_DELAY_MINUTES = 120;
    uint256 public totalPolicies = 0;
    uint256 public totalPayouts = 0;
    
    struct Policy {
        string policyId;
        address holder;
        string flightNumber;
        uint256 coverageAmount;
        uint256 premiumPaid;
        bool isPaid;
        bool isActive;
        uint256 createdAt;
    }
    
    struct PayoutProof {
        string flightNumber;
        uint256 delayMinutes;
        bytes32 verificationHash;
        uint256 timestamp;
        bool isVerified;
    }
    
    mapping(string => Policy) public policies;
    mapping(string => PayoutProof) public payoutProofs;
    mapping(address => string[]) public userPolicies;
    
    event PolicyCreated(string indexed policyId, address indexed holder, string flightNumber, uint256 coverage);
    event AutomaticPayout(string indexed policyId, string flightNumber, uint256 amount, bytes32 verificationHash);
    event OracleUpdated(address indexed newOracle);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this");
        _;
    }
    
    constructor(address _flrToken, address _oracleAddress) {
        flrToken = IERC20(_flrToken);
        owner = msg.sender;
        oracleAddress = _oracleAddress;
    }
    
    // Create insurance policy (called by backend)
    function createPolicy(
        string memory _policyId,
        address _holder,
        string memory _flightNumber,
        uint256 _coverageAmount,
        uint256 _premiumPaid
    ) external onlyOracle {
        require(bytes(policies[_policyId].policyId).length == 0, "Policy already exists");
        require(_coverageAmount > 0, "Coverage must be greater than 0");
        require(_premiumPaid > 0, "Premium must be greater than 0");
        
        policies[_policyId] = Policy({
            policyId: _policyId,
            holder: _holder,
            flightNumber: _flightNumber,
            coverageAmount: _coverageAmount,
            premiumPaid: _premiumPaid,
            isPaid: false,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userPolicies[_holder].push(_policyId);
        totalPolicies++;
        
        emit PolicyCreated(_policyId, _holder, _flightNumber, _coverageAmount);
    }
    
    // Execute automatic payout for delayed flights
    function executeAutomaticPayout(
        string memory _policyId,
        uint256 _delayMinutes,
        string memory _flightNumber,
        bytes32 _verificationHash
    ) external onlyOracle {
        Policy storage policy = policies[_policyId];
        
        require(bytes(policy.policyId).length > 0, "Policy does not exist");
        require(policy.isActive, "Policy is not active");
        require(!policy.isPaid, "Policy already paid out");
        require(_delayMinutes >= MINIMUM_DELAY_MINUTES, "Delay threshold not met");
        require(
            keccak256(abi.encodePacked(policy.flightNumber)) == keccak256(abi.encodePacked(_flightNumber)),
            "Flight number mismatch"
        );
        
        // Record the payout proof
        payoutProofs[_policyId] = PayoutProof({
            flightNumber: _flightNumber,
            delayMinutes: _delayMinutes,
            verificationHash: _verificationHash,
            timestamp: block.timestamp,
            isVerified: true
        });
        
        // Execute payout
        policy.isPaid = true;
        policy.isActive = false;
        totalPayouts += policy.coverageAmount;
        
        // Transfer FLR tokens to policy holder
        require(
            flrToken.transfer(policy.holder, policy.coverageAmount),
            "Payout transfer failed"
        );
        
        emit AutomaticPayout(_policyId, _flightNumber, policy.coverageAmount, _verificationHash);
    }
    
    // Get policy details
    function getPolicy(string memory _policyId) external view returns (Policy memory) {
        return policies[_policyId];
    }
    
    // Get user's policies
    function getUserPolicies(address _user) external view returns (string[] memory) {
        return userPolicies[_user];
    }
    
    // Get payout proof
    function getPayoutProof(string memory _policyId) external view returns (PayoutProof memory) {
        return payoutProofs[_policyId];
    }
    
    // Admin functions
    function updateOracleAddress(address _newOracle) external onlyOwner {
        oracleAddress = _newOracle;
        emit OracleUpdated(_newOracle);
    }
    
    // Deposit FLR tokens for payouts
    function depositFunds(uint256 _amount) external {
        require(
            flrToken.transferFrom(msg.sender, address(this), _amount),
            "Deposit failed"
        );
    }
    
    // Emergency withdrawal (only owner)
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(
            flrToken.transfer(owner, _amount),
            "Emergency withdrawal failed"
        );
    }
    
    // Get contract balance
    function getBalance() external view returns (uint256) {
        return flrToken.balanceOf(address(this));
    }
    
    // Get contract statistics
    function getStats() external view returns (uint256, uint256, uint256) {
        return (totalPolicies, totalPayouts, flrToken.balanceOf(address(this)));
    }
} 