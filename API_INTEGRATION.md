# 🔌 API Integration Guide

## Overview

Zipzy integrates with three main APIs. One is required, two are optional.

---

## 1️⃣ WalletConnect (REQUIRED)

**Purpose**: Enable WalletConnect wallet connections (in-app QR scanning)

### Setup

1. Visit: https://cloud.walletconnect.com
2. Create account (or sign in)
3. Click "Create Project"
4. Select "Ethereum" as network
5. Copy your **Project ID**
6. Add to `.env.local`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Used By

- RainbowKit ConnectButton
- WalletConnect connector in wagmiConfig.js

### What It Does

- Generates QR code for mobile wallet scanning
- Manages WalletConnect sessions
- Routes transactions through WalletConnect bridge

### Pricing

✅ **Free**

---

## 2️⃣ Alchemy API (OPTIONAL - Recommended)

**Purpose**: Fetch token balances and detailed wallet information

### Setup

1. Visit: https://dashboard.alchemy.com
2. Create account (or sign in)
3. Click "Create App"
4. Select:
   - Chain: Ethereum
   - Network: Mainnet (or Sepolia for testnet)
5. Copy your **API Key**
6. Add to `.env.local`:

```env
VITE_ALCHEMY_API_KEY=your_api_key_here
```

### Used By

- `useWalletBalance` hook
- `fetchTokenBalances` function

### Endpoints Used

- `alchemy_getTokenBalances` - Get all token holdings
- Standard JSON-RPC methods

### Pricing

- Free tier: 330M compute units/month (~enough for production apps)
- Paid tiers available for higher usage

### Without This

- ⚠️ Token list won't load
- ✅ ETH balance still works (via standard JSON-RPC)

---

## 3️⃣ Etherscan API (OPTIONAL - Recommended)

**Purpose**: Fetch transaction history and gas prices

### Setup

1. Visit: https://etherscan.io/apis
2. Create account (or sign in)
3. Click "Create API Key"
4. Name it "Zipzy"
5. Copy your **API Key**
6. Add to `.env.local`:

```env
VITE_ETHERSCAN_API_KEY=your_api_key_here
```

### Used By

- `fetchTransactionHistory` function
- Transaction list display

### Endpoints Used

- `account/txlist` - Get transaction list
- Standard analytics endpoints

### Pricing

- Free tier: 5 calls/second (enough for most apps)
- Paid tiers available

### Without This

- ⚠️ Transaction history shows mock data
- ✅ Still can send and receive transactions

---

## 4️⃣ CoinGecko API (NO SETUP - FREE)

**Purpose**: Get cryptocurrency prices

### Why It's Great

- ✅ Completely free
- ✅ No authentication required
- ✅ No rate limit warnings
- ✅ Comprehensive price data

### Used By

- `useWalletBalance` hook
- Portfolio calculations
- Price display

### Endpoints Used

- `simple/price` - Get token prices
- Includes 24h change and volume

### Pricing

- ✅ **FREE**
- 10-50 calls/minute limit (fine for UI apps)

---

## 📊 Configuration Priority

```
Required for full functionality:
1. VITE_WALLETCONNECT_PROJECT_ID (Required)
2. VITE_ALCHEMY_API_KEY (Optional but recommended)
3. VITE_ETHERSCAN_API_KEY (Optional but recommended)
4. CoinGecko (Free, no setup needed)

Minimum working setup:
1. VITE_WALLETCONNECT_PROJECT_ID ✅ 
   (rest fallback gracefully)
```

---

## 🧪 Testing Your Setup

### Test WalletConnect

```javascript
// In browser console
fetch('/api/wagmi-config')
  .then(r => r.json())
  .then(config => console.log(config.projectId))
```

### Test Alchemy

```javascript
// In src/hooks/useWalletBalance.js
// Check console for token balance fetches
console.log('Alchemy API Key present:', !!API_KEYS.ALCHEMY_API_KEY)
```

### Test Etherscan

```javascript
// In src/services/blockchain.js
// Check for transaction history
console.log('Etherscan API Key present:', !!API_KEYS.ETHERSCAN_API_KEY)
```

### Test CoinGecko

```javascript
// In browser console
fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## 🔑 API Key Security

### DO ✅

- Use environment variables
- Keep `.env.local` in `.gitignore`
- Rotate keys regularly
- Use different keys for dev/prod

### DON'T ❌

- Commit `.env.local` to Git
- Share API keys publicly
- Use same key across projects
- Log API keys

### In Production

1. Never expose API keys in frontend code
2. Use environment variables on hosting platform (Vercel, AWS, etc.)
3. Rotate keys every 3-6 months
4. Monitor API usage for suspicious activity

---

## 📈 Rate Limits

| API | Free Tier | Limit |
|-----|-----------|-------|
| WalletConnect | N/A | No limit |
| Alchemy | 330M compute units/month | ~production-grade |
| Etherscan | 5 calls/second | Enough for users |
| CoinGecko | 10-50 calls/minute | Enough for UI |

---

## ❌ What If API Is Down?

### Alchemy Down
- ✅ App still works
- ⚠️ Token balances won't load
- ✅ ETH balance still works

### Etherscan Down
- ✅ App still works
- ⚠️ Transaction history shows mock data
- ✅ Can still send transactions

### CoinGecko Down
- ✅ App still works
- ⚠️ Prices won't update
- ✅ Wallet functions still work

---

## 🚀 Scaling Production

As your app grows:

1. **Monitor API usage** in dashboards
2. **Upgrade to paid plans** if hitting limits
3. **Implement caching** for price data
4. **Use backend proxy** for API calls (security + rate limiting)
5. **Consider additional providers** (Infura, QuickNode, etc.)

---

## 📞 Support

### API Documentation

- **WalletConnect**: https://docs.walletconnect.com
- **Alchemy**: https://docs.alchemy.com
- **Etherscan**: https://docs.etherscan.io
- **CoinGecko**: https://www.coingecko.com/en/api

### Issues?

1. Check API status pages
2. Verify API key is correct
3. Check rate limits
4. See DEPLOYMENT_GUIDE.md for troubleshooting

---

## ✅ Checklist

- [ ] Created WalletConnect project → Got Project ID
- [ ] Added `VITE_WALLETCONNECT_PROJECT_ID` to `.env.local`
- [ ] (Optional) Created Alchemy app → Got API key
- [ ] (Optional) Added `VITE_ALCHEMY_API_KEY` to `.env.local`
- [ ] (Optional) Created Etherscan account → Got API key
- [ ] (Optional) Added `VITE_ETHERSCAN_API_KEY` to `.env.local`
- [ ] Tested Connect button works
- [ ] Tested wallet balance displays
- [ ] Tested sending transaction

---

## 🎉 You're All Set!

Your Zipzy wallet is ready to use with full API integration.

Next step: **[Deploy to Vercel](./DEPLOYMENT_GUIDE.md)**
