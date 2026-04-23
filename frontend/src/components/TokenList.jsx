import React, { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import TokenIcon from "./ui/TokenIcon";

const TokenCard = memo(({ asset, onClick }) => (
  <div 
    className="luxe-card p-6 flex items-center justify-between group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
    onClick={onClick}
  >
    <div className="flex items-center gap-5">
      <TokenIcon symbol={asset.symbol} src={asset.icon} />
      <div>
        <p className="text-lg font-black tracking-tight text-theme">{asset.name}</p>
        <p className="text-xs font-bold text-muted uppercase tracking-[0.2em]">{asset.symbol}</p>
      </div>
    </div>

    <div className="text-right">
      <p className="text-lg font-black tracking-tighter text-theme">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((asset.price * asset.holding) || 0)}
      </p>
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">
        {asset.holding} {asset.symbol}
      </p>
      <div className={`flex items-center justify-end gap-1 text-[11px] font-black ${asset.change >= 0 ? "text-[#16C784]" : "text-[#FF5A5A]"}`}>
        {asset.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(asset.change || 0).toFixed(2)}%
      </div>
    </div>
  </div>
));

export default function TokenList({ marketData }) {
  const navigate = useNavigate();
  const { holdings, tokens } = useWalletStore();

  // Map real tokens from Alchemy
  const realTokens = tokens.map(token => ({
    id: token.contractAddress,
    name: token.name || token.symbol,
    symbol: token.symbol,
    icon: token.logo,
    color: "#E9B3A2",
    price: marketData[`${token.symbol}USDT`]?.price || 0, // Try to find price in market data
    change: marketData[`${token.symbol}USDT`]?.change || 0,
    holding: token.balance
  }));

  // Map base holdings (legacy/mock)
  const baseAssets = Object.entries(holdings).map(([symbol, amount]) => {
    const baseSymbol = symbol.replace("USDT", "");
    const data = marketData[symbol] || {};
    return {
      id: symbol,
      name: baseSymbol,
      symbol: baseSymbol,
      icon: null,
      color: "#E9B3A2",
      price: data.price || 0,
      change: data.change || 0,
      holding: amount
    };
  });

  // Combine and remove duplicates by symbol
  const combinedAssets = [...realTokens, ...baseAssets].reduce((acc, current) => {
    const x = acc.find(item => item.symbol === current.symbol);
    if (!x) {
      return acc.concat([current]);
    } else {
      // If we have a real balance for a base asset, use the real one
      return acc;
    }
  }, []);

  return (
    <div className="space-y-4">
      {combinedAssets.map((asset) => (
        <TokenCard 
          key={asset.id} 
          asset={asset} 
          onClick={() => navigate(`/coin/${asset.id}`)} 
        />
      ))}
      {combinedAssets.length === 0 && (
        <div className="p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-sm font-bold text-muted">No tokens found in this wallet.</p>
        </div>
      )}
    </div>
  );
}
