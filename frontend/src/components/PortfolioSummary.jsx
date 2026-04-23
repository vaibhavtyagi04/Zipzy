// components/PortfolioSummary.jsx
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export default function PortfolioSummary({ totalBalance = 0, ethBalance = 0, ethSymbol = "ETH", change = 0 }) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalBalance);

  return (
    <div className="luxe-card p-10 relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-3">TOTAL BALANCE</p>
          <h1 className="text-6xl font-black tracking-tighter text-theme mb-2">{formattedBalance}</h1>
          
          <div className="flex items-center gap-3 mb-4">
            <p className="text-lg font-bold text-[#E9B3A2]">
              {ethBalance.toFixed(4)} <span className="text-sm opacity-60">{ethSymbol}</span>
            </p>
            <div className="h-4 w-px bg-white/10" />
            <div className={`flex items-center gap-1 ${change >= 0 ? 'bg-[#16C784]/10 text-[#16C784]' : 'bg-red-500/10 text-red-500'} px-3 py-1 rounded-full text-xs font-black`}>
              <ArrowUpRight size={14} strokeWidth={3} className={change >= 0 ? '' : 'rotate-90'} />
              {change >= 0 ? '+' : ''}{change}%
            </div>
          </div>
          
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Live Portfolio Value</span>
        </div>

        <div className="text-right">
           <div className="w-16 h-16 bg-[#E9B3A2]/10 rounded-3xl flex items-center justify-center mb-4">
              <TrendingUp size={28} className="text-[#E9B3A2]" />
           </div>
        </div>
      </div>

      {/* Luxe Gradient Graph - Dusty Rose to Transparent */}
      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-40 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E9B3A2" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E9B3A2" stopOpacity="0" />
            </linearGradient>
            <mask id="chartMask">
               <path d="M0,80 C50,65 100,85 150,45 C200,5 250,55 300,35 C350,15 400,55 400,80 L400,100 L0,100 Z" fill="white" />
            </mask>
          </defs>
          <path 
            d="M0,80 C50,65 100,85 150,45 C200,5 250,55 300,35 C350,15 400,55 400,80" 
            fill="none" 
            stroke="#E9B3A2" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="animate-pulse"
          />
          <rect width="400" height="100" fill="url(#roseGradient)" mask="url(#chartMask)" />
        </svg>
      </div>

      {/* Decorative Star Icon from Logo */}
      <div className="absolute -top-10 -right-10 w-40 h-40 opacity-[0.05] pointer-events-none">
         <svg viewBox="0 0 24 24" fill="#E9B3A2">
            <path d="M12 0C12 0 14 10 24 12C14 12 12 24 12 24C12 24 10 12 0 12C10 12 12 0 12 0Z" />
         </svg>
      </div>
    </div>
  );
}
