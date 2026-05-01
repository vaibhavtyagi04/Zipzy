// API Keys & Configuration
export const API_KEYS = {
  // WalletConnect Project ID (get from cloud.walletconnect.com)
  WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'b3d8f5c1e2a4b6d8e0f2a4c6e8b0d2f4',
  
  // Alchemy API Key (get from dashboard.alchemy.com)
  ALCHEMY_API_KEY: import.meta.env.VITE_ALCHEMY_API_KEY || '',
  
  // Etherscan API Key (get from etherscan.io/apis)
  ETHERSCAN_API_KEY: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
  
  // CoinGecko API (free, no key needed)
  COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
};

// Network Configuration
export const NETWORKS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
};

// API Domain
export const API_BASE = import.meta.env.VITE_API_BASE || "";

// API Endpoints
export const ENDPOINTS = {
  ALCHEMY_BASE: (key) => `https://eth-mainnet.g.alchemy.com/v2/${key}`,
  ETHERSCAN_BASE: 'https://api.etherscan.io/api',
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',
};
