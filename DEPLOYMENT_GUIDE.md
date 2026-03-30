# Smart Contract Deployment Guide

## LS-AgriFlow Supply Chain DApp

**Target Network:** Ethereum Sepolia Testnet  
**Contract:** LSAgriFlow_Supply_v1  
**Solidity Version:** ^0.8.19  
**Framework:** Hardhat

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installing Dependencies](#installing-dependencies)
4. [Hardhat Configuration](#hardhat-configuration)
5. [Obtaining Test ETH](#obtaining-test-eth)
6. [Deploying the Contract](#deploying-the-contract)
7. [Verifying the Deployment](#verifying-the-deployment)
8. [Frontend Integration](#frontend-integration)
9. [Troubleshooting](#troubleshooting)
10. [Production Considerations](#production-considerations)

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Download Link |
|------|---------|---------|---------------|
| Node.js | v18+ | JavaScript runtime | https://nodejs.org |
| npm | v9+ | Package manager | Included with Node.js |
| Git | Latest | Version control | https://git-scm.com |
| MetaMask | Extension | Web3 wallet | https://metamask.io |

### Verify Installation

```bash
# Check Node.js version
node --version
# Expected: v18.x.x or higher

# Check npm version
npm --version
# Expected: 9.x.x or higher

# Check Git
git --version
```

### Required Accounts

1. **MetaMask Wallet:** Install the browser extension
2. **Infura/Alchemy Account:** For RPC access to Sepolia (free tier available)
3. **GitHub Account:** For repository access

---

## Environment Setup

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/Lungile6/ls-agriflow.git

# Navigate to project directory
cd ls-agriflow

# Open in VS Code (optional)
code .
```

### Step 2: Create Environment File

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following variables:

```env
# ==========================================
# BLOCKCHAIN CONFIGURATION
# ==========================================

# Sepolia RPC URL - Get from Infura or Alchemy
# Infura: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Your wallet's private key (with 0x prefix)
# ⚠️ WARNING: Never share or commit this key!
# Get this from MetaMask: Account → ⋮ → Account Details → Show Private Key
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# ==========================================
# FRONTEND CONFIGURATION
# ==========================================

# Deployed contract address (filled after deployment)
VITE_CONTRACT_ADDRESS=0x

# Same RPC URL for frontend (Vite requires VITE_ prefix)
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

### Step 3: Secure Your Environment File

Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

Verify it's ignored:

```bash
git status
# Should NOT show .env as untracked
```

---

## Installing Dependencies

### Step 1: Install Node Modules

```bash
npm install
```

This installs:
- **Hardhat** - Ethereum development environment
- **ethers.js v6** - Web3 library
- **@nomicfoundation/hardhat-toolbox** - Testing and debugging tools
- **React + Vite** - Frontend framework

### Step 2: Verify Hardhat Installation

```bash
npx hardhat --version
# Expected: 2.19.x or higher
```

### Step 3: Check Available Hardhat Tasks

```bash
npx hardhat
```

Expected output:
```
AVAILABLE TASKS:
  check                 Check whatever you need
  clean                 Clears the cache and deletes all artifacts
  compile               Compiles the entire project, building all artifacts
  console               Opens a hardhat console
  coverage              Generates a code coverage report for tests
  flatten               Flattens and prints contracts and their dependencies
  help                  Prints this message
  node                  Starts a JSON-RPC server on top of Hardhat Network
  run                   Runs a user-defined script after compiling the project
  test                  Runs mocha tests
  verify                Verifies contract on Etherscan
```

---

## Hardhat Configuration

### Understanding hardhat.config.js

The project uses ES modules. The configuration file:

```javascript
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  solidity: {
    compilers: [
      { version: "0.8.19" },   // For LSAgriFlow
      { version: "0.8.28" }    // For other contracts
    ]
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined 
        ? [process.env.PRIVATE_KEY] 
        : [],
    },
  },
};
```

### Key Configuration Points

1. **Multiple Solidity Versions:** Supports both 0.8.19 (contract) and 0.8.28 (testing)
2. **Sepolia Network:** Configured for testnet deployment
3. **Private Key Security:** Loaded from environment variables
4. **ES Module Syntax:** Uses `import/export` instead of `require/module.exports`

---

## Obtaining Test ETH

### What is Sepolia?

Sepolia is an Ethereum testnet that uses fake ETH for testing. It mimics mainnet behavior without real costs.

### Method 1: Infura Faucet (Recommended)

1. Visit: https://www.infura.io/faucet/sepolia
2. Connect your MetaMask wallet
3. Request 0.5 Sepolia ETH
4. Wait ~1 minute for confirmation

### Method 2: Alchemy Faucet

1. Visit: https://sepoliafaucet.com
2. Enter your wallet address
3. Sign up for Alchemy (free)
4. Request 0.5 Sepolia ETH

### Method 3: Google Cloud Faucet

1. Visit: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Sign in with Google account
3. Enter wallet address
4. Request 0.05 ETH/day

### Verify Your Balance

```bash
# Using MetaMask
# 1. Ensure network is set to "Sepolia"
# 2. Check balance shows in the wallet

# Using Hardhat console
npx hardhat console --network sepolia
> const [signer] = await ethers.getSigners();
> await signer.getBalance();
> BigNumber { _hex: '0x1c30bfeda3c000', _isBigNumber: true }
# This equals approximately 0.5 ETH
```

---

## Deploying the Contract

### Step 1: Compile the Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully (evm target: paris).
```

This creates:
- `artifacts/contracts/LSAgriFlow_Supply_v1.sol/LSAgriFlow_Supply_v1.json`
- `artifacts/contracts/LSAgriFlow_Supply_v1.sol/LSAgriFlow_Supply_v1.dbg.json`

### Step 2: Run the Deployment Script

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
Deploying LSAgriFlow_Supply_v1...
LSAgriFlow_Supply_v1 deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

### Step 3: Save the Contract Address

Copy the deployed address and update your `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### Step 4: Verify Deployment on Etherscan

```bash
# Replace with your actual contract address
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

Visit: https://sepolia.etherscan.io/address/0xYOUR_CONTRACT_ADDRESS

---

## Understanding the Deployment Script

### deploy.js Breakdown

```javascript
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying LSAgriFlow_Supply_v1...");

  // Get the contract factory - loads compiled contract
  const LSAgriFlow = await ethers.getContractFactory("LSAgriFlow_Supply_v1");
  
  // Deploy the contract
  // This sends a transaction to create the contract on-chain
  const contract = await LSAgriFlow.deploy();

  // Wait for deployment to finish
  // Mining can take 10-30 seconds on Sepolia
  await contract.waitForDeployment();

  // Get the deployed contract address
  const address = await contract.getAddress();
  console.log(`LSAgriFlow_Supply_v1 deployed to: ${address}`);
}

// Execute deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### What Happens During Deployment?

1. **Contract Compilation:** Hardhat compiles Solidity to bytecode
2. **Transaction Creation:** Deploy transaction sent to Sepolia
3. **Mining:** Miners include transaction in a block (10-30s)
4. **Address Assignment:** Contract gets permanent address
5. **Gas Payment:** Deployment cost deducted from deployer wallet

### Gas Costs

| Operation | Estimated Gas | Cost (at 10 gwei) |
|-----------|----------------|-------------------|
| Contract Deployment | ~500,000 | 0.005 ETH (~$10) |
| Register Batch | ~45,000 | 0.00045 ETH (~$0.90) |
| Verify Batch | ~35,000 | 0.00035 ETH (~$0.70) |

---

## Verifying the Deployment

### Method 1: Etherscan Verification

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Method 2: Manual Verification via Console

```bash
npx hardhat console --network sepolia
```

```javascript
// Connect to deployed contract
const contract = await ethers.getContractAt(
  "LSAgriFlow_Supply_v1", 
  "0xYOUR_CONTRACT_ADDRESS"
);

// Check admin address
const admin = await contract.admin();
console.log("Admin:", admin);

// Should match your deploying wallet address
```

### Method 3: Read Contract Data

```javascript
// Check if address is farmer (should be false for new contract)
const isFarmer = await contract.farmers("0xSOME_ADDRESS");
console.log("Is Farmer:", isFarmer); // false

// Get transaction chain length
const chainLength = await contract.getTransactionChain();
console.log("Transactions:", chainLength.length); // 0
```

---

## Frontend Integration

### Step 1: Update Environment Variables

After deployment, update `.env`:

```env
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 370 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Connect MetaMask

1. Open browser at `http://localhost:5173`
2. Click "🔗 Connect MetaMask" button
3. Approve connection in MetaMask popup
4. Allow network switch to Sepolia when prompted

### Step 5: Test the Integration

1. **Login** with demo credentials (Farmer: 26600001 / 1234)
2. **Connect MetaMask** and ensure you're on Sepolia
3. **Register a batch** - should show transaction hash
4. **Verify on Etherscan** - copy transaction hash and search on https://sepolia.etherscan.io

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Private key is not valid"

**Error:**
```
Error: private key does not meet the requirements
```

**Solution:**
- Ensure private key has `0x` prefix
- Verify key is 64 characters after `0x`
- Example: `0x1234567890abcdef...` (66 chars total)

```env
# Correct
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Incorrect
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Issue 2: "Insufficient funds"

**Error:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:**
- Get more Sepolia ETH from faucet
- Check balance in MetaMask
- Ensure you're on Sepolia network, not mainnet

#### Issue 3: "Invalid RPC URL"

**Error:**
```
Error: could not detect network
```

**Solution:**
- Verify Infura/Alchemy project ID is correct
- Check network connectivity
- Try alternative RPC URL:
  - `https://rpc.sepolia.org` (public)
  - `https://sepolia.gateway.tenderly.co`

#### Issue 4: "Compilation failed"

**Error:**
```
Error: Expected identifier but got 'import'
```

**Solution:**
- Ensure `package.json` has `"type": "module"`
- Use ES module syntax in all files
- For Hardhat config, use `.js` not `.cjs`

#### Issue 5: "Nonce too low"

**Error:**
```
Error: nonce has already been used
```

**Solution:**
- Reset MetaMask account:
  - Settings → Advanced → Reset Account
- Wait for pending transactions to clear

#### Issue 6: "Contract verification failed"

**Error:**
```
Error: Contract source code not available
```

**Solution:**
- Ensure you compiled before verifying:
  ```bash
  npx hardhat compile
  ```
- Check contract address is correct
- Try manual verification on Etherscan

---

## Production Considerations

### Before Mainnet Deployment

1. **Security Audit:**
   - Hire professional auditor (e.g., CertiK, OpenZeppelin)
   - Cost: $10,000 - $50,000
   - Timeline: 2-4 weeks

2. **Gas Optimization:**
   - Run optimization passes:
     ```bash
     npx hardhat run scripts/gas-report.js
     ```
   - Consider contract size limits
   - Use storage efficiently

3. **Test Thoroughly:**
   - Achieve >90% test coverage
   - Test edge cases
   - Perform integration testing

4. **Upgrade Strategy:**
   - Consider proxy pattern for upgradability
   - Plan for contract migration if needed

### Mainnet Deployment Costs

| Item | Estimated Cost |
|------|---------------|
| Contract Deployment | $50 - $200 |
| First Month Operations | $100 - $500 |
| Security Audit | $10,000 - $50,000 |
| Gas for Initial Users | Variable |

### Environment for Production

```env
# Production .env
MAINNET_RPC_URL=https://mainnet.infura.io/v3/PROJECT_ID
PRIVATE_KEY=0xPRODUCTION_PRIVATE_KEY
ETHERSCAN_API_KEY=YourEtherscanAPIKey

# Use hardware wallet for production keys
# Never store production keys in plain text
```

---

## Quick Reference Commands

### Daily Development

```bash
# Start local development
npm run dev

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia 0xADDRESS
```

### Testing

```bash
# Run contract tests
npx hardhat test

# Run tests with gas report
REPORT_GAS=true npx hardhat test

# Check contract size
npx hardhat size-contracts
```

### Debugging

```bash
# Open Hardhat console
npx hardhat console --network sepolia

# Trace transaction
npx hardhat trace --tx 0xTRANSACTION_HASH --network sepolia
```

---

## Checklist for Successful Deployment

- [ ] Node.js v18+ installed
- [ ] MetaMask installed and configured
- [ ] `.env` file created with valid keys
- [ ] Sepolia test ETH obtained (0.5+ ETH)
- [ ] Dependencies installed (`npm install`)
- [ ] Contract compiled successfully
- [ ] Deployment script executed
- [ ] Contract address saved to `.env`
- [ ] Deployment verified on Etherscan
- [ ] Frontend connected to contract
- [ ] Test transaction sent successfully
- [ ] Transaction visible on Etherscan

---

## Support and Resources

### Documentation
- Hardhat Docs: https://hardhat.org/docs
- Ethers.js v6: https://docs.ethers.org/v6/
- Solidity Docs: https://docs.soliditylang.org

### Testnet Resources
- Sepolia Etherscan: https://sepolia.etherscan.io
- Sepolia Faucet: https://www.infura.io/faucet/sepolia
- Chainlist: https://chainlist.org/chain/11155111

### Community
- Ethereum Stack Exchange: https://ethereum.stackexchange.com
- Hardhat Discord: https://hardhat.org/discord

---

**Guide Version:** 1.0  
**Last Updated:** March 30, 2026  
**Network:** Ethereum Sepolia Testnet  
**Contract:** LSAgriFlow_Supply_v1
