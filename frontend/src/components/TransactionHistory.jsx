// components/TransactionHistory.jsx
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchTransactionHistory, getExplorerTxUrl } from '../services/blockchain';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

export default function TransactionHistory({ limit = 5 }) {
  const { address, chainId } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const txs = await fetchTransactionHistory(address, limit);
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
    // Refresh every 30 seconds
    const interval = setInterval(loadTransactions, 30000);
    return () => clearInterval(interval);
  }, [address, limit]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, idx) => (
        <motion.div
          key={tx.hash}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10 group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              tx.type === 'sent' 
                ? 'bg-red-500/10 text-red-400' 
                : 'bg-green-500/10 text-green-400'
            }`}>
              {tx.type === 'sent' 
                ? <ArrowUpRight className="w-4 h-4" /> 
                : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            
            <div>
              <p className="text-sm font-semibold capitalize">{tx.type}</p>
              <p className="text-xs text-gray-500">
                {new Date(tx.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{parseFloat(tx.value).toFixed(4)} ETH</p>
              <p className={`text-xs ${
                tx.status === 'success' 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {tx.status}
              </p>
            </div>

            <a
              href={getExplorerTxUrl(chainId, tx.hash)}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
