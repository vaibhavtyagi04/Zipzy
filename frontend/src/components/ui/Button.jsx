// components/ui/Button.jsx
import { motion } from "framer-motion";

export default function Button({ 
  children, 
  onClick, 
  variant = "primary", // primary, secondary, neon, ghost
  className = "",
  icon: Icon,
  fullWidth = false
}) {
  const variants = {
    primary: "bg-phantom-purple text-black hover:shadow-[0_0_20px_rgba(171,159,242,0.4)]",
    secondary: "bg-white/5 text-phantom-text border border-white/10 hover:bg-white/10",
    neon: "bg-[#D4FF75] text-black hover:shadow-[0_0_20px_rgba(212,255,117,0.4)]",
    ghost: "text-gray-500 hover:text-white"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        px-6 py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {Icon && <Icon size={20} strokeWidth={3} />}
      {children}
    </motion.button>
  );
}
