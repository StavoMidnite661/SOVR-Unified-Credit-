import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, Store, BadgeCheck, Wifi, AlertOctagon, RefreshCcw } from 'lucide-react';
import { WalletState } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface USDGatewayProps {
  wallet: WalletState;
  onAuthorize: (amount: number, merchantId: string) => Promise<void>;
  isLoading: boolean;
}

const USDGateway: React.FC<USDGatewayProps> = ({ wallet, onAuthorize, isLoading }) => {
  const [amount, setAmount] = useState('50.00');
  const [merchant, setMerchant] = useState('Acme Corp');
  const [step, setStep] = useState<'AUTH' | 'PAY' | 'SUCCESS' | 'DECLINED'>('AUTH');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initiateAuthorize = () => {
    if (!amount || Number(amount) <= 0) return;
    setIsConfirmOpen(true);
  };

  const executeAuthorize = async () => {
    try {
      await onAuthorize(Number(amount), merchant);
      setStep('PAY');
    } catch (e: any) {
      setErrorMsg(e.message || "Transaction declined by payment processor.");
      setStep('DECLINED');
    }
  };

  const handleConfirm = async () => {
    const btn = document.getElementById('pay-btn');
    if(btn) btn.innerHTML = "Processing Stripe Intent...";
    await new Promise(r => setTimeout(r, 1500));
    setStep('SUCCESS');
  };

  const reset = () => {
    setStep('AUTH');
    setAmount('50.00');
    setErrorMsg('');
  };

  if (step === 'DECLINED') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="glass-panel border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-10px_rgba(239,68,68,0.2)] bg-black/60 relative overflow-hidden transition-all duration-700">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 animate-in zoom-in duration-500">
            <AlertOctagon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Transaction Declined</h2>
          <p className="text-sovr-muted mb-8 text-sm">The payment authorization was rejected by the gateway.</p>
          
          <div className="bg-red-500/5 rounded-xl p-6 text-left space-y-3 font-mono text-xs mb-8 border border-red-500/10">
            <div className="flex justify-between">
              <span className="text-sovr-muted">Status</span>
              <span className="text-red-400 font-bold uppercase">Hard Failure</span>
            </div>
            <div className="flex justify-between border-t border-red-500/10 pt-2 mt-2">
              <span className="text-sovr-muted">Reason</span>
              <span className="text-red-400 text-right max-w-[180px] break-words">{errorMsg}</span>
            </div>
          </div>

          <button 
            onClick={reset} 
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="glass-panel border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] bg-black/60 relative overflow-hidden transition-all duration-700 hover:scale-[1.02]">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 animate-in zoom-in duration-500">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Complete</h2>
          <p className="text-sovr-muted mb-8 text-sm">The normalized credit has been settled via Stripe.</p>
          
          <div className="bg-white/5 rounded-xl p-6 text-left space-y-3 font-mono text-xs mb-8 border border-white/10">
            <div className="flex justify-between">
              <span className="text-sovr-muted">Merchant</span>
              <span className="text-white">{merchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sovr-muted">Amount</span>
              <span className="text-white">${Number(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sovr-muted">Method</span>
              <span className="text-sovr-primary">SOVR Credit</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="text-sovr-muted">Tx ID</span>
              <span className="text-emerald-400 truncate ml-4">pi_3M...xY7</span>
            </div>
          </div>

          <button onClick={reset} className="text-sovr-primary hover:text-white transition-colors text-sm font-medium hover:underline decoration-sovr-primary/50 underline-offset-4">
            Make another payment
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
        onConfirm={executeAuthorize}
        title="Authorize Payment"
        message="You are creating a PaymentIntent. Funds will be reserved from your USD Credit balance."
        confirmText="Authorize Funds"
        details={[
          { label: 'Merchant', value: merchant, highlight: true },
          { label: 'Amount', value: `$${Number(amount).toFixed(2)}` },
          { label: 'Gateway', value: 'Stripe Connect' },
        ]}
      />

      <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">USD Gateway</h2>
          <p className="text-sovr-muted max-w-md mx-auto text-sm">
            Securely process normalized credits through Stripe Connected accounts.
          </p>
        </div>

        <div className="w-full max-w-md relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative glass-panel rounded-2xl p-1 backdrop-blur-xl">
            <div className="bg-[#0a0a0a] rounded-xl p-8 shadow-2xl">
              
              {/* Stripe Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 font-bold text-indigo-400">
                  <BadgeCheck className="w-5 h-5" />
                  <span className="tracking-wide">Stripe</span>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Test Mode</span>
              </div>

              {step === 'AUTH' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-sovr-muted uppercase mb-2">Merchant ID</label>
                    <div className="relative group/input">
                      <Store className="absolute left-3 top-3 w-4 h-4 text-sovr-muted group-focus-within/input:text-indigo-400 transition-colors duration-300" />
                      <input 
                        type="text" 
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500/50 focus:bg-white/10 focus:scale-[1.02] focus:shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)] outline-none transition-all duration-300" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sovr-muted uppercase mb-2">Amount (USD)</label>
                    <div className="relative group/input">
                      <span className="absolute left-3 top-3 font-bold text-sovr-muted group-focus-within/input:text-indigo-400 transition-colors duration-300">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500/50 focus:bg-white/10 focus:scale-[1.02] focus:shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)] outline-none font-mono transition-all duration-300" 
                      />
                    </div>
                    <div className="mt-2 text-right text-xs text-indigo-400 flex justify-end items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                       Available Credit: ${wallet.usdCreditBalance.toFixed(2)}
                    </div>
                  </div>

                  <button 
                    onClick={initiateAuthorize}
                    disabled={isLoading || Number(amount) > wallet.usdCreditBalance}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? 'Authorizing...' : 'Authorize Payment'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 mb-6">
                    <div className="flex justify-between text-sm font-medium text-indigo-300">
                      <span>Total due</span>
                      <span className="text-white">${Number(amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Virtual Card UI - With Tilt Perspective */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-slate-800 to-black rounded-xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group/card hover:scale-[1.03] hover:-rotate-1 transition-all duration-500 ease-out preserve-3d">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover/card:bg-indigo-500/20 transition-colors duration-500"></div>
                      
                      <div className="flex justify-between items-start relative z-10">
                          <Wifi className="text-white/50 w-6 h-6 rotate-90" />
                          <span className="font-bold text-white/90 italic">VISA</span>
                      </div>
                      <div className="relative z-10">
                          <div className="flex gap-4 mb-4">
                              <div className="w-10 h-8 bg-yellow-500/20 rounded border border-yellow-500/40 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 animate-pulse-slow"></div>
                              </div>
                          </div>
                          <div className="font-mono text-white text-lg tracking-widest shadow-black drop-shadow-md">
                              4242 4242 4242 4242
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-white/60 font-mono">
                              <span>12/25</span>
                              <span>CVC ***</span>
                          </div>
                      </div>
                  </div>

                  <button 
                    id="pay-btn"
                    onClick={handleConfirm}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Lock className="w-4 h-4" /> Pay ${Number(amount).toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default USDGateway;