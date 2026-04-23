# 🚀 Zipzy Wallet - Complete Setup & Deployment Guide

## Architecture Overview

```
User → Web App (React) → Wallet (MetaMask/WalletConnect) → Blockchain (Ethereum)
```

### Key Features Implemented

✅ **Phase 1:** Wallet Connection (MetaMask, WalletConnect)
✅ **Phase 2:** Real Wallet Data (Address, ETH Balance)
✅ **Phase 3:** Token Support (Ready for Alchemy/Moralis)
✅ **Phase 4:** Send ETH Transactions
✅ **Phase 5:** Gas Estimation
✅ **Phase 6:** Transaction History from Etherscan
✅ **Phase 7:** Real Data Integration
✅ **Phase 8:** Portfolio Analytics
✅ **Phase 9:** Security Implementation
⬜ **Phase 10:** Deploy to Production

---

## Local Development Setup

### 1. Prerequisites

```bash
Node.js >= 18.x (currently using 18.19.1)
npm >= 9.x
A MetaMask wallet (or other EIP-1193 compliant wallet)
```

### 2. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables

Create `.env.local`:

```env
# Required: Get from https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional: Get from https://dashboard.alchemy.com (for token balances)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key

# Optional: Get from https://etherscan.io/apis (for transaction history)
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## How to Get API Keys

### WalletConnect (Required)

1. Visit https://cloud.walletconnect.com
2. Sign up / Sign in
3. Create a new project
4. Copy the `Project ID`
5. Add to `.env.local` as `VITE_WALLETCONNECT_PROJECT_ID`

### Alchemy API (Recommended - for token balances)

1. Visit https://dashboard.alchemy.com
2. Sign up / Sign in
3. Create a new app
4. Select Ethereum mainnet
5. Copy the API key
6. Add to `.env.local` as `VITE_ALCHEMY_API_KEY`

### Etherscan API (Recommended - for transaction history)

1. Visit https://etherscan.io/apis
2. Sign up / Sign in
3. Create a new API key
4. Copy the key
5. Add to `.env.local` as `VITE_ETHERSCAN_API_KEY`

---

## Key Files and Features

### Configuration Files

- **`src/config/env.js`** - API configuration and endpoints
- **`src/config/wagmiConfig.js`** - Wagmi and RainbowKit setup
- **`.env.example`** - Example environment variables

### Hooks

- **`src/hooks/useWalletBalance.js`** - Fetches wallet balance, tokens, and portfolio value
- **`src/hooks/useWallet.js`** - Existing wallet hook
- **`src/hooks/useWalletSync.js`** - Sync wagmi with Zustand store

### Services

- **`src/services/blockchain.js`** - Transaction handling, gas estimation, validation
  - `prepareSendTransaction()` - Validate and prepare ETH transactions
  - `estimateTransactionGas()` - Get gas cost estimates
  - `fetchTransactionHistory()` - Get transaction history from Etherscan
  - `isValidEthereumAddress()` - Validate Ethereum addresses
  - `validateBalance()` - Check sufficient balance

### Components

- **`src/components/WalletBalanceReal.jsx`** - Display real wallet balance
- **`src/components/TransactionHistory.jsx`** - Display transaction history
- **`src/components/wallet/SendModal.jsx`** - Send ETH with validation

### Pages

- **`src/pages/Wallet.jsx`** - Main wallet page
- **`src/pages/Tokens.jsx`** - Token list
- **`src/pages/Activity.jsx`** - Transaction activity

---

## Smart Contract Integration (Coming Soon)

### Supported Features

- [x] Send ETH (Phase 4)
- [x] View balance (Phase 2)
- [ ] Swap tokens (Phase 11)
- [ ] Staking (Phase 12)
- [ ] NFT support (Phase 13)

---

## Security Checklist

### ✅ Implemented

- [x] No private key storage (uses wallet signing)
- [x] Input validation (address format, amount > 0)
- [x] Balance validation before transaction
- [x] Wallet signing required for all transactions
- [x] HTTPS recommended (enforced on production)
- [x] User confirms all transactions in wallet

### ⚠️ Important

1. **Never store private keys** - Always use wallet signing
2. **Validate all inputs** - Check addresses and amounts
3. **Use HTTPS** - Especially in production
4. **Test on testnet first** - Use Sepolia before mainnet
5. **Keep API keys secure** - Use environment variables

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/zipzy.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Visit https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Choose "Frontend" directory: `frontend`
5. Add Environment Variables:
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_ALCHEMY_API_KEY` (optional)
   - `VITE_ETHERSCAN_API_KEY` (optional)
6. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps

---

## Testing Checklist

### Testnet Setup (Recommended First)

1. Change network to **Sepolia** in wallet
2. Get Sepolia ETH from faucet: https://sepoliafaucet.com
3. Test transactions on testnet first

### Test Cases

- [ ] Connect wallet (MetaMask)
- [ ] Connect wallet (WalletConnect)
- [ ] View ETH balance
- [ ] Send 0.001 ETH test
- [ ] View transaction in Etherscan
- [ ] View transaction history
- [ ] Test "Use Max" button
- [ ] Test address validation
- [ ] Test insufficient balance error

---

## Common Issues & Solutions

### Issue: WalletConnect Modal not appearing

**Solution:** Check `VITE_WALLETCONNECT_PROJECT_ID` in `.env.local`

### Issue: Gas estimation failing

**Solution:** This is OK - fallback values are used. Add `VITE_ETHERSCAN_API_KEY` for better estimates.

### Issue: Token balances not loading

**Solution:** This is optional. Add `VITE_ALCHEMY_API_KEY` to enable.

### Issue: "Cannot read property 'formatted' of undefined"

**Solution:** Wait for wallet to connect before reading balance. Use loading states.

---

## Performance Optimization

### Built-in Optimizations

- [x] React Query for data caching
- [x] Wagmi hooks for efficient state management
- [x] Lazy loading of routes
- [x] Optimized images

### To Improve Bundle Size

See build warnings for code splitting recommendations

---

## Next Steps

1. **Get API keys** (WalletConnect required, others optional)
2. **Test locally** on Sepolia testnet
3. **Deploy to Vercel** with environment variables
4. **Test on production** with small amounts first
5. **Monitor** transactions and user feedback

---

## Support & Resources

- **Wagmi Docs:** https://wagmi.sh
- **RainbowKit Docs:** https://rainbowkit.com
- **Ethers.js Docs:** https://docs.ethers.org
- **Ethereum Development:** https://ethereum.org/en/developers

---

## Security Notice

🔒 **IMPORTANT:** This is production-ready code, but always:

1. Test thoroughly on testnet first
2. Use HTTPS in production
3. Never store private keys
4. Validate all user inputs
5. Keep dependencies updated
6. Monitor for suspicious activity

