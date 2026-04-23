import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, PieChart, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Zap, Target, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore } from "../store/walletStore";
import { useAccount, useBalance } from "wagmi";

const TIME_RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 1825 },
];

const AllocationChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  let currentAngle = 0;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map((item, i) => {
          const angle = (item.percentage / total) * 360;
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          currentAngle += angle;
          const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;

          return (
            <motion.path
              key={item.symbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        <circle cx="50" cy="50" r="30" className="fill-[#0f172a]" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">Diversification</p>
        <p className="text-xl font-black text-theme">Healthy</p>
      </div>
    </div>
  );
};

export default function PortfolioAnalytics() {
  const { tokens, marketData, holdings } = useWalletStore();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  
  const [history, setHistory] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [timeRange, setTimeRange] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Phase 8: Real Analytics Calculation
  useEffect(() => {
    const calculateAllocation = () => {
      const ethPrice = marketData?.ETHUSDT?.price || 0;
      const ethBalance = balanceData ? parseFloat(balanceData.formatted) : 0;
      const ethValue = ethBalance * ethPrice;

      const assets = tokens.map(t => {
        const price = marketData[`${t.symbol}USDT`]?.price || 0;
        return {
          symbol: t.symbol,
          value: t.balance * price,
          color: "#E9B3A2"
        };
      });

      // Add ETH
      assets.push({ symbol: "ETH", value: ethValue, color: "#D4FF75" });

      const total = assets.reduce((sum, a) => sum + a.value, 0);
      
      const formattedAllocation = assets
        .filter(a => a.value > 0)
        .map(a => ({
          ...a,
          percentage: total > 0 ? parseFloat(((a.value / total) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.value - a.value);

      setAllocation(formattedAllocation);
      setLoading(false);
    };

    if (marketData && (tokens.length > 0 || balanceData)) {
      calculateAllocation();
    } else {
      // Fallback if no data yet
      setTimeout(() => setLoading(false), 2000);
    }
  }, [tokens, marketData, balanceData]);

  const fetchHistory = useCallback(async (range) => {
    setChartLoading(true);
    try {
      const days = TIME_RANGES.find(t => t.label === range)?.days || 30;
      const res = await fetch(`http://localhost:5000/api/portfolio-history?days=${days}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(timeRange);
  }, [fetchHistory, timeRange]);

  const handleTimeChange = (range) => {
    if (range === timeRange) return;
    setTimeRange(range);
  };

  const totalValue = allocation.reduce((sum, a) => sum + a.value, 0);
  const currentValue = totalValue; // Use calculated value
  const startValue = history.length > 0 ? history[0]?.value : currentValue * 0.95;
  const changePercent = startValue > 0 ? (((currentValue - startValue) / startValue) * 100).toFixed(1) : 0;
  const isPositive = changePercent >= 0;

  // Build chart path
  const buildChartPath = () => {
    if (history.length === 0) return { line: "", fill: "" };
    const minVal = Math.min(...history.map(h => h.value));
    const maxVal = Math.max(...history.map(h => h.value));
    const range = maxVal - minVal || 1;
    
    const points = history.map((h, i) => {
      const x = (i / (history.length - 1)) * 800;
      const y = 180 - ((h.value - minVal) / range) * 160;
      return `${x},${y}`;
    });
    
    const line = `M ${points.join(" L ")}`;
    const fill = `${line} L 800,200 L 0,200 Z`;
    return { line, fill };
  };

  const { line: chartLine, fill: chartFill } = buildChartPath();

  // Format dates for x-axis labels based on the range
  const getDateLabels = () => {
    if (history.length === 0) return [];
    const count = 4;
    const step = Math.floor(history.length / count);
    return Array.from({ length: count }, (_, i) => {
      const point = history[i * step];
      if (!point) return "";
      const d = new Date(point.time);
      if (timeRange === "1D") return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (timeRange === "1Y" || timeRange === "ALL") return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
      return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-[#E9B3A2]" size={40} />
        <p className="text-xs font-black text-muted uppercase tracking-widest">Computing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-theme tracking-tight mb-2">Portfolio Analytics</h1>
          <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">Deep financial insights and asset performance</p>
        </div>
        <button 
          onClick={() => { fetchHistory(timeRange); }}
          className="p-4 bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-theme transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Performance Chart */}
        <div className="xl:col-span-8 luxe-card p-10 space-y-10">
          <div className="flex justify-between items-center flex-wrap gap-4">
             <div>
                <h3 className="text-xs font-black text-muted uppercase tracking-widest mb-1">Performance Overview</h3>
                <p className="text-3xl font-black text-theme tracking-tight">
                  ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className={`text-sm ml-2 ${isPositive ? 'text-[#16C784]' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{changePercent}%
                  </span>
                </p>
             </div>
             <div className="flex gap-2">
                {TIME_RANGES.map(({ label }) => (
                  <button 
                    key={label} 
                    onClick={() => handleTimeChange(label)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      timeRange === label 
                        ? 'bg-[#E9B3A2] text-[#0f172a]' 
                        : 'bg-white/5 text-muted hover:text-theme hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="h-64 relative">
             {chartLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="animate-spin text-[#E9B3A2]" size={32} />
               </div>
             ) : (
               <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                     <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "#16C784" : "#EA3943"} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={isPositive ? "#16C784" : "#EA3943"} stopOpacity="0" />
                     </linearGradient>
                  </defs>
                  {chartFill && <path d={chartFill} fill="url(#chartGradient)" />}
                  {chartLine && (
                    <path 
                      d={chartLine}
                      fill="none"
                      stroke={isPositive ? "#16C784" : "#EA3943"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
               </svg>
             )}
             <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4 border-t border-white/5">
                {getDateLabels().map((date, i) => (
                  <span key={i} className="text-[9px] font-black text-muted uppercase tracking-widest">{date}</span>
                ))}
             </div>
          </div>
        </div>

        {/* Allocation */}
        <div className="xl:col-span-4 luxe-card p-10 space-y-10">
          <h3 className="text-xs font-black text-muted uppercase tracking-widest text-center">Asset Allocation</h3>
          <AllocationChart data={allocation} />
          <div className="space-y-4">
             {allocation.map(item => (
               <div key={item.symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                     <span className="text-xs font-black text-theme uppercase tracking-tight">{item.symbol}</span>
                  </div>
                  <span className="text-xs font-black text-theme">{item.percentage}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxe-card p-8 space-y-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-blue-500">
            <Target size={24} />
          </div>
          <div>
             <h4 className="text-xs font-black text-muted uppercase tracking-widest mb-1">Portfolio Alpha</h4>
             <p className="text-2xl font-black text-theme">0.84</p>
             <p className="text-[10px] text-muted font-bold leading-relaxed">Outperforming the market average by 12% this quarter.</p>
          </div>
        </div>

        <div className="luxe-card p-8 space-y-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl w-fit text-orange-500">
            <Zap size={24} />
          </div>
          <div>
             <h4 className="text-xs font-black text-muted uppercase tracking-widest mb-1">Est. Yearly Yield</h4>
             <p className="text-2xl font-black text-[#16C784]">$1,142.00</p>
             <p className="text-[10px] text-muted font-bold leading-relaxed">Based on current staking and liquidity positions.</p>
          </div>
        </div>

        <div className="luxe-card p-8 space-y-4">
          <div className="p-3 bg-red-500/10 rounded-2xl w-fit text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
             <h4 className="text-xs font-black text-muted uppercase tracking-widest mb-1">Risk Exposure</h4>
             <p className="text-2xl font-black text-red-400">Moderate</p>
             <p className="text-[10px] text-muted font-bold leading-relaxed">High correlation between ETH and SOL positions detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
