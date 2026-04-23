import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioSummary from "../components/PortfolioSummary";
import TokenList from "../components/TokenList";
import SwapCard from "../components/SwapCard";
import PriceChart from "../components/PriceChart";
import TransactionHistory from "../components/TransactionHistory";
import { useWalletStore } from "../store/walletStore";
import { useMarketWS } from "../hooks/useMarketWS";
import { useAccount, useBalance } from 'wagmi';
import { TokenService } from "../services/tokenService";
import SendModal from "../components/wallet/SendModal";
import { Plus, X, Loader2, Copy, Check, Send, Download } from "lucide-react";

export default function Dashboard() {
  const { marketData, holdings, tokens, setTokens, setMarketData } = useWalletStore();
  const { subscribe } = useMarketWS();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Phase 2: Fetch Real Wallet Data
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // Phase 3: Fetch Tokens
  useEffect(() => {
    if (address) {
      const fetchTokens = async () => {
        const tokenData = await TokenService.getTokenBalances(address);
        setTokens(tokenData);
      };
      fetchTokens();
    }
  }, [address, setTokens]);

  // Fetch initial market data if empty, and subscribe to current assets
  useEffect(() => {
    const initData = async () => {
      setIsPageLoading(true);
      if (Object.keys(marketData).length === 0) {
        const res = await fetch("http://localhost:5000/api/market-data");
        const data = await res.json();
        setMarketData(data);
        subscribe(Object.keys(data));
      } else {
        subscribe(Object.keys(marketData));
      }
      setTimeout(() => setIsPageLoading(false), 800);
    };
    initData();
  }, [setMarketData, subscribe]);

  // Calculate USD conversion
  const ethPrice = marketData?.ETHUSDT?.price || 0;
  const ethBalance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const ethInUsd = ethBalance * ethPrice;

  // Total Value (ETH + other holdings)
  const totalValue = Object.entries(holdings).reduce((acc, [symbol, amount]) => {
    const price = marketData[symbol]?.price || 0;
    return acc + (amount * price);
  }, ethInUsd);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      {/* Main Content Area */}
      <div className="xl:col-span-8 space-y-10">
        {isPageLoading ? (
          <div className="w-full h-64 bg-white/5 rounded-[40px] animate-pulse flex items-center justify-center">
            <Loader2 size={32} className="text-[#E9B3A2] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info Header */}
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                  <img src="/logo.png" alt="Zipzy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Wallet</p>
                  <button 
                    onClick={copyAddress}
                    className="flex items-center gap-2 text-sm font-bold text-theme hover:text-[#E9B3A2] transition-colors"
                  >
                    {truncateAddress(address)}
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Network</p>
                <p className="text-xs font-bold text-theme">Ethereum Mainnet</p>
              </div>
            </div>

            <div onClick={() => navigate("/balance-detail")} className="cursor-pointer group">
              <PortfolioSummary 
                totalBalance={totalValue} 
                ethBalance={ethBalance}
                ethSymbol={balanceData?.symbol}
                change={24.5} 
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 px-2">
              <button 
                onClick={() => setIsSendModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-[#E9B3A2] text-black p-5 rounded-[28px] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#E9B3A2]/10"
              >
                <Send size={18} />
                Send
              </button>
              <button 
                onClick={copyAddress}
                className="flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-theme p-5 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                <Download size={18} />
                Receive
              </button>
            </div>
          </div>
        )}
        
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black tracking-tight text-theme">Holdings</h3>
            <button 
              onClick={() => navigate("/tokens")}
              className="text-xs font-black text-muted uppercase tracking-widest hover:text-theme transition-colors"
            >
              See All
            </button>
          </div>
          {isPageLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="w-full h-24 bg-white/5 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <TokenList marketData={marketData} />
          )}
        </section>
      </div>

      {/* Right Panel Area */}
      <div className="xl:col-span-4 space-y-10">
        <SwapCard />
        
        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-black tracking-tight text-theme">Activity</h3>
            <button 
              onClick={() => navigate("/activity")}
              className="text-xs font-black text-muted uppercase tracking-widest hover:text-theme transition-colors"
            >
              Full History
            </button>
          </div>
          <div className="luxe-card p-2">
            <TransactionHistory limit={6} />
          </div>
        </section>
      </div>
      <SendModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        token={{ symbol: "ETH", price: ethPrice }} 
      />
    </div>
  );
}
