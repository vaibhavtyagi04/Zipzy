// components/layout/MainLayout.jsx
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Sidebar from "../Sidebar";
import Avatar from "../Avatar";
import Background from "../Background";
import NotificationToast from "../ui/NotificationToast";
import { useWalletStore } from "../../store/walletStore";
import { useLocation, Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import { useMarketWS } from "../../hooks/useMarketWS";
import { useWalletSync } from "../../hooks/useWalletSync";

export default function MainLayout({ children }) {
  const { user, isDarkMode, addNotification, updateSingleAsset } = useWalletStore();
  useWalletSync(); // Bridge wagmi → Zustand
  const { subscribe } = useMarketWS();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = location.pathname.split("/")[1] || "Dashboard";
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (val) => {
    setSearch(val);
    if (val.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${val}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search fetch failed:", error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = (symbol) => {
    // Add to local state and subscribe to WS
    updateSingleAsset(symbol, { symbol: symbol.replace("USDT", ""), price: 0, change: 0 });
    subscribe([symbol]);
    addNotification(`Subscribed to ${symbol}`, "info");
    setSearch("");
    setResults([]);
    navigate(`/coin/${symbol}`);
  };

  const userName = user?.name || "User";
  const userAvatar = user?.avatar || "Zipzy";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-phantom-bg text-phantom-text" : "bg-gray-50 text-gray-900"} font-sans overflow-hidden flex transition-colors duration-500`}>
      {isDarkMode && <Background />}

      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 hidden lg:block z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto z-10">
        
        {/* Top Bar */}
        <header className={`sticky top-0 z-40 ${isDarkMode ? "bg-phantom-bg/80" : "bg-white/80"} backdrop-blur-md px-10 py-6 flex justify-between items-center border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
          <div className="flex items-center gap-12">
            <h2 className="text-2xl font-black tracking-tight capitalize">{pageTitle}</h2>
            
            <div className="relative hidden md:block group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-phantom-purple transition-colors" />
              <input 
                type="text" 
                placeholder="Search market (e.g. BTC)..." 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className={`${isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} border rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-phantom-purple/20 transition-all w-64 text-sm`}
              />
              
              {results.length > 0 && (
                <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl border ${isDarkMode ? "bg-[#1E1E1E] border-white/5 shadow-2xl" : "bg-white border-gray-200 shadow-lg"} overflow-hidden z-50`}>
                  {results.map(res => (
                    <div 
                      key={res.symbol}
                      onClick={() => handleSelect(res.symbol)}
                      className={`px-6 py-3 cursor-pointer hover:bg-phantom-purple/5 transition-colors flex justify-between items-center`}
                    >
                      <span className="font-black text-xs tracking-wider">{res.symbol}</span>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{res.baseAsset}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          <div className="flex items-center gap-6">
            <ConnectButton />
            <Link 
              to="/profile"
              className={`${isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} flex items-center gap-3 border p-1.5 pr-4 rounded-full cursor-pointer hover:bg-opacity-80 transition-all`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Avatar seed={userAvatar} />
              </div>
              <div>
                <p className="text-xs font-black leading-tight">{userName.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PRO WALLET</p>
              </div>
              <ChevronDown size={14} className="text-gray-600" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <NotificationToast />
    </div>
  );
}
