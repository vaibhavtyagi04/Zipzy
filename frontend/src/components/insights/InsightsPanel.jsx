import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const InsightCard = ({ insight }) => {
  const getTheme = () => {
    switch (insight.type) {
      case "bullish": return "bg-green-500/10 border-green-500/20 text-green-500";
      case "warning": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      case "info": return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      default: return "bg-white/5 border-white/10 text-theme";
    }
  };

  const getIcon = () => {
    switch (insight.type) {
      case "bullish": return <TrendingUp size={16} />;
      case "warning": return <ShieldAlert size={16} />;
      case "info": return <Sparkles size={16} />;
      default: return <Zap size={16} />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${getTheme()} transition-all hover:scale-[1.02] cursor-default`}>
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-[10px] font-black uppercase tracking-widest">{insight.title}</span>
      </div>
      <p className="text-xs font-bold leading-relaxed opacity-90">{insight.desc}</p>
    </div>
  );
};

export default function InsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/insights");
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error("Insights fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E9B3A2]/10 rounded-xl">
            <Sparkles className="text-[#E9B3A2]" size={18} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-theme leading-none">Smart Insights</h3>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <span className="text-[8px] font-black uppercase tracking-widest text-muted">AI Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={24} />
          </div>
        ) : (
          insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>
    </div>
  );
}
