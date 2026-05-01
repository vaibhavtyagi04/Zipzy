// services/marketData.js
const BACKEND_MARKET_URL = "http://localhost:5000/api/market-data";
const COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";

const COINGECKO_ASSETS = [
  { id: "bitcoin", symbol: "BTCUSDT" },
  { id: "ethereum", symbol: "ETHUSDT" },
  { id: "solana", symbol: "SOLUSDT" },
  { id: "binancecoin", symbol: "BNBUSDT" },
  { id: "cardano", symbol: "ADAUSDT" },
  { id: "dogecoin", symbol: "DOGEUSDT" },
  { id: "polkadot", symbol: "DOTUSDT" },
  { id: "polygon-ecosystem-token", symbol: "MATICUSDT" },
];

const SYMBOL_BY_ID = COINGECKO_ASSETS.reduce((acc, asset) => {
  acc[asset.id] = asset.symbol;
  return acc;
}, {});

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeMarketMap(data, source = "backend") {
  if (!data || Array.isArray(data) || data.error) return null;

  return Object.entries(data).reduce((acc, [rawSymbol, value]) => {
    if (!value || typeof value !== "object") return acc;

    const symbol = rawSymbol.toUpperCase();
    acc[symbol] = {
      symbol,
      price: toNumber(value.price),
      change: toNumber(value.change),
      high: toNumber(value.high),
      low: toNumber(value.low),
      volume: toNumber(value.volume),
      timestamp: value.timestamp || new Date().toISOString(),
      source,
    };
    return acc;
  }, {});
}

async function fetchBackendMarket() {
  const response = await fetch(BACKEND_MARKET_URL);
  if (!response.ok) throw new Error("Backend market endpoint unreachable");

  const data = await response.json();
  const normalized = normalizeMarketMap(data, "binance");
  if (!normalized || Object.keys(normalized).length === 0) {
    throw new Error(data?.error || "Backend returned no market data");
  }

  return normalized;
}

async function fetchCoinGeckoMarket() {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: COINGECKO_ASSETS.map((asset) => asset.id).join(","),
    price_change_percentage: "24h",
    sparkline: "false",
  });

  const response = await fetch(`${COINGECKO_MARKETS_URL}?${params.toString()}`);
  if (!response.ok) throw new Error("CoinGecko market endpoint unreachable");

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("CoinGecko returned invalid market data");

  return data.reduce((acc, coin) => {
    const symbol = SYMBOL_BY_ID[coin.id];
    if (!symbol) return acc;

    acc[symbol] = {
      symbol,
      name: coin.name,
      image: coin.image,
      price: toNumber(coin.current_price),
      change: toNumber(coin.price_change_percentage_24h),
      high: toNumber(coin.high_24h),
      low: toNumber(coin.low_24h),
      volume: toNumber(coin.total_volume),
      marketCap: toNumber(coin.market_cap),
      timestamp: new Date().toISOString(),
      source: "coingecko",
    };
    return acc;
  }, {});
}

export async function getMarketPrices() {
  try {
    return await fetchBackendMarket();
  } catch (backendError) {
    console.warn("Backend market data unavailable, using CoinGecko fallback:", backendError);
  }

  try {
    return await fetchCoinGeckoMarket();
  } catch (fallbackError) {
    console.error("Market data fetch failed:", fallbackError);
    return null;
  }
}
