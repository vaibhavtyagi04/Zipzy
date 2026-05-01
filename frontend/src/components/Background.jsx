// components/Background.jsx
import { useWalletStore } from "../store/walletStore";

export default function Background() {
  const { isDarkMode } = useWalletStore();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ background: isDarkMode ? "var(--bg-main)" : "var(--bg-primary)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-64 opacity-50"
        style={{
          background:
            "linear-gradient(180deg, rgba(124,58,237,0.10), rgba(124,58,237,0.00))",
        }}
      />
    </div>
  );
}
