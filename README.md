# SOVR Protocol: Unified Credit System v2.0 "Aurora"

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)
![Network](https://img.shields.io/badge/network-Base_Mainnet-blue)

<div align="center">
  <img src="./hero-screenshot.png" alt="SOVR Tap-to-Pay Hero" width="300" />
</div>

**SOVR** is a decentralized, permissionless credit protocol bridging the gap between on-chain assets and real-world payment rails. The "Aurora" version of the protocol implements a production-ready ledger system using **TigerBeetle**, a mobile-native Progressive Web App (PWA) interface featuring **Web NFC Tap-to-Pay**, and real-world blockchain connectivity via **Viem** on the Base network. 

Additionally, it integrates an ultra low-latency **AI Assistant** using Google's generative AI models to guide users through the protocol's functionalities.

---

## 🚀 Key Features

### 1. Atomic Protocol V2 (Tap-to-Pay)
- **Web NFC Integration:** Uses the browser's `NDEFReader` API for real-world "Tap to Pay" functionality, communicating with physical merchant terminals.
- **Haptic Feedback:** Native vibration feedback upon successful merchant signal detection (`navigator.vibrate()`).
- **Atomic Settlement:** Instantly bundles three operations: Swapping SOVR to fiat, burning the fiat on-chain, and executing the Stripe fiat payment.
- **POS Mode:** Ability to generate dynamic standalone QR codes to act as a receiving Point-of-Sale (POS) terminal.

### 2. Immutable Ledger via TigerBeetle
- **Strict Double-Entry Accounting:** Financial state transitions strictly enforce solvency. 
- **Production Backend Gateway:** An Express/Node.js backend safely acts as the sole mutator for the TigerBeetle cluster, routing `/transactions/transfer` calls.
- **Real-Time Polling Engine:** The React frontend polls TigerBeetle account balances every two seconds to keep the UI in precise sync with the ledger.

### 3. Real-World Blockchain Bridge (Viem)
- **On-Chain Burn:** Uses `viem` to broadcast base network transactions that provably burn stablecoins (`usdSOVR`).
- **Off-Chain Credit Issuance:** On-chain burning atomicaly translates into off-chain spendable credits housed inside TigerBeetle's liability accounts.

### 4. Embedded AI Assistant 
- **Google GenAI Integration:** Leverages the `gemini-flash-lite-latest` model for ultra-low latency contextual help regarding swapping, normalizing, and paying within the protocol.

---

## 🏗 Architecture & Tech Stack

### Frontend App Details
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (with highly customized glassmorphism theme, dynamic Aurora backgrounds, and animations)
- **Icons:** `lucide-react`
- **PWA:** `manifest.json` and `sw.js` for standalone mobile installation and caching.

### Backend & Middleware
- **Environment:** Node.js, Express
- **Database:** TigerBeetle Node Client (`tigerbeetle-node` via `createClient`)
- **Web3 Connector:** `viem` configured for the Base network (`viem/chains`).

### Protocol Logical Architecture
1. **Presentation Layer:** `App.tsx` containing the Dashboard (Tabs: Pay, Terminal, Ledger, History).
2. **Middleware Services:** `productionMiddleware.ts` defining abstract financial flows (Swap, Burn, Pay).
3. **Execution Layer:** `mockBackend.ts` handling simulated Stripe limits and API delays, while `web3.ts` executes the actual smart contract calls.
4. **Data Verification Layer:** `server/src/index.ts` processing and verifying double-entry bookkeeping ledgers before committing them.

---

## 📒 TigerBeetle Ledger Schema

TigerBeetle tracks state using a strict Chart of Accounts (CoA). The UI explicitly visualizes this in the **Ledger** view.

| Account ID | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| **1000** | Liquidity Pool | Asset | Holds the system's reserve of SOVR/usdSOVR assets. |
| **2000** | User Liabilities | Liability | Represents total stablecoins allocated to user wallets off-chain. |
| **3000** | Gateway Credits | Liability | Represents off-chain credits available for spending at merchants. |
| **4000** | Merchant Revenue | Liability | Accumulates settled payments assigned to connected merchants. |
| **5000** | Burn Account | Liability | Cryptographic dead-end account; used during manual Protocol Burn. |

### TigerBeetle Transfer Codes:
- `101`: Protocol Swap (SOVR <-> usdSOVR) [Accounts: `1000` & `2000`]
- `301`: Merchant Payment Settlement [Accounts: `3000` -> `4000`]
- `501`: Protocol Burn (Mint Gateway Credits) [Accounts: `2000` -> `3000`]

---

## 📁 Source Code Structure

```text
SOVR-Unified-Credit/
├── server/
│   ├── src/index.ts            # Express server & TigerBeetle Node Client
│   └── package.json            # Backend dependencies
├── src/
│   ├── components/
│   │   ├── AIAssistant.tsx     # Floating Gemini chat widget
│   │   ├── CreditTerminal.tsx  # Manual Swap UI
│   │   ├── LogConsole.tsx      # Scrolling system event logs
│   │   ├── NormalizationLayer.tsx # Manual Burn/Normalize UI
│   │   ├── USDGateway.tsx      # Tap To Pay / QR NFC Engine UI
│   │   └── ...                 # Modals & utilities
│   ├── services/
│   │   ├── geminiService.ts    # Model integration for AI chat
│   │   ├── mockBackend.ts      # Stripe settlement / NFC simulators
│   │   ├── productionMiddleware.ts # Ledger transition logic orchestrator
│   │   ├── tigerBeetle.ts      # Local TS simulated TB ledger (fallback)
│   │   └── web3.ts             # Viem config and burn contract execution
│   ├── App.tsx                 # Core App layout, State & Polling Manager
│   ├── index.tsx               # Service Worker configuration & React DOM mount
│   └── types.ts                # Global TypeScript definitions
├── index.html                  # PWA layout & Tailwind config/theme constraints
├── manifest.json               # Native PWA properties
├── vite.config.ts              # Vite bundle configuration
└── package.json                # Frontend dependencies
```

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js v20+
- A running TigerBeetle cluster on your machine or cloud provider (default: `127.0.0.1:3000`)

### 2. Setup Server (Backend)
```bash
cd server
npm install
npm run dev
```
*Note: Make sure to define `TB_CLUSTER_ID` and `TB_ADDRESS` in standard `.env` configuration if deviating from the defaults.*

### 3. Setup Client (Frontend)
```bash
# Return to the root directory
cd ..
npm install
# Set up your Gemini API keys in .env.local
echo "GEMINI_API_KEY=your_gen_ai_key" > .env.local
npm run dev
```

### 4. Running With Full Capability
By default `index.html` leverages deep integration with Vite's dev server wrapper config. Navigating to `http://localhost:3000` will spin up the application. In a mobile environment or simulated browser device mode, navigate to the `Pay` tab and click `NFC` to initialize the WebNFC API prompt.

---

## 📄 Documentation for Agents

For initial agent protocol generation instructions and deployment notes relating directly to the Ledger initialization parameters, please refer to the historical `AGENTS.md` included in the root directory.

> "Code is law. Credit is energy. You are the bank." - *SOVR Manifesto*
