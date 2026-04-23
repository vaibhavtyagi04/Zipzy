// store/walletStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useWalletStore = create(
  persist(
    (set, get) => ({
      // Wallet state (synced from wagmi via useWalletSync)
      wallet: null,
      loading: true,
      address: "",
      balance: 0,
      chainId: null,
      isConnected: false,
      // Market & Holdings
      marketData: {},
      historicalData: {},
      tokens: [],
      holdings: {},
      
      // UI State
      isDarkMode: true,
      notifications: [],
      user: {
        name: "Vaibhav",
        email: "vaibhav@zipzy.eth",
        bio: "Web3 Developer & Crypto Enthusiast",
        avatar: "Vaibhav"
      },
      
      // Intelligent Features
      network: "ethereum",
      isAiEnabled: true,
      isNotificationsEnabled: true,
      whaleAlerts: [],

      // Setters (wagmi-synced)
      setWallet: (wallet) => set({ 
        wallet, 
        address: wallet?.address || "", 
        loading: false 
      }),
      setLoading: (loading) => set({ loading }),
      setBalance: (balance) => set({ balance }),
      setIsConnected: (isConnected) => set({ isConnected }),
      setChainId: (chainId) => set({ chainId }),
      setVault: (vault) => set({ vault }),
      setIsInternalWallet: (v) => set({ isInternalWallet: v }),
      setTokens: (tokens) => set({ tokens }),
      
      // Market
      setMarketData: (marketData) => set({ marketData }),
      setHoldings: (holdings) => set({ holdings }),
      
      updateSingleAsset: (symbol, data) => set((state) => ({
        marketData: {
          ...state.marketData,
          [symbol]: {
            ...(state.marketData[symbol] || {}),
            ...data
          }
        }
      })),

      setHistoricalData: (symbol, data) => set((state) => ({
        historicalData: { ...state.historicalData, [symbol]: data }
      })),

      updateHistoricalData: (symbol, kline) => set((state) => {
        const existing = state.historicalData[symbol] || [];
        const last = existing[existing.length - 1];
        let updated;
        if (last && last.time === kline.time) {
          updated = [...existing.slice(0, -1), kline];
        } else {
          updated = [...existing, kline].slice(-200);
        }
        return {
          historicalData: { ...state.historicalData, [symbol]: updated }
        };
      }),
      
      // UI
      toggleDarkMode: () => {
        const nextMode = !get().isDarkMode;
        document.documentElement.classList.toggle("dark", nextMode);
        set({ isDarkMode: nextMode });
      },
      
      addNotification: (message, type = "info") => {
        if (!get().isNotificationsEnabled) return;
        const id = Date.now();
        set((state) => ({ 
          notifications: [...state.notifications, { id, message, type }] 
        }));
        setTimeout(() => {
          get().removeNotification(id);
        }, 4000);
      },

      removeNotification: (id) => set((state) => ({ 
        notifications: state.notifications.filter(n => n.id !== id) 
      })),
      
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      setNetwork: (network) => set({ network }),
      setInsights: (insights) => set({ insights }),
      setIsAiEnabled: (isAiEnabled) => set({ isAiEnabled }),
      setIsNotificationsEnabled: (isNotificationsEnabled) => set({ isNotificationsEnabled }),
      addWhaleAlert: (alert) => {
        if (!get().isNotificationsEnabled) return;
        set((state) => ({ 
          whaleAlerts: [alert, ...state.whaleAlerts].slice(0, 50) 
        }));
        get().addNotification(alert.msg, alert.type === 'price_crash' ? 'error' : 'info');
      },
      clearWhaleAlerts: () => set({ whaleAlerts: [] }),

      rehydrated: false,
      setRehydrated: (val) => set({ rehydrated: val }),
    }),
    {
      name: "zipzy-wallet-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        address: state.address, 
        balance: state.balance,
        marketData: state.marketData,
        isDarkMode: state.isDarkMode,
        user: state.user,
        network: state.network,
        isAiEnabled: state.isAiEnabled,
        isNotificationsEnabled: state.isNotificationsEnabled,
        chainId: state.chainId,
        vault: state.vault,
        isInternalWallet: state.isInternalWallet,
      }),
      onRehydrateStorage: () => (state) => {
        state.setRehydrated(true);
      }
    }
  )
);
