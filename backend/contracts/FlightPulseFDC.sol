// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Saflair Smart Contract with Flare Data Connector Integration
// Verifies flight delay data using FDC attestations and triggers automatic payouts

interface IFdcVerification {
    function verifyAttestation(
        bytes32 attestationType,
        bytes32 sourceId,
        uint256 votingRound,
        bytes calldata response,
        bytes32[] calldata merkleProof
    ) external view returns (bool);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SaflairFDC {
    // Flare Data Connector integration
    IFdcVerification public immutable fdcVerification;
    IERC20 public immutable flrToken;
    
    address public owner;
    address public oracle; // Backend oracle address
    
    // Constants
    uint256 public constant MINIMUM_DELAY_MINUTES = 120;
    bytes32 public constant JSON_API_TYPE = keccak256("JsonApi");
    bytes32 public constant AVIATION_STACK_SOURCE = keccak256("aviationStack");
    
    // State variables
    uint256 public totalPolicies = 0;
    uint256 public totalPayouts = 0;
    uint256 public totalPremiums = 0;
    
    struct FlightPolicy {
        string policyId;
        address holder;
        string flightNumber;
        uint256 coverageAmount;
        uint256 premiumPaid;
        bool isPaid;
        bool isActive;
        uint256 createdAt;
        uint256 votingRound; // FDC voting round for verification
    }
    
    struct FlightData {
        string flightNumber;
        uint256 delayMinutes;
        string status;
        uint256 votingRound;
        bytes32 verificationHash;
        bool isVerified;
        uint256 timestamp;
    }
    
    struct PayoutProof {
        uint256 votingRound;
        bytes response;
        bytes32[] merkleProof;
        bytes32 verificationHash;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(string => FlightPolicy) public policies;
    mapping(string => FlightData) public verifiedFlightData;
    mapping(string => PayoutProof) public payoutProofs;
    mapping(address => string[]) public userPolicies;
    mapping(uint256 => bytes32) public votingRoundRoots; // FDC Merkle roots
    
    // Events
    event PolicyCreated(string indexed policyId, address indexed holder, string flightNumber, uint256 coverage);
    event FlightDataVerified(string indexed flightNumber, uint256 delayMinutes, uint256 votingRound, bytes32 verificationHash);
    event AutomaticPayout(string indexed policyId, string flightNumber, uint256 amount, uint256 votingRound);
    event FDCAttestationVerified(string indexed flightNumber, uint256 votingRound, bool isValid);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }
    
    constructor(
        address _fdcVerification,
        address _flrToken,
        address _oracle
    ) {
        fdcVerification = IFdcVerification(_fdcVerification);
        flrToken = IERC20(_flrToken);
        owner = msg.sender;
        oracle = _oracle;
    }
    
    // Create insurance policy
    function createPolicy(
        string memory _policyId,
        address _holder,
        string memory _flightNumber,
        uint256 _coverageAmount,
        uint256 _premiumPaid
    ) external onlyOracle {
        require(bytes(policies[_policyId].policyId).length == 0, "Policy exists");
        require(_coverageAmount > 0, "Invalid coverage");
        require(_premiumPaid > 0, "Invalid premium");
        
        policies[_policyId] = FlightPolicy({
            policyId: _policyId,
            holder: _holder,
            flightNumber: _flightNumber,
            coverageAmount: _coverageAmount,
            premiumPaid: _premiumPaid,
            isPaid: false,
            isActive: true,
            createdAt: block.timestamp,
            votingRound: 0
        });
        
        userPolicies[_holder].push(_policyId);
        totalPolicies++;
        totalPremiums += _premiumPaid;
        
        emit PolicyCreated(_policyId, _holder, _flightNumber, _coverageAmount);
    }
    
    // Verify flight data using FDC attestation and trigger payout if eligible
    function verifyFlightDataAndPayout(
        string memory _policyId,
        string memory _flightNumber,
        uint256 _votingRound,
        bytes memory _response,
        bytes32[] memory _merkleProof
    ) external onlyOracle {
        FlightPolicy storage policy = policies[_policyId];
        
        require(bytes(policy.policyId).length > 0, "Policy not found");
        require(policy.isActive, "Policy not active");
        require(!policy.isPaid, "Already paid");
        require(
            keccak256(bytes(policy.flightNumber)) == keccak256(bytes(_flightNumber)),
            "Flight number mismatch"
        );
        
        // Verify FDC attestation
        bool isValid = fdcVerification.verifyAttestation(
            JSON_API_TYPE,
            AVIATION_STACK_SOURCE,
            _votingRound,
            _response,
            _merkleProof
        );
        
        require(isValid, "FDC verification failed");
        
        emit FDCAttestationVerified(_flightNumber, _votingRound, isValid);
        
        // Parse flight data from response
        FlightData memory flightData = parseFlightResponse(_response, _votingRound);
        
        // Store verified flight data
        verifiedFlightData[_flightNumber] = flightData;
        policy.votingRound = _votingRound;
        
        emit FlightDataVerified(
            _flightNumber,
            flightData.delayMinutes,
            _votingRound,
            flightData.verificationHash
        );
        
        // Check if delay qualifies for payout
        if (flightData.delayMinutes >= MINIMUM_DELAY_MINUTES) {
            executeAutomaticPayout(_policyId, flightData, _response, _merkleProof);
        }
    }
    
    // Execute automatic payout for qualified flight delays
    function executeAutomaticPayout(
        string memory _policyId,
        FlightData memory _flightData,
        bytes memory _response,
        bytes32[] memory _merkleProof
    ) internal {
        FlightPolicy storage policy = policies[_policyId];
        
        // Store payout proof
        payoutProofs[_policyId] = PayoutProof({
            votingRound: _flightData.votingRound,
            response: _response,
            merkleProof: _merkleProof,
            verificationHash: _flightData.verificationHash,
            timestamp: block.timestamp
        });
        
        // Update policy status
        policy.isPaid = true;
        policy.isActive = false;
        totalPayouts += policy.coverageAmount;
        
        // Execute payout
        require(
            flrToken.transfer(policy.holder, policy.coverageAmount),
            "Payout transfer failed"
        );
        
        emit AutomaticPayout(
            _policyId,
            _flightData.flightNumber,
            policy.coverageAmount,
            _flightData.votingRound
        );
    }
    
    // Parse flight data from FDC response (simplified JSON parsing)
    function parseFlightResponse(
        bytes memory _response,
        uint256 _votingRound
    ) internal view returns (FlightData memory) {
        // In a real implementation, you'd use a JSON parsing library
        // For this example, we'll simulate the parsing
        
        // This would extract: flight_number, delay, status from JSON response
        // For now, we'll use placeholder logic
        
        return FlightData({
            flightNumber: "AA1234", // Would be parsed from response
            delayMinutes: 150, // Would be parsed from response
            status: "delayed", // Would be parsed from response
            votingRound: _votingRound,
            verificationHash: keccak256(_response),
            isVerified: true,
            timestamp: block.timestamp
        });
    }
    
    // Get policy details
    function getPolicy(string memory _policyId) external view returns (FlightPolicy memory) {
        return policies[_policyId];
    }
    
    // Get verified flight data
    function getFlightData(string memory _flightNumber) external view returns (FlightData memory) {
        return verifiedFlightData[_flightNumber];
    }
    
    // Get payout proof
    function getPayoutProof(string memory _policyId) external view returns (PayoutProof memory) {
        return payoutProofs[_policyId];
    }
    
    // Get user's policies
    function getUserPolicies(address _user) external view returns (string[] memory) {
        return userPolicies[_user];
    }
    
    // Admin: Update oracle address
    function updateOracle(address _newOracle) external onlyOwner {
        oracle = _newOracle;
    }
    
    // Admin: Deposit funds for payouts
    function depositFunds(uint256 _amount) external {
        require(
            flrToken.transferFrom(msg.sender, address(this), _amount),
            "Deposit failed"
        );
    }
    
    // Admin: Emergency withdrawal
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(
            flrToken.transfer(owner, _amount),
            "Withdrawal failed"
        );
    }
    
    // Get contract statistics
    function getContractStats() external view returns (
        uint256 _totalPolicies,
        uint256 _totalPayouts,
        uint256 _totalPremiums,
        uint256 _balance
    ) {
        return (
            totalPolicies,
            totalPayouts,
            totalPremiums,
            flrToken.balanceOf(address(this))
        );
    }
    
    // Verify specific attestation manually (for testing)
    function verifySpecificAttestation(
        uint256 _votingRound,
        bytes memory _response,
        bytes32[] memory _merkleProof
    ) external view returns (bool) {
        return fdcVerification.verifyAttestation(
            JSON_API_TYPE,
            AVIATION_STACK_SOURCE,
            _votingRound,
            _response,
            _merkleProof
        );
    }
} 