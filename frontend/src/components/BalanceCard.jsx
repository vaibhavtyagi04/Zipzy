// components/BalanceCard.jsx
import GlassCard from "./GlassCard";

export default function BalanceCard() {
  return (
    <GlassCard>
      <h2 className="text-gray-400">Balance</h2>
      <h1 className="text-3xl font-bold text-white mt-2">
        2.345 ETH
      </h1>
      <p className="text-gray-400">≈ ₹4,20,000</p>
    </GlassCard>
  );
}
