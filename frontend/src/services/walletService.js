// services/walletService.js
import { ethers } from "ethers";

/**
 * WalletService - Wallet management + Gas estimation
 * Handles internal HD wallets AND works alongside wagmi for MetaMask
 */
export const WalletService = {
  /**
   * Generates a new 12-word mnemonic phrase
   */
  generateMnemonic: () => {
    return ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
  },

  /**
   * Derives a wallet from a mnemonic phrase using BIP-44 path
   */
  deriveWallet: (mnemonic, index = 0) => {
    return ethers.HDNodeWallet.fromPhrase(mnemonic, null, `m/44'/60'/0'/0/${index}`);
  },

  /**
   * Creates a wallet instance from a private key
   */
  fromPrivateKey: (privateKey) => {
    return new ethers.Wallet(privateKey);
  },

  /**
   * Encrypts a wallet's private key with a password
   */
  encrypt: async (wallet, password) => {
    return await wallet.encrypt(password);
  },

  /**
   * Decrypts a wallet from a JSON keystore string
   */
  decrypt: async (json, password) => {
    return await ethers.Wallet.fromEncryptedJson(json, password);
  },

  /**
   * Estimates current gas fees from backend
   */
  estimateGasFees: async () => {
    try {
      const response = await fetch("http://localhost:5000/api/gas-fees");
      const gasData = await response.json();
      
      const marketRes = await fetch("http://localhost:5000/api/market-data");
      const marketData = await marketRes.json();
      const ethPrice = marketData?.ETHUSDT?.price || 2500;

      const gwei = gasData.standard;
      const usdCost = (21000 * gwei * 1e-9 * ethPrice).toFixed(2);

      return {
        maxFeePerGas: gasData.fast,
        maxPriorityFeePerGas: 2,
        total_usd: parseFloat(usdCost),
        gwei: gwei,
        suggestion: gasData.suggestion
      };
    } catch (err) {
      console.error("Gas Estimate Error:", err);
      return {
        maxFeePerGas: "20",
        maxPriorityFeePerGas: "2",
        total_usd: 1.50,
        gwei: 20
      };
    }
  },
};
