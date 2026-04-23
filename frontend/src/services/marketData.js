// services/marketData.js
export async function getMarketPrices() {
  try {
    const response = await fetch("http://localhost:5000/api/market-data");
    if (!response.ok) throw new Error("Backend unreachable");
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching market data from backend:", error);
    
    // Minimal fallback for critical assets if backend is down
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin,dogecoin,pepe,shiba-inu&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await response.json();
      return {
        eth: { price: data.ethereum.usd, change: data.ethereum.usd_24h_change.toFixed(2) },
        sol: { price: data.solana.usd, change: data.solana.usd_24h_change.toFixed(2) },
        btc: { price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change.toFixed(2) },
        doge: { price: data.dogecoin.usd, change: data.dogecoin.usd_24h_change.toFixed(2) }
      };
    } catch (fallbackError) {
      return null;
    }
  }
}
