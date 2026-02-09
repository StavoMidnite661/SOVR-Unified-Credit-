export enum AppTab {
  TERMINAL = 'TERMINAL',
  GATEWAY = 'GATEWAY',
  HISTORY = 'HISTORY',
  LEDGER = 'LEDGER'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'CHAIN' | 'NORM' | 'STRIPE' | 'SYSTEM';
  message: string;
  hash?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface WalletState {
  address: string;
  sovrBalance: number;
  sfiatBalance: number; // Represents usdSOVR balance internally
  usdCreditBalance: number;
  isConnected: boolean;
}

export interface Transaction {
  id: string;
  type: 'SWAP' | 'NORMALIZE' | 'PAYMENT';
  description: string;
  amount: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  hash: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}