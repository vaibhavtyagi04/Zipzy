import React, { useState } from "react";
import { useWalletStore } from "../store/walletStore";
import { Copy, ArrowUpRight, ArrowDownLeft, Shield, ExternalLink, QrCode, Share2, X, TrendingUp, LogOut, Globe } from "lucide-react";
import Button from "../components/ui/Button";
import TokenIcon from "../components/ui/TokenIcon";
import SendModal from "../components/wallet/SendModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect, useSwitchChain, useBalance } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { formatEther } from "viem";

function getExplorerAddress(chainId, address) {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

const ReceiveModal = ({ isOpen, onClose, address, network }) => {
  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wallet Address',
        text: `Network: ${network?.toUpperCase()}\nAddress: ${address}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-phantom-bg border border-theme rounded-[40px] p-10 text-center shadow-2xl"
      >
        <div className="absolute top-6 right-8">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <h3 className="text-2xl font-black text-theme mb-2">Receive Assets</h3>
        <p className="text-[10px] text-[#E9B3A2] font-black uppercase tracking-[0.3em] mb-8">On {network?.toUpperCase()} Network</p>

        <div className="bg-white p-6 rounded-[32px] mb-8 inline-block shadow-inner">
          <div className="w-48 h-48 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center relative group">
            <QrCode size={140} className="text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-3 text-left px-2">Wallet Address</p>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 group hover:border-[#E9B3A2]/20 transition-all">
              <span className="text-[11px] font-bold text-theme truncate font-mono opacity-80">{address}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(address)} 
                className="p-2.5 bg-[#E9B3A2]/10 rounded-xl hover:bg-[#E9B3A2]/20 transition-colors"
              >
                <Copy size={16} className="text-[#E9B3A2]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" icon={Share2} onClick={handleShare} fullWidth>Share</Button>
            <Button variant="primary" onClick={onClose} fullWidth>Done</Button>
          </div>
          
          <p className="text-[9px] text-muted font-bold leading-relaxed opacity-60">
            Only send <span className="text-theme">{network?.toUpperCase()}</span> compatible tokens to this address. Sending other assets may result in permanent loss.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default function Wallet() {
  const { holdings, marketData } = useWalletStore();
  const { address, isConnected, chainId, connector } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({ symbol: "ETH", price: 2400 });

  const displayAddress = address || "0x0000000000000000000000000000000000000000";
  const ethBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
  const networkName = chainId === 1 ? "Ethereum" : chainId === 11155111 ? "Sepolia" : `Chain ${chainId}`;

  const networks = [
    { id: mainnet.id, label: "Ethereum", short: "ETH", color: "#627EEA" },
    { id: sepolia.id, label: "Sepolia", short: "SEP", color: "#8B5CF6" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-theme mb-2">My Wallet</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
              {networks.map(n => (
                <button
                  key={n.id}
                  onClick={() => switchChain?.({ chainId: n.id })}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chainId === n.id ? "bg-[#E9B3A2] text-[#0f172a]" : "text-muted hover:text-theme"}`}
                >
                  {n.short}
                </button>
              ))}
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">{networkName} · Live</span>
            {connector && (
              <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
                via {connector.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setIsReceiveOpen(true)} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-theme transition-all">
             <QrCode size={20} />
           </button>
           <Button variant="primary" size="lg" icon={ArrowUpRight} onClick={() => setIsSendOpen(true)}>Transfer Assets</Button>
           <button 
             onClick={() => disconnect()} 
             className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all"
             title="Disconnect Wallet"
           >
             <LogOut size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <div className="luxe-card p-10 bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-between h-80 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 bg-[#E9B3A2]/5 blur-[100px] rounded-full group-hover:bg-[#E9B3A2]/10 transition-all" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#E9B3A2]/10 rounded-2xl">
                  <Shield className="text-[#E9B3A2]" size={32} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mb-1">Connected Wallet</p>
                   <p className="text-xs font-black text-[#E9B3A2]">{connector?.name || "External"}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-2">ETH Balance</p>
              <h2 className="text-7xl font-black text-theme tracking-tighter">{ethBalance.toFixed(4)} <span className="text-2xl text-muted">ETH</span></h2>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 flex-1 group/addr cursor-pointer hover:border-[#E9B3A2]/20 transition-all">
                <div className="flex-1">
                  <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">Network: {networkName}</p>
                  <p className="text-xs font-bold text-theme truncate font-mono opacity-60 group-hover/addr:opacity-100 transition-opacity">{displayAddress}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(displayAddress)} className="p-3 bg-white/5 rounded-xl transition-colors">
                  <Copy size={18} className="text-[#E9B3A2]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex-1 luxe-card p-8 bg-white/5 border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-muted uppercase tracking-widest">Chain Info</p>
               <span className="text-green-500 text-[10px] font-black">● Connected</span>
            </div>
            <div>
               <h4 className="text-3xl font-black text-theme">{networkName}</h4>
               <p className="text-xs text-muted font-bold">Chain ID: {chainId}</p>
            </div>
            <a 
              href={getExplorerAddress(chainId, displayAddress)} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-black text-[#E9B3A2] uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity mt-4"
            >
              <ExternalLink size={14} /> View on Explorer
            </a>
          </div>

          <div className="luxe-card p-8 bg-[#E9B3A2]/10 border-[#E9B3A2]/20 flex items-center gap-6">
            <div className="p-4 bg-[#E9B3A2] text-[#0f172a] rounded-2xl">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-[#E9B3A2] uppercase tracking-widest">Status</p>
               <h4 className="text-xl font-black text-theme">Production Ready</h4>
            </div>
          </div>
        </div>
      </div>

      <section className="luxe-card p-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
             <h3 className="text-2xl font-black text-theme tracking-tight">Assets</h3>
             <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-muted uppercase tracking-widest">Tracking {Object.keys(holdings).length} Tokens</span>
          </div>
          <a 
            href={getExplorerAddress(chainId, displayAddress)} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest hover:text-theme transition-colors"
          >
            <ExternalLink size={14} />
            View on Explorer
          </a>
        </div>

        <div className="space-y-4">
          {Object.entries(holdings).map(([symbol, amount]) => {
            const data = marketData[symbol + "USDT"] || marketData[symbol] || { price: 0, change: 0 };
            const price = data?.price || 0;
            return (
              <div key={symbol} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-5">
                  <TokenIcon symbol={symbol} size={48} />
                  <div>
                    <h4 className="text-lg font-black text-theme">{symbol.replace("USDT", "")}</h4>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">${price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-12">
                  <div className="hidden md:block">
                    <p className="text-lg font-black text-theme">{(amount || 0).toLocaleString()} {symbol.replace("USDT", "")}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">${((amount || 0) * price).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedToken({ symbol: symbol.replace("USDT", ""), price });
                      setIsSendOpen(true);
                    }}
                    className="p-4 bg-white/5 rounded-2xl text-muted hover:text-[#E9B3A2] hover:bg-[#E9B3A2]/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {isSendOpen && <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} token={selectedToken} />}
        {isReceiveOpen && <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} address={displayAddress} network={networkName} />}
      </AnimatePresence>
    </div>
  );
}
