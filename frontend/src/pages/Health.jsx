// pages/Health.jsx
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Globe, Cpu, Clock, Signal } from "lucide-react";

export default function Health() {
  const stats = [
    { label: "Blockchain RPC", status: "Connected", icon: Globe, color: "text-green-400" },
    { label: "Market Data API", status: "Operational", icon: Activity, color: "text-green-400" },
    { label: "Wallet Security", status: "Verified", icon: ShieldCheck, color: "text-phantom-purple" },
    { label: "System Latency", status: "24ms", icon: Signal, color: "text-blue-400" },
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
            className="bg-white/5 border border-white/5 p-8 rounded-[40px] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-3xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black">{stat.status}</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          </motion.div>
        ))}
      </div>

      <div className="bg-phantom-accent/40 border border-white/5 p-10 rounded-[40px] relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-6">System Diagnostics</h3>
          <div className="space-y-6">
            <DiagnosticRow label="Memory Usage" value="128MB / 1024MB" progress={12} />
            <DiagnosticRow label="Node Performance" value="99.9% Uptime" progress={99} />
            <DiagnosticRow label="Data Sync" value="Synchronized" progress={100} />
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
