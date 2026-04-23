// components/GlassCard.jsx
export default function GlassCard({ children, className = "", gradientBorder = false }) {
  if (gradientBorder) {
    return (
      <div className={`relative p-[1px] rounded-[32px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-purple-500/10 ${className}`}>
        <div className="bg-[#0B0F1A]/90 backdrop-blur-2xl rounded-[31px] p-6 h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
