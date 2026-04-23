import React, { useState, useEffect } from "react";
import { useWalletStore } from "../../store/walletStore";
import { X, ArrowRight, Send, Loader2, AlertCircle, Fuel, ShieldCheck, Zap, AlertTriangle, ExternalLink } from "lucide-react";
import Button from "../ui/Button";
import TokenIcon from "../ui/TokenIcon";
import { motion, AnimatePresence } from "framer-motion";
import TransactionGuard from "./TransactionGuard";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useBalance, useEstimateGas } from "wagmi";
import { parseEther, formatEther } from "viem";
import { isValidEthereumAddress, validateBalance } from "../../services/blockchain";

function getExplorerUrl(chainId, hash) {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

export default function SendModal({ isOpen, onClose, token }) {
  const { addNotification, chainId } = useWalletStore();
  const { isConnected, address: userAddress } = useAccount();
  const { data: userBalance } = useBalance({ address: userAddress });
  const { 
    data: txHash, 
    isPending: isSending, 
    error: sendError, 
    sendTransaction 
  } = useSendTransaction();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input"); // input, review, processing, success, error
  const [gasInfo, setGasInfo] = useState(null);
  const [loadingGas, setLoadingGas] = useState(false);
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Validate address on change
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    
    if (val && !isValidEthereumAddress(val)) {
      setAddressError("Invalid Ethereum address (must be 0x followed by 40 hex characters)");
    } else {
      setAddressError("");
    }
  };

  // Validate amount on change
  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    
    if (val) {
      const numAmount = parseFloat(val);
      if (isNaN(numAmount) || numAmount <= 0) {
        setAmountError("Amount must be greater than 0");
      } else if (userBalance && !validateBalance(userBalance.formatted, val)) {
        setAmountError(`Insufficient balance (${userBalance.formatted} available)`);
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }
  };

  // Wagmi: Wait for receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ 
    hash: txHash 
  });

  // Phase 5: On-chain Gas Estimation
  const { data: estimateGasData } = useEstimateGas({
    to: address && isValidEthereumAddress(address) ? address : undefined,
    value: amount && parseFloat(amount) > 0 ? parseEther(amount) : undefined,
    query: {
      enabled: isOpen && address && amount && parseFloat(amount) > 0 && isValidEthereumAddress(address),
    }
  });

  // Sync gas info with on-chain estimation
  useEffect(() => {
    if (isOpen && address && amount && parseFloat(amount) > 0) {
      estimateGas();
    }
  }, [isOpen, address, amount, estimateGasData]);

  const estimateGas = async () => {
    setLoadingGas(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/gas-fees");
      const gasData = await response.json();
      const marketRes = await fetch("http://localhost:5000/api/market-data");
      const marketData = await marketRes.json();
      const ethPrice = marketData?.ETHUSDT?.price || 2500;
      const gwei = gasData.standard;
      const usdCost = (21000 * gwei * 1e-9 * ethPrice).toFixed(2);
      setGasInfo({
        maxFeePerGas: gasData.fast,
        total_usd: parseFloat(usdCost),
        gwei
      });
    } catch (err) {
      setGasInfo({ maxFeePerGas: 20, total_usd: 1.50, gwei: 20 });
    } finally {
      setLoadingGas(false);
    }
  };

  // Handle real blockchain send
  const handleSend = async () => {
    if (!address || !amount || !isConnected) return;
    setStep("processing");
    setError("");

    try {
      sendTransaction({
        to: address,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Send Error:", err);
      setError(err.message || "Transaction rejected");
      setStep("error");
    }
  };

  // React to wagmi state changes
  useEffect(() => {
    if (sendError) {
      setError(sendError.shortMessage || sendError.message || "Transaction failed");
      setStep("error");
    }
  }, [sendError]);

  useEffect(() => {
    if (txHash) {
      addNotification("Transaction submitted!", "info");
    }
  }, [txHash]);

  useEffect(() => {
    if (isConfirmed) {
      setStep("success");
      addNotification("Transaction confirmed on-chain!", "success");
    }
  }, [isConfirmed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="relative w-full max-w-lg luxe-card p-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-20 bg-[#E9B3A2]/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-theme tracking-tight">Send {token?.symbol}</h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                {chainId === 11155111 ? "Sepolia Testnet" : "Ethereum Mainnet"}
              </p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
              <X size={20} className="text-muted" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Recipient Address</label>
                  <div>
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      value={address}
                      onChange={handleAddressChange}
                      className={`w-full bg-black/20 border ${addressError ? 'border-red-500' : 'border-white/5'} rounded-[24px] p-6 text-sm font-bold text-theme focus:border-[#E9B3A2]/40 outline-none transition-all`}
                    />
                    {addressError && (
                      <p className="text-xs text-red-400 mt-2 ml-2">{addressError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between px-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Amount</label>
                    {userBalance && (
                      <span 
                        className="text-[10px] font-black text-[#E9B3A2] uppercase tracking-widest cursor-pointer hover:opacity-80"
                        onClick={() => {
                          const max = userBalance.formatted;
                          setAmount(max);
                          setAmountError("");
                        }}
                      >
                        Use Max ({userBalance.formatted})
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={handleAmountChange}
                        className={`w-full bg-black/20 border ${amountError ? 'border-red-500' : 'border-white/5'} rounded-[24px] p-8 text-4xl font-black text-theme focus:border-[#E9B3A2]/40 outline-none transition-all placeholder:opacity-20`}
                      />
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <TokenIcon symbol={token?.symbol} size={32} />
                        <span className="text-lg font-black text-theme">{token?.symbol}</span>
                      </div>
                    </div>
                    {amountError && (
                      <p className="text-xs text-red-400 mt-2 ml-2">{amountError}</p>
                    )}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg" 
                  icon={ArrowRight}
                  disabled={!address || !amount || addressError || amountError || !isConnected}
                  onClick={() => setStep("review")}
                >
                  Review Transaction
                </Button>
              </motion.div>
            )}

            {step === "review" && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                 <div className="bg-black/20 rounded-[32px] p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-muted">Recipient</span>
                       <span className="text-xs font-black text-theme font-mono">{address.slice(0, 8)}...{address.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-muted">Amount</span>
                       <span className="text-xs font-black text-theme">{amount} {token?.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <div className="flex items-center gap-2">
                          <Fuel size={14} className="text-muted" />
                          <span className="text-xs font-bold text-muted">Gas Fee</span>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-theme">{gasInfo ? `$${gasInfo.total_usd}` : "--"}</p>
                          <p className="text-[9px] font-bold text-muted uppercase">{gasInfo ? `${gasInfo.gwei} Gwei` : "Estimating..."}</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-sm font-black text-[#E9B3A2] uppercase tracking-widest">Total cost</span>
                       <span className="text-xl font-black text-theme">${(parseFloat(amount) * (token?.price || 0) + (gasInfo?.total_usd || 0)).toFixed(2)}</span>
                    </div>
                 </div>

                 <TransactionGuard amount={amount} recipient={address} />

                 <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-500/80 font-bold leading-relaxed">
                      This is a <strong>real blockchain transaction</strong>. Your wallet will prompt you to sign. Gas fees are paid in ETH.
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="secondary" fullWidth onClick={() => setStep("input")}>Back</Button>
                    <Button variant="primary" fullWidth onClick={handleSend}>Confirm & Send</Button>
                 </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center space-y-8">
                 <div className="relative inline-block">
                    <div className="w-24 h-24 border-4 border-[#E9B3A2]/20 border-t-[#E9B3A2] rounded-full animate-spin mx-auto" />
                    <Zap className="absolute inset-0 m-auto text-[#E9B3A2] animate-pulse" size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-theme mb-2">
                      {isSending ? "Waiting for Wallet..." : isConfirming ? "Confirming on Chain..." : "Broadcasting..."}
                    </h4>
                    <p className="text-xs text-muted font-bold px-10 leading-relaxed uppercase tracking-widest">
                      {isSending ? "Please confirm in your wallet extension" : "Waiting for block confirmation"}
                    </p>
                 </div>
                 {txHash && (
                   <div className="bg-black/20 p-4 rounded-2xl inline-block border border-white/5">
                      <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-1">TX HASH</p>
                      <p className="text-[10px] font-mono text-[#E9B3A2] truncate w-64">{txHash}</p>
                   </div>
                 )}
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-8">
                 <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <ShieldCheck size={48} />
                 </div>
                 <div>
                    <h4 className="text-3xl font-black text-theme mb-2 tracking-tight">Confirmed!</h4>
                    <p className="text-sm text-muted font-bold px-10 leading-relaxed">Your transfer of {amount} {token?.symbol} has been confirmed on the blockchain.</p>
                 </div>
                 <div className="space-y-4 px-10 pt-6">
                    <a 
                      href={getExplorerUrl(chainId, txHash)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 text-[10px] font-black text-[#E9B3A2] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                    >
                      <ExternalLink size={14} />
                      View on Etherscan
                    </a>
                    <Button variant="primary" fullWidth size="lg" onClick={onClose}>Finish</Button>
                 </div>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-8">
                 <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
                    <AlertTriangle size={48} />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-theme mb-2 tracking-tight">Transaction Failed</h4>
                    <p className="text-sm text-red-400 font-bold px-10 leading-relaxed mb-4">{error}</p>
                 </div>
                 <div className="px-10 pt-6">
                    <Button variant="primary" fullWidth size="lg" onClick={() => setStep("input")}>Try Again</Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
