// hooks/useWalletSync.js
// Bridges wagmi's reactive blockchain state into the Zustand store
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { formatEther } from "viem";
import { WalletService } from "../services/walletService";

export function useWalletSync() {
  const { address, isConnected, chainId } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const {
    vault,
    setWallet,
    setBalance,
    setIsConnected,
    setChainId,
    setIsInternalWallet,
  } = useWalletStore();

  // Sync connection state
  useEffect(() => {
    if (isConnected && address) {
      setIsInternalWallet(false);
      setIsConnected(true);
      setWallet({ address, type: "external" });
      setChainId(chainId);
    } else if (vault?.address) {
      setIsInternalWallet(true);
      setIsConnected(true);
      setWallet({ address: vault.address, type: "internal" });
      setChainId(vault.chainId || 1);
    } else {
      setIsInternalWallet(false);
      setIsConnected(false);
      setWallet(null);
      setBalance(0);
    }
  }, [isConnected, address, chainId, vault]);

  // Sync balance
  useEffect(() => {
    if (balanceData) {
      setBalance(parseFloat(formatEther(balanceData.value)));
    }
  }, [balanceData]);

  useEffect(() => {
    if (isConnected || !vault?.address) return;

    let cancelled = false;
    WalletService.getBalance(vault.address, vault.chainId || 1).then((nextBalance) => {
      if (!cancelled) setBalance(parseFloat(nextBalance));
    });

    const interval = setInterval(() => {
      WalletService.getBalance(vault.address, vault.chainId || 1).then((nextBalance) => {
        if (!cancelled) setBalance(parseFloat(nextBalance));
      });
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isConnected, vault, setBalance]);

  // Notify on chain change
  useEffect(() => {
    if (chainId && isConnected) {
      const chainName = chainId === 1 ? "Ethereum Mainnet" : chainId === 11155111 ? "Sepolia Testnet" : `Chain ${chainId}`;
      setChainId(chainId);
    }
  }, [chainId]);

  return {
    address: address || vault?.address,
    isConnected: isConnected || !!vault?.address,
    chainId: chainId || vault?.chainId || 1,
    balance: balanceData,
  };
}
