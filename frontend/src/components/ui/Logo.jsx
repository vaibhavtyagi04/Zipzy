// components/ui/Logo.jsx
export default function Logo({ size = "md", showText = true }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative ${sizes[size]} overflow-hidden rounded-2xl flex items-center justify-center shadow-sm border border-black/5`}>
        <img src="/logo.png" alt="Zipzy Logo" className="w-full h-full object-cover" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-theme leading-none">Zipzy</span>
          <span className="text-[7px] font-black tracking-[0.2em] text-secondary uppercase mt-1">SMART WEB3 WALLET</span>
        </div>
      )}
    </div>
  );
}
