import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import { chatWithAdvocate } from '../lib/gemini';

export default function Advocate({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your Regrade assistant. I can help you figure out whether you have grounds to appeal, how to approach your professor, and what to include in your letter. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Map our app roles to Gemini roles
      const history = messages.slice(1).map(m => ({
        role: m.role === 'ai' ? 'model' as const : 'user' as const,
        text: m.text
      }));

      const response = await chatWithAdvocate(userMessage, history);
      
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that request." }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I ran into an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto glass-panel rounded-[3rem] overflow-hidden border border-primary/5 bg-white/60 backdrop-blur-3xl shadow-2xl relative">
      <div className="absolute inset-0 paper-texture opacity-5 pointer-events-none" />
      
      {/* Header */}
      <header className="p-8 border-b border-primary/5 flex items-center justify-between bg-primary/5 relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="p-3 bg-white hover:bg-primary/5 rounded-2xl transition-all text-primary shadow-sm border border-primary/5"
          >
            <ICONS.ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="font-serif text-2xl text-primary font-light">Appeal Assistant</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-[#6cf8bb] rounded-full animate-pulse" />
              <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-primary/40">Online</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           {[ICONS.Shield, ICONS.Download].map((Icon, i) => (
             <button key={i} className="p-3 bg-white/50 text-primary/30 hover:text-primary transition-all rounded-xl border border-primary/5">
                <Icon size={18} />
             </button>
           ))}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10 scrollbar-hide">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] p-8 rounded-[2rem] text-lg font-serif italic leading-relaxed ${
              m.role === 'ai' 
                ? 'bg-white/80 border border-primary/5 text-primary/80 shadow-[0_10px_30px_-10px_rgba(0,35,111,0.05)]' 
                : 'bg-primary text-white shadow-xl shadow-primary/20'
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/80 border border-primary/5 p-6 rounded-2xl flex gap-2">
              <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-8 border-t border-primary/5 bg-white/80 relative z-10">
        <div className="relative flex items-center max-w-2xl mx-auto">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your appeal..."
            className="w-full bg-[#fdfcf7] border border-primary/5 rounded-[2rem] px-10 py-6 outline-none focus:ring-2 focus:ring-primary/10 transition-all pr-20 text-sm font-serif italic text-primary/80 placeholder:text-primary/20"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <ICONS.RefreshCcw className="animate-spin" size={20} /> : <ICONS.Send size={20} />}
          </button>
        </div>
        <div className="flex justify-center items-center gap-4 mt-6">
           <div className="h-px w-8 bg-primary/10" />
           <p className="text-[9px] text-primary/30 font-bold uppercase tracking-[0.4em]">
              Your conversations are private
           </p>
           <div className="h-px w-8 bg-primary/10" />
        </div>
      </form>
    </div>
  );
}
