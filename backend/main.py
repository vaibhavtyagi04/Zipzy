from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import asyncio
import aiohttp
from datetime import datetime
from typing import List, Dict, Set
from dotenv import load_dotenv

from auth import router as auth_router

load_dotenv()

app = FastAPI(title="Zipzy Backend ⚡")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        self.all_active_symbols: Set[str] = {"btcusdt", "ethusdt", "solusdt", "bnbusdt", "adausdt", "dogeusdt"}
        self.binance_ws = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        self.subscriptions[websocket] = {"BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"}

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

    async def update_binance_subscriptions(self, new_symbols: List[str], stream_type: str = "ticker"):
        if self.binance_ws and new_symbols:
            # Normalize to binance format
            sub_list = []
            for s in new_symbols:
                key = f"{s.lower()}@{stream_type}"
                if key not in self.all_active_symbols:
                    sub_list.append(key)
                    self.all_active_symbols.add(key)
            
            if sub_list:
                msg = {
                    "method": "SUBSCRIBE",
                    "params": sub_list,
                    "id": 1
                }
                await self.binance_ws.send_str(json.dumps(msg))

manager = ConnectionManager()
manager.all_active_symbols = {"btcusdt@ticker", "ethusdt@ticker", "solusdt@ticker", "bnbusdt@ticker"}

# Binance WebSocket URL
BINANCE_WS_URL = "wss://stream.binance.com:9443/ws"

async def binance_worker():
    """Background task to fetch data from Binance and broadcast to clients"""
    while True:
        try:
            streams = "/".join(list(manager.all_active_symbols))
            url = f"{BINANCE_WS_URL}/{streams}"
            
            async with aiohttp.ClientSession() as session:
                async with session.ws_connect(url) as ws:
                    manager.binance_ws = ws
                    print(f"Connected to Binance WebSocket: {url}")
                    
                    batch_ticker = {}
                    last_broadcast = datetime.now()

                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            
                            # Handle Ticker Update
                            if "e" in data and data["e"] == "24hrTicker":
                                symbol = data['s']
                                batch_ticker[symbol] = {
                                    "symbol": symbol,
                                    "price": float(data['c']),
                                    "change": float(data['P']),
                                    "high": float(data['h']),
                                    "low": float(data['l']),
                                    "volume": float(data['v']),
                                    "timestamp": datetime.now().isoformat()
                                }
                            
                            # Handle Kline (OHLC) Update
                            elif "e" in data and data["e"] == "kline":
                                k = data['k']
                                payload = {
                                    "type": "kline",
                                    "symbol": data['s'],
                                    "data": {
                                        "time": k['t'] / 1000,
                                        "open": float(k['o']),
                                        "high": float(k['h']),
                                        "low": float(k['l']),
                                        "close": float(k['c'])
                                    }
                                }
                                await manager.broadcast(payload)
                            
                            # Broadcast tickers every 1 second
                            if (datetime.now() - last_broadcast).total_seconds() >= 1:
                                if batch_ticker:
                                    await manager.broadcast(batch_ticker)
                                    batch_ticker = {}
                                last_broadcast = datetime.now()
                                
                        elif msg.type == aiohttp.WSMsgType.CLOSED:
                            break
        except Exception as e:
            print(f"Binance WS Error: {e}")
            await asyncio.sleep(5)

async def intelligence_worker():
    """Background task for smart alerts (Whale moves, Gas spikes, etc)"""
    while True:
        try:
            # Simulate a Whale Alert every 30-60 seconds for demo
            whale_symbols = ["BTC", "ETH", "SOL", "USDC"]
            import random
            symbol = random.choice(whale_symbols)
            amount = random.uniform(1000000, 50000000)
            
            alert = {
                "type": "whale_alert",
                "symbol": symbol,
                "amount": amount,
                "usd_value": amount if symbol == "USDC" else amount * 2500, # crude approx
                "timestamp": datetime.now().isoformat(),
                "msg": f"🚨 WHALE MOVE: {amount:,.2f} {symbol} transferred to unknown wallet"
            }
            
            await manager.broadcast({"type": "alert", "data": alert})
            await asyncio.sleep(random.randint(30, 60))
        except Exception as e:
            print(f"Intelligence Worker Error: {e}")
            await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(binance_worker())
    asyncio.create_task(intelligence_worker())

@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "subscribe":
                    symbols = [s.upper() for s in msg.get("symbols", [])]
                    stream_type = msg.get("stream", "ticker")
                    # Trigger backend to subscribe to these symbols on Binance if not already
                    await manager.update_binance_subscriptions(symbols, stream_type)
                elif msg.get("type") == "unsubscribe":
                    pass 
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/search")
def search_coins(q: str):
    try:
        # Search Binance symbols
        url = "https://api.binance.com/api/v3/exchangeInfo"
        response = requests.get(url)
        data = response.json()
        
        matches = []
        query = q.upper()
        for s in data["symbols"]:
            if query in s["symbol"] and s["quoteAsset"] == "USDT":
                matches.append({
                    "symbol": s["symbol"],
                    "baseAsset": s["baseAsset"],
                    "quoteAsset": s["quoteAsset"]
                })
                if len(matches) >= 10: break
        return matches
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/market-data")
def get_market_data():
    try:
        # Initial snapshot from REST
        url = "https://api.binance.com/api/v3/ticker/24hr"
        response = requests.get(url)
        data = response.json()
        
        # Filter for major coins to keep it manageable
        top_symbols = {"BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "DOGEUSDT", "DOTUSDT", "MATICUSDT"}
        market_map = {}
        
        for item in data:
            symbol = item["symbol"]
            if symbol in top_symbols:
                market_map[symbol] = {
                    "symbol": symbol,
                    "price": float(item["lastPrice"]),
                    "change": float(item["priceChangePercent"]),
                    "high": float(item["highPrice"]),
                    "low": float(item["lowPrice"]),
                    "volume": float(item["volume"])
                }
        return market_map
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/historical/{symbol}")
def get_historical_data(symbol: str, interval: str = "1h", limit: int = 100):
    try:
        url = f"https://api.binance.com/api/v3/klines?symbol={symbol.upper()}&interval={interval}&limit={limit}"
        response = requests.get(url)
        data = response.json()
        
        if not isinstance(data, list):
            return {"error": f"Invalid response from Binance: {data}"}
            
        # Format for lightweight-charts: { time, open, high, low, close }
        formatted_data = []
        for item in data:
            try:
                formatted_data.append({
                    "time": int(item[0]) // 1000, # ms to s (integer division)
                    "open": float(item[1]),
                    "high": float(item[2]),
                    "low": float(item[3]),
                    "close": float(item[4]),
                    "volume": float(item[5])
                })
            except (ValueError, IndexError, TypeError):
                continue
        return formatted_data
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/gas-fees")
async def get_gas_fees():
    # Simulate dynamic gas fees
    import random
    base = 15 + random.randint(-5, 10)
    return {
        "low": base - 2,
        "standard": base,
        "fast": base + 5,
        "unit": "Gwei",
        "trend": random.choice(["up", "down", "stable"]),
        "suggestion": "Gas is low. Good time for swaps!" if base < 20 else "Gas is high. Consider waiting."
    }

@app.get("/api/swap-quote")
async def get_swap_quote(from_token: str, to_token: str, amount: float):
    # Simulate a swap quote with price impact and routing
    rate = 2250.45 if from_token == "ETH" and to_token == "USDC" else 1.0 / 2250.45
    if from_token == to_token: rate = 1.0
    
    return {
        "from": from_token,
        "to": to_token,
        "amount_in": amount,
        "amount_out": amount * rate * 0.997, # 0.3% fee
        "price_impact": 0.05,
        "route": ["Uniswap V3", "Sushiswap"],
        "gas_estimate": 12.50
    }

@app.get("/api/portfolio-history")
async def get_portfolio_history(days: int = 30):
    import random
    from datetime import timedelta
    history = []
    base_value = 12500.0
    # Scale volatility to the time range
    volatility = 200 if days <= 1 else (400 if days <= 7 else (700 if days <= 30 else 1200))
    points = min(days * 24, 720) if days <= 30 else days  # hourly for short ranges, daily for long
    for i in range(max(points, 2)):
        fraction = i / max(points - 1, 1)
        date = (datetime.now() - timedelta(days=days * (1 - fraction))).isoformat()
        base_value += random.uniform(-volatility / points, volatility / points * 1.3)
        history.append({
            "time": date,
            "value": round(max(base_value, 1000), 2)
        })
    return history


@app.get("/api/portfolio-allocation")
async def get_portfolio_allocation():
    return [
        {"symbol": "ETH", "percentage": 45.5, "color": "#E9B3A2"},
        {"symbol": "BTC", "percentage": 25.0, "color": "#F7931A"},
        {"symbol": "SOL", "percentage": 15.5, "color": "#14F195"},
        {"symbol": "USDC", "percentage": 14.0, "color": "#2775CA"}
    ]

@app.get("/api/insights")
async def get_insights():
    return [
        {
            "id": 1,
            "title": "Accumulation Phase",
            "desc": "Whales are accumulating BTC at current levels. Market sentiment is turning bullish.",
            "type": "bullish"
        },
        {
            "id": 2,
            "title": "Gas Optimization",
            "desc": "Network congestion is low. Consider rebalancing your portfolio now to save on fees.",
            "type": "info"
        },
        {
            "id": 3,
            "title": "Volatility Warning",
            "desc": "SOL showing high volatility. Consider setting stop-loss orders.",
            "type": "warning"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
