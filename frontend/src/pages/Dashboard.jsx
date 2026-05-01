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
import { Loader2, Copy, Check, Send, Download } from "lucide-react";
import { getMarketPrices } from "../services/marketData";
import { getChainName } from "../services/blockchain";

export default function Dashboard() {
  const {
    marketData,
    holdings,
    setTokens,
    setMarketData,
    vault,
    address: storedAddress,
    balance: storedBalance,
    chainId: storedChainId,
  } = useWalletStore();
  const { subscribe } = useMarketWS();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Phase 2: Fetch Real Wallet Data
  const { address: externalAddress, isConnected, chainId: externalChainId } = useAccount();
  const activeAddress = externalAddress || storedAddress || vault?.address;
  const activeChainId = externalChainId || storedChainId || vault?.chainId || 1;
  const { data: balanceData } = useBalance({ address: activeAddress });

  // Phase 3: Fetch Tokens
  useEffect(() => {
    if (activeAddress) {
      const fetchTokens = async () => {
        const tokenData = await TokenService.getTokenBalances(activeAddress);
        setTokens(tokenData);
      };
      fetchTokens();
    }
  }, [activeAddress, setTokens]);

  // Fetch initial market data if empty, and subscribe to current assets
  useEffect(() => {
    const initData = async () => {
      setIsPageLoading(true);
      try {
        if (Object.keys(marketData).length === 0) {
          const data = await getMarketPrices();
          if (data && !data.error) {
            setMarketData(data);
            subscribe(Object.keys(data));
          }
        } else {
          subscribe(Object.keys(marketData));
        }
      } catch (error) {
        console.error("Dashboard market init failed:", error);
      } finally {
        setTimeout(() => setIsPageLoading(false), 500);
      }
    };
    initData();
  }, [setMarketData, subscribe]);

  // Calculate USD conversion
  const ethPrice = marketData?.ETHUSDT?.price || 0;
  const ethBalance = balanceData ? parseFloat(balanceData.formatted) : storedBalance || 0;
  const ethInUsd = ethBalance * ethPrice;

  // Total Value (ETH + other holdings)
  const totalValue = Object.entries(holdings).reduce((acc, [symbol, amount]) => {
    const price = marketData[symbol]?.price || 0;
    return acc + (amount * price);
  }, ethInUsd);

  const copyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
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
          <div className="w-full h-64 bg-surface rounded-[40px] animate-pulse flex items-center justify-center">
            <Loader2 size={32} className="text-accent animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info Header */}
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-theme shadow-lg">
                  <img src="/logo.png" alt="Zipzy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Wallet</p>
                  <button 
                    onClick={copyAddress}
                    className="flex items-center gap-2 text-sm font-bold text-theme hover:text-accent transition-colors"
                  >
                    {truncateAddress(activeAddress)}
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Network</p>
                <p className="text-xs font-bold text-theme">{getChainName(activeChainId)}</p>
              </div>
            </div>

            <div onClick={() => navigate("/balance-detail")} className="cursor-pointer group">
              <PortfolioSummary 
                totalBalance={totalValue} 
                ethBalance={ethBalance}
                ethSymbol={balanceData?.symbol || "ETH"}
                change={24.5} 
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 px-2">
              <button 
                onClick={() => setIsSendModalOpen(true)}
                className="send-button flex items-center justify-center gap-3 p-5 uppercase tracking-widest text-xs transition-all active:scale-95"
              >
                <Send size={18} />
                Send
              </button>
              <button 
                onClick={copyAddress}
                className="flex items-center justify-center gap-3 bg-surface border border-theme text-theme p-5 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-theme transition-all"
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
              {[1,2,3].map(i => <div key={i} className="w-full h-24 bg-surface rounded-3xl animate-pulse" />)}
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
