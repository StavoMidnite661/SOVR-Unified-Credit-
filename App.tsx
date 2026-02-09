import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, CreditCard, ArrowLeftRight, History, Wallet, Sparkles, ExternalLink, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AppTab, WalletState, LogEntry, Transaction } from './types';
import { createLog, processNormalization, authorizeStripePayment, simulateDelay, checkTransactionStatus, registerTransaction } from './services/mockBackend';
import CreditTerminal from './components/CreditTerminal';
import NormalizationLayer from './components/NormalizationLayer';
import USDGateway from './components/USDGateway';
import LogConsole from './components/LogConsole';
import AIAssistant from './components/AIAssistant';
import ManifestoModal from './components/ManifestoModal';

// Helper component for smooth number transitions
const AnimatedNumber = ({ value, prefix = '', className = '' }: { value: number; prefix?: string; className?: string }) => {
  const [display, setDisplay] = useState(value);

  React.useEffect(() => {
    let startTimestamp: number;
    const startValue = display;
    const endValue = value;
    const duration = 800; // 0.8s animation

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = startValue + (endValue - startValue) * ease;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <span className={className}>{prefix}{display.toFixed(2)}</span>;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TERMINAL);
  const [isLoading, setIsLoading] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  
  // App State
  const [logs, setLogs] = useState<LogEntry[]>([
    createLog('SYSTEM', 'SOVR Protocol v2.0 "Aurora" Initialized'),
    createLog('CHAIN', 'Connected to Base Chain RPC')
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_init_01',
      type: 'SWAP',
      description: 'Initial Liquidity Provision',
      amount: '1000.00 SOVR',
      status: 'COMPLETED',
      hash: '0x71...9A23',
      timestamp: Date.now() - 10000000
    }
  ]);
  
  const [wallet, setWallet] = useState<WalletState>({
    address: '0x71C...9A23',
    sovrBalance: 1500.00,
    sfiatBalance: 0.00, // This is usdSOVR
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

  // --- Polling Mechanism for Pending Transactions ---
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const pendingTxs = transactions.filter(tx => tx.status === 'PENDING');
      
      if (pendingTxs.length === 0) return;

      let updatesMade = false;
      const updatedTransactions = [...transactions];

      for (const tx of pendingTxs) {
        try {
          // Check backend for status update
          const newStatus = await checkTransactionStatus(tx.hash);
          
          if (newStatus === 'COMPLETED') {
            const index = updatedTransactions.findIndex(t => t.id === tx.id);
            if (index !== -1) {
              updatedTransactions[index] = { ...updatedTransactions[index], status: 'COMPLETED' };
              updatesMade = true;
              
              // Add confirmation log
              let source: LogEntry['source'] = 'CHAIN';
              if (tx.type === 'NORMALIZE') source = 'NORM';
              if (tx.type === 'PAYMENT') source = 'STRIPE';
              
              addLog(createLog(source, `Transaction Confirmed: ${tx.description}`, 'success'));
            }
          }
        } catch (error) {
           console.error("Polling error for tx:", tx.id);
        }
      }

      if (updatesMade) {
        setTransactions(updatedTransactions);
      }

    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [transactions]);


  // Actions
  const handleSwap = async (amountIn: number, isSovrToFiat: boolean) => {
    setIsLoading(true);
    const fromToken = isSovrToFiat ? 'SOVR' : 'usdSOVR';
    const toToken = isSovrToFiat ? 'usdSOVR' : 'SOVR';
    
    // Simulate signing delay
    addLog(createLog('CHAIN', `Signing swap: ${amountIn} ${fromToken}...`, 'info'));
    await simulateDelay(1000);

    // Initial Checks
    if (isSovrToFiat && wallet.sovrBalance < amountIn) {
        addLog(createLog('CHAIN', 'Swap rejected: Insufficient balance', 'error'));
        setIsLoading(false);
        return;
    }
    if (!isSovrToFiat && wallet.sfiatBalance < amountIn) {
        addLog(createLog('CHAIN', 'Swap rejected: Insufficient balance', 'error'));
        setIsLoading(false);
        return;
    }

    // Determine values
    const amountOut = isSovrToFiat ? amountIn * 2.5 : amountIn / 2.5;
    
    // Generate Hash & Register for Polling
    const txHash = '0x' + Math.random().toString(16).substr(2, 40);
    registerTransaction(txHash);

    // Optimistic UI Update (Balances)
    if (isSovrToFiat) {
        setWallet(prev => ({
            ...prev,
            sovrBalance: prev.sovrBalance - amountIn,
            sfiatBalance: prev.sfiatBalance + amountOut
        }));
    } else {
         setWallet(prev => ({
            ...prev,
            sfiatBalance: prev.sfiatBalance - amountIn,
            sovrBalance: prev.sovrBalance + amountOut
        }));
    }

    // Add Pending Transaction
    addTransaction({
        id: `tx_${Date.now()}`,
        type: 'SWAP',
        description: `Swap ${fromToken} to ${toToken}`,
        amount: `+${amountOut.toFixed(2)} ${toToken}`,
        status: 'PENDING',
        hash: txHash,
        timestamp: Date.now()
    });

    addLog(createLog('CHAIN', `Transaction Broadcasted: ${txHash.substring(0, 10)}...`, 'warning'));
    setIsLoading(false);
  };

  const handleNormalize = async (amount: number) => {
    setIsLoading(true);
    addLog(createLog('NORM', `Requesting normalization for ${amount.toFixed(2)} usdSOVR...`, 'info'));

    try {
        // Validation
        if (amount > wallet.sfiatBalance) throw new Error("Insufficient Balance");

        // Optimistic Balance Update
        setWallet(prev => ({ ...prev, sfiatBalance: prev.sfiatBalance - amount }));
        
        // Call backend to start process
        const result = await processNormalization(amount, wallet.address);
        
        // Update credit balance immediately for UX (or we could wait for polling)
        // For this demo, we update credit immediately but keep transaction pending on ledger
        setWallet(prev => ({ ...prev, usdCreditBalance: prev.usdCreditBalance + result.usdValue }));
        
        addLog(createLog('SYSTEM', `Credits Issued (Optimistic). Waiting for finality...`, 'info'));
        
        addTransaction({
            id: `tx_${Date.now()}`,
            type: 'NORMALIZE',
            description: 'Normalize usdSOVR to Credit',
            amount: `$${amount.toFixed(2)} USD`,
            status: 'PENDING',
            hash: result.attestationId,
            timestamp: Date.now()
        });
    } catch (e) {
        addLog(createLog('NORM', 'Normalization failed', 'error'));
    }

    setIsLoading(false);
  };

  const handleStripeAuth = async (amount: number, merchantId: string) => {
    setIsLoading(true);
    addLog(createLog('STRIPE', `Creating PaymentIntent for ${merchantId}...`, 'info'));
    
    try {
        const result = await authorizeStripePayment(amount, merchantId);
        
        // If we get here, the "API call" was successful, but settlements take time
        addLog(createLog('STRIPE', `Payment Authorized. ID: ${result.id}`, 'info'));
        setWallet(prev => ({ ...prev, usdCreditBalance: prev.usdCreditBalance - amount }));
        
        addTransaction({
            id: `tx_${Date.now()}`,
            type: 'PAYMENT',
            description: `Payment to ${merchantId}`,
            amount: `-$${amount.toFixed(2)} USD`,
            status: 'PENDING', // Gateway settlements are pending
            hash: result.id,
            timestamp: Date.now()
        });
    } catch (e: any) {
        addLog(createLog('STRIPE', `Authorization failed: ${e.message}`, 'error'));
        
        addTransaction({
            id: `tx_${Date.now()}`,
            type: 'PAYMENT',
            description: `Payment to ${merchantId}`,
            amount: `-$${amount.toFixed(2)} USD`,
            status: 'FAILED',
            hash: 'pi_failed_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now()
        });
        
        throw e;
    } finally {
        setIsLoading(false);
    }
  };

  const tabs = [
    { id: AppTab.TERMINAL, icon: ArrowLeftRight, label: 'Terminal', desc: 'Swap' },
    { id: AppTab.LEDGER, icon: LayoutGrid, label: 'Ledger', desc: 'Mint' },
    { id: AppTab.GATEWAY, icon: CreditCard, label: 'Gateway', desc: 'Pay' },
    { id: AppTab.HISTORY, icon: History, label: 'History', desc: 'Logs' },
  ];

  return (
    <div className="min-h-screen w-full relative bg-black font-sans selection:bg-sovr-primary/30 overflow-x-hidden overflow-y-auto">
      
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />

      {/* --- Aurora Background --- */}
      <div
        className="absolute inset-0 z-0 pointer-events-none fixed"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.15), transparent 70%), #000000",
        }}
      />
      {/* Floating Particles/Stars */}
      <div className="absolute top-20 left-10 w-1 h-1 bg-white/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-2 h-2 bg-blue-400/10 rounded-full animate-float-delayed"></div>
      
      {/* Top Navbar */}
      <header className="relative z-50 h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 transition-all duration-300">
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => setShowManifesto(true)}
        >
          <div className="relative group-hover:scale-105 transition-transform duration-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-sovr-primary to-sovr-secondary rounded-lg blur opacity-40 animate-pulse-slow"></div>
            <div className="relative w-10 h-10 bg-black border border-white/10 rounded-lg flex items-center justify-center font-bold text-sovr-text">
              <Sparkles className="w-5 h-5 text-sovr-primary group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg tracking-wide text-white group-hover:text-sovr-primary transition-colors duration-300">SOVR <span className="text-sovr-primary/80 font-normal">Protocol</span></h1>
            <span className="text-[10px] text-sovr-muted uppercase tracking-[0.2em]">Unified Credit System</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
           <div className="flex flex-col items-end group cursor-default">
             <span className="text-[10px] text-sovr-muted uppercase tracking-wider group-hover:text-sovr-primary transition-colors">SOVR Price</span>
             <span className="font-mono text-white text-base shadow-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-110 origin-right transition-transform duration-300">$2.50</span>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <div className="flex flex-col items-end group cursor-default">
             <span className="text-[10px] text-sovr-muted uppercase tracking-wider group-hover:text-sovr-success transition-colors">Network Gas</span>
             <span className="font-mono text-sovr-success group-hover:scale-110 origin-right transition-transform duration-300">0.001 Gwei</span>
           </div>
        </div>

        <div>
          {!wallet.isConnected ? (
            <button 
              onClick={connectWallet}
              className="relative group overflow-hidden px-6 py-2.5 rounded-full hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sovr-primary to-sovr-secondary opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border border-white/10 rounded-full"></div>
              <span className="relative text-sm font-medium text-sovr-primary group-hover:text-white transition-colors">Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full hover:border-sovr-primary/30 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]">
               <div className="relative">
                 <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[2px] opacity-50 animate-pulse"></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full relative z-10"></div>
               </div>
               <span className="font-mono text-xs text-sovr-muted group-hover:text-white transition-colors">{wallet.address}</span>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-40 container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-5rem)] h-auto pb-32 lg:pb-6">
        
        {/* Left: Navigation & Stats - HIDDEN ON MOBILE */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 animate-in slide-in-from-left-4 duration-500 order-2 lg:order-1">
           <nav className="flex flex-col gap-2">
             {tabs.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`flex items-start gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 border group ${
                   activeTab === item.id 
                     ? 'glass-panel border-sovr-primary/30 bg-sovr-primary/5 shadow-[0_0_20px_-5px_rgba(56,189,248,0.1)] translate-x-2' 
                     : 'border-transparent hover:bg-white/5 text-sovr-muted hover:translate-x-1'
                 }`}
               >
                 <div className={`mt-1 p-2 rounded-lg transition-colors duration-300 ${activeTab === item.id ? 'bg-sovr-primary/20 text-sovr-primary' : 'bg-white/5 text-sovr-muted group-hover:text-white'}`}>
                   <item.icon className="w-4 h-4" />
                 </div>
                 <div>
                   <div className={`text-sm font-medium transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-sovr-muted group-hover:text-white'}`}>
                     {item.label}
                   </div>
                   <div className="text-[10px] text-sovr-muted/70 mt-0.5">{item.desc}</div>
                 </div>
               </button>
             ))}
           </nav>

           <div className="mt-auto glass-panel rounded-2xl p-6 relative overflow-hidden group hover-glow hidden lg:block transition-all duration-300 hover:scale-[1.02]">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Wallet className="w-24 h-24 -mr-8 -mt-8 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
             </div>
             
             <div className="flex items-center gap-2 text-sovr-muted text-xs uppercase font-bold tracking-wider mb-6">
               <span className="w-1 h-4 bg-sovr-primary rounded-full"></span>
               Asset Overview
             </div>
             
             <div className="space-y-5 relative z-10">
               <div className="flex justify-between items-end group/item hover:translate-x-1 transition-transform duration-200">
                 <span className="text-sm text-sovr-muted">SOVR Token</span>
                 <AnimatedNumber value={wallet.sovrBalance} className="font-mono text-lg text-white" />
               </div>
               <div className="flex justify-between items-end group/item hover:translate-x-1 transition-transform duration-200 delay-75">
                 <span className="text-sm text-sovr-muted">usdSOVR Stable</span>
                 <AnimatedNumber value={wallet.sfiatBalance} className="font-mono text-lg text-sovr-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-between items-end group/item hover:translate-x-1 transition-transform duration-200 delay-100">
                 <span className="text-sm text-emerald-400 font-medium">USD Credit</span>
                 <AnimatedNumber value={wallet.usdCreditBalance} prefix="$" className="font-mono text-xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
               </div>
             </div>
           </div>
        </aside>

        {/* Center: Main Viewport */}
        <section className="lg:col-span-6 flex flex-col order-1 lg:order-2">
           <div className="flex-1 relative">
              {activeTab === AppTab.TERMINAL && (
                <CreditTerminal 
                    wallet={wallet} 
                    onSwap={handleSwap} 
                    isLoading={isLoading} 
                />
              )}
              {activeTab === AppTab.LEDGER && (
                <NormalizationLayer 
                    wallet={wallet} 
                    onNormalize={handleNormalize} 
                    isLoading={isLoading} 
                />
              )}
              {activeTab === AppTab.GATEWAY && (
                <USDGateway 
                    wallet={wallet} 
                    onAuthorize={handleStripeAuth} 
                    isLoading={isLoading} 
                />
              )}
              {activeTab === AppTab.HISTORY && (
                <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden animate-in fade-in duration-500">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white/5 rounded-lg">
                             <History className="w-5 h-5 text-sovr-primary" />
                           </div>
                           <div>
                             <h3 className="text-lg font-bold text-white">Immutable Ledger</h3>
                             <p className="text-xs text-sovr-muted">Base Network • Confirmed Transactions</p>
                           </div>
                        </div>
                        <div className="px-3 py-1 bg-sovr-success/10 border border-sovr-success/20 rounded-full flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-sovr-success rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-bold text-sovr-success uppercase tracking-wider">Synced</span>
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
                                    tx.amount.startsWith('-') ? 'text-sovr-secondary' : 'text-white'
                                }`}>
                                  {tx.amount}
                                </span>
                              </td>
                              <td className="p-4 hidden sm:table-cell">
                                <div className="flex items-center gap-2 text-sovr-muted group-hover:text-white transition-colors">
                                  <span className="font-mono text-[10px] opacity-70">{tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}</span>
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
                              <td colSpan={5} className="p-12 text-center text-sovr-muted opacity-50">
                                No transactions recorded on this node.
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

        {/* Right: Logs */}
        <section className="lg:col-span-3 h-[300px] lg:h-auto animate-in slide-in-from-right-4 duration-500 delay-100 order-3">
          <LogConsole logs={logs} />
        </section>

      </main>

      <AIAssistant />

      {/* Mobile Bottom Navigation - Floating Dock Style */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/5 animate-in slide-in-from-bottom-16 duration-700">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative p-3.5 rounded-full transition-all duration-300 group flex flex-col items-center justify-center min-w-[3.5rem] ${
                activeTab === item.id 
                  ? 'text-white' 
                  : 'text-sovr-muted hover:text-white'
              }`}
            >
              {/* Active Glow Indicator - Subtle & Tight */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${activeTab === item.id ? 'bg-gradient-to-tr from-sovr-primary/20 to-sovr-secondary/10 opacity-100' : 'opacity-0'}`}></div>
              
              {activeTab === item.id && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-sovr-primary rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"></div>
              )}

              <item.icon 
                className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                    : 'group-hover:scale-110'
                }`} 
              />
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
};

export default App;