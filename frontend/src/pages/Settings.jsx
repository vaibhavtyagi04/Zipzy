// pages/Settings.jsx
import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useWalletStore } from "../store/walletStore";
import { Sun, Moon, Shield, Key, Download, Trash2, User, Eye, EyeOff, Copy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    addNotification, 
    wallet, 
    isAiEnabled, 
    setIsAiEnabled,
    isNotificationsEnabled,
    setIsNotificationsEnabled
  } = useWalletStore();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Appearance Section */}
        <Card className="p-8">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-theme">
            {isDarkMode ? <Moon className="text-phantom-purple" /> : <Sun className="text-orange-400" />}
            Appearance
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Dark Mode</p>
                <p className="text-xs text-gray-500">Enable high-contrast dark theme</p>
              </div>
              <button 
                onClick={() => {
                  toggleDarkMode();
                  addNotification(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`, "success");
                }}
                className={`w-14 h-8 rounded-full relative p-1 transition-colors ${isDarkMode ? "bg-phantom-purple" : "bg-gray-200"}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${isDarkMode ? "translate-x-6" : "translate-x-0"} flex items-center justify-center`}>
                  {isDarkMode ? <Moon size={12} className="text-black" /> : <Sun size={12} className="text-black" />}
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Account Shortcut */}
        <Card className="p-8">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-theme">
            <User className="text-phantom-purple" />
            Account
          </h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Manage your personal information, email preferences, and linked social accounts.
          </p>
          <Link to="/profile">
            <Button variant="secondary" fullWidth>Edit Profile Settings</Button>
          </Link>
        </Card>

        {/* AI Features Section */}
        <Card className="p-8">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-theme">
            <Sparkles className="text-[#E9B3A2]" />
            Intelligence
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Smart Insights</p>
                <p className="text-xs text-gray-500">Enable AI-driven market intelligence</p>
              </div>
              <button 
                onClick={() => {
                  const nextVal = !isAiEnabled;
                  setIsAiEnabled(nextVal);
                  addNotification(`AI Insights ${nextVal ? 'Enabled' : 'Disabled'}`, "info");
                }}
                className={`w-14 h-8 rounded-full relative p-1 transition-colors ${isAiEnabled ? "bg-[#E9B3A2]" : "bg-gray-200"}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${isAiEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div>
                <p className="font-bold">Real-time Notifications</p>
                <p className="text-xs text-gray-500">Whale moves and system popups</p>
              </div>
              <button 
                onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                className={`w-14 h-8 rounded-full relative p-1 transition-colors ${isNotificationsEnabled ? "bg-green-500" : "bg-gray-200"}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${isNotificationsEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Security Info Card */}
        <Card className="p-8 col-span-full border-[#16C784]/10 bg-[#16C784]/5">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-[#16C784]/10 rounded-2xl text-[#16C784]">
               <Shield size={28} />
             </div>
             <div>
               <h3 className="text-xl font-black text-theme mb-1">Non-Custodial Security</h3>
               <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                 Zipzy is a strictly non-custodial interface. We <span className="text-[#16C784] font-bold">never store</span> your private keys or seed phrase. All transactions are signed directly within your connected wallet (MetaMask, WalletConnect, or Safe).
               </p>
             </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
