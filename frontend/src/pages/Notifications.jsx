import React, { useState, useMemo } from "react";
import { useWalletStore } from "../store/walletStore";
import { Bell, Zap, TrendingUp, AlertTriangle, Trash2, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationCard = ({ alert }) => {
  const getTheme = () => {
    switch (alert.type) {
      case "whale_alert": return "bg-yellow-500/10 border-yellow-500/20";
      case "price_crash": return "bg-red-500/10 border-red-500/20";
      default: return "bg-white/5 border-white/5";
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case "whale_alert": return <Zap className="text-yellow-400" size={18} />;
      case "price_crash": return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Bell className="text-[#E9B3A2]" size={18} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-6 rounded-3xl border ${getTheme()} flex items-start gap-6 transition-all hover:translate-x-1`}
    >
      <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-black text-theme uppercase tracking-tight">
            {alert.type === "whale_alert" ? "Whale Movement" : "Notification"}
          </h4>
          <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm font-bold text-theme opacity-80 leading-relaxed mb-2">{alert.msg}</p>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-muted tracking-widest">
            {alert.symbol || "System"}
          </span>
          {alert.usd_value && (
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
              Value: ${new Intl.NumberFormat().format(alert.usd_value)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Notifications() {
  const { whaleAlerts, clearWhaleAlerts } = useWalletStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredAlerts = useMemo(() => {
    let list = whaleAlerts;
    if (filter === "whale") list = list.filter(a => a.type === "whale_alert");
    if (search) list = list.filter(a => a.msg.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [whaleAlerts, filter, search]);

  const filters = [
    { id: "all", label: "All Alerts", count: whaleAlerts.length },
    { id: "whale", label: "Whale Moves", count: whaleAlerts.filter(a => a.type === "whale_alert").length },
    { id: "transactions", label: "Transactions", count: 0 },
    { id: "system", label: "System", count: 0 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-theme">Notifications</h1>
          <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">Manage your real-time alerts and activity</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={clearWhaleAlerts}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left: Filters */}
        <div className="xl:col-span-3 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4 px-2">Filters</p>
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl transition-all ${filter === f.id ? "bg-[#E9B3A2]/10 text-[#E9B3A2] font-black" : "text-muted hover:bg-white/5"}`}
              >
                <span className="text-xs uppercase tracking-widest">{f.label}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filter === f.id ? "bg-[#E9B3A2] text-bg" : "bg-white/5"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#E9B3A2]/20 transition-all text-xs text-theme"
            />
          </div>
        </div>

        {/* Right: List */}
        <div className="xl:col-span-9 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <NotificationCard key={alert.timestamp + index} alert={alert} />
              ))
            ) : (
              <div className="py-40 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                <Bell size={40} className="mx-auto mb-6 text-muted opacity-20" />
                <p className="text-muted font-black uppercase tracking-[0.3em]">No notifications found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
