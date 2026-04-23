import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { ArrowLeft, TrendingUp, Wallet, PieChart, Activity, Shield } from "lucide-react";

export default function BalanceDetail() {
  const { marketData, holdings } = useWalletStore();
  const navigate = useNavigate();

  const details = useMemo(() => {
    let total = 0;
    const items = Object.entries(holdings).map(([symbol, amount]) => {
      const price = marketData[symbol]?.price || 0;
      const value = amount * price;
      total += value;
      const base = symbol.replace("USDT", "");
      return {
        symbol: base,
        amount,
        price,
        value,
        change: marketData[symbol]?.change || 0,
        percentage: 0 // Will calculate after total
      };
    });

    return {
      total,
      assets: items.map(item => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0
      })).sort((a, b) => b.value - a.value)
    };
  }, [holdings, marketData]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] hover:text-theme transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-[#E9B3A2]/10 rounded-2xl flex items-center justify-center">
                <Wallet className="text-[#E9B3A2]" size={24} />
             </div>
             <h1 className="text-4xl font-black tracking-tight text-theme">Portfolio Analytics</h1>
          </div>
          <p className="text-muted font-bold text-sm max-w-md">
            Comprehensive breakdown of your digital assets and real-time portfolio performance.
          </p>
        </div>

        <div className="text-right">
           <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">AGGREGATED NET WORTH</p>
           <p className="text-5xl font-black tracking-tighter text-[#E9B3A2]">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.total)}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="luxe-card p-10">
            <h3 className="text-xl font-black mb-10 text-theme flex items-center gap-3">
              <PieChart size={20} className="text-[#E9B3A2]" />
              Asset Allocation
            </h3>
            <div className="space-y-8">
              {details.assets.map(asset => (
                <div key={asset.symbol} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-theme">{asset.symbol}</span>
                      <span className="text-[10px] font-bold text-muted px-2 py-0.5 bg-white/5 rounded-md uppercase">
                        {asset.amount} {asset.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-theme">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                      </span>
                      <span className="ml-3 text-[11px] font-black text-[#16C784]">
                        {asset.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#E9B3A2] rounded-full shadow-[0_0_10px_rgba(233,179,162,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="luxe-card p-8 bg-gradient-to-br from-[#16C784]/5 to-transparent border-[#16C784]/10">
                <div className="flex items-center gap-3 mb-4">
                   <Activity size={18} className="text-[#16C784]" />
                   <h4 className="text-sm font-black text-theme uppercase tracking-widest">Performance</h4>
                </div>
                <p className="text-2xl font-black text-[#16C784] mb-2">+12.4%</p>
                <p className="text-xs text-muted font-bold">Portfolio grew by $482.30 this week.</p>
             </div>
             <div className="luxe-card p-8 bg-gradient-to-br from-[#E9B3A2]/5 to-transparent border-[#E9B3A2]/10">
                <div className="flex items-center gap-3 mb-4">
                   <Shield size={18} className="text-[#E9B3A2]" />
                   <h4 className="text-sm font-black text-theme uppercase tracking-widest">Security Score</h4>
                </div>
                <p className="text-2xl font-black text-[#E9B3A2] mb-2">98/100</p>
                <p className="text-xs text-muted font-bold">All assets are secured in your non-custodial wallet.</p>
             </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="luxe-card p-10 bg-[#E9B3A2] text-[#121212]">
            <h3 className="font-black text-xl mb-6">Market Insight</h3>
            <p className="text-sm font-bold leading-relaxed mb-8 opacity-80">
              Your portfolio is currently 85% correlated with BTC price action. Diversifying into stablecoins or L2 protocols could reduce volatility.
            </p>
            <button className="w-full py-4 bg-[#121212] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform">
              Optimization Report
            </button>
          </div>

          <div className="luxe-card p-10 border border-white/5">
             <h3 className="font-black text-sm text-muted uppercase tracking-widest mb-8">Recent Flow</h3>
             <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                           <TrendingUp size={14} className="text-[#16C784]" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-theme">Staking Reward</p>
                           <p className="text-[10px] font-bold text-muted">2 hours ago</p>
                        </div>
                     </div>
                     <p className="text-xs font-black text-[#16C784]">+$4.20</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
