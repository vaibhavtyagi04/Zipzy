// components/BalanceCard.jsx
import GlassCard from "./GlassCard";

export default function BalanceCard() {
  return (
    <GlassCard>
      <h2 className="text-muted">Balance</h2>
      <h1 className="text-3xl font-bold text-theme mt-2">
        2.345 ETH
      </h1>
      <p className="text-muted">≈ ₹4,20,000</p>
    </GlassCard>
  );
}
