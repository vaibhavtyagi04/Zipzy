// components/BottomNav.jsx
import { motion } from "framer-motion";
import { Wallet, Image as ImageIcon, RefreshCw, History } from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "tokens", icon: Wallet, label: "Tokens" },
    { id: "nfts", icon: ImageIcon, label: "NFTs" },
    { id: "swap", icon: RefreshCw, label: "Swap" },
    { id: "activity", icon: History, label: "Activity" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-phantom-bg/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "text-phantom-purple" : "text-gray-500 group-hover:text-gray-300"}`}>
                <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? "text-phantom-purple" : "text-gray-500 group-hover:text-gray-300"}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-phantom-purple rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
