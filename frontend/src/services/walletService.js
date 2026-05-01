// services/walletService.js
import { ethers } from "ethers";
import { getProviderForChain, getWalletBalance } from "./blockchain";

const MIN_PASSWORD_LENGTH = 8;

function assertStrongEnoughPassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

function normalizePhrase(phrase) {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}

function toVault(wallet, encryptedJson, chainId = 1) {
  return {
    type: "internal",
    version: 1,
    address: wallet.address,
    encryptedJson,
    chainId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * WalletService - Wallet management + Gas estimation
 * Handles internal HD wallets AND works alongside wagmi for MetaMask
 */
export const WalletService = {
  MIN_PASSWORD_LENGTH,

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
    assertStrongEnoughPassword(password);
    return await wallet.encrypt(password);
  },

  /**
   * Decrypts a wallet from a JSON keystore string
   */
  decrypt: async (json, password) => {
    return await ethers.Wallet.fromEncryptedJson(json, password);
  },

  /**
   * Creates an encrypted non-custodial wallet vault.
   * The mnemonic is returned once for backup and is never persisted by this service.
   */
  createEncryptedWallet: async (password, chainId = 1) => {
    assertStrongEnoughPassword(password);
    const wallet = ethers.Wallet.createRandom();
    const encryptedJson = await wallet.encrypt(password);

    return {
      vault: toVault(wallet, encryptedJson, chainId),
      mnemonic: wallet.mnemonic?.phrase || "",
    };
  },

  /**
   * Imports a wallet from a recovery phrase and stores only the encrypted keystore.
   */
  importEncryptedWallet: async (phrase, password, chainId = 1) => {
    assertStrongEnoughPassword(password);
    const normalizedPhrase = normalizePhrase(phrase);
    const words = normalizedPhrase.split(" ");

    if (![12, 15, 18, 21, 24].includes(words.length)) {
      throw new Error("Secret Recovery Phrase must be 12, 15, 18, 21, or 24 words");
    }

    ethers.Mnemonic.fromPhrase(normalizedPhrase);
    const wallet = ethers.Wallet.fromPhrase(normalizedPhrase);
    const encryptedJson = await wallet.encrypt(password);

    return toVault(wallet, encryptedJson, chainId);
  },

  /**
   * Unlocks a persisted encrypted vault for the current session only.
   */
  unlockVault: async (vault, password, chainId = vault?.chainId || 1) => {
    if (!vault?.encryptedJson) {
      throw new Error("Encrypted wallet vault not found");
    }

    const wallet = await ethers.Wallet.fromEncryptedJson(vault.encryptedJson, password);
    return wallet.connect(getProviderForChain(chainId));
  },

  getBalance: async (address, chainId = 1) => {
    return getWalletBalance(address, chainId);
  },

  getNetwork: async (chainId = 1) => {
    const provider = getProviderForChain(chainId);
    return provider.getNetwork();
  },

  sendEth: async ({ vault, password, to, amountEth, chainId = vault?.chainId || 1 }) => {
    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    const wallet = await WalletService.unlockVault(vault, password, chainId);
    return wallet.sendTransaction({
      to,
      value: ethers.parseEther(amountEth.toString()),
    });
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
