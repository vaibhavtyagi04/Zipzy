import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import PriceChart from "../components/PriceChart";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, ShieldCheck } from "lucide-react";
import { useMarketWS } from "../hooks/useMarketWS";

export default function CoinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marketData, historicalData, setHistoricalData, updateSingleAsset } = useWalletStore();
  const { subscribe } = useMarketWS();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeframe, setTimeframe] = useState("1D");

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!marketData[id]) setLoading(true);
      setError(null);
      
      try {
        // Try to get price from local if available, or just use ID
        let symbol = id;
        if (!symbol.endsWith("USDT")) symbol += "USDT";

        let interval = "1h";
        let limit = 200;
        
        switch(timeframe) {
          case "1H": interval = "1m"; limit = 60; break;
          case "1D": interval = "15m"; limit = 96; break;
          case "1W": interval = "1h"; limit = 168; break;
          case "1M": interval = "4h"; limit = 180; break;
          case "3M": interval = "1d"; limit = 90; break;
          case "1Y": interval = "1d"; limit = 365; break;
          case "MAX": interval = "1w"; limit = 1000; break;
          default: interval = "1h"; limit = 200;
        }

        // FETCH DIRECTLY FROM BINANCE (Production Ready)
        const histRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        const rawData = await histRes.json();
        
        if (!Array.isArray(rawData)) throw new Error("Invalid data format from Binance");

        const formattedData = rawData.map(d => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5])
        }));
        
        setHistoricalData(id, formattedData);
        
        // Also update the current price from the last candle
        const lastCandle = formattedData[formattedData.length - 1];
        updateSingleAsset(id, { 
          price: lastCandle.close, 
          change: ((lastCandle.close - formattedData[0].open) / formattedData[0].open) * 100 
        });

      } catch (err) {
        console.error("CoinDetail Fetch Error:", err);
        setError("Failed to load market performance data from Binance API.");
      } finally {
        setLoading(false);
        subscribe([id], "kline");
      }
    };

    fetchCoinData();
  }, [id, timeframe, setHistoricalData, updateSingleAsset, subscribe]);

  const timeframeOptions = [
    { label: "1H", value: "1H" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "1Y", value: "1Y" },
    { label: "MAX", value: "MAX" }
  ];

  const coin = marketData?.[id] || { symbol: id?.replace("USDT", "") || "---", price: 0, change: 0 };
  const history = historicalData?.[id] || [];

  // Calculate dynamic stats based on history and timeframe
  const stats = useMemo(() => {
    if (!history || history.length === 0) return { high: 0, low: 0, volume: 0 };
    
    let high = -Infinity;
    let low = Infinity;
    let totalVolume = 0;

    history.forEach(d => {
      if (d.high > high) high = d.high;
      if (d.low < low) low = d.low;
      totalVolume += (d.volume || 0);
    });

    return { 
      high: high === -Infinity ? 0 : high, 
      low: low === Infinity ? 0 : low, 
      volume: totalVolume 
    };
  }, [history]);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse pb-20">
        <div className="h-6 w-32 bg-white/5 rounded-full mb-10" />
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/5" />
            <div className="space-y-3">
              <div className="h-10 w-48 bg-white/5 rounded-xl" />
              <div className="h-4 w-32 bg-white/5 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3 text-right">
            <div className="h-12 w-64 bg-white/5 rounded-2xl ml-auto" />
            <div className="h-4 w-32 bg-white/5 rounded-lg ml-auto" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-10">
            <div className="h-[400px] w-full bg-white/5 rounded-[40px]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white/5 rounded-3xl" />)}
            </div>
          </div>
          <div className="xl:col-span-4 space-y-10">
            <div className="h-64 w-full bg-white/5 rounded-[40px]" />
            <div className="h-16 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-2">
          <span className="text-4xl">!</span>
        </div>
        <p className="text-red-400 font-black uppercase tracking-widest text-center max-w-md px-10 leading-relaxed">
          {error || "Invalid Asset ID Provided"}
        </p>
        <button 
          onClick={() => navigate("/")}
          className="btn-luxe px-12"
        >
          GO BACK HOME
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in zoom-in-95 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] hover:text-theme transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Assets
      </button>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E9B3A2]/20 to-[#E9B3A2]/5 flex items-center justify-center text-[#E9B3A2] text-3xl font-black shadow-2xl border border-white/5">
            {coin?.symbol?.substring(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tight text-theme">{coin?.symbol}</h1>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-muted uppercase tracking-widest">ASSET</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold text-muted uppercase tracking-[0.1em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#14F195]" /> Verified Source
              </p>
              <a href={`https://www.binance.com/en/trade/${id}`} target="_blank" rel="noreferrer" className="text-xs font-black text-[#E9B3A2] flex items-center gap-1 hover:underline">
                BINANCE <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-5xl font-black tracking-tighter text-theme mb-2">
            {coin?.price > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.price) : "---"}
          </p>
          <div className={`flex items-center justify-end gap-2 text-sm font-black ${coin?.change >= 0 ? "text-[#14F195]" : "text-[#FF5A5A]"}`}>
            {coin?.change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {Math.abs(coin?.change || 0).toFixed(2)}% <span className="text-muted">(24h)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          <section className="luxe-card p-10 border border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h3 className="text-xl font-black tracking-tight text-theme">Market Performance</h3>
              <div className="flex gap-1 bg-white/5 p-1 rounded-2xl">
                {timeframeOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    onClick={() => setTimeframe(opt.value)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${timeframe === opt.value ? 'bg-[#E9B3A2] text-[#121212] shadow-lg' : 'text-muted hover:text-theme'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {history && history.length > 0 ? (
              <PriceChart key={`${id}-${timeframe}`} data={history} symbol={id} />
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-3xl animate-pulse">
                <p className="text-xs font-black text-muted uppercase tracking-widest">Loading {timeframe} Data...</p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label={`${timeframe} High`} value={stats.high ? `$${stats.high.toLocaleString()}` : "---"} />
            <StatCard label={`${timeframe} Low`} value={stats.low ? `$${stats.low.toLocaleString()}` : "---"} />
            <StatCard label={`${timeframe} Volume`} value={stats.volume ? stats.volume.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "---"} />
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
          <div className="luxe-card p-10 border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="font-black mb-8 text-theme text-xl">Asset Intelligence</h3>
            <div className="space-y-6">
               <InfoRow label="Protocol" value="Binance Ticker" />
               <InfoRow label="Trading Pair" value={`${coin?.symbol}/USDT`} />
               <InfoRow label="Status" value="Live Streaming" />
               <InfoRow label="Precision" value="8 Decimals" />
            </div>
            <div className="mt-10 pt-10 border-t border-white/5">
               <p className="text-[10px] text-muted font-bold leading-relaxed">
                 Data is fetched in real-time from global liquidity providers. Prices may vary slightly across exchanges.
               </p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate("/swap")}
            className="btn-luxe w-full py-6 text-lg tracking-[0.2em] shadow-2xl shadow-[#E9B3A2]/10"
          >
            EXECUTE SWAP
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="luxe-card p-6">
      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-xl font-black text-theme tracking-tight">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, isAddress }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5">
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className={`text-xs font-black ${isAddress ? 'text-[#E9B3A2]' : 'text-theme'}`}>{value}</span>
    </div>
  );
}
