# EchoDAO Frontend - Backend Integration Guide

## 🔗 API Endpoints Connected

### 1. **Reports API** (`/reports`)

#### Submit Report
- **Endpoint**: `POST /reports/submit_report`
- **Description**: Upload files (txt, pdf, images) to IPFS with AI analysis
- **Request**: FormData with file
- **Response**:
  ```typescript
  {
    filename: string;
    ipfs_hash: string;      // IPFS hash for decentralized storage
    file_hash: string;       // SHA-256 hash for verification
    summary: string;         // AI-generated summary (BART-CNN)
    trust_score: number;     // 0-100 trust rating
    credibility: string;     // "High" or "Medium"
  }
  ```

#### Verify Report AI
- **Endpoint**: `POST /reports/verify_report_ai`
- **Description**: Verify plain text report without file upload
- **Request**: `{ content: string }`
- **Response**: Summary, trust score, credibility

---

### 2. **Proposals API** (`/proposals`)

#### Create Proposal
- **Endpoint**: `POST /proposals/create`
- **Description**: Create new governance proposal on blockchain
- **Request**:
  ```typescript
  {
    title: string;
    description: string;
    amount_eth: number;     // Amount in CELO
    recipient: string;       // Recipient wallet address
  }
  ```
- **Response**:
  ```typescript
  {
    tx_hash: string;        // Blockchain transaction hash
    proposal_id: number;    // Unique proposal ID
    message: string;        // Success message
  }
  ```

#### Vote on Proposal
- **Endpoint**: `POST /proposals/vote`
- **Description**: Cast vote on existing proposal
- **Request**:
  ```typescript
  {
    proposal_id: number;
    support: boolean;       // true = support, false = oppose
  }
  ```
- **Response**:
  ```typescript
  {
    tx_hash: string;
    message: string;
  }
  ```

#### Execute Proposal
- **Endpoint**: `POST /proposals/execute/{proposal_id}`
- **Description**: Execute a passed proposal
- **Response**:
  ```typescript
  {
    tx_hash: string;
    message: string;
    events?: object;        // Blockchain event logs
  }
  ```

---

### 3. **Funds/Treasury API** (`/funds`)

#### Get Treasury Balance
- **Endpoint**: `GET /funds/treasury_balance`
- **Description**: Fetch current treasury balance
- **Response**:
  ```typescript
  {
    balance_wei: number;    // Balance in Wei
    balance_eth: number;    // Balance in CELO/ETH
  }
  ```

#### Get Treasury Info
- **Endpoint**: `GET /funds/treasury_info`
- **Description**: Get comprehensive treasury information
- **Response**:
  ```typescript
  {
    treasury: string;       // Treasury contract address
    owner: string;          // Owner address
    balance_wei: number;
    balance_eth: number;
  }
  ```

#### Get Proposal Status
- **Endpoint**: `GET /funds/proposal_status/{proposal_id}`
- **Description**: Check proposal voting status
- **Response**:
  ```typescript
  {
    proposal_id: number;
    yes_votes: number;
    no_votes: number;
    executed: boolean;
    block_start: number;    // Voting start block
    block_end: number;      // Voting end block
  }
  ```

---

## 🛠️ Tech Stack Integration

### Backend Technologies
- **FastAPI**: High-performance async Python framework
- **Web3.py**: Ethereum/Celo blockchain interaction
- **Transformers (HuggingFace)**: AI summarization (BART-CNN)
- **Pinata**: IPFS file storage
- **Pydantic**: Data validation

### Frontend Technologies
- **React + TypeScript**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Lucide Icons**: Icon library

---

## 📁 File Structure

```
frontend1/
├── src/
│   ├── components/
│   │   ├── VideoUpload.tsx       # Main interface component
│   │   ├── Features.tsx          # Technology showcase
│   │   └── ...
│   └── config/
│       └── api.ts                # API configuration & functions
├── .env                          # Environment variables
├── .env.example                  # Environment template
└── package.json
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontend1` directory:

```env
VITE_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL:
```env
VITE_API_URL=https://your-backend-domain.com
```

### API Configuration (`src/config/api.ts`)

The API module provides:
- **Centralized endpoint management**
- **Type-safe API calls**
- **Error handling with custom APIError class**
- **Request timeout (30 seconds)**
- **Automatic JSON parsing**

---

## 🚀 Usage Examples

### Import API Functions

```typescript
import { reportAPI, proposalAPI, fundsAPI, APIError } from '../config/api';
```

### Submit a Report

```typescript
try {
  const result = await reportAPI.submitReport(file);
  console.log('IPFS Hash:', result.ipfs_hash);
  console.log('Trust Score:', result.trust_score);
} catch (err) {
  if (err instanceof APIError) {
    console.error('API Error:', err.message, err.statusCode);
  }
}
```

### Create a Proposal

```typescript
try {
  const result = await proposalAPI.create({
    title: 'Fund Community Project',
    description: 'Allocate funds for...',
    amount_eth: 10.5,
    recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  });
  console.log('Proposal ID:', result.proposal_id);
  console.log('TX Hash:', result.tx_hash);
} catch (err) {
  console.error('Failed to create proposal:', err);
}
```

### Vote on Proposal

```typescript
try {
  const result = await proposalAPI.vote({
    proposal_id: 1,
    support: true  // or false to oppose
  });
  console.log('Vote recorded:', result.tx_hash);
} catch (err) {
  console.error('Failed to vote:', err);
}
```

### Check Treasury Balance

```typescript
try {
  const balance = await fundsAPI.getTreasuryBalance();
  console.log('Treasury Balance:', balance.balance_eth, 'CELO');
} catch (err) {
  console.error('Failed to fetch balance:', err);
}
```

### Check Proposal Status

```typescript
try {
  const status = await fundsAPI.getProposalStatus(1);
  console.log('Yes votes:', status.yes_votes);
  console.log('No votes:', status.no_votes);
  console.log('Executed:', status.executed);
} catch (err) {
  console.error('Failed to fetch status:', err);
}
```

---

## 🔐 Error Handling

The API module includes comprehensive error handling:

```typescript
try {
  const result = await reportAPI.submitReport(file);
} catch (err) {
  if (err instanceof APIError) {
    // API-specific error
    console.error('Message:', err.message);
    console.error('Status Code:', err.statusCode);
    console.error('Details:', err.details);
  } else {
    // Generic error
    console.error('Unexpected error:', err);
  }
}
```

### Common Error Scenarios

1. **Network Timeout** (408): Request took longer than 30 seconds
2. **Bad Request** (400): Invalid data sent to backend
3. **Server Error** (500): Backend processing error
4. **Blockchain Error**: Transaction failed or reverted

---

## 🎨 UI Components

### Tab Navigation
The main interface includes 4 tabs:
1. **Submit Report**: Upload and analyze files
2. **Create Proposal**: Submit governance proposals
3. **Vote**: Cast votes on proposals
4. **Treasury**: View balance and proposal status

### Features Showcase
Displays 8 technology cards highlighting:
- AI-Powered Report Analysis
- IPFS Decentralized Storage
- On-Chain Governance
- Smart Contract Treasury
- Trust Score ML Model
- Real-Time Proposal Tracking
- FastAPI Backend
- Blockchain Security

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd Backend
uvicorn app:app --reload
```

### 2. Start Frontend
```bash
cd frontend1
npm run dev
```

### 3. Test Endpoints
- Navigate to `http://localhost:5173`
- Try uploading a text file in the "Submit Report" tab
- Create a test proposal in the "Create Proposal" tab
- Check treasury balance in the "Treasury" tab

---

## 📝 Type Safety

All API responses are fully typed:

```typescript
// Automatically inferred types
const report: ReportResult = await reportAPI.submitReport(file);
const proposal: ProposalResult = await proposalAPI.create({...});
const vote: VoteResult = await proposalAPI.vote({...});
const balance: TreasuryInfo = await fundsAPI.getTreasuryBalance();
const status: ProposalStatus = await fundsAPI.getProposalStatus(1);
```

---

## 🔄 Real-Time Updates

To fetch live data, components call API functions:

```typescript
// Refresh treasury balance
const refreshBalance = async () => {
  const data = await fundsAPI.getTreasuryBalance();
  setTreasuryInfo(data);
};

// Poll for proposal status updates
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await fundsAPI.getProposalStatus(proposalId);
    setProposalStatus(status);
  }, 10000); // Every 10 seconds
  
  return () => clearInterval(interval);
}, [proposalId]);
```

---

## 🛡️ Security Considerations

1. **CORS**: Backend allows all origins (`allow_origins=["*"]`)
   - Update in production to specific domain
2. **API Keys**: Never expose private keys in frontend
3. **Input Validation**: All inputs validated by Pydantic on backend
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Keep `.env` out of version control

---

## 📊 Blockchain Integration

### Celo Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: Configured in backend `.env`
- **Smart Contracts**: EchoDAO + Treasury

### Transaction Flow
1. Frontend → API Request
2. Backend → Web3.py → Celo Node
3. Transaction Signed & Broadcasted
4. Wait for Receipt
5. Return TX Hash to Frontend

---

## 🎯 Next Steps

1. **Add Loading States**: Improve UX during API calls
2. **Error Messages**: More user-friendly error displays
3. **Pagination**: For listing proposals
4. **WebSocket**: Real-time updates for votes
5. **Wallet Integration**: Connect MetaMask/WalletConnect
6. **Transaction History**: Track user's interactions

---

## 📞 Support

For issues or questions:
- Check backend logs: `Backend/` directory
- Verify API is running: `http://localhost:8000/docs`
- Check browser console for frontend errors

---

**Built with ❤️ for transparent governance on the blockchain**
