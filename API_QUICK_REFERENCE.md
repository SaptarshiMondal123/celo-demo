# 🚀 EchoDAO API Quick Reference

## Base Configuration

```typescript
// Default API URL (can be changed via .env)
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Functions

### 1. Reports

```typescript
// Upload file to IPFS with AI analysis
await reportAPI.submitReport(file);
// Returns: { filename, ipfs_hash, file_hash, summary, trust_score, credibility }

// Verify text without file upload
await reportAPI.verifyReport(content);
// Returns: { summary, trust_score, credibility }
```

### 2. Proposals

```typescript
// Create governance proposal
await proposalAPI.create({
  title: "Proposal Title",
  description: "Detailed description", 
  amount_eth: 10.5,
  recipient: "0x..."
});
// Returns: { tx_hash, proposal_id, message }

// Vote on proposal
await proposalAPI.vote({
  proposal_id: 1,
  support: true  // or false to oppose
});
// Returns: { tx_hash, message }

// Execute passed proposal
await proposalAPI.execute(proposalId);
// Returns: { tx_hash, message, events }
```

### 3. Treasury

```typescript
// Get treasury balance
await fundsAPI.getTreasuryBalance();
// Returns: { balance_wei, balance_eth }

// Get detailed treasury info
await fundsAPI.getTreasuryInfo();
// Returns: { treasury, owner, balance_wei, balance_eth }

// Get proposal voting status
await fundsAPI.getProposalStatus(proposalId);
// Returns: { proposal_id, yes_votes, no_votes, executed, block_start, block_end }
```

---

## 🔥 Usage Examples

### Submit a Report
```typescript
const handleFileUpload = async (file: File) => {
  try {
    const result = await reportAPI.submitReport(file);
    console.log('IPFS Hash:', result.ipfs_hash);
    console.log('Trust Score:', result.trust_score);
  } catch (error) {
    if (error instanceof APIError) {
      console.error('Error:', error.message, error.statusCode);
    }
  }
};
```

### Create and Vote
```typescript
// Create
const result = await proposalAPI.create({
  title: "Fund Initiative",
  description: "Community funding proposal",
  amount_eth: 5,
  recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
});

// Vote
await proposalAPI.vote({
  proposal_id: result.proposal_id,
  support: true
});
```

### Check Treasury
```typescript
const balance = await fundsAPI.getTreasuryBalance();
console.log(`Treasury: ${balance.balance_eth} CELO`);

const status = await fundsAPI.getProposalStatus(1);
console.log(`Votes - Yes: ${status.yes_votes}, No: ${status.no_votes}`);
```

---

## ⚠️ Error Handling

```typescript
try {
  const result = await reportAPI.submitReport(file);
} catch (err) {
  if (err instanceof APIError) {
    console.error('API Error:', err.message);
    console.error('Status Code:', err.statusCode);
    console.error('Details:', err.details);
  }
}
```

---

## 🔗 Backend Endpoints

| Function | Backend Route | Method |
|----------|---------------|---------|
| `reportAPI.submitReport()` | `/reports/submit_report` | POST |
| `reportAPI.verifyReport()` | `/reports/verify_report_ai` | POST |
| `proposalAPI.create()` | `/proposals/create` | POST |
| `proposalAPI.vote()` | `/proposals/vote` | POST |
| `proposalAPI.execute()` | `/proposals/execute/{id}` | POST |
| `fundsAPI.getTreasuryBalance()` | `/funds/treasury_balance` | GET |
| `fundsAPI.getTreasuryInfo()` | `/funds/treasury_info` | GET |
| `fundsAPI.getProposalStatus()` | `/funds/proposal_status/{id}` | GET |

---

## 📝 Type Definitions

```typescript
interface ReportResult {
  filename: string;
  ipfs_hash: string;
  file_hash: string;
  summary: string;
  trust_score: number;
  credibility: string;
}

interface ProposalResult {
  tx_hash: string;
  proposal_id: number | null;
  message: string;
}

interface VoteResult {
  tx_hash: string;
  message: string;
}

interface TreasuryInfo {
  balance_wei: number;
  balance_eth: number;
}

interface ProposalStatus {
  proposal_id: number;
  yes_votes: number;
  no_votes: number;
  executed: boolean;
  block_start: number;
  block_end: number;
}
```

---

## 🎯 Complete Example

```typescript
import { reportAPI, proposalAPI, fundsAPI, APIError } from './config/api';

// 1. Submit a report
const reportFile = new File(['Report content'], 'report.txt');
const report = await reportAPI.submitReport(reportFile);

// 2. Create proposal based on report
const proposal = await proposalAPI.create({
  title: 'Fund Based on Report',
  description: `Report ${report.ipfs_hash} shows need for funding`,
  amount_eth: 10,
  recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
});

// 3. Vote on proposal
await proposalAPI.vote({
  proposal_id: proposal.proposal_id!,
  support: true
});

// 4. Check status
const status = await fundsAPI.getProposalStatus(proposal.proposal_id!);
console.log('Proposal Status:', status);

// 5. Check treasury
const balance = await fundsAPI.getTreasuryBalance();
console.log('Treasury Balance:', balance.balance_eth, 'CELO');
```

---

**All endpoints are fully connected and production-ready! 🎉**
