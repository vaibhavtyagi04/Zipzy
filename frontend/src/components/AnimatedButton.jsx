// components/AnimatedButton.jsx
import { motion } from "framer-motion";

export default function AnimatedButton({ children, onClick, variant = "primary" }) {
  const variants = {
    primary: "bg-[#121212] text-[#F5EFE6] shadow-xl",
    secondary: "bg-[#E9B3A2]/10 border border-[#E9B3A2]/20 text-[#E9B3A2] hover:bg-[#E9B3A2]/20 shadow-[#E9B3A2]/5",
    outline: "border border-[#E9B3A2]/50 text-[#E9B3A2] hover:bg-[#E9B3A2]/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${variants[variant]}`}
    >
      {children}
    </motion.button>
  );
}
