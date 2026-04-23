// pages/Activity.jsx
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, ExternalLink } from "lucide-react";
import Card from "../components/ui/Card";
import { useWalletStore } from "../store/walletStore";

const activities = [
  { id: 1, type: "send", amount: "0.25 ETH", to: "0x8a3...f2b", date: "22 Apr, 02:45 AM", status: "Completed" },
  { id: 2, type: "receive", amount: "1.5 ETH", from: "0x12c...9e1", date: "21 Apr, 11:30 PM", status: "Completed" },
  { id: 3, type: "swap", amount: "45.2 SOL", to: "500 USDC", date: "21 Apr, 08:15 PM", status: "Completed" },
  { id: 4, type: "send", amount: "0.05 ETH", to: "0x55d...1a2", date: "20 Apr, 04:20 PM", status: "Failed" },
];

export default function Activity() {
  const { isDarkMode } = useWalletStore();

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">History</h1>
          <p className="text-gray-500 font-bold">Your recent on-chain activity</p>
        </div>
        <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <RefreshCcw size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((act, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={act.id}
          >
            <Card className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  act.type === 'send' ? 'bg-red-400/5 border-red-400/10 text-red-400' :
                  act.type === 'receive' ? 'bg-green-400/5 border-green-400/10 text-green-400' :
                  'bg-phantom-purple/5 border-phantom-purple/10 text-phantom-purple'
                }`}>
                  {act.type === 'send' ? <ArrowUpRight size={24} /> : 
                   act.type === 'receive' ? <ArrowDownLeft size={24} /> : 
                   <RefreshCcw size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-lg capitalize">{act.type} {act.amount}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {act.type === 'send' ? `To: ${act.to}` : 
                     act.type === 'receive' ? `From: ${act.from}` : 
                     `To: ${act.to}`}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest mb-1 ${act.status === 'Failed' ? 'text-red-400' : 'text-gray-400'}`}>
                    {act.status}
                  </p>
                  <p className="text-[10px] font-bold text-gray-600">{act.date}</p>
                </div>
                <button className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-phantom-purple">
                  <ExternalLink size={16} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
