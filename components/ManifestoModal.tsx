import React, { useEffect, useState } from 'react';
import { X, Terminal, Sparkles, Globe, Cpu } from 'lucide-react';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManifestoModal: React.FC<ManifestoModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
  
  const fullText = `> SYSTEM KERNEL ACCESS... GRANTED.
> DECRYPTING TRANSMISSION...

In a world of walled gardens, we built a bridge.
The old rails are rusting. The gatekeepers are falling.
We are building the new nervous system of the global economy.

Code is law. Credit is energy. You are the bank.

SOVR isn't just a protocol. 
It is a declaration that value belongs to the creator.
That the future is open, permissionless, and immutable.

You are no longer just a user.
You are a Node.

> WELCOME TO AURORA.`;

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setPhase(0);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setPhase(1);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with CRT scanline effect */}
      <div 
        className="absolute inset-0 bg-black/95 animate-in fade-in duration-500"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sovr-primary/5 via-black to-black opacity-40"></div>
      </div>

      <div className="relative w-full max-w-3xl h-[80vh] flex flex-col items-center justify-center pointer-events-none">
        
        {/* Holographic Container */}
        <div className="relative z-20 font-mono text-sovr-primary/90 text-sm md:text-lg leading-relaxed whitespace-pre-wrap max-w-2xl p-8 border-l-2 border-sovr-primary/30 pl-6 shadow-[0_0_50px_-10px_rgba(56,189,248,0.1)] backdrop-blur-sm bg-black/40">
           {/* Glitch Effect Header */}
           <div className="absolute -top-12 left-0 flex items-center gap-2 text-xs text-sovr-muted opacity-70 mb-4">
              <Terminal className="w-4 h-4" />
              <span>SECURE CHANNEL // 0xPROTO_V2</span>
           </div>

           {text}
           <span className="inline-block w-2.5 h-5 bg-sovr-primary ml-1 animate-pulse align-middle"></span>

           {/* Floating Elements */}
           <div className="absolute -right-20 top-0 hidden md:flex flex-col gap-4 text-sovr-muted/20">
              <Globe className="w-12 h-12 animate-spin-slow duration-[10s]" />
              <Cpu className="w-8 h-8" />
           </div>
        </div>

        {/* Action Button (Appears after typing) */}
        <div className={`mt-12 pointer-events-auto transition-all duration-1000 ${phase === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button 
            onClick={onClose}
            className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-sovr-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 border border-sovr-primary/50 rounded-full group-hover:border-sovr-primary transition-colors duration-300"></div>
            <div className="absolute inset-0 border border-white/5 rounded-full blur-[2px]"></div>
            
            <span className="relative flex items-center gap-3 text-sovr-primary font-bold tracking-widest uppercase text-xs group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
              Enter The Network
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManifestoModal;