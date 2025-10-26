# 🚀 EchoDAO Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Create .env file with your configuration
# (Copy from .env.example and update values)

# Start backend server
uvicorn app:app --reload
```

Backend will run at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend1

# Install dependencies
npm install

# Create .env file (already created)
# Verify VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🔗 Endpoints Connected

### ✅ Reports
- `POST /reports/submit_report` - Upload files to IPFS with AI analysis
- `POST /reports/verify_report_ai` - Verify text reports

### ✅ Proposals  
- `POST /proposals/create` - Create governance proposal
- `POST /proposals/vote` - Vote on proposals
- `POST /proposals/execute/{id}` - Execute passed proposals

### ✅ Treasury/Funds
- `GET /funds/treasury_balance` - Get treasury balance
- `GET /funds/treasury_info` - Get treasury details
- `GET /funds/proposal_status/{id}` - Get proposal status

---

## 🎯 Features Implemented

### Frontend Components

1. **Technology Showcase** (`Features.tsx`)
   - 8 feature cards highlighting tech stack
   - AI Analysis, IPFS Storage, Blockchain Governance
   - Smart Contract Treasury, ML Trust Scores
   - Real-time tracking, FastAPI backend
   - Blockchain security features

2. **Main Interface** (`VideoUpload.tsx` → `EchoDaoInterface`)
   - **Tab 1: Submit Report**
     - Drag & drop file upload
     - AI summarization with BART-CNN
     - IPFS storage with hash verification
     - Trust score and credibility rating
   
   - **Tab 2: Create Proposal**
     - Form for governance proposals
     - Blockchain transaction handling
     - Auto-fund treasury if needed
     - Returns TX hash and proposal ID
   
   - **Tab 3: Vote**
     - Vote Support or Oppose
     - On-chain voting
     - Transaction confirmation
   
   - **Tab 4: Treasury**
     - Real-time balance display (CELO & Wei)
     - Proposal status checker
     - Vote counts and execution status

### API Integration (`src/config/api.ts`)

- Centralized endpoint management
- Type-safe API calls with TypeScript
- Comprehensive error handling
- 30-second timeout protection
- Automatic JSON parsing
- Custom `APIError` class

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Web3.py** - Blockchain interaction
- **Transformers** - AI models (BART-CNN)
- **Pinata** - IPFS storage
- **Pydantic** - Data validation
- **Celo Alfajores** - Testnet blockchain

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Styling
- **Lucide Icons** - Icon library

### Smart Contracts
- **Solidity** - Contract language
- **OpenZeppelin** - Security standards
- **Hardhat** - Development environment

---

## 📝 Environment Variables

### Backend (.env)
```env
CELO_RPC=https://alfajores-forno.celo-testnet.org
PRIVATE_KEY=your_private_key
DAO_CONTRACT=0x...
TREASURY_CONTRACT_ADDRESS=0x...
PINATA_API_KEY=your_key
PINATA_SECRET=your_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing the Application

### 1. Test Report Submission
- Go to "Submit Report" tab
- Upload a `.txt` file
- View AI summary, trust score, IPFS hash

### 2. Test Proposal Creation
- Go to "Create Proposal" tab
- Fill in title, description, amount, recipient
- Submit and get TX hash

### 3. Test Voting
- Go to "Vote" tab
- Enter proposal ID
- Select Support/Oppose
- Submit vote

### 4. Test Treasury
- Go to "Treasury" tab
- Click "Refresh" to see balance
- Enter proposal ID to check status

---

## 🔍 Verification

### Check Backend is Running
```bash
curl http://localhost:8000/
# Should return: {"message": "Welcome to EchoDAO Backend 🚀"}
```

### Check API Documentation
Visit: `http://localhost:8000/docs`

### Check Frontend
Visit: `http://localhost:5173`

---

## 📊 Directory Structure

```
EchoDao/
├── Backend/
│   ├── app.py                    # Main FastAPI app
│   ├── routes/
│   │   ├── report_routes.py     # Report endpoints
│   │   ├── proposal_routes.py   # Proposal endpoints
│   │   └── fund_routes.py       # Treasury endpoints
│   ├── blockchain/
│   │   └── celo_interact.py     # Web3 integration
│   ├── ai/
│   │   ├── summarizer.py        # AI summarization
│   │   └── truth_verifier.py    # Trust scoring
│   └── storage/
│       └── ipfs_handler.py      # IPFS integration
│
├── frontend1/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUpload.tsx  # Main interface
│   │   │   ├── Features.tsx     # Tech showcase
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   └── Footer.tsx
│   │   └── config/
│   │       └── api.ts           # API configuration
│   ├── .env                     # Environment vars
│   └── API_INTEGRATION.md       # Documentation
│
└── Solidity/
    ├── contracts/
    │   ├── EchoDAO.sol          # Main DAO contract
    │   └── Treasury.sol         # Treasury contract
    └── scripts/
        └── deploy.js
```

---

## 🎨 UI/UX Features

- **Gradient Design** - Purple/pink theme
- **Responsive Layout** - Mobile-friendly
- **Loading States** - User feedback during API calls
- **Error Handling** - Clear error messages
- **Tab Navigation** - Easy switching between features
- **Hover Effects** - Interactive cards
- **Real-time Updates** - Refresh treasury data
- **Transaction Tracking** - View TX hashes

---

## 🚨 Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Install requirements: `pip install -r requirements.txt`
- Verify `.env` file exists with correct values

### Frontend won't start
- Check Node version (16+)
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check `.env` file

### API calls failing
- Verify backend is running at `http://localhost:8000`
- Check CORS settings in `app.py`
- View browser console for errors
- Check network tab in DevTools

### Blockchain errors
- Verify Celo RPC URL is correct
- Check private key has test CELO
- Ensure contract addresses are deployed
- Check Alfajores testnet status

---

## 📚 Documentation Links

- **FastAPI Docs**: `http://localhost:8000/docs`
- **API Integration Guide**: `frontend1/API_INTEGRATION.md`
- **Celo Documentation**: https://docs.celo.org
- **IPFS/Pinata**: https://docs.pinata.cloud

---

## 🎯 Next Steps

1. **Deploy Backend** - Heroku, Railway, or AWS
2. **Deploy Frontend** - Vercel, Netlify, or Cloudflare Pages
3. **Wallet Integration** - Add MetaMask support
4. **Enhanced UI** - More animations and transitions
5. **Proposal List** - View all proposals
6. **User Dashboard** - Track personal proposals/votes
7. **Notifications** - Real-time updates via WebSocket

---

## ✅ Completed Integration

✓ All backend endpoints connected  
✓ Type-safe API calls  
✓ Comprehensive error handling  
✓ Technology showcase updated  
✓ Environment configuration  
✓ Full documentation  

**Ready to use! 🎉**
