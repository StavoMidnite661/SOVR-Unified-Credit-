# SOVR Protocol: Unified Credit System v2.0 "Aurora"

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Alpha-orange.svg)
![Network](https://img.shields.io/badge/network-Base_Mainnet-blue)

**SOVR** is a decentralized, permissionless credit protocol bridging the gap between on-chain assets and real-world payment rails. The Unified Credit System (UCS) allows users to swap governance tokens for stablecoins, normalize them into off-chain credit, and spend them instantly via traditional gateways like Stripe.

---

## 🚀 Features

### 1. **Credit Terminal (Swap)**
*   **Uniswap V3 Integration**: Real-time quotes for SOVR / usdSOVR pairs.
*   **Smart Routing**: Optimized trade execution on the Base network.
*   **Slippage Protection**: Built-in guardrails for volatile market conditions.

### 2. **Normalization Layer (Mint)**
*   **Asset Bridge**: Burn on-chain `usdSOVR` to mint off-chain `USD Credits` (1:1 Peg).
*   **Attestation Engine**: Cryptographic verification of burn events before credit issuance.
*   **Immutable Logging**: Every normalization event is permanently recorded on the ledger.

### 3. **USD Gateway (Pay)**
*   **Stripe Connect**: Spend your normalized USD Credits directly with real-world merchants.
*   **Virtual Card Logic**: Simulates card authorization flows with instant settlement.
*   **Risk Engine**: Integrated compliance checks (mocked for demo: try merchant "Cyberdyne Systems").

### 4. **AI Intelligence**
*   **Embedded LLM**: Integrated Google Gemini 2.5 Flash Lite model for real-time protocol assistance.
*   **Context Aware**: The AI understands your current wallet state and protocol mechanics.

---

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Icons**: Lucide React
*   **Animation**: Native CSS Keyframes + RequestAnimationFrame
*   **AI**: Google Generative AI SDK (`@google/genai`)
*   **Blockchain Simulation**: Mock Backend services (Replace with `viem` / `wagmi` for production).

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
3.  **Database**: Connect a Postgres database to index blockchain events for the History tab (using The Graph or a custom indexer).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> "Code is law. Credit is energy. You are the bank." - *SOVR Manifesto*
