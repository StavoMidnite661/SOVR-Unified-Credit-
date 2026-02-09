export enum AppTab {
  PAY = 'PAY',
  TERMINAL = 'TERMINAL',
  HISTORY = 'HISTORY',
  LEDGER = 'LEDGER'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'CHAIN' | 'NORM' | 'STRIPE' | 'SYSTEM' | 'TIGERBEETLE' | 'NFC' | 'QR';
  message: string;
  hash?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface WalletState {
  address: string;
  sovrBalance: number;
  sfiatBalance: number; 
  usdCreditBalance: number;
  isConnected: boolean;
}

// TigerBeetle Specific Types
export interface TBAccount {
  id: string;
  userData128: string;
  ledger: number;
  code: number;
  flags: number;
  debits_pending: number;
  debits_posted: number;
  credits_pending: number;
  credits_posted: number;
}

export interface TBTransfer {
  id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  pending_id: string;
  ledger: number;
  code: number;
  flags: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'SWAP' | 'NORMALIZE' | 'PAYMENT' | 'ATOMIC_PAY';
  description: string;
  amount: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  hash: string;
  timestamp: number;
  tbTransferId?: string;
  method?: 'NFC' | 'QR' | 'MANUAL';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MerchantRequest {
  id: string;
  name: string;
  amountUSD: number;
  category: string;
}