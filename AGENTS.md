# SOVR Protocol: Technical Documentation for Agents & Developers

This document provides a deep dive into the architecture, ledger mechanics, and integration patterns of the SOVR Unified Credit System.

## 1. Ledger Schema (TigerBeetle)

TigerBeetle is the source of truth for all balances. The protocol uses a standard Chart of Accounts (CoA) with the following identifiers:

| Account ID | Name | Type | Description |
| :--- | :--- | :--- | :--- |
| **1000** | Liquidity Pool | Asset | Holds the system's reserve of SOVR/usdSOVR assets. |
| **2000** | User Liabilities | Liability | Represents the total supply of stablecoins issued to users. |
| **3000** | Gateway Credits | Liability | Represents off-chain credits available for spending at merchants. |
| **4000** | Merchant Revenue | Liability | Accumulates settled payments for merchants. |
| **5000** | Burn Account | Liability | A "dead" account where tokens go upon destruction. |

### Transaction Codes
- `101`: Protocol Swap (SOVR <-> usdSOVR)
- `201`: Normalization (Simulation only - legacy)
- `301`: Merchant Payment Settlement
- `501`: Protocol Burn (Atomic conversion of 2000 -> 3000)

---

## 2. Core Protocol Flows

### A. Stablecoin Burning (Burn & Mint)
When a user "Normalizes" assets, the following sequence occurs:
1. **Blockchain:** `services/web3.ts` calls `burnStablecoins`. This sends an on-chain transaction on the Base network to a dead address.
2. **Backend:** The frontend calls the server's `/transactions/transfer` endpoint.
3. **TigerBeetle:** A transfer is created from **Account 2000** (Liability) to **Account 3000** (Gateway Credits).
   - This reduces the on-chain supply liability and increases the off-chain spending power.

### B. Tap-to-Pay (NFC)
The `USDGateway.tsx` component uses the **Web NFC API**:
1. `ndef.scan()` is invoked.
2. Upon detection, a `reading` event provides the merchant's signature.
3. The app triggers a `vibrate` haptic feedback.
4. An atomic payment is executed:
   - Automated Swap (if needed).
   - Automated Burn (to create credit).
   - **TigerBeetle Transfer:** **Account 3000** -> **Account 4000**.

---

## 3. PWA & Mobile Native Integration

- **Service Worker (`sw.js`):** Handles basic caching for offline-first capabilities.
- **Manifest (`manifest.json`):** Defines the app as `standalone` to remove the browser address bar when installed.
- **Viewport:** `index.html` uses `viewport-fit=cover` to support modern notched devices.

---

## 4. Development & Testing

### Verification Scripts
The repository includes several verification scripts for testing without a full browser:
- `services/verify_ledger.test.ts`: Tests the TigerBeetle ledger transitions using `tsx`.

### Environment Variables (Server)
Located in `server/.env.example`:
- `PORT`: Server port (default 3001).
- `TB_CLUSTER_ID`: TigerBeetle cluster ID (default 0).
- `TB_ADDRESS`: TigerBeetle replica addresses.

---

## 5. Deployment Checklist

1. **TigerBeetle:** Ensure a TigerBeetle node is running with the accounts 1000-5000 initialized.
2. **Base Contracts:** Replace placeholder addresses in `services/web3.ts` with real deployed contract addresses.
   - `USD_SOVR_ADDRESS`: The ERC20 stablecoin on Base.
   - `BURN_ADDRESS`: Typically `0x000000000000000000000000000000000000dEaD`.
3. **PWA Assets:** Replace the placeholder icons in `manifest.json` with official SOVR branding.
4. **Stripe Integration:** Replace the simulation in `services/protocolService.ts` with a real Stripe Connect implementation in the backend.

## 6. Real-World Testing Guide

To test the system in a production-like environment:
1. **Connect Wallet:** Use MetaMask on the Base network (Sepolia for testing).
2. **Faucet:** Ensure you have the SOVR/usdSOVR test tokens in your wallet.
3. **Burn Logic:** Go to the "Terminal" tab, enter an amount, and click "Burn Stablecoins". Confirm the transaction in your wallet.
4. **Ledger Sync:** Observe the "Ledger" tab; you should see the User Liability decrease and Gateway Credit increase in real-time as the TigerBeetle backend processes the event.
5. **Tap-to-Pay:** Use a secondary device or simulator to trigger an NFC NDEF message containing a merchant ID.
