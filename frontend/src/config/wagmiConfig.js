// config/wagmiConfig.js
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { API_KEYS } from "./env";

export const config = getDefaultConfig({
  appName: "Zipzy Wallet",
  projectId: API_KEYS.WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, sepolia],
});

export const queryClient = new QueryClient();
