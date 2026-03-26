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
| Blockchain simulation | crypto-js SHA-256, chain-linked transactions |
| QR Codes | qrcode.react |
| Charts | Recharts |
| Persistence | Browser localStorage |
| Build tool | Vite 5 |

---

## Prerequisites

- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (bundled with Node.js)

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

### Any terminal

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
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                   ← Entry point + seed
    ├── App.jsx                    ← Router & protected routes
    ├── index.css                  ← Full design system
    ├── components/
    │   ├── Logo.jsx               ← Mokorotlo SVG + branding constants
    │   ├── Layout.jsx             ← Sidebar + topbar shell
    │   └── common.jsx             ← StatCard, Badge, ChainViewer, PassportModal
    ├── context/
    │   └── AppContext.jsx         ← Auth, toasts, global state
    ├── utils/
    │   ├── crypto.js              ← SHA-256, transaction builder, chain verifier
    │   ├── db.js                  ← localStorage abstraction
    │   └── seed.js                ← Demo data seeder
    └── pages/
        ├── Login.jsx              ← Branded login with Mokorotlo hero
        ├── farmer/
        │   ├── Dashboard.jsx
        │   ├── RegisterBatch.jsx
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
