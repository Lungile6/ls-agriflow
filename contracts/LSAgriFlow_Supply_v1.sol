// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract LSAgriFlow_Supply_v1 {
    struct Batch {
        string id;
        address farmer;
        string productType;
        uint256 weight;
        string grade;
        string region;
        uint256 harvestDate;
        bytes32 hash;
        BatchStatus status;
        uint256 createdAt;
    }
    
    struct Transaction {
        bytes32 id;
        bytes32 batchId;
        address actor;
        string txType;
        bytes32 prevHash;
        bytes32 hash;
        uint256 timestamp;
        string data; // JSON string for flexibility
    }
    
    enum BatchStatus { PENDING, VERIFIED, REJECTED, LISTED, SOLD }
    
    mapping(bytes32 => Batch) public batches;
    mapping(bytes32 => Transaction) public transactions;
    bytes32[] public transactionChain;
    
    // Role mappings
    mapping(address => bool) public farmers;
    mapping(address => bool) public agents;
    mapping(address => bool) public buyers;
    mapping(address => bool) public ministryOfficers;
    
    address public admin;
    
    event BatchRegistered(bytes32 indexed batchId, address indexed farmer);
    event BatchVerified(bytes32 indexed batchId, address indexed agent, string grade);
    event BatchRejected(bytes32 indexed batchId, address indexed agent, string reason);
    event BatchListed(bytes32 indexed batchId, uint256 price);
    event BatchPurchased(bytes32 indexed batchId, address indexed buyer);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyFarmers() {
        require(farmers[msg.sender], "Only farmers");
        _;
    }
    
    modifier onlyAgents() {
        require(agents[msg.sender], "Only agents");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function registerBatch(
        string memory _id,
        string memory _productType,
        uint256 _weight,
        string memory _grade,
        string memory _region,
        uint256 _harvestDate,
        string memory _description // Now handled to silence warning
    ) external onlyFarmers {
        bytes32 batchId = keccak256(abi.encodePacked(_id, msg.sender));
        
        // Security check: Ensure batch doesn't already exist
        require(batches[batchId].createdAt == 0, "Batch ID already exists");

        bytes32 batchHash = keccak256(abi.encodePacked(
            msg.sender, _productType, _weight, _grade, _region, _harvestDate
        ));
        
        batches[batchId] = Batch({
            id: _id,
            farmer: msg.sender,
            productType: _productType,
            weight: _weight,
            grade: _grade,
            region: _region,
            harvestDate: _harvestDate,
            hash: batchHash,
            status: BatchStatus.PENDING,
            createdAt: block.timestamp
        });
        
        // Pass description into the transaction data to utilize the variable
        _addTransaction(batchId, "REGISTER", _description);
        emit BatchRegistered(batchId, msg.sender);
    }
    
    function verifyBatch(bytes32 _batchId, string memory _grade, string memory _notes) 
        external onlyAgents {
        require(batches[_batchId].status == BatchStatus.PENDING, "Batch not pending");
        
        batches[_batchId].status = BatchStatus.VERIFIED;
        batches[_batchId].grade = _grade;
        
        string memory data = string(abi.encodePacked(_grade, "|", _notes));
        _addTransaction(_batchId, "VERIFY", data);
        emit BatchVerified(_batchId, msg.sender, _grade);
    }
    
    function _addTransaction(bytes32 _batchId, string memory _txType, string memory _data) internal {
        bytes32 prevHash = transactionChain.length > 0 
            ? transactions[transactionChain[transactionChain.length - 1]].hash 
            : bytes32(0);
            
        bytes32 txId = keccak256(abi.encodePacked(_batchId, _txType, block.timestamp));
        bytes32 txHash = keccak256(abi.encodePacked(txId, _batchId, msg.sender, _txType, _data, prevHash, block.timestamp));
        
        transactions[txId] = Transaction({
            id: txId,
            batchId: _batchId,
            actor: msg.sender,
            txType: _txType,
            prevHash: prevHash,
            hash: txHash,
            timestamp: block.timestamp,
            data: _data
        });
        
        transactionChain.push(txId);
    }
    
    // Admin functions for role management
    function addFarmer(address _farmer) external onlyAdmin {
        farmers[_farmer] = true;
    }
    
    function addAgent(address _agent) external onlyAdmin {
        agents[_agent] = true;
    }
    
    function addBuyer(address _buyer) external onlyAdmin {
        buyers[_buyer] = true;
    }
    
    function addMinistryOfficer(address _officer) external onlyAdmin {
        ministryOfficers[_officer] = true;
    }

    /**
     * @dev New function to allow the frontend and tests to fetch 
     * the entire list of transaction IDs at once.
     */
    function getTransactionChain() external view returns (bytes32[] memory) {
        return transactionChain;
    }
}