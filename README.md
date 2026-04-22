# 🧪 Zipzy - Advanced Blockchain Wallet

A production-ready Ethereum wallet application built with React, Wagmi, and RainbowKit.

## ✨ Features

### Core Wallet Features
- 🔌 **Multi-chain Support**: Ethereum Mainnet & Sepolia Testnet
- 🪪 **Wallet Connection**: MetaMask, WalletConnect, and EIP-1193 wallets
- 💰 **Balance Tracking**: Real-time ETH and token balances
- 📤 **Send Transactions**: Send ETH with full validation
- ⛽ **Gas Estimation**: Automatic gas fee calculation
- 📊 **Portfolio Analytics**: Portfolio value and asset breakdown
- 📜 **Transaction History**: Complete transaction tracking with Etherscan links
- 🔐 **Security First**: Input validation, balance checks, wallet signing

### UI/UX
- ✨ Modern glass-morphism design
- 🌙 Dark mode support
- 📱 Fully responsive
- ⚡ Real-time data updates
- 🎨 Beautiful animations

---

## 🚀 Quick Start

See **[QUICK_START.md](./QUICK_START.md)** for the fastest way to get running.

### Prerequisites
- Node.js >= 18
- npm >= 9
- A crypto wallet (MetaMask recommended)

### Setup

```bash
# 1. Clone repository
git clone <your-repo>
cd Zipzy

# 2. Install dependencies
cd frontend
npm install --legacy-peer-deps

# 3. Create .env.local
cp .env.example .env.local
# Add your VITE_WALLETCONNECT_PROJECT_ID

# 4. Start development server
npm run dev
```

Visit: http://localhost:5173

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 3-minute setup guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full deployment guide
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - API configuration (coming soon)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Zipzy React App                         │
│  (RainbowKit UI + Wagmi State Management + Custom Hooks)   │
└───────────────────────────────────────────────────────────┐
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌──────▼───────┐   ┌────▼────────┐
    │ MetaMask  │      │ WalletConnect │   │ Other EIP   │
    │  Wallet   │      │    Wallet     │   │1193 Wallet  │
    └────┬─────┘      └──────┬───────┘   └────┬────────┘
         │                   │                 │
         └───────────────────┼─────────────────┘
                             │
                      ┌──────▼───────┐
                      │  Ethereum    │
                      │ Mainnet/Test │
                      └──────────────┘
```

### Stack

- **Frontend**: React 18 + Vite
- **Wallet**: Wagmi + RainbowKit
- **Blockchain**: Ethers.js + Viem
- **State**: Zustand
- **Styling**: Tailwind CSS + Framer Motion
- **HTTP**: Axios

### APIs Integrated

- **CoinGecko** - Cryptocurrency prices (free)
- **Alchemy** - Token balances (optional)
- **Etherscan** - Transaction history (optional)

---

## 🔧 Environment Variables

### Required
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get from: https://cloud.walletconnect.com

### Optional
```env
VITE_ALCHEMY_API_KEY=your_api_key          # Token balances
VITE_ETHERSCAN_API_KEY=your_api_key        # Transaction history
```

---

## 📱 Pages & Components

### Main Pages
- **Dashboard** - Portfolio overview
- **Wallet** - Wallet management & balance
- **Tokens** - Token holdings
- **Activity** - Transaction history
- **Settings** - App settings

### Components
- **WalletBalanceReal** - Live balance display
- **TransactionHistory** - Transaction list
- **SendModal** - Send ETH interface
- **ConnectButton** - Wallet connection (RainbowKit)

---

## 🔐 Security Features

✅ No private key storage
✅ All transactions require wallet signing
✅ Input validation (addresses, amounts)
✅ Balance verification
✅ HTTPS enforced (production)
✅ User confirmation for all actions

---

## 📊 Data Flow

```
User Interaction
     ↓
React Component
     ↓
Wagmi Hook (useAccount, useBalance, useSendTransaction)
     ↓
RainbowKit (Wallet Connection)
     ↓
Wallet (MetaMask / WalletConnect)
     ↓
Blockchain (Ethereum)
```

---

## 🧪 Testing

### Test on Sepolia Testnet (Recommended)

1. Switch MetaMask to Sepolia
2. Get free testnet ETH: https://sepoliafaucet.com
3. Send test transaction
4. View on Etherscan: https://sepolia.etherscan.io

### Test Cases

- [ ] Connect wallet (MetaMask)
- [ ] Connect wallet (WalletConnect)
- [ ] View real balance
- [ ] Send 0.001 ETH
- [ ] View transaction history
- [ ] Test address validation
- [ ] Test insufficient balance error

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Import on Vercel
# https://vercel.com/new

# Add environment variables in Vercel dashboard
# Deploy!
```

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed steps.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connect button not working | Check `VITE_WALLETCONNECT_PROJECT_ID` |
| Balance showing $0 | Connect wallet & ensure you have ETH |
| Gas estimation fails | This is OK, fallback values used |
| Build errors | Run `npm install --legacy-peer-deps` |

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file

---

## 🎯 Roadmap

- ✅ Wallet connection
- ✅ Balance display
- ✅ Send ETH
- ✅ Transaction history
- ⬜ Token swaps
- ⬜ Staking
- ⬜ NFT support
- ⬜ Multi-chain support

---

## 📚 Resources

- **Wagmi**: https://wagmi.sh
- **RainbowKit**: https://rainbowkit.com
- **Ethers.js**: https://docs.ethers.org
- **Ethereum Dev**: https://ethereum.org/en/developers
- **Web3 Best Practices**: https://web3.hashnode.com

---

## 🆘 Support

For issues and questions:
1. Check [QUICK_START.md](./QUICK_START.md)
2. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Review Wagmi/RainbowKit documentation

---

## ⚡ Performance

- Initial load: ~2.5s
- Build size: ~1.3MB (minified)
- Gzip: ~400KB

---

## 🔄 Version Info

- **Node**: 18.19.1
- **React**: 18.2.0
- **Wagmi**: 3.6.4
- **RainbowKit**: 2.2.10
- **Vite**: 4.4.5

---

Made with ❤️ by the Zipzy team

# Zipzy
