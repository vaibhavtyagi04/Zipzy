// pages/Home.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Mail, Settings, ChevronDown, Plus } from "lucide-react";
import Background from "../components/Background";
import Sidebar from "../components/Sidebar";
import PortfolioSummary from "../components/PortfolioSummary";
import TokenList from "../components/TokenList";
import SwapCard from "../components/SwapCard";
import Avatar from "../components/Avatar";
import { useWallet } from "../hooks/useWallet";
import Profile from "./Profile";
import { getMarketPrices } from "../services/marketData";

export default function Home() {
  const { wallet, loading } = useWallet();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentView, setCurrentView] = useState("dashboard");
  const [marketData, setMarketData] = useState(null);

  const fetchPrices = async () => {
    const data = await getMarketPrices();
    if (data) setMarketData(data);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const totalValue = marketData ? (2.345 * marketData.eth.price) + (45.2 * marketData.sol.price) : 1080000;

  return (
    <AnimatePresence mode="wait">
      {currentView === "profile" ? (
        <Profile key="profile" onBack={() => setCurrentView("dashboard")} />
      ) : (
        <motion.div 
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-phantom-bg text-phantom-text font-sans overflow-hidden flex"
        >
          <Background />

          {/* Sidebar */}
          <aside className="w-64 h-screen sticky top-0 hidden lg:block">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          {/* Main Content & Right Panel Grid */}
          <div className="flex-1 flex flex-col h-screen overflow-y-auto">
            
            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-phantom-bg/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-12">
                <h2 className="text-2xl font-black tracking-tight capitalize">{activeTab}</h2>
                
                {/* Global Search */}
                <div className="relative hidden md:block group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-phantom-purple transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search market..." 
                    className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-phantom-purple/20 transition-all w-64 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-phantom-bg" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Mail size={20} />
                  </button>
                </div>
                
                {/* User Dropdown */}
                <div 
                  onClick={() => setCurrentView("profile")}
                  className="flex items-center gap-3 bg-white/5 border border-white/5 p-1.5 pr-4 rounded-full cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Avatar seed="Vaibhav" />
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight">Vaibhav</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PRO WALLET</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-600" />
                </div>
              </div>
            </header>

            {/* Scrollable Dashboard Grid */}
            <main className="p-10">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                
                {/* Main Content Area */}
                <div className="xl:col-span-8 space-y-10">
                  <PortfolioSummary totalBalance={totalValue} change={24500} />
                  
                  <section>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black tracking-tight">Top assets</h3>
                      <button className="text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">See All</button>
                    </div>
                    <TokenList marketData={marketData} />
                  </section>
                </div>

                {/* Right Panel Area */}
                <div className="xl:col-span-4 space-y-10">
                  <SwapCard />
                  
                  <div className="bg-gradient-to-br from-[#D4FF75]/10 to-transparent p-8 rounded-[40px] border border-[#D4FF75]/5 relative overflow-hidden group">
                    <h3 className="font-black mb-2">History available</h3>
                    <p className="text-xs text-gray-500 mb-6">Check your weekly transaction reports and analytics.</p>
                    <button className="text-xs font-black text-[#D4FF75] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                      VIEW REPORT →
                    </button>
                    <Plus size={60} className="absolute -bottom-4 -right-4 text-[#D4FF75]/5 rotate-12 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

              </div>
            </main>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
