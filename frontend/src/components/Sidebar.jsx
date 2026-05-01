// components/Sidebar.jsx
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Heart, History, TrendingUp, BarChart3, Settings, LogOut, Activity, Bell, Sparkles, Coins } from "lucide-react";
import Logo from "./ui/Logo";
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../store/authStore";
import { AuthService } from "../services/authService";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { whaleAlerts, isAiEnabled } = useWalletStore();
  const clearSession = useAuthStore((state) => state.clearSession);
  const unreadNotifications = whaleAlerts.length; // Simplified for demo

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
    { id: 'tokens', label: 'Tokens', icon: Coins, path: '/tokens' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: unreadNotifications },
    { id: "activity", label: "Activity", icon: History, path: "/activity" },
  ];

  const toolItems = [
    { id: "swap", label: "Swap", icon: Activity, path: "/swap" },
    ...(isAiEnabled ? [{ id: "ai-insights", label: "AI Insights", icon: Sparkles, path: "/ai-insights" }] : []),
    { id: "health", label: "Health", icon: BarChart3, path: "/health" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="h-full flex flex-col py-10 px-8 sidebar-glass overflow-y-auto custom-scrollbar">
      {/* Branding */}
      <div className="mb-10 shrink-0">
        <Logo showText={true} />
      </div>

      <div className="flex-1 space-y-8">
        <nav>
          <SectionLabel label="PORTFOLIO" />
          <div className="space-y-3">
            {menuItems.map((item) => (
              <NavItem 
                key={item.id} 
                item={item} 
                isActive={currentPath === item.path} 
              />
            ))}
          </div>
        </nav>

        <nav>
          <SectionLabel label="ECOSYSTEM" />
          <div className="space-y-3">
            {toolItems.map((item) => (
              <NavItem 
                key={item.id} 
                item={item} 
                isActive={currentPath === item.path} 
              />
            ))}
          </div>
        </nav>
      </div>

      <div className="pt-8 border-t border-theme">
        <button
          onClick={async () => {
            try {
              await AuthService.logout();
            } catch (error) {
              console.error("Logout failed", error);
            }
            clearSession();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-4 py-4 w-full rounded-2xl text-muted hover:text-red-400 hover:bg-red-400/5 transition-all font-bold text-sm"
          type="button"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-5 px-4 opacity-60">{label}</p>
  );
}

function NavItem({ item, isActive }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-4 px-5 py-4 w-full rounded-2xl transition-all duration-300 relative group ${isActive ? "text-[#E9B3A2] font-black" : "text-muted hover:text-theme hover:bg-black/5"}`}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebarActive"
          className="absolute inset-0 bg-[#E9B3A2]/10 rounded-2xl -z-10"
        />
      )}
      <item.icon size={22} strokeWidth={isActive ? 3 : 2} className={isActive ? "text-[#E9B3A2]" : "opacity-70"} />
      <span className="text-[15px] flex-1 tracking-tight">{item.label}</span>
      {item.badge > 0 && (
        <span className="bg-[#E9B3A2] text-bg text-[10px] font-black px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {isActive && (
         <div className="absolute left-0 w-1 h-6 bg-[#E9B3A2] rounded-r-full" />
      )}
    </Link>
  );
}
