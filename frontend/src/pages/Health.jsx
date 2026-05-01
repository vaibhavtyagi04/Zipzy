// pages/Health.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Globe, Cpu, Signal, RefreshCcw } from "lucide-react";
import { useWalletStore } from "../store/walletStore";
import { getChainName, getProviderForChain } from "../services/blockchain";

const COINGECKO_PING = "https://api.coingecko.com/api/v3/ping";

function formatLatency(value) {
  if (value == null) return "--";
  return `${Math.round(value)}ms`;
}

function getMemorySnapshot() {
  const memory = performance.memory;
  if (!memory) {
    return {
      label: "Browser Memory",
      value: "Unavailable",
      progress: 0,
    };
  }

  const used = memory.usedJSHeapSize / 1024 / 1024;
  const limit = memory.jsHeapSizeLimit / 1024 / 1024;
  return {
    label: "Browser Memory",
    value: `${used.toFixed(0)}MB / ${limit.toFixed(0)}MB`,
    progress: Math.min(100, Math.round((used / limit) * 100)),
  };
}

export default function Health() {
  const { vault, chainId, marketData } = useWalletStore();
  const [checks, setChecks] = useState({
    rpc: { status: "Checking", latency: null, blockNumber: null, ok: false },
    market: { status: "Checking", latency: null, ok: false },
    memory: getMemorySnapshot(),
    lastUpdated: null,
  });

  useEffect(() => {
    let cancelled = false;

    const runChecks = async () => {
      const next = {
        rpc: { status: "Offline", latency: null, blockNumber: null, ok: false },
        market: { status: "Offline", latency: null, ok: false },
        memory: getMemorySnapshot(),
        lastUpdated: new Date().toLocaleTimeString(),
      };

      try {
        const provider = getProviderForChain(chainId || vault?.chainId || 1);
        const start = performance.now();
        const blockNumber = await provider.getBlockNumber();
        next.rpc = {
          status: `Block ${blockNumber.toLocaleString()}`,
          latency: performance.now() - start,
          blockNumber,
          ok: true,
        };
      } catch (error) {
        next.rpc.status = "RPC Unreachable";
      }

      try {
        const start = performance.now();
        const response = await fetch(COINGECKO_PING);
        if (!response.ok) throw new Error("CoinGecko ping failed");
        next.market = {
          status: "Operational",
          latency: performance.now() - start,
          ok: true,
        };
      } catch (error) {
        next.market.status = "API Unreachable";
      }

      if (!cancelled) setChecks(next);
    };

    runChecks();
    const interval = setInterval(runChecks, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [chainId, vault]);

  const dataSync = useMemo(() => {
    const timestamps = Object.values(marketData || {})
      .map((item) => item?.timestamp)
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter(Number.isFinite);

    if (!timestamps.length) return { value: "Waiting for market feed", progress: 10 };

    const newest = Math.max(...timestamps);
    const ageSeconds = Math.max(0, Math.round((Date.now() - newest) / 1000));
    return {
      value: ageSeconds < 20 ? "Live" : `${ageSeconds}s old`,
      progress: ageSeconds < 20 ? 100 : Math.max(15, 100 - ageSeconds),
    };
  }, [marketData]);

  const stats = [
    {
      label: "Blockchain RPC",
      status: checks.rpc.status,
      subStatus: `${getChainName(chainId || vault?.chainId || 1)} · ${formatLatency(checks.rpc.latency)}`,
      icon: Globe,
      color: checks.rpc.ok ? "text-green-400" : "text-red-400",
      ok: checks.rpc.ok,
    },
    {
      label: "Market Data API",
      status: checks.market.status,
      subStatus: `CoinGecko · ${formatLatency(checks.market.latency)}`,
      icon: Activity,
      color: checks.market.ok ? "text-green-400" : "text-red-400",
      ok: checks.market.ok,
    },
    {
      label: "Wallet Security",
      status: vault?.encryptedJson ? "Encrypted Vault" : "External Signer",
      subStatus: vault?.encryptedJson ? "Local keystore" : "Provider custody boundary",
      icon: ShieldCheck,
      color: "text-accent",
      ok: true,
    },
    {
      label: "System Latency",
      status: formatLatency(checks.rpc.latency || checks.market.latency),
      subStatus: checks.lastUpdated ? `Updated ${checks.lastUpdated}` : "Running diagnostics",
      icon: Signal,
      color: "text-blue-400",
      ok: checks.rpc.ok || checks.market.ok,
    },
  ];

  return (
    <div className="max-w-4xl space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-surface border border-theme p-8 rounded-[24px] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-secondary ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-theme">{stat.status}</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">{stat.subStatus}</p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${stat.ok ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-theme p-10 rounded-[24px] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-theme">System Diagnostics</h3>
            <RefreshCcw size={18} className="text-muted" />
          </div>
          <div className="space-y-6">
            <DiagnosticRow label={checks.memory.label} value={checks.memory.value} progress={checks.memory.progress} />
            <DiagnosticRow label="RPC Response" value={checks.rpc.ok ? formatLatency(checks.rpc.latency) : "Offline"} progress={checks.rpc.ok ? Math.max(10, 100 - Math.min(90, checks.rpc.latency / 10)) : 0} />
            <DiagnosticRow label="Data Sync" value={dataSync.value} progress={dataSync.progress} />
          </div>
        </div>
        <Cpu size={120} className="absolute -bottom-10 -right-10 text-white/5" />
      </div>
    </div>
  );
}

function DiagnosticRow({ label, value, progress }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-gray-400">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-phantom-purple"
        />
      </div>
    </div>
  );
}
