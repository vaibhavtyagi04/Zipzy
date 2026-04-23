// hooks/useWallet.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedKey = localStorage.getItem("zipzy_private_key");
    if (savedKey) {
      try {
        const w = new ethers.Wallet(savedKey);
        setWallet(w);
      } catch (e) {
        console.error("Failed to load wallet", e);
        createNewWallet();
      }
    } else {
      createNewWallet();
    }
    setLoading(false);
  }, []);

  const createNewWallet = () => {
    const w = ethers.Wallet.createRandom();
    localStorage.setItem("zipzy_private_key", w.privateKey);
    setWallet(w);
    return w;
  };

  return { wallet, loading, createNewWallet };
}
