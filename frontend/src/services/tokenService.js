import { Alchemy, Network } from "alchemy-sdk";
import { API_KEYS } from "../config/env";

const config = {
  apiKey: API_KEYS.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export const TokenService = {
  /**
   * Fetches all ERC-20 token balances for a given address
   */
  getTokenBalances: async (address) => {
    if (!API_KEYS.ALCHEMY_API_KEY) {
      console.warn("Alchemy API Key missing. Skipping token fetch.");
      return [];
    }

    try {
      // Get all token balances
      const balances = await alchemy.core.getTokenBalances(address);

      // Filter out tokens with zero balance
      const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
      });

      // Fetch metadata (symbol, name, logo) for each token
      const tokensWithMetadata = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          
          // Convert balance from hex to decimal based on decimals
          const decimals = metadata.decimals || 18;
          const balance = parseFloat(token.tokenBalance) / Math.pow(10, decimals);

          return {
            contractAddress: token.contractAddress,
            balance: balance,
            symbol: metadata.symbol,
            name: metadata.name,
            logo: metadata.logo,
            decimals: decimals,
          };
        })
      );

      return tokensWithMetadata;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  },
};
