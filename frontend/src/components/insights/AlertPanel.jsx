import React, { useEffect, useState } from "react";
import { useWalletStore } from "../../store/walletStore";
import { Bell, Zap, TrendingUp, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AlertItem = ({ alert, onRemove }) => {
  const getIcon = () => {
    switch (alert.type) {
      case "whale_alert": return <Zap className="text-yellow-400" size={16} />;
      case "price_crash": return <AlertTriangle className="text-red-500" size={16} />;
      default: return <Bell className="text-[#E9B3A2]" size={16} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-surface border border-theme p-4 rounded-2xl flex items-start gap-4 group relative"
    >
      <div className="p-2 bg-black/20 rounded-xl">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-theme leading-tight mb-1">{alert.msg}</p>
        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <button 
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-lg"
      >
        <X size={14} className="text-muted" />
      </button>
    </motion.div>
  );
};

export default function AlertPanel() {
  const { whaleAlerts, removeNotification } = useWalletStore();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    setAlerts(whaleAlerts);
  }, [whaleAlerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-10 z-50 w-80 space-y-3">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E9B3A2]">Live Alerts</h4>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <AlertItem 
            key={alert.timestamp + index} 
            alert={alert} 
            onRemove={() => {
              setAlerts(prev => prev.filter((_, i) => i !== index));
            }} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
