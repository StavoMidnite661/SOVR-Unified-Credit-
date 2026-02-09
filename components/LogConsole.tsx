import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, Activity, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

interface LogConsoleProps {
  logs: LogEntry[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-sovr-success" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return <Activity className="w-3 h-3 text-sovr-primary" />;
    }
  };

  const getColor = (source: string) => {
    switch (source) {
      case 'CHAIN': return 'text-sovr-secondary';
      case 'STRIPE': return 'text-indigo-400';
      case 'NORM': return 'text-sovr-success';
      default: return 'text-sovr-muted';
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel border-l border-white/5 shadow-2xl backdrop-blur-md rounded-l-2xl lg:rounded-2xl overflow-hidden hover-glow">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sovr-primary" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">System Event Stream</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
          </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-3 scroll-smooth bg-black/40 relative"
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>
        
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-sovr-muted opacity-30">
            <Cpu className="w-8 h-8 mb-2" />
            <span>Waiting for signals...</span>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="relative z-20 flex gap-3 group animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-sovr-muted opacity-40 shrink-0 w-16">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <div className="mt-0.5 shrink-0">
              {getIcon(log.type)}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getColor(log.source)}`}>[{log.source}]</span>
                <span className="text-sovr-text/90 break-words">{log.message}</span>
              </div>
              {log.hash && (
                <div className="pl-1 mt-1 border-l-2 border-white/10">
                  <span className="text-[10px] text-sovr-muted/50 block">Transaction Hash</span>
                  <a href="#" className="text-sovr-primary/70 hover:text-sovr-primary text-[10px] truncate hover:underline transition-colors block font-mono">
                    {log.hash}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Status */}
      <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] text-sovr-muted font-mono">
         <span>Latency: <span className="text-sovr-success">24ms</span></span>
         <span className="flex items-center gap-1"><span className="w-1 h-1 bg-sovr-success rounded-full animate-pulse"></span> LIVE</span>
      </div>
    </div>
  );
};

export default LogConsole;