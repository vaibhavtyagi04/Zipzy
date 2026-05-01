// components/GlassCard.jsx
export default function GlassCard({ children, className = "", gradientBorder = false }) {
  if (gradientBorder) {
    return (
      <div className={`relative p-[1px] rounded-[32px] bg-gradient-to-r from-accent via-purple-500 to-indigo-500 shadow-2xl shadow-accent/10 ${className}`}>
        <div className="bg-surface/90 backdrop-blur-2xl rounded-[31px] p-6 h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl bg-surface border border-theme rounded-[32px] p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
