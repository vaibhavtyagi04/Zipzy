// hooks/useWalletBalance.js
import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import axios from 'axios';
import { API_KEYS, ENDPOINTS } from '../config/env';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address, watch: true });
  
  const [tokens, setTokens] = useState([]);
  const [tokenPrices, setTokenPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Common token contract addresses on Ethereum mainnet
  const COMMON_TOKENS = {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2',
  };

  // Fetch token prices from CoinGecko (free API)
  const fetchTokenPrices = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.COINGECKO_BASE}/simple/price`, {
        params: {
          ids: 'ethereum,usd-coin,tether,dai',
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
        },
      });
      
      const prices = {
        ETH: response.data.ethereum.usd,
        USDC: response.data['usd-coin'].usd,
        USDT: response.data.tether.usd,
        DAI: response.data.dai.usd,
      };
      
      setTokenPrices(prices);
      return prices;
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError(err.message);
      return {};
    }
  };

  // Fetch token balances from Alchemy (requires API key)
  const fetchTokenBalances = async () => {
    if (!address || !API_KEYS.ALCHEMY_API_KEY) {
      console.log('Skipping Alchemy fetch - address or API key missing');
      return [];
    }

    try {
      setLoading(true);
      
      // Using Alchemy's getTokenBalances endpoint
      const response = await axios.post(
        `${ENDPOINTS.ALCHEMY_BASE(API_KEYS.ALCHEMY_API_KEY)}`,
        {
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          params: [address, 'erc20'],
          id: 1,
        }
      );

      if (response.data.result?.tokenBalances) {
        const formattedTokens = response.data.result.tokenBalances
          .filter(t => t.tokenBalance !== '0x0')
          .map(t => ({
            address: t.contractAddress,
            symbol: Object.keys(COMMON_TOKENS).find(
              key => COMMON_TOKENS[key] === t.contractAddress
            ) || 'UNKNOWN',
            balance: t.tokenBalance,
          }));
        
        setTokens(formattedTokens);
        return formattedTokens;
      }
    } catch (err) {
      console.log('Alchemy fetch skipped or failed (this is ok):', err.message);
      // This is expected if Alchemy API key is not configured
    }
    
    return [];
  };

  // Calculate total portfolio value
  const calculatePortfolioValue = (prices) => {
    let total = 0;
    
    if (ethBalance) {
      const ethValue = ethBalance.value / 1e18; // Convert from wei
      total += ethValue * (prices.ETH || 0);
    }
    
    tokens.forEach(token => {
      if (prices[token.symbol]) {
        const balance = token.balance / 1e18; // Assuming 18 decimals
        total += balance * prices[token.symbol];
      }
    });
    
    return total;
  };

  // Load data when connected
  useEffect(() => {
    if (!isConnected || !address) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const prices = await fetchTokenPrices();
        await fetchTokenBalances();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    ethBalance: ethBalance ? {
      formatted: ethBalance.formatted,
      symbol: ethBalance.symbol,
      decimals: ethBalance.decimals,
      value: parseFloat(ethBalance.formatted),
    } : null,
    tokens,
    tokenPrices,
    portfolioValue: calculatePortfolioValue(tokenPrices),
    loading,
    error,
  };
};

export default useWalletBalance;
