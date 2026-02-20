# SOVR Protocol: Unified Credit System v2.0 "Aurora"

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)
![Network](https://img.shields.io/badge/network-Base_Mainnet-blue)

**SOVR** is a decentralized, permissionless credit protocol bridging the gap between on-chain assets and real-world payment rails. This version of the protocol implements a production-ready ledger system using **TigerBeetle**, a mobile-native PWA interface with **NFC Tap-to-Pay**, and real-world blockchain connectivity via **Viem** on the Base network.

---

## 🚀 Features

### 1. **Atomic Tap-to-Pay (NFC)**
*   **Web NFC Integration**: Real-world "Tap to Pay" using the browser's NDEFReader API.
*   **Haptic Feedback**: Physical confirmation vibration upon successful merchant signal detection.
*   **PWA Native Feel**: Installed as a standalone app on iOS/Android for a native look and feel.

### 2. **TigerBeetle Source of Truth**
*   **Immutable Ledger**: All financial transitions (Swap, Burn, Pay) are recorded in a high-performance TigerBeetle database.
*   **Double-Entry Accounting**: Rigid chart of accounts ensures system-wide solvency.
*   **Production Backend**: Node.js Express server acting as the secure gateway to the ledger.

### 3. **Stablecoin Burning Mechanism**
*   **On-Chain Burn**: Uses `viem` to interact with stablecoin contracts on the Base network.
*   **On-Chain to Off-Chain Bridge**: Burning tokens on-chain atomically triggers the issuance of off-chain credits in the TigerBeetle ledger.

### 4. **Merchant POS Mode**
*   **QR Payment Terminal**: The app can function as a Point-of-Sale (POS) terminal, generating dynamic QR codes for receiving payments.
*   **Real-World Dinner Interaction**: Simulated merchant flow for dining and retail scenarios.

---

## 🏗 Architecture

-   **Frontend**: React 19 (PWA), TypeScript, Tailwind CSS, Viem.
-   **Backend**: Node.js Express, TigerBeetle Node Client.
-   **Ledger**: TigerBeetle (Source of Truth).
-   **Blockchain**: Base Network (Mainnet/Testnet).

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js v20+
- A running TigerBeetle cluster (default: `127.0.0.1:3000`)

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Update .env with your TigerBeetle cluster details
npm run dev
```

### 3. Setup Frontend
```bash
# In the root directory
npm install
npm run dev
```

---

## 📄 Documentation for Agents

For deep technical details on the ledger schema, API endpoints, and protocol state transitions, please refer to [AGENTS.md](./AGENTS.md).

---

> "Code is law. Credit is energy. You are the bank." - *SOVR Manifesto*
