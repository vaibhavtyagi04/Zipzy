// components/WalletBalanceReal.jsx
import React from 'react';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { GlassCard } from './GlassCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletBalanceReal() {
  const { address, isConnected, ethBalance, portfolioValue, tokenPrices, loading, error } = useWalletBalance();

  if (!isConnected) {
    return (
      <GlassCard className="p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          <p className="text-sm text-gray-400">Connect your wallet to see balance</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
          <p className="text-sm text-red-400">Error: {error}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Connected Wallet</p>
            <p className="font-mono text-sm truncate">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <div className="border-t border-white/5 pt-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Balance</p>
            
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-3xl font-black">
                    ${portfolioValue?.toFixed(2)}
                  </p>
                  {ethBalance && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        {ethBalance.value.toFixed(4)} ETH
                      </p>
                      {tokenPrices.ETH && (
                        <p className="text-xs text-gray-500">
                          @ ${tokenPrices.ETH.toFixed(2)} /ETH
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
