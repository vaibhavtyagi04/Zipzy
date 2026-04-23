import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, ShieldAlert, Zap, Send, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InsightsPanel from "../components/insights/InsightsPanel";

const AiAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Zipzy AI assistant. I can analyze your portfolio risk, gas optimization, or suggest market strategies. What would you like to know?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "I've analyzed the current market data. ";
      if (input.toLowerCase().includes("eth")) {
        response += "ETH is currently showing strong support at $2,200. Gas is trending down, making it a good time for long-term accumulation.";
      } else if (input.toLowerCase().includes("risk")) {
        response += "Your portfolio risk is currently 'Moderate'. You have a 42% concentration in SOL, which is showing high volatility. Consider diversifying into stablecoins.";
      } else {
        response += "Based on on-chain activity, whales are moving USDC to exchanges, which often precedes a buying phase. Stay alert!";
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="luxe-card h-[600px] flex flex-col overflow-hidden relative">
      <div className="p-6 border-b border-theme flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E9B3A2]/20 rounded-xl">
            <MessageSquare className="text-[#E9B3A2]" size={18} />
          </div>
          <h3 className="text-sm font-black text-theme uppercase tracking-tight">AI Companion</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-bold ${m.role === 'user' ? 'bg-[#E9B3A2] text-bg' : 'bg-white/5 text-theme border border-white/5'}`}>
              {m.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <Loader2 className="animate-spin text-[#E9B3A2]" size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-theme">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {["Best time to swap?", "Portfolio risk?", "ETH Price prediction"].map(tip => (
            <button 
              key={tip}
              onClick={() => setInput(tip)}
              className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase text-muted hover:text-[#E9B3A2] hover:border-[#E9B3A2]/30 transition-all"
            >
              {tip}
            </button>
          ))}
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Ask AI assistant..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-surface border border-theme rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-[#E9B3A2]/40 transition-all text-xs text-theme"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#E9B3A2] text-bg rounded-xl transition-all hover:scale-110 active:scale-95"
          >
            <Send size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AIInsights() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-theme flex items-center gap-4">
            AI Insights
            <Sparkles className="text-[#E9B3A2]" size={32} />
          </h1>
          <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">Real-time market intelligence and predictive analytics</p>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Insights */}
        <div className="xl:col-span-7 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="luxe-card p-8 border-[#16C784]/20 bg-[#16C784]/5">
              <TrendingUp className="text-[#16C784] mb-4" size={24} />
              <h4 className="text-sm font-black text-theme uppercase tracking-tight mb-2">Market Sentiment</h4>
              <p className="text-2xl font-black text-[#16C784] mb-2 tracking-tighter">BULLISH (74%)</p>
              <p className="text-xs text-muted font-bold leading-relaxed">Social mentions and on-chain accumulation suggest a continued upward trend for BTC and ETH over the next 48 hours.</p>
            </div>
            
            <div className="luxe-card p-8 border-[#FF5A5A]/20 bg-[#FF5A5A]/5">
              <ShieldAlert className="text-[#FF5A5A] mb-4" size={24} />
              <h4 className="text-sm font-black text-theme uppercase tracking-tight mb-2">Risk Exposure</h4>
              <p className="text-2xl font-black text-[#FF5A5A] mb-2 tracking-tighter">MODERATE (4.2/10)</p>
              <p className="text-xs text-muted font-bold leading-relaxed">Portfolio is heavily weighted towards SOL (42%). High correlation detected between top holdings.</p>
            </div>
          </div>

          <section className="luxe-card p-10">
            <InsightsPanel />
          </section>
        </div>

        {/* AI Assistant */}
        <div className="xl:col-span-5">
          <AiAssistant />
        </div>
      </div>
    </div>
  );
}
