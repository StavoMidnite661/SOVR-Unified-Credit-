import { LogEntry, Transaction, MerchantRequest } from "../types";

// Mock Constants
export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const POOL_ADDRESS = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

// Transaction Registry to simulate network state
const txRegistry = new Map<string, number>();

const generateHash = () => "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
const generateId = () => Math.random().toString(36).substr(2, 9);

export const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Register a transaction hash to start its "mining" timer
export const registerTransaction = (hash: string) => {
  txRegistry.set(hash, Date.now());
};

// Check status based on elapsed time since registration
export const checkTransactionStatus = async (hash: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED'> => {
  // Simulate network RPC call time
  await simulateDelay(200);

  const startTime = txRegistry.get(hash);
  
  if (!startTime) return 'FAILED'; // Unknown hash

  // Simulate a 5-8 second confirmation time
  const elapsed = Date.now() - startTime;
  const confirmationTime = 6000; 

  if (elapsed > confirmationTime) {
    return 'COMPLETED';
  }
  
  return 'PENDING';
};

// Mock Pricing Logic (Uniswap V3 Math Simulation)
export const getQuote = (amountIn: number, isSovrToFiat: boolean): number => {
  // Mock price: 1 SOVR = 2.50 usdSOVR (USDC)
  const EXCHANGE_RATE = 2.50; 
  const SLIPPAGE = 0.001; // 0.1%
  
  if (isSovrToFiat) {
    return amountIn * EXCHANGE_RATE * (1 - SLIPPAGE);
  } else {
    return amountIn / EXCHANGE_RATE * (1 - SLIPPAGE);
  }
};

export const createLog = (source: LogEntry['source'], message: string, type: LogEntry['type'] = 'info'): LogEntry => ({
  id: generateId(),
  timestamp: new Date().toISOString(),
  source,
  message,
  hash: source === 'CHAIN' ? generateHash() : undefined,
  type
});

export const processNormalization = async (amount: number, wallet: string): Promise<{ usdValue: number, attestationId: string }> => {
  await simulateDelay(800); // Shorter initial delay, rest handled by polling
  const attestationId = `att-${generateId()}-${Date.now()}`;
  registerTransaction(attestationId);
  return {
    usdValue: amount, // 1:1 Peg
    attestationId
  };
};

export const authorizeStripePayment = async (amount: number, merchantId: string): Promise<{ clientSecret: string, id: string }> => {
  await simulateDelay(1500); // Simulate Stripe API call

  // Mock Failure Conditions for UI testing
  const lowerId = merchantId.toLowerCase();
  if (lowerId.includes('fail') || lowerId.includes('decline') || lowerId.includes('error') || lowerId === 'cyberdyne systems') {
    throw new Error("Risk_Threshold_Exceeded: Merchant flagged by compliance layer.");
  }

  const id = `pi_${generateId()}`;
  registerTransaction(id);

  return {
    clientSecret: `pi_${generateId()}_secret_${generateId()}`,
    id: id
  };
};

// New Detection Simulations
export const detectMerchantSignal = async (mode: 'NFC' | 'QR'): Promise<MerchantRequest> => {
  await simulateDelay(2000); // Wait for "scan"
  
  const merchants = [
    { name: 'Starbucks Coffee', category: 'Food & Drink', avg: 12.50 },
    { name: 'Uber Technologies', category: 'Transport', avg: 24.00 },
    { name: 'Whole Foods Market', category: 'Grocery', avg: 85.00 },
    { name: 'Apple Store', category: 'Electronics', avg: 299.00 },
    { name: 'The Steakhouse (Dinner)', category: 'Dining', avg: 145.00 }
  ];

  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  
  return {
    id: `merch_${generateId()}`,
    name: merchant.name,
    category: merchant.category,
    amountUSD: Number((merchant.avg + (Math.random() * 10 - 5)).toFixed(2))
  };
};