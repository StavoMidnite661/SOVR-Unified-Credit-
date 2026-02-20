import { tigerBeetle } from "./tigerBeetle";
import { createLog } from "./mockBackend";
import { LogEntry } from "../types";

/**
 * Production Middleware
 * This layer handles the business logic of moving money between 
 * specific TigerBeetle accounts to ensure protocol solvency.
 */

export const performProtocolSwap = async (amount: number, isSovrToFiat: boolean): Promise<string> => {
  // In a real swap, we move value from Pool to User or vice versa
  // If User buys usdSOVR: 
  // Debit: System Pool (1000)
  // Credit: User Liability (2000)
  const response = await fetch('http://localhost:3001/transactions/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      debit_id: isSovrToFiat ? "1000" : "2000",
      credit_id: isSovrToFiat ? "2000" : "1000",
      amount,
      code: 101
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.transfer_id;
};

export const performBurn = async (amount: number): Promise<string> => {
  // Production Ledger Flow:
  // Convert Stablecoin Liability (2000) -> Gateway Credit Liability (3000)
  // This is an atomic "Burn & Mint" in the TigerBeetle source of truth.
  const response = await fetch('http://localhost:3001/transactions/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      debit_id: "2000",
      credit_id: "3000",
      amount,
      code: 501 // Protocol Burn Code
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.transfer_id;
};

export const performNormalization = async (amount: number): Promise<string> => {
  // Normalization is now consolidated into performBurn for production efficiency.
  // We keep this as a pass-through or alias if needed, but App.tsx will call performBurn.
  return performBurn(amount);
};

export const performPayment = async (amount: number, merchantId: string): Promise<string> => {
  const response = await fetch('http://localhost:3001/transactions/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      debit_id: "3000",
      credit_id: "4000",
      amount,
      code: 301
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.transfer_id;
};

export const getTBAccountBalance = (id: string): number => {
  const acc = tigerBeetle.getAccount(id);
  if (!acc) return 0;
  // Standard accounting balance: Credits - Debits (for liabilities/revenue)
  // Or Debits - Credits (for assets)
  // Here we'll return a raw net
  return (acc.credits_posted - acc.debits_posted) / 100;
};