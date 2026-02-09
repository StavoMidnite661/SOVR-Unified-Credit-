import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Zap } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateResponse } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello. I am the SOVR Protocol Intelligence. I can explain slippage, normalization, or Gateway status. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateResponse(messages, userMsg.text);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Protocol Error: Connection interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to format text with basic markdown support (Bold & Lists)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Empty lines
      if (!line.trim()) return <div key={i} className="h-2" />;

      // Lists
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const content = isBullet ? line.trim().substring(2) : line;

      // Bold parsing
      const parts = content.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={j} className="text-white font-bold">{part.slice(2, -2)}</span>;
        }
        return <span key={j}>{part}</span>;
      });

      if (isBullet) {
        return (
           <div key={i} className="flex items-start gap-2 pl-1 mb-1">
             <div className="w-1 h-1 rounded-full bg-sovr-primary mt-1.5 shrink-0"></div>
             <div className="flex-1">{parts}</div>
           </div>
        );
      }

      return <div key={i} className="mb-0.5">{parts}</div>;
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 lg:bottom-6 right-6 w-14 h-14 bg-sovr-primary hover:bg-sky-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center transition-all hover:scale-110 z-50 group border border-white/20"
      >
        <Bot className="w-8 h-8 text-black" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-sovr-dark animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-28 lg:bottom-6 right-6 w-80 md:w-96 bg-[#0f172a] border border-sovr-primary/30 rounded-xl shadow-[0_0_50px_-10px_rgba(56,189,248,0.15)] flex flex-col overflow-hidden z-50 h-[500px] animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-sovr-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-sovr-text">SOVR Intelligence</span>
            <span className="text-[10px] text-sovr-muted flex items-center gap-1">
              <Zap className="w-3 h-3 text-sovr-primary" /> gemini-2.5-flash-lite
            </span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-sovr-muted hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/80 relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.1),transparent_70%)]"></div>
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
            <div 
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-sovr-primary/10 text-white border border-sovr-primary/30' 
                  : 'bg-white/5 text-sovr-muted border border-white/5'
              }`}
            >
              {msg.role === 'model' ? renderFormattedText(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-sovr-primary rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-sovr-primary rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-sovr-primary rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask protocol question..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:border-sovr-primary/50 focus:bg-white/10 outline-none transition-all"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 text-sovr-primary hover:text-white transition-colors"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;