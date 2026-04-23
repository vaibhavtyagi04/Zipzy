// App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { config, queryClient } from "./config/wagmiConfig";
import { useAccount } from "wagmi";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Tokens from "./pages/Tokens";
import NFTs from "./pages/NFTs";
import Swap from "./pages/Swap";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Health from "./pages/Health";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BalanceDetail from "./pages/BalanceDetail";
import Notifications from "./pages/Notifications";
import AIInsights from "./pages/AIInsights";
import PortfolioAnalytics from "./pages/PortfolioAnalytics";
import WalletSetup from "./pages/WalletSetup";
import CoinDetail from "./pages/CoinDetail";
import ErrorBoundary from "./components/ErrorBoundary";
import { useWalletStore } from "./store/walletStore";
import { getMarketPrices } from "./services/marketData";

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useAccount();
  const { vault } = useWalletStore();
  // Allow access if connected via MetaMask OR has an internal wallet
  if (!isConnected && !vault) return <Navigate to="/wallet/setup" />;
  return (
    <ErrorBoundary>
      <MainLayout>{children}</MainLayout>
    </ErrorBoundary>
  );
};

function AppRoutes() {
  const { setMarketData, isDarkMode, rehydrated, isAiEnabled, vault } = useWalletStore();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!rehydrated) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    
    const fetchMarket = async () => {
      const data = await getMarketPrices();
      if (data) setMarketData(data);
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);
    return () => clearInterval(interval);
  }, [setMarketData, isDarkMode, rehydrated]);

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-phantom-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E9B3A2]/20 border-t-[#E9B3A2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/wallet/setup" element={(isConnected || vault) ? <Navigate to="/" /> : <WalletSetup />} />
      <Route path="/" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/tokens" element={<ProtectedRoute><ErrorBoundary><Tokens /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/coin/:id" element={<ProtectedRoute><ErrorBoundary><CoinDetail /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/nfts" element={<ProtectedRoute><NFTs /></ProtectedRoute>} />
      <Route path="/swap" element={<ProtectedRoute><Swap /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/ai-insights" element={
        <ProtectedRoute>
          {isAiEnabled ? <AIInsights /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />
      <Route path="/balance-detail" element={<ProtectedRoute><ErrorBoundary><BalanceDetail /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><ErrorBoundary><PortfolioAnalytics /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><Health /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
