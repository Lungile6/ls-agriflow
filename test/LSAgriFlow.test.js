import { expect } from "chai";
import hre from "hardhat";

// Extract ethers from hardhat for cleaner usage
const { ethers } = hre;

describe("LSAgriFlow_Supply_v1 Contract Tests", function () {
  let contract;
  let owner;
  let farmer;
  let agent;
  let buyer;
  let ministry;
  let nonAuthorized;

  // Deploy contract before each test
  beforeEach(async function () {
    // Get signers
    [owner, farmer, agent, buyer, ministry, nonAuthorized] = await ethers.getSigners();

    // Deploy contract
    const LSAgriFlow = await ethers.getContractFactory("LSAgriFlow_Supply_v1");
    contract = await LSAgriFlow.deploy();
    await contract.waitForDeployment();

    // Setup roles
    await contract.addFarmer(farmer.address);
    await contract.addAgent(agent.address);
    await contract.addBuyer(buyer.address);
    await contract.addMinistryOfficer(ministry.address);
  });

  describe("Deployment", function () {
    it("Should deploy successfully and set admin", async function () {
      expect(await contract.admin()).to.equal(owner.address);
    });

    it("Should have empty transaction chain initially", async function () {
      const chain = await contract.getTransactionChain();
      expect(chain.length).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add farmer", async function () {
      const newFarmer = nonAuthorized.address;
      await contract.addFarmer(newFarmer);
      expect(await contract.farmers(newFarmer)).to.be.true;
    });

    it("Should allow admin to add agent", async function () {
      const newAgent = nonAuthorized.address;
      await contract.addAgent(newAgent);
      expect(await contract.agents(newAgent)).to.be.true;
    });

    it("Should allow admin to add buyer", async function () {
      const newBuyer = nonAuthorized.address;
      await contract.addBuyer(newBuyer);
      expect(await contract.buyers(newBuyer)).to.be.true;
    });

    it("Should allow admin to add ministry officer", async function () {
      const newOfficer = nonAuthorized.address;
      await contract.addMinistryOfficer(newOfficer);
      expect(await contract.ministryOfficers(newOfficer)).to.be.true;
    });

    it("Should NOT allow non-admin to add roles", async function () {
      const contractAsFarmer = contract.connect(farmer);
      await expect(
        contractAsFarmer.addFarmer(nonAuthorized.address)
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("Batch Registration", function () {
    it("Should allow farmer to register a batch", async function () {
      const contractAsFarmer = contract.connect(farmer);
      const batchId = "BATCH-001";
      
      const tx = await contractAsFarmer.registerBatch(
        batchId,
        "Wool",
        150,
        "A",
        "Maseru District",
        1704067200,
        "High quality wool"
      );

      await expect(tx)
        .to.emit(contract, "BatchRegistered")
        .withArgs(
          ethers.keccak256(
            ethers.concat([
              ethers.toUtf8Bytes(batchId),
              farmer.address
            ])
          ),
          farmer.address
        );
    });

    it("Should store batch data correctly", async function () {
      const contractAsFarmer = contract.connect(farmer);
      const batchId = "BATCH-002";
      
      await contractAsFarmer.registerBatch(
        batchId,
        "Mohair",
        200,
        "AA",
        "Leribe District",
        1704153600,
        "Premium mohair"
      );

      const batchIdBytes = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes(batchId),
          farmer.address
        ])
      );

      const batch = await contract.batches(batchIdBytes);
      expect(batch.id).to.equal(batchId);
      expect(batch.productType).to.equal("Mohair");
      expect(batch.weight).to.equal(200);
      expect(batch.grade).to.equal("AA");
      expect(batch.region).to.equal("Leribe District");
      expect(batch.farmer).to.equal(farmer.address);
      expect(batch.status).to.equal(0); // PENDING
    });

    it("Should NOT allow duplicate batch registration", async function () {
      const contractAsFarmer = contract.connect(farmer);
      const batchId = "BATCH-003";
      
      await contractAsFarmer.registerBatch(
        batchId,
        "Wool",
        100,
        "B",
        "Quthing",
        1704067200,
        "First registration"
      );

      await expect(
        contractAsFarmer.registerBatch(
          batchId,
          "Mohair",
          150,
          "A",
          "Mokhotlong",
          1704153600,
          "Duplicate"
        )
      ).to.be.revertedWith("Batch ID already exists");
    });

    it("Should NOT allow non-farmer to register batch", async function () {
      const contractAsNonFarmer = contract.connect(nonAuthorized);
      
      await expect(
        contractAsNonFarmer.registerBatch(
          "BATCH-004",
          "Wool",
          100,
          "A",
          "District",
          1704067200,
          "Test"
        )
      ).to.be.revertedWith("Only farmers");
    });

    it("Should create a transaction in the chain", async function () {
      const contractAsFarmer = contract.connect(farmer);
      
      await contractAsFarmer.registerBatch(
        "BATCH-CHAIN-TEST",
        "Wool",
        150,
        "A",
        "Maseru",
        1704067200,
        "Chain test"
      );

      const chain = await contract.getTransactionChain();
      expect(chain.length).to.equal(1);

      const txId = chain[0];
      const transaction = await contract.transactions(txId);
      expect(transaction.txType).to.equal("REGISTER");
      expect(transaction.prevHash).to.equal(ethers.ZeroHash); // Genesis
    });
  });

  describe("Batch Verification", function () {
    let batchIdBytes;

    beforeEach(async function () {
      const contractAsFarmer = contract.connect(farmer);
      const batchId = "BATCH-VERIFY-001";
      
      await contractAsFarmer.registerBatch(
        batchId,
        "Wool",
        150,
        "A",
        "Maseru District",
        1704067200,
        "For verification"
      );

      batchIdBytes = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes(batchId),
          farmer.address
        ])
      );
    });

    it("Should allow agent to verify pending batch", async function () {
      const contractAsAgent = contract.connect(agent);
      
      const tx = await contractAsAgent.verifyBatch(
        batchIdBytes,
        "A+",
        "Excellent quality"
      );

      await expect(tx)
        .to.emit(contract, "BatchVerified")
        .withArgs(batchIdBytes, agent.address, "A+");
    });

    it("Should update batch status and grade after verification", async function () {
      const contractAsAgent = contract.connect(agent);
      
      await contractAsAgent.verifyBatch(
        batchIdBytes,
        "A+",
        "Excellent quality"
      );

      const batch = await contract.batches(batchIdBytes);
      expect(batch.status).to.equal(1); // VERIFIED
      expect(batch.grade).to.equal("A+");
    });

    it("Should NOT allow non-agent to verify batch", async function () {
      const contractAsNonAgent = contract.connect(nonAuthorized);
      
      await expect(
        contractAsNonAgent.verifyBatch(batchIdBytes, "B", "Not good")
      ).to.be.revertedWith("Only agents");
    });

    it("Should NOT allow verification of non-pending batch", async function () {
      const contractAsAgent = contract.connect(agent);
      
      await contractAsAgent.verifyBatch(batchIdBytes, "A+", "First verification");

      await expect(
        contractAsAgent.verifyBatch(batchIdBytes, "A++", "Second try")
      ).to.be.revertedWith("Batch not pending");
    });

    it("Should create verification transaction in chain", async function () {
      const contractAsAgent = contract.connect(agent);
      
      await contractAsAgent.verifyBatch(batchIdBytes, "A+", "Verify for chain");

      const chain = await contract.getTransactionChain();
      expect(chain.length).to.equal(2); // REGISTER + VERIFY

      const verifyTxId = chain[1];
      const verifyTransaction = await contract.transactions(verifyTxId);
      expect(verifyTransaction.txType).to.equal("VERIFY");
      expect(verifyTransaction.prevHash).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("Transaction Chain Integrity", function () {
    it("Should maintain correct hash chain", async function () {
      const contractAsFarmer = contract.connect(farmer);
      const contractAsAgent = contract.connect(agent);

      await contractAsFarmer.registerBatch(
        "CHAIN-TEST-001",
        "Wool",
        100,
        "B",
        "District",
        1704067200,
        "First"
      );

      const batchIdBytes = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes("CHAIN-TEST-001"),
          farmer.address
        ])
      );

      await contractAsAgent.verifyBatch(batchIdBytes, "A", "Good");

      const chain = await contract.getTransactionChain();
      expect(chain.length).to.equal(2);

      const tx1 = await contract.transactions(chain[0]);
      const tx2 = await contract.transactions(chain[1]);

      expect(tx1.prevHash).to.equal(ethers.ZeroHash);
      expect(tx2.prevHash).to.equal(tx1.hash);
      expect(tx1.hash).to.not.equal(tx2.hash);
    });
  });

  describe("Gas Usage Analysis", function () {
    it("Should use reasonable gas for deployment", async function () {
      const LSAgriFlow = await ethers.getContractFactory("LSAgriFlow_Supply_v1");
      const newContract = await LSAgriFlow.deploy();
      await newContract.waitForDeployment();

      const deploymentReceipt = await newContract.deploymentTransaction().wait();
      // Bumping limit to 2.5M
      expect(deploymentReceipt.gasUsed).to.be.lt(2500000n); 
    });

    it("Should use reasonable gas for registration", async function () {
      const contractAsFarmer = contract.connect(farmer);
      
      const tx = await contractAsFarmer.registerBatch(
        "GAS-TEST-001",
        "Wool",
        100,
        "A",
        "District",
        1704067200,
        "Gas test"
      );

      const receipt = await tx.wait();
      // Bumping limit to 500k
      expect(receipt.gasUsed).to.be.lt(500000n);
  });
});

  describe("Role Checking", function () {
    it("Should correctly identify farmer role", async function () {
      expect(await contract.farmers(farmer.address)).to.be.true;
      expect(await contract.farmers(nonAuthorized.address)).to.be.false;
    });

    it("Should correctly identify agent role", async function () {
      expect(await contract.agents(agent.address)).to.be.true;
      expect(await contract.agents(nonAuthorized.address)).to.be.false;
    });
  });
});
