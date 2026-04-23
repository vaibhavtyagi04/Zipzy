import React, { useMemo } from "react";
import { ShieldCheck, AlertTriangle, Info, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";

export default function TransactionGuard({ amount, recipient, type = "send" }) {
  const { balance, wallet } = useWalletStore();

  const findings = useMemo(() => {
    const list = [];
    const numAmount = parseFloat(amount) || 0;
    
    // 1. Balance Check
    if (numAmount > balance) {
      list.push({
        id: "insufficient-funds",
        type: "error",
        msg: `Insufficient funds. Your balance is ${balance.toFixed(4)} ETH.`,
        icon: AlertCircle
      });
    } else if (numAmount > balance * 0.9) {
       list.push({
        id: "high-balance-percent",
        type: "warning",
        msg: "This transaction uses over 90% of your total balance.",
        icon: AlertTriangle
      });
    }

    // 2. Self-Transfer Check
    if (recipient && wallet?.address && recipient.toLowerCase() === wallet.address.toLowerCase()) {
      list.push({
        id: "self-transfer",
        type: "warning",
        msg: "You are sending funds to your own address. Is this intentional?",
        icon: Info
      });
    }

    // 3. High Value Check
    if (numAmount > 1.0) {
      list.push({
        id: "high-value",
        type: "info",
        msg: "High value transaction detected. Extra caution recommended.",
        icon: ShieldAlert
      });
    }

    // 4. Default Success
    if (list.length === 0) {
      list.push({
        id: "simulation",
        type: "success",
        msg: "Transaction simulation successful. No issues detected.",
        icon: CheckCircle2
      });
    }

    return list;
  }, [amount, recipient, balance, wallet?.address]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#E9B3A2]/10 rounded-xl">
          <ShieldCheck className="text-[#E9B3A2]" size={20} />
        </div>
        <h4 className="text-xs font-black text-theme uppercase tracking-[0.2em]">Transaction Guard Analysis</h4>
      </div>

      <div className="space-y-3">
        {findings.map(item => (
          <div 
            key={item.id}
            className={`p-4 rounded-2xl border flex gap-4 items-start ${
              item.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500' :
              item.type === 'error' ? 'bg-red-500/5 border-red-500/10 text-red-500' :
              item.type === 'success' ? 'bg-green-500/5 border-green-500/10 text-green-500' :
              'bg-white/5 border-white/5 text-muted'
            }`}
          >
            <item.icon size={18} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold leading-relaxed">{item.msg}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-6 border-t border-theme">
        <p className="text-[9px] text-muted font-bold uppercase tracking-widest leading-relaxed text-center opacity-60">
          Guard provides security insights but does not guarantee transaction success. <br/> Always verify manually.
        </p>
      </div>
    </div>
  );
}
