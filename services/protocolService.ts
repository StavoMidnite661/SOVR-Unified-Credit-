import { LogEntry, Transaction, MerchantRequest } from "../types";

// Protocol Registry for Tracking Status
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
  const startTime = txRegistry.get(hash);
  if (!startTime) return 'FAILED';

  // Standard Confirmation Logic (Simulated for Demo, would be publicClient.waitForTransactionReceipt)
  const elapsed = Date.now() - startTime;
  const confirmationTime = 3000;

  if (elapsed > confirmationTime) {
    return 'COMPLETED';
  }
  
  return 'PENDING';
};

export const getQuote = (amountIn: number, isSovrToFiat: boolean): number => {
  // Production Pricing Engine: In a real system, this fetches from Uniswap V3 Oracles
  const EXCHANGE_RATE = 2.50; 
  return isSovrToFiat ? amountIn * EXCHANGE_RATE : amountIn / EXCHANGE_RATE;
};

export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const createLog = (source: LogEntry['source'], message: string, type: LogEntry['type'] = 'info'): LogEntry => ({
  id: generateId(),
  timestamp: new Date().toISOString(),
  source,
  message,
  hash: source === 'CHAIN' ? generateHash() : undefined,
  type
});

// Production POS Signal Detection
export const detectMerchantSignal = async (mode: 'NFC' | 'QR'): Promise<MerchantRequest> => {
  // In production, this parses incoming NDEF or QR data
  await simulateDelay(1500);
  
  const merchants = [
    { name: 'The Steakhouse (Dinner)', category: 'Dining', avg: 145.00 },
    { name: 'Whole Foods Market', category: 'Grocery', avg: 85.00 },
    { name: 'Apple Store', category: 'Electronics', avg: 299.00 }
  ];

  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  
  return {
    id: `merch_${generateId()}`,
    name: merchant.name,
    category: merchant.category,
    amountUSD: Number((merchant.avg + (Math.random() * 10 - 5)).toFixed(2))
  };
};

export const authorizeStripePayment = async (amount: number, merchantId: string): Promise<{ clientSecret: string, id: string }> => {
  // This would be a real backend call to your server which talks to Stripe
  const id = `pi_${generateId()}`;
  registerTransaction(id);

  return {
    clientSecret: `pi_${generateId()}_secret_${generateId()}`,
    id: id
  };
};
