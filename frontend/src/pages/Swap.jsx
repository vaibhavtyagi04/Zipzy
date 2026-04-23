import React, { useState, useEffect } from "react";
import { useWalletStore } from "../store/walletStore";
import { 
  ArrowDown, 
  Settings2, 
  RefreshCcw, 
  ChevronDown, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Loader2,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Button from "../components/ui/Button";
import TokenIcon from "../components/ui/TokenIcon";
import { motion, AnimatePresence } from "framer-motion";

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", price: 2250.45 },
  { symbol: "USDC", name: "USD Coin", price: 1.0 },
  { symbol: "SOL", name: "Solana", price: 105.20 },
  { symbol: "BTC", name: "Bitcoin", price: 64200.00 },
  { symbol: "USDT", name: "Tether", price: 1.0 }
];

export default function Swap() {
  const { addNotification, balance } = useWalletStore();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("swap"); // swap, confirming, success
  const [quote, setQuote] = useState(null);
  const [showRoutes, setShowRoutes] = useState(false);

  // Simulation: Fetch quote when amount changes
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount) && parseFloat(fromAmount) > 0) {
      const delay = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/swap-quote?from_token=${fromToken.symbol}&to_token=${toToken.symbol}&amount=${fromAmount}`);
          const data = await res.json();
          setQuote(data);
          setToAmount(data.amount_out.toFixed(6));
        } catch (err) {
          console.error("Swap quote error:", err);
        } finally {
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setToAmount("");
      setQuote(null);
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    setStep("confirming");
    // Simulate blockchain processing
    await new Promise(r => setTimeout(r, 3000));
    setStep("success");
    addNotification("Swap executed successfully!", "success");
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-500/20"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-theme tracking-tight mb-2">Swap Confirmed!</h2>
          <p className="text-muted font-bold uppercase text-[10px] tracking-widest">Transaction hash: 0x4a...f2e9</p>
        </div>
        <div className="luxe-card p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <TokenIcon symbol={fromToken.symbol} size={32} />
             <div className="text-left">
                <p className="text-xs font-bold text-muted uppercase">Sent</p>
                <p className="text-lg font-black text-theme">{fromAmount} {fromToken.symbol}</p>
             </div>
          </div>
          <ArrowRight className="text-muted" size={20} />
          <div className="flex items-center gap-4 text-right">
             <div className="text-right">
                <p className="text-xs font-bold text-muted uppercase">Received</p>
                <p className="text-lg font-black text-theme">{toAmount} {toToken.symbol}</p>
             </div>
             <TokenIcon symbol={toToken.symbol} size={32} />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth onClick={() => { setStep("swap"); setFromAmount(""); }}>New Swap</Button>
          <Button variant="primary" fullWidth icon={ExternalLink}>View on Explorer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-theme tracking-tight mb-2">Smart Swap</h1>
          <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">Optimized routing for best execution</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-theme transition-colors">
            <RefreshCcw size={18} />
          </button>
          <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-theme transition-colors">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <div className="relative space-y-2">
        {/* FROM CARD */}
        <div className="luxe-card p-8 bg-white/[0.02] border-white/5">
          <div className="flex justify-between mb-4">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">You Pay</label>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Balance: {fromToken.symbol === 'ETH' ? balance.toFixed(4) : '0.00'}</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="w-full bg-transparent text-4xl font-black text-theme outline-none placeholder:opacity-20"
            />
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4 cursor-pointer hover:bg-white/10 transition-all">
              <TokenIcon symbol={fromToken.symbol} size={24} />
              <span className="text-sm font-black text-theme">{fromToken.symbol}</span>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
          <div className="mt-4">
             <p className="text-xs font-bold text-muted">${(parseFloat(fromAmount || 0) * fromToken.price).toLocaleString()}</p>
          </div>
        </div>

        {/* SWITCH BUTTON */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={switchTokens}
            className="p-3 bg-[#0f172a] border border-white/10 rounded-2xl text-[#E9B3A2] hover:scale-110 transition-all shadow-2xl"
          >
            <ArrowDown size={20} strokeWidth={3} />
          </button>
        </div>

        {/* TO CARD */}
        <div className="luxe-card p-8 bg-white/[0.04] border-white/10">
          <div className="flex justify-between mb-4">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">You Receive</label>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full text-4xl font-black text-theme">
              {loading ? <Loader2 className="animate-spin text-[#E9B3A2]" size={32} /> : (toAmount || "0.0")}
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4 cursor-pointer hover:bg-white/10 transition-all">
              <TokenIcon symbol={toToken.symbol} size={24} />
              <span className="text-sm font-black text-theme">{toToken.symbol}</span>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
          <div className="mt-4">
             <p className="text-xs font-bold text-muted">${(parseFloat(toAmount || 0) * toToken.price).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* QUOTE INFO */}
      <AnimatePresence>
        {quote && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
             <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-2 text-muted font-bold uppercase tracking-widest">
                      <Zap size={14} /> Price Impact
                   </div>
                   <span className="text-[#16C784] font-black">&lt; 0.01%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-2 text-muted font-bold uppercase tracking-widest">
                      <Info size={14} /> Est. Network Fee
                   </div>
                   <span className="text-theme font-black">${quote.gas_estimate.toFixed(2)}</span>
                </div>
                <div 
                  className="pt-4 border-t border-white/5 cursor-pointer flex justify-between items-center"
                  onClick={() => setShowRoutes(!showRoutes)}
                >
                   <div className="flex items-center gap-2 text-muted font-bold uppercase tracking-widest text-[10px]">
                      <ShieldCheck size={14} /> Smart Routing
                   </div>
                   <div className="flex items-center gap-1">
                      <span className="text-theme font-black text-[10px] uppercase">{quote.route.join(" → ")}</span>
                      <ChevronDown size={12} className={`text-muted transition-transform ${showRoutes ? "rotate-180" : ""}`} />
                   </div>
                </div>
                
                {showRoutes && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="overflow-hidden pt-4 space-y-4"
                  >
                     <div className="flex items-center gap-4 justify-center py-4 relative">
                        <div className="flex flex-col items-center gap-2 z-10">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                              <TokenIcon symbol={fromToken.symbol} size={20} />
                           </div>
                           <span className="text-[8px] font-black text-muted uppercase">{fromToken.symbol}</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#E9B3A2] to-transparent relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-[#0f172a] text-[8px] font-black text-[#E9B3A2] uppercase">Uniswap V3</div>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                              <TokenIcon symbol={toToken.symbol} size={20} />
                           </div>
                           <span className="text-[8px] font-black text-muted uppercase">{toToken.symbol}</span>
                        </div>
                     </div>
                  </motion.div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        variant="primary" 
        fullWidth 
        size="lg" 
        disabled={!fromAmount || loading || step === "confirming"}
        onClick={handleSwap}
      >
        {step === "confirming" ? (
          <div className="flex items-center gap-3">
             <Loader2 className="animate-spin" size={20} />
             Confirming Transaction...
          </div>
        ) : (
          `Swap ${fromToken.symbol}`
        )}
      </Button>

      <div className="text-center">
        <p className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">
          Swaps are executed via decentralized protocols. <br/>
          Zipzy finds the best route to minimize slippage and gas fees.
        </p>
      </div>
    </div>
  );
}
