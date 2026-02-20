import React, { useState, useEffect } from 'react';
import { ArrowDownUp, RefreshCw, Wallet, Cpu, Zap } from 'lucide-react';
import { WalletState } from '../types';
import { getQuote, simulateDelay, ROUTER_ADDRESS } from '../services/protocolService';
import ConfirmationModal from './ConfirmationModal';

interface CreditTerminalProps {
  wallet: WalletState;
  onSwap: (amountIn: number, isSovrToFiat: boolean) => Promise<void>;
  isLoading: boolean;
}

const CreditTerminal: React.FC<CreditTerminalProps> = ({ wallet, onSwap, isLoading }) => {
  const [isSovrToFiat, setIsSovrToFiat] = useState(true);
  const [amountIn, setAmountIn] = useState<string>('10');
  const [quote, setQuote] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountIn || isNaN(Number(amountIn))) return;
      setCalculating(true);
      await simulateDelay(400); // Simulate RPC delay
      const q = getQuote(Number(amountIn), isSovrToFiat);
      setQuote(q);
      setCalculating(false);
    };
    fetchQuote();
  }, [amountIn, isSovrToFiat]);

  const initiateSwap = () => {
    if (!wallet.isConnected) return;
    if (!amountIn || Number(amountIn) <= 0) return;
    setIsConfirmOpen(true);
  };

  const executeSwap = () => {
    onSwap(Number(amountIn), isSovrToFiat);
  };

  const handleSwitch = () => {
    setIsSovrToFiat(!isSovrToFiat);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeSwap}
        title="Confirm Token Swap"
        message="You are about to interact with the SOVR V3 Router. Please review the details below."
        confirmText="Execute Swap"
        details={[
          { label: 'Spending', value: `${amountIn} ${isSovrToFiat ? 'SOVR' : 'usdSOVR'}`, highlight: true },
          { label: 'Receiving (Est.)', value: `${quote.toFixed(2)} ${isSovrToFiat ? 'usdSOVR' : 'SOVR'}` },
          { label: 'Router', value: `${ROUTER_ADDRESS.substring(0, 6)}...${ROUTER_ADDRESS.substring(38)}` },
          { label: 'Network Cost', value: '~ $0.0004' },
        ]}
      />

      <div className="h-full flex flex-col items-center justify-center p-2 lg:p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-visible hover-glow transition-all duration-500">
          
          {/* Background Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-sovr-secondary/20 rounded-full blur-[80px] opacity-40 animate-pulse-slow pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-sovr-primary/20 rounded-full blur-[80px] opacity-40 animate-pulse-slow pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sovr-primary/20 to-sovr-secondary/20 rounded-lg border border-white/10">
                 <Cpu className="w-5 h-5 text-sovr-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Credit Terminal</h2>
                <p className="text-[10px] text-sovr-muted uppercase tracking-wider">Base Network • V3 Router</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-sovr-success bg-sovr-success/10 px-2 py-1 rounded border border-sovr-success/20 animate-pulse-slow">
              <Zap className="w-3 h-3" />
              CONNECTED
            </div>
          </div>

          {/* Input Field - With Focus Micro-animation */}
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-2 relative z-10 transition-all duration-300 ease-out focus-within:border-sovr-primary/50 focus-within:bg-black/60 focus-within:scale-[1.02] focus-within:shadow-[0_0_20px_-5px_rgba(56,189,248,0.15)] group">
            <div className="flex justify-between text-xs text-sovr-muted mb-2">
              <span className="font-medium text-sovr-muted group-focus-within:text-sovr-primary transition-colors duration-300">You Pay</span>
              <span>Bal: <span className="text-white font-mono transition-colors duration-300 group-focus-within:text-sovr-primary">{isSovrToFiat ? wallet.sovrBalance.toFixed(2) : wallet.sfiatBalance.toFixed(2)}</span></span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="bg-transparent text-3xl font-mono text-white outline-none w-full placeholder-white/20 transition-all"
                placeholder="0.00"
              />
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0 group-focus-within:border-white/20 transition-colors">
                 {isSovrToFiat ? (
                   <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sovr-primary to-sovr-secondary shadow-sm"></div>
                 ) : (
                   <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-sm"></div>
                 )}
                <span className="font-bold text-sm text-white">
                  {isSovrToFiat ? 'SOVR' : 'usdSOVR'}
                </span>
              </div>
            </div>
          </div>

          {/* Switcher - With Rotation Animation */}
          <div className="flex justify-center -my-5 relative z-20">
            <button 
              onClick={handleSwitch}
              className="group bg-[#0f172a] border border-white/10 p-2.5 rounded-xl text-sovr-primary hover:text-white hover:border-sovr-primary/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <ArrowDownUp className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>

          {/* Output Field - With Focus Micro-animation */}
          <div className="bg-black/40 rounded-xl p-4 pt-6 border border-white/5 mt-2 relative z-10 transition-all duration-300 ease-out focus-within:border-sovr-secondary/50 focus-within:bg-black/60 focus-within:scale-[1.02] focus-within:shadow-[0_0_20px_-5px_rgba(129,140,248,0.15)]">
            <div className="flex justify-between text-xs text-sovr-muted mb-2">
              <span>You Receive</span>
              <span>Bal: <span className="text-white font-mono">{isSovrToFiat ? wallet.sfiatBalance.toFixed(2) : wallet.sovrBalance.toFixed(2)}</span></span>
            </div>
            <div className="flex items-center justify-between">
              {calculating ? (
                <div className="animate-pulse h-9 w-32 bg-white/10 rounded"></div>
              ) : (
                <span className="text-3xl font-mono text-sovr-success drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] animate-in fade-in zoom-in-95 duration-200 key={quote}">
                  {quote.toFixed(2)}
                </span>
              )}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                 {!isSovrToFiat ? (
                   <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sovr-primary to-sovr-secondary shadow-sm"></div>
                 ) : (
                   <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-sm"></div>
                 )}
                <span className="font-bold text-sm text-white">
                  {isSovrToFiat ? 'usdSOVR' : 'SOVR'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 text-xs space-y-2 relative z-10 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sovr-muted">
              <span>Exchange Rate</span>
              <span className="font-mono text-white">1 SOVR ≈ 2.50 USDC</span>
            </div>
            <div className="flex justify-between items-center text-sovr-muted">
               <span className="flex items-center gap-1">Router Address <span className="w-1 h-1 bg-sovr-success rounded-full"></span></span>
              <span className="font-mono text-[10px] bg-black/30 px-2 py-0.5 rounded">{ROUTER_ADDRESS.substring(0, 8)}...{ROUTER_ADDRESS.substring(ROUTER_ADDRESS.length - 6)}</span>
            </div>
            <div className="w-full h-px bg-white/5 my-2"></div>
            <div className="flex justify-between text-sovr-primary">
              <span>Network Fee (Est.)</span>
              <span className="font-mono">$0.0004</span>
            </div>
          </div>

          {/* Action Button - With Hover Fill Animation */}
          <button
            onClick={initiateSwap}
            disabled={isLoading || !wallet.isConnected}
            className="group w-full mt-6 bg-gradient-to-r from-sovr-primary to-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
            ) : wallet.isConnected ? (
              <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">Execute Swap <ArrowDownUp className="w-4 h-4" /></span>
            ) : (
              <span className="relative z-10 flex items-center gap-2"><Wallet className="w-4 h-4" /> Connect Wallet</span>
            )}
          </button>

        </div>
      </div>
    </>
  );
};

export default CreditTerminal;