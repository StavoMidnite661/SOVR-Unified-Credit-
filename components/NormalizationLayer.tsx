import React, { useState } from 'react';
import { ArrowRight, Database, ShieldCheck, Lock, FileJson, Activity, Zap } from 'lucide-react';
import { WalletState } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface NormalizationLayerProps {
  wallet: WalletState;
  onBurn: (amount: number) => Promise<void>;
  isLoading: boolean;
}

const NormalizationLayer: React.FC<NormalizationLayerProps> = ({ wallet, onBurn, isLoading }) => {
  const [amount, setAmount] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const initiateBurn = () => {
    if (!amount || Number(amount) <= 0) return;
    setIsConfirmOpen(true);
  };

  const executeBurn = () => {
    onBurn(Number(amount));
    setAmount('');
    setIsConfirmOpen(false);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeBurn}
        title="Confirm Protocol Burn"
        message="Stablecoins will be permanently removed from circulation to create a verified ledger entry in TigerBeetle."
        confirmText="Burn Stablecoins"
        isDangerous={true}
        details={[
          { label: 'Asset to Burn', value: `${amount} usdSOVR`, highlight: true },
          { label: 'Ledger Entry', value: 'TigerBeetle ID: 5000' },
          { label: 'Action', value: 'Permanent Destruction' },
        ]}
      />

      <div className="h-full flex flex-col items-center justify-center p-2 lg:p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
        
        {/* Action Panel */}
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-visible hover-glow transition-all duration-500">
           {/* Background Decorative Glow (Matches CreditTerminal) */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-sovr-secondary/20 rounded-full blur-[80px] opacity-40 animate-pulse-slow pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sovr-primary/20 to-sovr-secondary/20 rounded-lg border border-white/10">
                   <FileJson className="w-5 h-5 text-sovr-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Burn & Ledger</h2>
                  <p className="text-[10px] text-sovr-muted uppercase tracking-wider">Stablecoin Destruction</p>
                </div>
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-mono text-sovr-success bg-sovr-success/10 px-2 py-1 rounded border border-sovr-success/20 animate-pulse-slow">
                <Zap className="w-3 h-3" />
                ACTIVE
             </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            {/* Balance Display Block */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 transition-all duration-300 hover:bg-black/60">
               <div className="flex justify-between text-xs text-sovr-muted mb-2">
                 <span className="font-medium">Available Balance</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-3xl font-mono text-sovr-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                    {wallet.sfiatBalance.toFixed(2)}
                 </span>
                 <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-sm"></div>
                    <span className="font-bold text-sm text-white">usdSOVR</span>
                 </div>
               </div>
            </div>

            {/* Input Block */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 transition-all duration-300 ease-out focus-within:border-sovr-primary/50 focus-within:bg-black/60 focus-within:scale-[1.02] focus-within:shadow-[0_0_20px_-5px_rgba(56,189,248,0.15)] group">
               <div className="flex justify-between text-xs text-sovr-muted mb-2">
                 <span className="font-medium text-sovr-muted group-focus-within:text-sovr-primary transition-colors duration-300">Amount to Burn</span>
               </div>
               <div className="flex items-center justify-between">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-3xl font-mono text-white outline-none w-full placeholder-white/20 transition-all"
                  />
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                    <span className="font-bold text-sm text-white">USD Credit</span>
                  </div>
               </div>
            </div>

             {/* Action Button */}
             <button 
                onClick={initiateBurn}
                disabled={isLoading || Number(amount) <= 0 || Number(amount) > wallet.sfiatBalance}
                className="group w-full mt-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                {isLoading ? (
                  <Activity className="w-5 h-5 animate-spin relative z-10" />
                ) : (
                  <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
                     Burn Stablecoins <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            
            <div className="mt-4 flex items-start gap-2 text-[10px] text-sovr-muted bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              <Activity className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
              <p>By clicking Burn, you are permanently destroying stablecoins to create a verifiable credit entry in the TigerBeetle ledger.</p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 relative mt-12">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-sovr-primary/30 to-transparent -translate-y-1/2 z-0"></div>

          {/* Step 1: Blockchain */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative hover-glow z-10 bg-black/60 transition-all duration-300 hover:scale-105 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sovr-secondary/10 to-transparent border border-sovr-secondary/30 flex items-center justify-center mb-5 text-sovr-secondary shadow-[0_0_15px_rgba(129,140,248,0.2)] transition-transform duration-500 group-hover:rotate-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">1. On-Chain Lock</h3>
            <p className="text-xs text-sovr-muted leading-relaxed">usdSOVR assets are securely locked in the Settlement Contract. An immutable burn event is emitted.</p>
          </div>

          {/* Step 2: Normalization */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative hover-glow z-10 border-sovr-primary/30 shadow-[0_0_30px_-10px_rgba(56,189,248,0.15)] bg-black/60 transition-all duration-300 hover:scale-105 group delay-100">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sovr-primary text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-cyan-400/20 group-hover:scale-110 transition-transform">
                Processing
             </div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sovr-primary/10 to-transparent border border-sovr-primary/30 flex items-center justify-center mb-5 text-sovr-primary shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">2. Normalization</h3>
            <p className="text-xs text-sovr-muted leading-relaxed">Oracle reads chain state. 1.0 usdSOVR is mathematically attested as $1.00 USD Credit.</p>
          </div>

          {/* Step 3: Off-Chain */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative hover-glow z-10 bg-black/60 transition-all duration-300 hover:scale-105 group delay-200">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-transform duration-500 group-hover:-rotate-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">3. USD Credit</h3>
            <p className="text-xs text-sovr-muted leading-relaxed">Credits are issued to the Gateway. Authorized for immediate Stripe processing.</p>
          </div>
        </div>

      </div>
    </>
  );
};

export default NormalizationLayer;