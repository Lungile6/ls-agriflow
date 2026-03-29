# LS-AgriFlow
## *Ho tloha polasing ho ea 'marakeng*
### From farm to market · Lesotho Agricultural Supply Chain Platform

Smart contract namespace: **`LSAgriFlow_Supply_v1`**

---

## What It Does

**LS-AgriFlow** is a blockchain-backed AgriCommerce platform for Lesotho's wool and mohair sector.

- 👨‍🌾 **Farmers** register produce batches → receive a cryptographic **Digital Passport** (SHA-256 hash + QR code)
- 🔍 **Field Agents** verify or reject batches → each action is an immutable, chain-linked ledger transaction
- 🛒 **Buyers** browse a verified marketplace, purchase batches, and receive blockchain-certified **export certificates**
- 🏛 **Ministry Officers** view national analytics, the full immutable ledger, and export PDF reports

---

## Branding

| Element | Value |
|---|---|
| Platform name | LS-AgriFlow |
| Sesotho tagline | *Ho tloha polasing ho ea 'marakeng* |
| English tagline | From farm to market |
| Logo mark | Mokorotlo (Basotho conical hat) SVG — `src/components/Logo.jsx` |
| Smart contract name | `LSAgriFlow_Supply_v1` |
| Verify domain | `ls-agriflow.gov.ls` |
| localStorage prefix | `lsagriflow_` |
| Window global | `window.__lsagriflow__` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router 6 |
| Styling | Custom CSS design system (no framework) |
| **Blockchain** | **Hardhat + ethers.js v6 + MetaMask** |
| **Smart Contracts** | **Solidity 0.8.19 (Sepolia Testnet)** |
| Blockchain simulation | crypto-js SHA-256, chain-linked transactions |
| QR Codes | qrcode.react |
| Charts | Recharts |
| Persistence | Browser localStorage + **Ethereum Blockchain** |
| Build tool | Vite 5 |
| **Web3 Integration** | **Web3Manager Class + WalletConnect** |

---

## Prerequisites

- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (bundled with Node.js)
- **MetaMask** browser extension → https://metamask.io
- **Sepolia Testnet ETH** (free from https://sepoliafaucet.com)

Verify:
```bash
node --version   # v18.x.x or higher
npm --version    # 9.x.x or higher
```

---

## Setup & Run

### VS Code (recommended)

1. Open VS Code → **File → Open Folder** → select `ls-agriflow/`
2. Open terminal: **Terminal → New Terminal** (`` Ctrl+` ``)
3. Run:

```bash
npm install
npm run dev
```

4. Browser opens automatically at **http://localhost:5173**

---

## Environment Setup

Create `.env` file in project root:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YourProjectId
```

**Note**: Variables must use `VITE_` prefix for Vite compatibility.

---

## Smart Contract Deployment

Deploy to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address to your `.env` file.

```bash
cd ls-agriflow        # navigate to project root
npm install           # install dependencies (first time only)
npm run dev           # start dev server
# → open http://localhost:5173
```

---

### WebStorm / IntelliJ

1. Open `ls-agriflow/` as a project
2. Terminal panel → `npm install` → `npm run dev`
3. Click the localhost link in the terminal

---

## Demo Credentials

All accounts use **PIN: 1234**

| Role | Phone | Capabilities |
|---|---|---|
| 👨‍🌾 Farmer — Lineo Mokoena | `26600001` | Register batches, Digital Passport, create listings |
| 👨‍🌾 Farmer — Thabo Letsie | `26600002` | Same as above |
| 👨‍🌾 Farmer — Palesa Ntho | `26600003` | Same as above |
| 🔍 Field Agent — Mosa Tau | `26600010` | Verify / reject pending batches |
| 🛒 Buyer — Cape Wool Co. | `26600020` | Browse marketplace, purchase, download export certs |
| 🛒 Buyer — Mohair World | `26600021` | Same as above |
| 🏛 Ministry — Dr. Ntoi Rapapa | `26600030` | Analytics dashboard, full ledger, national PDF report |

---

## Recommended Demo Flow

1. **Farmer** (26600001 / 1234) → Register a new batch → see SHA-256 hash generated → view Digital Passport + QR
2. **Sign out** → **Agent** (26600010) → Verify Queue → approve the batch with grade + notes
3. **Sign out** → **Farmer** → My Batches → verified batch → Create Marketplace Listing
4. **Sign out** → **Buyer** (26600020) → Marketplace → Product Detail → Chain of Custody → Purchase → Export Certificate auto-issued
5. **Sign out** → **Ministry** (26600030) → Dashboard charts → Full Ledger (chain integrity check) → Reports → Export National PDF

---

## Project Structure

```
ls-agriflow/
├── contracts/
│   └── LSAgriFlow_Supply_v1.sol  ← Smart contract
├── scripts/
│   └── deploy.js                 ← Deployment script
├── hardhat.config.js            ← Hardhat configuration
├── artifacts/                    ← Compiled contract artifacts
├── .env                         ← Environment variables
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                   ← Entry point + seed
    ├── App.jsx                    ← Router & protected routes
    ├── index.css                  ← Full design system
    ├── components/
    │   ├── Logo.jsx               ← Mokorotlo SVG branding
    │   ├── Layout.jsx             ← Sidebar + topbar shell
    │   ├── WalletConnect.jsx      ← MetaMask connection UI
    │   └── common.jsx             ← StatCard, Badge, ChainViewer
    ├── context/
    │   └── AppContext.jsx         ← Auth, toasts, Web3 state
    ├── utils/
    │   ├── crypto.js              ← SHA-256, chain verifier
    │   ├── db.js                  ← localStorage abstraction
    │   ├── web3.js                ← Web3Manager - MetaMask/Contract
    │   └── seed.js                ← Demo data seeder
    └── pages/
        ├── Login.jsx
        ├── farmer/
        │   ├── Dashboard.jsx
        │   ├── RegisterBatch.jsx  ← Hybrid blockchain/local
        │   ├── MyBatches.jsx
        │   └── MyListings.jsx
        ├── agent/
        │   ├── Dashboard.jsx
        │   └── VerifyQueue.jsx
        ├── buyer/
        │   ├── Marketplace.jsx
        │   ├── ProductDetail.jsx
        │   ├── Orders.jsx
        │   └── VerifyBatch.jsx
        └── ministry/
            ├── Dashboard.jsx
            ├── FullLedger.jsx
            └── Reports.jsx
```

---

## How the Blockchain Simulation Works

Every action in the app writes a **Transaction** to the `LSAgriFlow_Supply_v1` ledger:

```
TX-0001: REGISTER  batchId=BATCH-KX7A  prevHash=0000000000000000  hash=abc123...
TX-0002: VERIFY    batchId=BATCH-KX7A  prevHash=abc123...          hash=def456...
TX-0003: LIST      batchId=BATCH-KX7A  prevHash=def456...          hash=ghi789...
TX-0004: PURCHASE  batchId=BATCH-KX7A  prevHash=ghi789...          hash=jkl012...
TX-0005: CERTIFY   batchId=BATCH-KX7A  prevHash=jkl012...          hash=mno345...
```

Each transaction:
- Is SHA-256 hashed over all its fields combined
- Includes `prevHash` — the hash of the previous transaction (the chain link)
- Is immutable once written to localStorage

The Ministry **Full Ledger** page runs `verifyChain()` which re-hashes every transaction
and confirms each `prevHash` matches its predecessor. If any record is tampered with,
a red **"Chain Integrity: COMPROMISED"** banner appears.

---

## Blockchain Architecture (DApp Mode)

The platform now runs as a **hybrid DApp**:

- **Primary Storage**: localStorage for fast, offline access
- **Blockchain Backup**: Sepolia testnet for immutable records  
- **Auto-Fallback**: Uses localStorage if MetaMask not connected
- **On-Chain Verification**: Batches registered on Ethereum with transaction hashes

### MetaMask Integration Flow:

1. Click **"🔗 Connect MetaMask"** in the UI
2. Approve connection in MetaMask popup
3. Auto-switch to Sepolia testnet (chain ID: 0xaa36a7)
4. Register batches → Creates on-chain transactions
5. View transaction hashes in batch details

### Smart Contract Functions:
- `registerBatch()` - Immutable batch registration
- `verifyBatch()` - Cryptographic verification by agents
- Role-based access control (Farmers, Agents, Buyers, Ministry)

---

## Web3Manager Class

The `Web3Manager` class (`src/utils/web3.js`) handles all blockchain interactions:

```javascript
const web3 = new Web3Manager()
await web3.connect()           // Connect MetaMask
await web3.registerBatch(data) // Register on blockchain
await web3.verifyBatch(id, grade, notes) // Verify batch
```

Key features:
- **Environment-based config**: Uses `VITE_CONTRACT_ADDRESS` and `VITE_SEPOLIA_RPC_URL`
- **Auto network switching**: Prompts to switch to Sepolia if on wrong network
- **Error handling**: Validates environment variables before operations
- **Type conversion**: Handles Solidity integer requirements for weights

### WalletConnect Component

UI component (`src/components/WalletConnect.jsx`) provides:
- Connect/Disconnect MetaMask button
- Display connected wallet address (truncated)
- Blockchain status indicator (⛓ Blockchain / 📱 Local)
- Integration with `AppContext` for global wallet state

---

## Smart Contract Naming Convention

Following the `LS` prefix developer brand:

| Asset | Name |
|---|---|
| Primary supply contract | `LSAgriFlow_Supply_v1` |
| Origin certificate contract | `LSAgriFlow_OriginCert_v1` |
| Marketplace escrow contract | `LSAgriFlow_Escrow_v1` |
| Farmer identity registry | `LSAgriFlow_FarmerReg_v1` |

---

## Build for Production

```bash
npm run build
# Output → dist/
```

Deploy to any static host:

```bash
# Netlify CLI
netlify deploy --dir=dist --prod

# Or drag dist/ to netlify.com/drop
# Or push to GitHub + connect to Vercel
```

---

## Reset Demo Data

Open browser console and run:
```javascript
localStorage.clear(); location.reload();
```

Fresh seed data is automatically loaded on next page load.
