import React, { useState, useEffect } from 'react';
import { LayoutGrid, CreditCard, ArrowLeftRight, History, Wallet, Sparkles, ExternalLink, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, Database, TrendingUp, TrendingDown, ShieldCheck, Activity, Zap } from 'lucide-react';
import { AppTab, WalletState, LogEntry, Transaction, TBAccount, MerchantRequest } from './types';
import { createLog, processNormalization, authorizeStripePayment, simulateDelay, checkTransactionStatus, registerTransaction } from './services/mockBackend';
import { tigerBeetle } from './services/tigerBeetle';
import { performProtocolSwap, performNormalization, performPayment } from './services/productionMiddleware';
import CreditTerminal from './components/CreditTerminal';
import NormalizationLayer from './components/NormalizationLayer';
import SovrPay from './components/USDGateway';
import LogConsole from './components/LogConsole';
import AIAssistant from './components/AIAssistant';
import ManifestoModal from './components/ManifestoModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PAY);
  const [isLoading, setIsLoading] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  
  // App State
  const [logs, setLogs] = useState<LogEntry[]>([
    createLog('SYSTEM', 'TigerBeetle Node Initialized [Cluster: 0x1]'),
    createLog('TIGERBEETLE', 'Standard Chart of Accounts Deployed', 'success')
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tbAccounts, setTbAccounts] = useState<TBAccount[]>(tigerBeetle.getAllAccounts());
  
  const [wallet, setWallet] = useState<WalletState>({
    address: '0x71C...9A23',
    sovrBalance: 1500.00,
    sfiatBalance: 0.00, 
    usdCreditBalance: 0.00,
    isConnected: false
  });

  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const connectWallet = () => {
    setWallet(prev => ({ ...prev, isConnected: true }));
    addLog(createLog('SYSTEM', 'Wallet connected: 0x71C...9A23', 'success'));
  };

  // Polling for Pending Transactions & TB State Sync
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const pendingTxs = transactions.filter(tx => tx.status === 'PENDING');
      
      if (pendingTxs.length > 0) {
        const updatedTransactions = [...transactions];
        let updatesMade = false;

        for (const tx of pendingTxs) {
          try {
            const newStatus = await checkTransactionStatus(tx.hash);
            if (newStatus === 'COMPLETED') {
              const idx = updatedTransactions.findIndex(t => t.id === tx.id);
              if (idx !== -1) {
                updatedTransactions[idx] = { ...updatedTransactions[idx], status: 'COMPLETED' };
                updatesMade = true;
                addLog(createLog('TIGERBEETLE', `Transfer Committed: ${tx.tbTransferId}`, 'success'));
              }
            }
          } catch (e) {
            console.error("Poll error:", e);
          }
        }
        if (updatesMade) setTransactions(updatedTransactions);
      }

      // Sync TigerBeetle Accounts UI
      setTbAccounts(tigerBeetle.getAllAccounts());
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [transactions]);

  // --- ATOMIC PROTOCOL LOGIC (V2) ---
  const handleAtomicPayment = async (merchant: MerchantRequest, sovrCost: number): Promise<string> => {
    setIsLoading(true);
    const txId = `tx_atomic_${Date.now()}`;
    const sovrAmount = sovrCost;
    const usdAmount = merchant.amountUSD;

    try {
      if (wallet.sovrBalance < sovrAmount) throw new Error("Insufficient SOVR Balance");

      // 1. Swap SOVR -> sFIAT
      addLog(createLog('CHAIN', `Auto-Swap: ${sovrAmount.toFixed(4)} SOVR -> ${usdAmount.toFixed(2)} usdSOVR`, 'info'));
      await simulateDelay(800);
      const swapTxId = await performProtocolSwap(usdAmount, true); // True = SOVR to Fiat

      // 2. Normalize sFIAT -> Credit
      addLog(createLog('NORM', `Auto-Normalize: ${usdAmount.toFixed(2)} usdSOVR -> Credit`, 'info'));
      await simulateDelay(600);
      const normTxId = await performNormalization(usdAmount);

      // 3. Pay Merchant
      addLog(createLog('STRIPE', `Settling to ${merchant.name}...`, 'info'));
      const stripeRes = await authorizeStripePayment(usdAmount, merchant.name);
      const payTxId = await performPayment(usdAmount, merchant.name);

      // Update Wallet (Subtract SOVR, USD passes through)
      setWallet(prev => ({
        ...prev,
        sovrBalance: prev.sovrBalance - sovrAmount
      }));

      addTransaction({
        id: txId,
        type: 'ATOMIC_PAY',
        description: `Pay ${merchant.name}`,
        amount: `-${sovrAmount.toFixed(2)} SOVR`,
        status: 'PENDING',
        hash: stripeRes.id,
        tbTransferId: payTxId,
        timestamp: Date.now(),
        method: 'NFC'
      });

      addLog(createLog('SYSTEM', `Atomic Protocol Execution Complete.`, 'success'));
      setIsLoading(false);
      return stripeRes.id;

    } catch (e: any) {
      addLog(createLog('SYSTEM', `Atomic Fail: ${e.message}`, 'error'));
      setIsLoading(false);
      throw e;
    }
  };

  // --- LEGACY MANUAL ACTIONS ---
  const handleSwap = async (amountIn: number, isSovrToFiat: boolean) => {
    setIsLoading(true);
    addLog(createLog('CHAIN', `Processing Swap...`, 'info'));
    
    try {
      await simulateDelay(1000);
      const amountOut = isSovrToFiat ? amountIn * 2.5 : amountIn / 2.5;
      
      if (isSovrToFiat && wallet.sovrBalance < amountIn) throw new Error("Insufficient SOVR");
      if (!isSovrToFiat && wallet.sfiatBalance < amountIn) throw new Error("Insufficient usdSOVR");

      const transferId = await performProtocolSwap(amountOut, isSovrToFiat);
      const txHash = '0x' + Math.random().toString(16).substr(2, 40);
      registerTransaction(txHash);

      if (isSovrToFiat) {
        setWallet(prev => ({ ...prev, sovrBalance: prev.sovrBalance - amountIn, sfiatBalance: prev.sfiatBalance + amountOut }));
      } else {
        setWallet(prev => ({ ...prev, sfiatBalance: prev.sfiatBalance - amountIn, sovrBalance: prev.sovrBalance + amountOut }));
      }

      addTransaction({
        id: `tx_${Date.now()}`,
        type: 'SWAP',
        description: `Swap for ${isSovrToFiat ? 'usdSOVR' : 'SOVR'}`,
        amount: `${isSovrToFiat ? '+' : '-'}${amountOut.toFixed(2)} ${isSovrToFiat ? 'usdSOVR' : 'SOVR'}`,
        status: 'PENDING',
        hash: txHash,
        tbTransferId: transferId,
        timestamp: Date.now()
      });

      addLog(createLog('TIGERBEETLE', `Pending Transfer Batch: ${transferId}`, 'warning'));
    } catch (e: any) {
      addLog(createLog('CHAIN', `Swap failed: ${e.message}`, 'error'));
    }
    setIsLoading(false);
  };

  const tabs = [
    { id: AppTab.PAY, icon: Zap, label: 'Pay', desc: 'Protocol V2' },
    { id: AppTab.TERMINAL, icon: ArrowLeftRight, label: 'Terminal', desc: 'Manual Swap' },
    { id: AppTab.LEDGER, icon: Database, label: 'Ledger', desc: 'TigerBeetle' },
    { id: AppTab.HISTORY, icon: History, label: 'History', desc: 'Logs' },
  ];

  return (
    <div className="min-h-screen w-full relative bg-black font-sans selection:bg-sovr-primary/30 overflow-x-hidden overflow-y-auto">
      
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />

      {/* --- Aurora Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.15), transparent 70%), #000000" }} />
      
      {/* Top Navbar */}
      <header className="relative z-50 h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowManifesto(true)}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sovr-primary to-sovr-secondary rounded-lg blur opacity-40 animate-pulse-slow"></div>
            <div className="relative w-10 h-10 bg-black border border-white/10 rounded-lg flex items-center justify-center font-bold text-sovr-text">
              <Sparkles className="w-5 h-5 text-sovr-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-white">SOVR <span className="text-sovr-primary/80 font-normal">Protocol</span></h1>
            <span className="text-[10px] text-sovr-muted uppercase tracking-[0.2em]">Atomic V2 Enabled</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] text-sovr-muted uppercase">TB Sync Status</span>
             <span className="font-mono text-sovr-success text-xs flex items-center gap-1">
               <div className="w-1 h-1 bg-sovr-success rounded-full animate-pulse"></div> 0.2ms Latency
             </span>
           </div>
           {!wallet.isConnected ? (
             <button onClick={connectWallet} className="glass-panel px-6 py-2 rounded-full text-sm font-medium text-sovr-primary border-sovr-primary/20 hover:border-sovr-primary/50 transition-all">
               Connect Node
             </button>
           ) : (
             <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 group hover:border-sovr-primary/40 transition-all cursor-pointer">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="font-mono text-xs text-sovr-muted group-hover:text-white transition-colors">{wallet.address}</span>
             </div>
           )}
        </div>
      </header>

      <main className="relative z-40 container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-5rem)] h-auto pb-32 lg:pb-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 order-2 lg:order-1 animate-in slide-in-from-left-4 duration-500">
           <nav className="flex flex-col gap-2">
             {tabs.map((item) => (
               <button key={item.id} onClick={() => setActiveTab(item.id)}
                 className={`flex items-start gap-4 px-5 py-4 rounded-xl text-left transition-all border group ${activeTab === item.id ? 'glass-panel border-sovr-primary/30 bg-sovr-primary/5 shadow-lg translate-x-1' : 'border-transparent hover:bg-white/5 text-sovr-muted hover:translate-x-1'}`}
               >
                 <item.icon className={`w-4 h-4 mt-1 transition-colors ${activeTab === item.id ? 'text-sovr-primary' : 'group-hover:text-white'}`} />
                 <div>
                   <div className={`text-sm font-medium transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-white'}`}>{item.label}</div>
                   <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                 </div>
               </button>
             ))}
           </nav>

           <div className="mt-auto glass-panel rounded-2xl p-6 hover-glow transition-all">
             <div className="flex items-center gap-2 text-sovr-muted text-[10px] uppercase font-bold mb-6 tracking-wider">
               <Database className="w-3 h-3 text-sovr-primary" /> Real-Time Liquidity
             </div>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs text-sovr-muted mb-1"><span>usdSOVR Pool</span><span>100% Solvent</span></div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-sovr-primary w-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div></div>
               </div>
               <div className="pt-4 border-t border-white/5 space-y-2">
                 <div className="flex justify-between text-xs"><span className="text-sovr-muted">Credit Balance</span><span className="text-white font-mono">${wallet.usdCreditBalance.toFixed(2)}</span></div>
                 <div className="flex justify-between text-xs"><span className="text-sovr-muted">Wallet (usdSOVR)</span><span className="text-white font-mono">{wallet.sfiatBalance.toFixed(2)}</span></div>
                 <div className="flex justify-between text-xs"><span className="text-sovr-muted">Wallet (SOVR)</span><span className="text-white font-mono">{wallet.sovrBalance.toFixed(2)}</span></div>
               </div>
             </div>
           </div>
        </aside>

        {/* Main Content Viewport */}
        <section className="lg:col-span-6 flex flex-col order-1 lg:order-2 min-h-[500px]">
           <div className="flex-1 relative">
              {activeTab === AppTab.PAY && <SovrPay wallet={wallet} onAtomicPayment={handleAtomicPayment} isLoading={isLoading} />}
              {activeTab === AppTab.TERMINAL && <CreditTerminal wallet={wallet} onSwap={handleSwap} isLoading={isLoading} />}
              
              {activeTab === AppTab.LEDGER && (
                <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden animate-in fade-in duration-500">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2 tracking-tight"><Database className="w-5 h-5 text-sovr-primary" /> System Ledger</h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-sovr-muted uppercase tracking-widest">TigerBeetle DB (Simulated)</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {tbAccounts.map(acc => (
                      <div key={acc.id} className="glass-panel p-4 rounded-xl border border-white/5 group hover:border-sovr-primary/20 transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sovr-primary/10 flex items-center justify-center text-sovr-primary font-bold">{acc.id}</div>
                            <div>
                              <div className="text-xs font-bold text-white uppercase tracking-wider">
                                {acc.id === "1000" && "Liquidity Pool"}
                                {acc.id === "2000" && "User Stablecoin Liabilities"}
                                {acc.id === "3000" && "Gateway Credit Reserves"}
                                {acc.id === "4000" && "Merchant Revenue"}
                              </div>
                              <div className="text-[10px] text-sovr-muted">Account Code: {acc.code}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-sovr-muted uppercase tracking-tighter">Net Balance</div>
                            <div className="font-mono text-sm text-white">${((acc.credits_posted - acc.debits_posted) / 100).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div>
                            <div className="text-[9px] text-sovr-muted uppercase mb-1">Total Debits</div>
                            <div className="text-xs text-red-400 font-mono">${(acc.debits_posted / 100).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-sovr-muted uppercase mb-1">Total Credits</div>
                            <div className="text-xs text-emerald-400 font-mono">${(acc.credits_posted / 100).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === AppTab.HISTORY && (
                 <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden animate-in fade-in duration-500">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                       <h3 className="font-bold text-white flex items-center gap-2 tracking-tight"><History className="w-5 h-5 text-sovr-primary" /> Immutable Ledger</h3>
                       <div className="flex items-center gap-2 text-[10px] font-mono text-sovr-success">
                          <div className="w-1.5 h-1.5 bg-sovr-success rounded-full animate-pulse"></div> SYNCED
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th className="p-4 text-[10px] uppercase font-bold text-sovr-muted tracking-wider border-b border-white/5">Event</th>
                            <th className="p-4 text-[10px] uppercase font-bold text-sovr-muted tracking-wider border-b border-white/5">Status</th>
                            <th className="p-4 text-[10px] uppercase font-bold text-sovr-muted tracking-wider border-b border-white/5">Amount</th>
                            <th className="p-4 text-[10px] uppercase font-bold text-sovr-muted tracking-wider border-b border-white/5 hidden sm:table-cell">Hash</th>
                            <th className="p-4 text-[10px] uppercase font-bold text-sovr-muted tracking-wider border-b border-white/5 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-white/5 transition-colors duration-200">
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-white group-hover:text-sovr-primary transition-colors">{tx.type}</span>
                                  <span className="text-[10px] text-sovr-muted">{tx.description}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
                                    tx.status === 'COMPLETED' ? 'bg-sovr-success/10 text-sovr-success border-sovr-success/20' :
                                    tx.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                   {tx.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                   {tx.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                                   {tx.status === 'PENDING' && <Loader2 className="w-3 h-3 animate-spin" />}
                                   {tx.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`font-mono text-xs font-medium ${
                                    tx.status === 'FAILED' ? 'text-sovr-muted line-through opacity-60' :
                                    tx.amount.startsWith('+') ? 'text-sovr-success' : 
                                    tx.amount.startsWith('-') ? 'text-red-400' : 'text-white'
                                }`}>
                                  {tx.amount}
                                </span>
                              </td>
                              <td className="p-4 hidden sm:table-cell">
                                <div className="flex items-center gap-2 text-sovr-muted group-hover:text-white transition-colors cursor-pointer">
                                  <span className="font-mono text-[10px] opacity-70">{tx.hash.substring(0, 10)}...</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-sovr-muted">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[10px]">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {transactions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-12 text-center text-sovr-muted opacity-50 text-xs italic">
                                No cryptographic evidence found on this cluster.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
              )}
           </div>
        </section>

        {/* Right Console Logging */}
        <section className="lg:col-span-3 h-[300px] lg:h-auto animate-in slide-in-from-right-4 duration-500 delay-100 order-3">
          <LogConsole logs={logs} />
        </section>

      </main>

      <AIAssistant />

      {/* Mobile Navigation Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <div className="flex items-center gap-1 p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative p-3 rounded-full transition-all duration-300 group ${
                activeTab === item.id ? 'text-white' : 'text-sovr-muted'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-sovr-primary/10 rounded-full animate-in zoom-in-50 duration-300"></div>
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''}`} />
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
};

export default App;