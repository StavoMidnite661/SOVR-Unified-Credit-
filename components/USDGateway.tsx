import React, { useState, useEffect } from 'react';
import { Wifi, QrCode, Scan, CreditCard, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Zap, X } from 'lucide-react';
import { WalletState, MerchantRequest } from '../types';
import { detectMerchantSignal } from '../services/mockBackend';
import ConfirmationModal from './ConfirmationModal';

interface SovrPayProps {
  wallet: WalletState;
  onAtomicPayment: (merchant: MerchantRequest, sovrCost: number) => Promise<string>;
  isLoading: boolean;
}

const SovrPay: React.FC<SovrPayProps> = ({ wallet, onAtomicPayment, isLoading }) => {
  const [mode, setMode] = useState<'NFC' | 'QR'>('NFC');
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'DETECTED' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [merchantData, setMerchantData] = useState<MerchantRequest | null>(null);
  const [sovrQuote, setSovrQuote] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Reset state when switching modes
  useEffect(() => {
    if (status === 'SUCCESS' || status === 'DETECTED') {
      setStatus('IDLE');
      setMerchantData(null);
    }
  }, [mode]);

  const startScan = async () => {
    setStatus('SCANNING');
    try {
      const data = await detectMerchantSignal(mode);
      setMerchantData(data);
      
      // Calculate SOVR needed: (USD Amount / 2.5) roughly, utilizing backend quote logic
      const estimatedSovr = data.amountUSD / 2.5 * 1.01; // Adding 1% buffer
      setSovrQuote(estimatedSovr);
      
      setStatus('DETECTED');
    } catch (e) {
      setStatus('IDLE');
    }
  };

  const handleApprove = () => {
    setIsConfirmOpen(true);
  };

  const executePayment = async () => {
    if (!merchantData) return;
    setStatus('PROCESSING');
    await onAtomicPayment(merchantData, sovrQuote);
    setStatus('SUCCESS');
  };

  if (status === 'SUCCESS') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm glass-panel bg-black/80 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden border-emerald-500/30 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">Paid ${merchantData?.amountUSD.toFixed(2)}</h2>
          <p className="text-emerald-400 font-mono text-sm mb-6">to {merchantData?.name}</p>
          
          <div className="w-full bg-white/5 rounded-xl p-4 space-y-2 mb-6 border border-white/5 text-xs">
             <div className="flex justify-between text-sovr-muted">
               <span>SOVR Spent</span>
               <span className="text-white font-mono">{sovrQuote.toFixed(4)} SOVR</span>
             </div>
             <div className="flex justify-between text-sovr-muted">
               <span>Protocol Route</span>
               <span className="text-sovr-primary">Atomic V2</span>
             </div>
          </div>

          <button 
            onClick={() => { setStatus('IDLE'); setMerchantData(null); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executePayment}
        title="Confirm Atomic Payment"
        message="The SOVR Protocol will automatically swap tokens, normalize assets, and settle this transaction in USD."
        confirmText={`Pay $${merchantData?.amountUSD}`}
        details={[
          { label: 'Merchant', value: merchantData?.name || '', highlight: true },
          { label: 'Total USD', value: `$${merchantData?.amountUSD.toFixed(2)}` },
          { label: 'SOVR Cost', value: `~ ${sovrQuote.toFixed(4)} SOVR` },
          { label: 'Network', value: 'Base Mainnet' },
        ]}
      />

      <div className="h-full flex flex-col items-center justify-center p-4 lg:p-6 animate-in fade-in duration-700">
        
        {/* V2 Header */}
        <div className="text-center mb-8 relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-sovr-primary/10 border border-sovr-primary/20 rounded-full mb-3">
              <Zap className="w-3 h-3 text-sovr-primary" />
              <span className="text-[10px] font-bold text-sovr-primary tracking-widest uppercase">Protocol V2 Enabled</span>
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Tap to Pay</h2>
           <p className="text-sovr-muted text-sm">Bridge SOVR to USD instantly.</p>
        </div>

        {/* Main Interface */}
        <div className="relative w-full max-w-sm aspect-[3/5] md:aspect-[4/5] glass-panel rounded-[2.5rem] bg-black/40 border-white/10 flex flex-col overflow-hidden shadow-2xl">
          
          {/* Mode Switcher */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 p-1 rounded-full border border-white/10 z-20 backdrop-blur-md">
             <button 
               onClick={() => setMode('NFC')}
               className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'NFC' ? 'bg-sovr-primary text-black shadow-lg shadow-sky-500/20' : 'text-sovr-muted hover:text-white'}`}
             >
               <Wifi className="w-3 h-3 rotate-90" /> NFC
             </button>
             <button 
               onClick={() => setMode('QR')}
               className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'QR' ? 'bg-sovr-primary text-black shadow-lg shadow-sky-500/20' : 'text-sovr-muted hover:text-white'}`}
             >
               <QrCode className="w-3 h-3" /> Scan
             </button>
          </div>

          {/* Active Area */}
          <div className="flex-1 relative flex items-center justify-center">
             
             {/* Merchant Detected State */}
             {status === 'DETECTED' && merchantData ? (
                <div className="w-full h-full absolute inset-0 bg-[#050505] z-30 flex flex-col p-6 animate-in fade-in duration-300">
                   
                   {/* Header / Status Line */}
                   <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 mt-8">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-sovr-primary animate-pulse rounded-full"></div>
                         <span className="text-[10px] font-mono text-sovr-primary tracking-widest uppercase">Signal Detected</span>
                      </div>
                      <span className="text-[10px] font-mono text-sovr-muted opacity-50">{new Date().toLocaleTimeString()}</span>
                   </div>

                   {/* Merchant Details - Terminal Style */}
                   <div className="flex-1 flex flex-col justify-center space-y-8">
                      <div>
                         <span className="text-[9px] text-sovr-muted font-mono uppercase tracking-wider block mb-2 opacity-70">Merchant Entity</span>
                         <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{merchantData.name}</h3>
                         <div className="inline-flex items-center gap-2 mt-2 px-2 py-1 border border-white/10 rounded bg-white/5">
                            <span className="w-1 h-1 bg-sovr-success rounded-full"></span>
                            <span className="text-[9px] text-sovr-muted font-mono uppercase">{merchantData.category}</span>
                         </div>
                      </div>

                      <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                         <div className="flex justify-between items-end border-b border-white/5 pb-3 border-dashed">
                            <span className="text-[10px] text-sovr-muted font-mono uppercase mb-1">Obligation (USD)</span>
                            <span className="text-3xl font-mono text-white tracking-tighter">${merchantData.amountUSD.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center pt-1">
                             <span className="text-[10px] text-sovr-muted font-mono uppercase">Protocol Swap</span>
                             <span className="text-xs font-mono text-sovr-primary flex items-center gap-2">
                                <ArrowRight className="w-3 h-3" /> {sovrQuote.toFixed(4)} SOVR
                             </span>
                         </div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="mt-auto space-y-3 mb-4">
                      <button 
                        onClick={handleApprove}
                        className="w-full py-4 bg-sovr-card border border-sovr-primary/30 hover:border-sovr-primary hover:bg-sovr-primary/10 text-white font-mono text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-3 group shadow-[0_0_20px_-10px_rgba(56,189,248,0.1)] hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)]"
                      >
                        <span className="w-1.5 h-1.5 bg-sovr-primary rounded-full group-hover:shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all"></span>
                        CONFIRM_SETTLEMENT
                      </button>
                      
                      <button 
                        onClick={() => setStatus('IDLE')}
                        className="w-full py-2 text-[10px] text-sovr-muted hover:text-white font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
                      >
                        <X className="w-3 h-3" /> Abort Sequence
                      </button>
                   </div>
                </div>
             ) : (
                /* Idle / Scanning State */
                <button 
                  onClick={startScan}
                  disabled={status === 'SCANNING'}
                  className="group relative w-64 h-64 flex items-center justify-center outline-none"
                >
                   {/* Ripple Effects for NFC */}
                   {mode === 'NFC' && (
                     <>
                       <div className={`absolute inset-0 border-2 border-sovr-primary/20 rounded-full ${status === 'SCANNING' ? 'animate-ping' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100'} transition-all duration-700`}></div>
                       <div className={`absolute inset-4 border border-sovr-primary/40 rounded-full ${status === 'SCANNING' ? 'animate-ping delay-150' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100'} transition-all duration-700`}></div>
                       <div className={`absolute inset-8 border border-sovr-primary/60 rounded-full ${status === 'SCANNING' ? 'animate-ping delay-300' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100'} transition-all duration-700`}></div>
                     </>
                   )}

                   {/* QR Scan Line */}
                   {mode === 'QR' && (
                     <div className="absolute inset-0 rounded-3xl border-2 border-white/10 overflow-hidden bg-black/50">
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                           {[...Array(36)].map((_, i) => <div key={i} className="border-[0.5px] border-sovr-primary/30"></div>)}
                        </div>
                        {status === 'SCANNING' && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-sovr-primary shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        )}
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-sovr-primary"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-sovr-primary"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-sovr-primary"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-sovr-primary"></div>
                     </div>
                   )}

                   {/* Center Icon */}
                   <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-gray-900 to-black rounded-full border border-white/10 shadow-2xl flex items-center justify-center group-hover:border-sovr-primary/50 transition-colors">
                      {status === 'SCANNING' ? (
                        <Loader2 className="w-10 h-10 text-sovr-primary animate-spin" />
                      ) : mode === 'NFC' ? (
                        <Wifi className="w-10 h-10 text-white rotate-90" />
                      ) : (
                        <Scan className="w-10 h-10 text-white" />
                      )}
                   </div>
                   
                   <div className="absolute -bottom-12 text-center">
                      <p className="text-white font-bold text-lg tracking-wide">
                        {status === 'SCANNING' ? 'Searching...' : mode === 'NFC' ? 'Tap to Pay' : 'Scan Code'}
                      </p>
                      <p className="text-xs text-sovr-muted mt-1">
                        {status === 'SCANNING' ? 'Hold near reader' : 'Ready for merchant signal'}
                      </p>
                   </div>
                </button>
             )}
          </div>

          {/* Footer - Wallet Info */}
          <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/5">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-sovr-muted font-bold uppercase">Funding Source</span>
                <div className="flex items-center gap-1.5 bg-sovr-primary/10 px-2 py-1 rounded text-[10px] text-sovr-primary border border-sovr-primary/20">
                   <ShieldCheck className="w-3 h-3" /> Auto-Bridge
                </div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sovr-primary to-sovr-secondary p-0.5">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sovr-primary to-sovr-secondary"></div>
                      </div>
                   </div>
                   <div>
                      <div className="text-white font-mono font-bold">SOVR Token</div>
                      <div className="text-[10px] text-sovr-muted">Bal: {wallet.sovrBalance.toFixed(2)}</div>
                   </div>
                </div>
                <CreditCard className="w-5 h-5 text-sovr-muted" />
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SovrPay;