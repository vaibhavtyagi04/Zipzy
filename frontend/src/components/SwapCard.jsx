import { useState, useEffect, useMemo } from "react";
import { RefreshCcw, ArrowDown, Info, ChevronDown, Zap, Loader2 } from "lucide-react";
import { useWalletStore } from "../store/walletStore";
import TokenIcon from "./ui/TokenIcon";

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", price: 2250.45 },
  { symbol: "USDC", name: "USD Coin", price: 1.0 },
  { symbol: "SOL", name: "Solana", price: 105.20 },
  { symbol: "BTC", name: "Bitcoin", price: 64200.00 },
  { symbol: "USDT", name: "Tether", price: 1.0 }
];

export default function SwapCard() {
  const { marketData, holdings, balance } = useWalletStore();
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [sendAsset, setSendAsset] = useState(TOKENS[0]);
  const [receiveAsset, setReceiveAsset] = useState(TOKENS[1]);
  const [loading, setLoading] = useState(false);
  const [selectingAsset, setSelectingAsset] = useState(null); // 'send' or 'receive'
  const [quote, setQuote] = useState(null);

  // Sync with real market data if available
  useEffect(() => {
    if (sendAmount && !isNaN(sendAmount) && parseFloat(sendAmount) > 0) {
      const delay = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/swap-quote?from_token=${sendAsset.symbol}&to_token=${receiveAsset.symbol}&amount=${sendAmount}`);
          const data = await res.json();
          setQuote(data);
          setReceiveAmount(data.amount_out.toFixed(4));
        } catch (err) {
          console.error("SwapCard quote error:", err);
        } finally {
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setReceiveAmount("");
      setQuote(null);
    }
  }, [sendAmount, sendAsset, receiveAsset]);

  const switchAssets = () => {
    const temp = sendAsset;
    setSendAsset(receiveAsset);
    setReceiveAsset(temp);
    setSendAmount(receiveAmount);
  };

  const maxBalance = sendAsset.symbol === 'ETH' ? balance : (holdings[sendAsset.symbol] || 0);

  return (
    <div className="luxe-card p-8 flex flex-col h-full relative overflow-hidden bg-white/[0.02]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black tracking-tight text-theme flex items-center gap-2">
          Swap 
          <Zap size={14} className="text-[#E9B3A2]" />
        </h3>
        <button 
          className={`p-3 text-muted hover:text-theme hover:bg-white/5 rounded-2xl transition-all ${loading ? 'animate-spin' : ''}`}
          onClick={() => {}}
        >
          <RefreshCcw size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="space-y-3 relative">
        <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between mb-3">
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">SENDING</span>
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">BAL: {maxBalance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <input 
              type="number" 
              placeholder="0.00" 
              className="bg-transparent text-3xl font-black outline-none w-full text-theme placeholder:opacity-20"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
            <div 
              className="flex items-center gap-2 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setSelectingAsset('send')}
            >
              <TokenIcon symbol={sendAsset.symbol} size={24} />
              <span className="font-black text-sm text-theme">{sendAsset.symbol}</span>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={switchAssets}
            className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg border-4 border-[#0f172a] text-[#E9B3A2] hover:scale-110 transition-transform"
          >
             <ArrowDown size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between mb-3">
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">RECEIVING</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="text-3xl font-black text-theme">
              {loading ? <Loader2 className="animate-spin text-[#E9B3A2]" size={24} /> : (receiveAmount || "0.00")}
            </div>
            <div 
              className="flex items-center gap-2 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setSelectingAsset('receive')}
            >
              <TokenIcon symbol={receiveAsset.symbol} size={24} />
              <span className="font-black text-sm text-theme">{receiveAsset.symbol}</span>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="w-full py-4 bg-[#E9B3A2] text-bg rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group">
          SWAP ASSETS
          <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {quote && (
        <div className="mt-6 flex justify-between text-[10px] font-black text-muted uppercase tracking-[0.2em] px-2">
          <span>Impact: &lt; 0.01%</span>
          <span>Gas: ${quote.gas_estimate.toFixed(2)}</span>
        </div>
      )}

      {/* Asset Selector Modal */}
      {selectingAsset && (
        <div className="absolute inset-0 z-50 bg-[#0f172a] p-8 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-sm tracking-widest text-theme uppercase">Select Token</h4>
              <button 
                onClick={() => setSelectingAsset(null)}
                className="p-2 hover:bg-white/5 rounded-full"
              >
                 <ChevronDown className="rotate-180 text-muted" size={20} />
              </button>
           </div>
           <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
              {TOKENS.map(token => (
                <div 
                  key={token.symbol}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-colors"
                  onClick={() => {
                    if (selectingAsset === 'send') setSendAsset(token);
                    else setReceiveAsset(token);
                    setSelectingAsset(null);
                  }}
                >
                   <div className="flex items-center gap-4">
                      <TokenIcon symbol={token.symbol} size={32} />
                      <div>
                         <p className="text-sm font-black text-theme">{token.symbol}</p>
                         <p className="text-[10px] font-bold text-muted">{token.name}</p>
                      </div>
                   </div>
                   <p className="text-xs font-black text-theme">
                      ${token.price.toLocaleString()}
                   </p>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
