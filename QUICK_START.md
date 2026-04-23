# 🚀 Quick Start Guide - Zipzy Wallet

## What You Have

A **production-ready** blockchain wallet application with:

✅ Wallet connection (MetaMask, WalletConnect)
✅ Real ETH balance display
✅ Transaction sending
✅ Gas estimation
✅ Transaction history
✅ Portfolio tracking
✅ Input validation & security

---

## 3-Minute Setup

### 1. Get WalletConnect ID (Required)

- Visit: https://cloud.walletconnect.com
- Create account → New Project
- Copy your **Project ID**

### 2. Create `.env.local`

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_copied_project_id_here
```

### 3. Start Dev Server

```bash
npm install --legacy-peer-deps
npm run dev
```

Visit: **http://localhost:5173**

---

## First Test (Recommended)

1. **Connect MetaMask Wallet** (Click "Connect" button)
2. **Switch to Sepolia Testnet** (in MetaMask)
3. **Get Free Sepolia ETH**: https://sepoliafaucet.com
4. **Send a test transaction** (0.001 ETH)
5. **View transaction on Etherscan**

---

## Optional: Add More Features

### For Token Balances (Alchemy API)

```env
VITE_ALCHEMY_API_KEY=your_alchemy_key_here
```

Get key: https://dashboard.alchemy.com

### For Transaction History (Etherscan API)

```env
VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
```

Get key: https://etherscan.io/apis

---

## Deploy to Production (Vercel)

```bash
git push origin main
```

Then:

1. Visit https://vercel.com
2. Import your GitHub repo
3. Add `.env.local` variables
4. Deploy! 🎉

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletBalanceReal.jsx    ← Display wallet balance
│   │   ├── TransactionHistory.jsx   ← Show transactions
│   │   └── wallet/SendModal.jsx     ← Send ETH
│   ├── hooks/
│   │   └── useWalletBalance.js      ← Fetch balance & tokens
│   ├── services/
│   │   └── blockchain.js            ← Transaction logic
│   └── config/
│       ├── env.js                   ← API configuration
│       └── wagmiConfig.js           ← Wallet setup
├── .env.local                        ← Your API keys (create this!)
└── .env.example                      ← Template
```

---

## Key Features Explained

### Connect Wallet
- Supports MetaMask, WalletConnect, and other EIP-1193 wallets
- Zero private key storage
- User controls all transactions

### View Balance
- Real-time ETH balance
- USD conversion (via CoinGecko free API)
- Token support (with Alchemy)

### Send ETH
- Full validation (address format, sufficient balance)
- Gas estimation
- One-click transaction review
- Transaction confirmation tracking

### Transaction History
- Shows sent/received transactions
- Links to Etherscan
- Real-time updates

---

## Troubleshooting

### "Connect" button not working

→ Check `VITE_WALLETCONNECT_PROJECT_ID` in `.env.local`

### Balance showing $0

→ Make sure wallet is connected AND you have ETH
→ Try Sepolia testnet first

### No transaction history

→ Add `VITE_ETHERSCAN_API_KEY` (optional, but recommended)

### Build errors

→ Run `npm install --legacy-peer-deps`

---

## Security Reminders

🔒 **This is production code:**

- Never share your API keys
- Always test on Sepolia first
- Start with small amounts on mainnet
- Keep dependencies updated
- Enable 2FA on all accounts

---

## What's Next?

1. ✅ Local testing (done!)
2. ✅ Add API keys (do this!)
3. ✅ Deploy to Vercel (next!)
4. ⬜ Add swap functionality
5. ⬜ Add staking
6. ⬜ Add NFT support

---

## Support

- **Wagmi Docs**: https://wagmi.sh
- **RainbowKit**: https://rainbowkit.com
- **Ethers.js**: https://docs.ethers.org
- **Ethereum Dev**: https://ethereum.org/en/developers

---

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

Happy hacking! 🚀

