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
  const [transferId] = await tigerBeetle.createTransfers([{
    debit_account_id: isSovrToFiat ? "1000" : "2000",
    credit_account_id: isSovrToFiat ? "2000" : "1000",
    amount: Math.floor(amount * 100), // TB works in integers (cents/micros)
    code: 101 // Swap Code
  }]);
  
  return transferId;
};

export const performNormalization = async (amount: number): Promise<string> => {
  // Normalization: User burns on-chain usdSOVR, gains off-chain Credit
  // Debit: User Liability Account (2000) - Reducing the supply
  // Credit: Gateway Credit Pool (3000) - Increasing spending power
  const [transferId] = await tigerBeetle.createTransfers([{
    debit_account_id: "2000",
    credit_account_id: "3000",
    amount: Math.floor(amount * 100),
    code: 201 // Normalization Code
  }]);

  return transferId;
};

export const performPayment = async (amount: number, merchantId: string): Promise<string> => {
  // Payment: User spends Credit at a Merchant
  // Debit: Gateway Credit Pool (3000)
  // Credit: Merchant Revenue Account (4000)
  const [transferId] = await tigerBeetle.createTransfers([{
    debit_account_id: "3000",
    credit_account_id: "4000",
    amount: Math.floor(amount * 100),
    code: 301 // Payment Code
  }]);

  return transferId;
};

export const getTBAccountBalance = (id: string): number => {
  const acc = tigerBeetle.getAccount(id);
  if (!acc) return 0;
  // Standard accounting balance: Credits - Debits (for liabilities/revenue)
  // Or Debits - Credits (for assets)
  // Here we'll return a raw net
  return (acc.credits_posted - acc.debits_posted) / 100;
};