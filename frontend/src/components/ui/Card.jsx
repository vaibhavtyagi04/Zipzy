// components/ui/Card.jsx
import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = true, glow = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        bg-theme border border-theme rounded-[40px] p-8 relative overflow-hidden group shadow-sm
        ${glow ? "shadow-[0_20px_40px_rgba(171,159,242,0.1)]" : ""}
        ${className}
      `}
    >
      {glow && (
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent/5 blur-[80px] rounded-full group-hover:bg-accent/10 transition-colors" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
