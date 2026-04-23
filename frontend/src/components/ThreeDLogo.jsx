// components/ThreeDLogo.jsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ThreeDLogo() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div 
      className="relative flex items-center justify-center p-12"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-32 h-32 bg-gradient-to-tr from-[#E9B3A2] to-[#AB9FF2] rounded-[2.5rem] shadow-2xl flex items-center justify-center relative group"
      >
        <div style={{ transform: "translateZ(50px)" }} className="text-6xl font-black text-white drop-shadow-2xl">
          Z
        </div>
        
        {/* Glow behind logo */}
        <div className="absolute inset-0 bg-[#E9B3A2] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
      </motion.div>
    </div>
  );
}
