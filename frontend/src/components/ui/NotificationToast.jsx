// components/ui/NotificationToast.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";

export default function NotificationToast() {
  const { notifications, removeNotification } = useWalletStore();

  return (
    <div className="fixed top-24 right-10 z-[100] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-phantom-card border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[300px] backdrop-blur-xl"
          >
            <div className={`p-2 rounded-xl bg-white/5 ${n.type === 'success' ? 'text-green-400' : 'text-phantom-purple'}`}>
              {n.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-phantom-text">{n.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
