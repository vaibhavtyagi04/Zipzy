// components/ui/Button.jsx
import { motion } from "framer-motion";

export default function Button({ 
  children, 
  onClick, 
  variant = "primary", // primary, secondary, neon, ghost
  type = "button",
  className = "",
  icon: Icon,
  fullWidth = false,
  size = "md",
  disabled = false
}) {
  const variants = {
    primary: "bg-accent text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] hover:shadow-[0_12px_36px_rgba(124,58,237,0.36)]",
    secondary: "bg-surface text-theme border border-theme hover:bg-secondary",
    neon: "bg-[#D4FF75] text-black hover:shadow-[0_0_20px_rgba(212,255,117,0.4)]",
    ghost: "text-muted hover:text-theme"
  };

  const sizes = {
    sm: "px-4 py-3 text-xs rounded-2xl",
    md: "px-6 py-4 text-sm rounded-2xl",
    lg: "px-7 py-5 text-sm rounded-2xl"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        font-black flex items-center justify-center gap-3 transition-all duration-300
        ${sizes[size] || sizes.md}
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        ${className}
      `}
    >
      {Icon && <Icon size={20} strokeWidth={3} />}
      {children}
    </motion.button>
  );
}
