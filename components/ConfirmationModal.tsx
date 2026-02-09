import React from 'react';
import { AlertTriangle, X, Check, ArrowRight } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  details?: { label: string; value: string; highlight?: boolean }[];
  confirmText?: string;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText = "Confirm Transaction",
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 group">
        
        {/* Decorative Glows */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sovr-primary to-transparent opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sovr-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sovr-primary/20 transition-colors"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl border ${isDangerous ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-sovr-primary/10 border-sovr-primary/20 text-sovr-primary'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="text-sovr-muted hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sovr-muted text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {details && details.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3 border border-white/5">
              {details.map((detail, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-sovr-muted">{detail.label}</span>
                  <span className={`font-mono font-medium ${detail.highlight ? 'text-white' : 'text-sovr-muted'}`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sovr-muted hover:text-white font-medium transition-all border border-white/5 hover:border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isDangerous 
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                  : 'bg-sovr-primary hover:bg-sky-400 text-black shadow-sky-900/20'
              }`}
            >
              <span>{confirmText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;