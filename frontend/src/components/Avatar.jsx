// components/Avatar.jsx
import { motion } from "framer-motion";

export default function Avatar({ seed = "Vaibhav" }) {
  // Using DiceBear for high-quality, choice-based avatars
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="w-24 h-24 rounded-full border-4 border-phantom-purple/20 p-1 bg-phantom-accent overflow-hidden shadow-xl shadow-phantom-purple/10"
    >
      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </motion.div>
  );
}
