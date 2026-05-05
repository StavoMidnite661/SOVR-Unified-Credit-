# SOVR Protocol: Unified Credit System v2.0 "Aurora"

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Alpha-orange.svg)
![Network](https://img.shields.io/badge/network-Base_Mainnet-blue)

**SOVR** is a decentralized, permissionless credit protocol bridging the gap between on-chain assets and real-world payment rails. The Unified Credit System (UCS) allows users to swap governance tokens for stablecoins, normalize them into off-chain credit, and spend them instantly via traditional gateways like Stripe.

**New: Protocol V2 "Atomic" Standard**
The latest release introduces **Atomic Payments**: a streamlined workflow where users simply "Tap to Pay". The protocol automatically handles the token swap (SOVR -> usdSOVR), normalization (usdSOVR -> USD Credit), and fiat settlement in a single cryptographic transaction.

---

## 🚀 Features

### 1. **Atomic Payment Interface (Tap-to-Pay)**
*   **Protocol V2 Engine**: Combines Swap, Burn, and Settle into one user action.
*   **NFC & QR Simulation**: "Contactless" detection logic for merchant terminals.
*   **Console UI**: Professional, high-contrast transaction manifest for clear settlement data.
*   **Auto-Bridging**: Automatically calculates required SOVR tokens based on real-time fiat obligations.

### 2. **TigerBeetle Ledger (Accounting)**
*   **Double-Entry Core**: Integrated simulation of the [TigerBeetle](https://tigerbeetle.com) database for financial accounting.
*   **Real-time Solvency**: Tracks On-Chain Liquidity, User Liabilities, and Gateway Reserves with millisecond latency.
*   **Immutable Logs**: Every transfer is cryptographically linked and queryable.

### 3. **Credit Terminal (Manual Swap)**
*   **Uniswap V3 Integration**: Real-time quotes for SOVR / usdSOVR pairs.
*   **Smart Routing**: Optimized trade execution on the Base network.
*   **Slippage Protection**: Built-in guardrails for volatile market conditions.

### 4. **Normalization Layer (Mint)**
*   **Asset Bridge**: Burn on-chain `usdSOVR` to mint off-chain `USD Credits` (1:1 Peg).
*   **Attestation Engine**: Cryptographic verification of burn events before credit issuance.
*   **Immutable Logging**: Every normalization event is permanently recorded on the ledger.

### 5. **AI Intelligence**
*   **Embedded LLM**: Integrated Google Gemini 2.5 Flash Lite model for real-time protocol assistance.
*   **Context Aware**: The AI understands your current wallet state and protocol mechanics.

---

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Icons**: Lucide React
*   **Animation**: Native CSS Keyframes + RequestAnimationFrame
*   **AI**: Google Generative AI SDK (`@google/genai`)
*   **Ledger**: TigerBeetle (Simulation) for high-performance financial accounting.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sovr-protocol.git

# Navigate to project root
cd sovr-protocol

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚠️ Production Readiness

**Current Status: MVP / Simulation**

This application uses a mock backend (`services/mockBackend.ts`) to simulate blockchain interactions and payment gateway responses. 

**To Deploy to Production:**
1.  **Web3 Integration**: Replace mock calls with real contract interactions using `wagmi` or `viem`.
    *   Connect to Base Mainnet RPC.
    *   Interact with the Router and Stablecoin contracts.
2.  **Backend API**: Deploy a Node.js/Go backend to handle the Stripe Secret Keys.
    *   **Do not** expose Stripe secrets in the frontend.
3.  **Database**: Connect a real TigerBeetle cluster for high-throughput double-entry accounting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> "Code is law. Credit is energy. You are the bank." - *SOVR Manifesto*