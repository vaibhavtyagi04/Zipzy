// services/blockchain.js
import { ethers } from "ethers";
import axios from 'axios';
import { parseEther, formatEther } from 'viem';
import { API_KEYS, ENDPOINTS } from '../config/env';

export const CHAIN_LABELS = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  137: "Polygon",
};

const RPC_URLS = {
  1: import.meta.env.VITE_ETHEREUM_RPC_URL || "https://cloudflare-eth.com",
  11155111: import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  137: import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com",
};

export const getChainName = (chainId) => {
  if (!chainId) return "Ethereum Mainnet";
  return CHAIN_LABELS[Number(chainId)] || `Chain ${chainId}`;
};

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URLS[1]);
};

export const getProviderForChain = (chainId = 1) => {
  const id = Number(chainId || 1);
  return new ethers.JsonRpcProvider(RPC_URLS[id] || RPC_URLS[1]);
};

export const getWalletBalance = async (address, chainId = 1) => {
  try {
    const provider = getProviderForChain(chainId);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0.0";
  }
};

// Explorer URL helpers
export function getExplorerTxUrl(chainId, hash) {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

export function getExplorerAddressUrl(chainId, address) {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

/**
 * PHASE 4: Send ETH Transaction
 */
export const prepareSendTransaction = (toAddress, amountEth) => {
  // Validate address format
  if (!toAddress || !toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid Ethereum address');
  }

  // Validate amount
  if (isNaN(amountEth) || amountEth <= 0) {
    throw new Error('Invalid amount');
  }

  return {
    to: toAddress,
    value: parseEther(amountEth.toString()),
    data: '0x',
  };
};

/**
 * PHASE 5: Estimate Gas Fees
 */
export const estimateTransactionGas = async (publicClient, { to, value, data = '0x' }) => {
  try {
    if (!publicClient) {
      throw new Error('PublicClient not available');
    }

    // Get current gas price
    const gasPrice = await publicClient.getGasPrice();

    // Estimate gas for transaction
    const gasEstimate = await publicClient.estimateGas({
      account: undefined,
      to,
      value,
      data,
    }).catch(() => {
      // Fallback: 21000 for ETH transfer
      return BigInt(21000);
    });

    const gasCost = (gasEstimate * gasPrice) / BigInt(1e18); // Convert to ETH
    const totalCost = (value + gasEstimate * gasPrice) / BigInt(1e18);

    return {
      gasEstimate: gasEstimate.toString(),
      gasPrice: formatEther(gasPrice),
      gasCost: formatEther(gasEstimate * gasPrice),
      totalCost: formatEther(value + gasEstimate * gasPrice),
    };
  } catch (error) {
    console.error('Gas estimation error:', error);
    // Return reasonable defaults
    return {
      gasEstimate: '21000',
      gasPrice: '0.00001',
      gasCost: '0.00021',
      totalCost: formatEther(value || BigInt(0)),
    };
  }
};

/**
 * PHASE 6: Fetch Transaction History from Etherscan
 */
export const fetchTransactionHistory = async (address, limit = 10) => {
  if (!API_KEYS.ETHERSCAN_API_KEY) {
    console.warn('Etherscan API key not configured');
    return [];
  }

  try {
    const response = await axios.get(ENDPOINTS.ETHERSCAN_BASE, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: API_KEYS.ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status !== '1') {
      console.log('No transactions found');
      return [];
    }

    return response.data.result.slice(0, limit).map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: formatEther(BigInt(tx.value)),
      gasPrice: formatEther(BigInt(tx.gasPrice)),
      gasUsed: tx.gasUsed,
      status: tx.isError === '0' ? 'success' : 'failed',
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      type: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
    }));
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    return [];
  }
};

/**
 * Validate wallet address
 */
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate sufficient balance
 */
export const validateBalance = (balance, requiredAmount) => {
  return parseFloat(balance) >= parseFloat(requiredAmount);
};

/**
 * Format transaction display
 */
export const formatTransaction = (tx) => {
  return {
    ...tx,
    displayValue: `${parseFloat(tx.value).toFixed(4)} ETH`,
    displayGas: `${parseFloat(tx.gasPrice).toFixed(8)} ETH`,
    displayTime: new Date(tx.timestamp).toLocaleString(),
  };
};
