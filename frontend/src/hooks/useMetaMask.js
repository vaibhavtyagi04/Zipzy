import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export const useMetaMask = () => {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setAddress(await signer.getAddress());
          const network = await provider.getNetwork();
          setChainId(network.chainId);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
        }
      };

      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use proper eth_requestAccounts as requested
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const connectedAddress = await signer.getAddress();
        setAddress(connectedAddress);
        
        const network = await provider.getNetwork();
        setChainId(network.chainId);
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (err) {
      console.error("Error switching network:", err);
    }
  };

  return {
    address,
    chainId,
    isLoading,
    error,
    connectWallet,
    switchNetwork,
    isConnected: !!address
  };
};
