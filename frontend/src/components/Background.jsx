// components/Background.jsx
import { motion } from "framer-motion";
import { useWalletStore } from "../store/walletStore";

export default function Background() {
  const { isDarkMode } = useWalletStore();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dynamic Base Gradient */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        isDarkMode 
          ? "bg-gradient-to-b from-[#1A1A1F] via-[#0F0E13] to-[#050505]" 
          : "bg-gradient-to-b from-[#FDF8F5] via-[#FFF5F0] to-[#FDF8F5]"
      }`} />

      {/* Soft Sunset Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, #AB9FF2 0%, transparent 70%)" }}
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, #FFD1A9 0%, transparent 70%)" }}
      />

      {/* Decorative "Mountain" Wave Layers (Subtle) */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] opacity-[0.03] dark:opacity-[0.1]">
         <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full preserve-3d">
            <path fill="#AB9FF2" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,197.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>
    </div>
  );
}
