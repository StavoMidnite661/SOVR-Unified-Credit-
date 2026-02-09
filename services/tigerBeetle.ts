import { TBAccount, TBTransfer } from "../types";

/**
 * TigerBeetle Simulation Engine
 * In production, this would be replaced with:
 * import { createClient } from "@tigerbeetle/node";
 */

class TigerBeetleClient {
  private accounts = new Map<string, TBAccount>();
  private transfers: TBTransfer[] = [];

  constructor() {
    this.initSystemAccounts();
  }

  private initSystemAccounts() {
    // 1000: On-Chain Liquidity Pool (Asset)
    this.createAccount("1000", 1);
    // 2000: User Liabilities (Stablecoin Supply)
    this.createAccount("2000", 1);
    // 3000: Gateway Credit Pool (Asset/Internal)
    this.createAccount("3000", 1);
    // 4000: Merchant Revenue (Liability)
    this.createAccount("4000", 1);
  }

  createAccount(id: string, code: number): TBAccount {
    const account: TBAccount = {
      id,
      userData128: "0",
      ledger: 1,
      code,
      flags: 0,
      debits_pending: 0,
      debits_posted: 0,
      credits_pending: 0,
      credits_posted: 0,
    };
    this.accounts.set(id, account);
    return account;
  }

  getAccount(id: string): TBAccount | undefined {
    return this.accounts.get(id);
  }

  getAllAccounts(): TBAccount[] {
    return Array.from(this.accounts.values());
  }

  getAllTransfers(): TBTransfer[] {
    return [...this.transfers];
  }

  async createTransfers(transfers: Partial<TBTransfer>[]): Promise<string[]> {
    const ids: string[] = [];
    
    for (const t of transfers) {
      const debitAcc = this.accounts.get(t.debit_account_id!);
      const creditAcc = this.accounts.get(t.credit_account_id!);
      
      if (!debitAcc || !creditAcc) throw new Error("Account not found");

      const amount = t.amount || 0;
      
      // Update posted totals (TB is strictly additive)
      debitAcc.debits_posted += amount;
      creditAcc.credits_posted += amount;

      const newTransfer: TBTransfer = {
        id: Math.random().toString(36).substr(2, 9),
        debit_account_id: t.debit_account_id!,
        credit_account_id: t.credit_account_id!,
        amount,
        pending_id: "0",
        ledger: 1,
        code: t.code || 1,
        flags: 0,
        timestamp: Date.now(),
      };

      this.transfers.push(newTransfer);
      ids.push(newTransfer.id);
    }

    return ids;
  }
}

export const tigerBeetle = new TigerBeetleClient();