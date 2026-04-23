#!/bin/bash

# Zipzy Wallet - Quick Setup Script
# This script automates the setup process for both frontend and backend

echo "🚀 Zipzy Wallet - Setup Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js >= 18${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}📦 Installing Frontend Dependencies...${NC}"
cd frontend
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}📝 Please update .env.local with your API keys:${NC}"
    echo "   - VITE_WALLETCONNECT_PROJECT_ID (required)"
    echo "   - VITE_ALCHEMY_API_KEY (optional)"
    echo "   - VITE_ETHERSCAN_API_KEY (optional)"
    echo ""
fi

# Backend Setup (Optional)
if [ -d "../backend" ]; then
    echo -e "${BLUE}📦 Installing Backend Dependencies...${NC}"
    cd ../backend
    
    if [ -f "requirements.txt" ]; then
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    fi
fi

cd ../frontend
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update frontend/.env.local with your API keys"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:5173"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
