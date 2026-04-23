// hooks/useWalletSync.js
// Bridges wagmi's reactive blockchain state into the Zustand store
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { formatEther } from "viem";

export function useWalletSync() {
  const { address, isConnected, chainId, connector } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const {
    setWallet,
    setBalance,
    setIsConnected,
    setChainId,
    addNotification,
  } = useWalletStore();

  // Sync connection state
  useEffect(() => {
    setIsConnected(isConnected);
    if (isConnected && address) {
      setWallet({ address });
      setChainId(chainId);
    } else {
      setWallet(null);
      setBalance(0);
    }
  }, [isConnected, address, chainId]);

  // Sync balance
  useEffect(() => {
    if (balanceData) {
      setBalance(parseFloat(formatEther(balanceData.value)));
    }
  }, [balanceData]);

  // Notify on chain change
  useEffect(() => {
    if (chainId && isConnected) {
      const chainName = chainId === 1 ? "Ethereum Mainnet" : chainId === 11155111 ? "Sepolia Testnet" : `Chain ${chainId}`;
      setChainId(chainId);
    }
  }, [chainId]);

  return { address, isConnected, chainId, balance: balanceData };
}
