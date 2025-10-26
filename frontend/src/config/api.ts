// Type definitions for API responses
export interface ReportResult {
  filename: string;
  ipfs_hash: string;
  file_hash: string;
  summary: string;
  trust_score: number;
  credibility: string;
}

export interface ProposalResult {
  tx_hash: string;
  proposal_id: number | null;
  message: string;
  fee_charged?: number;
  is_free?: boolean;
}

export interface ProposalLimitCheck {
  can_create: boolean;
  is_free: boolean;
  proposals_today: number;
  total_proposals: number;
  message: string;
  minimum_fee: number;
}

export interface VoteResult {
  tx_hash: string;
  message: string;
}

export interface ExecuteResult {
  tx_hash: string;
  message: string;
  events?: Record<string, any>;
}

export interface TreasuryInfo {
  balance_wei: number;
  balance_eth: number;
}

export interface ProposalStatus {
  proposal_id: number;
  yes_votes: number;
  no_votes: number;
  executed: boolean;
  block_start: number;
  block_end: number;
}

export interface ProposalDetail {
  proposal_id: number;
  target: string;
  value: number;
  callData: string;
  description: string;
  blockStart: number;
  blockEnd: number;
  yesVotes: number;
  noVotes: number;
  executed: boolean;
}

export interface ProposalListResponse {
  proposals: ProposalDetail[];
  total_count: number;
}

// API Configuration
// Update this URL to match your backend deployment

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 120000, // 120 seconds (2 minutes) - increased for blockchain calls
  RETRY_ATTEMPTS: 2, // Number of retry attempts for failed requests
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

// API Endpoints
// These match the FastAPI backend routes defined in:
// - Backend/routes/report_routes.py
// - Backend/routes/proposal_routes.py  
// - Backend/routes/fund_routes.py
export const API_ENDPOINTS = {
  // Reports - prefix: /reports
  SUBMIT_REPORT: '/reports/submit_report',        // POST - Upload file to IPFS with AI analysis
  VERIFY_REPORT_AI: '/reports/verify_report_ai',  // POST - Verify text report without file
  
  // Proposals - prefix: /proposals
  CREATE_PROPOSAL: '/proposals/create',            // POST - Create blockchain proposal
  CHECK_PROPOSAL_LIMIT: (userAddress: string) => `/proposals/check-limit/${userAddress}`,  // GET - Check user's proposal limit
  VOTE_PROPOSAL: '/proposals/vote',                // POST - Cast vote on proposal
  EXECUTE_PROPOSAL: (proposalId: number) => `/proposals/execute/${proposalId}`,  // POST - Execute passed proposal
  LIST_PROPOSALS: '/proposals/list',               // GET - Get all proposals
  GET_PROPOSAL: (proposalId: number) => `/proposals/${proposalId}`,  // GET - Get specific proposal details
  
  // Funds/Treasury - prefix: /funds
  TREASURY_BALANCE: '/funds/treasury_balance',     // GET - Get current balance
  TREASURY_INFO: '/funds/treasury_info',           // GET - Get detailed treasury info
  PROPOSAL_STATUS: (proposalId: number) => `/funds/proposal_status/${proposalId}`,  // GET - Get proposal voting status
  
  // Root
  ROOT: '/',                                       // GET - Health check
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API Error Handler
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic fetch wrapper with error handling and retry logic
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<T> => {
  const url = buildUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      throw new APIError(
        errorDetails?.detail || errorDetails?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorDetails
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      // Retry on timeout errors (408) or server errors (5xx)
      if ((error.statusCode === 408 || (error.statusCode && error.statusCode >= 500)) && retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        console.log(`Retrying request (attempt ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})...`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // Retry on timeout
        if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
          console.log(`Request timed out. Retrying (attempt ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})...`);
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
          return apiRequest<T>(endpoint, options, retryCount + 1);
        }
        throw new APIError('Request timeout - The blockchain node might be slow. Please try again later.', 408);
      }
      throw new APIError(error.message);
    }

    throw new APIError('An unexpected error occurred');
  }
};

// Specific API functions for type safety
export const reportAPI = {
  /**
   * Submit a report file to IPFS with AI analysis
   * Backend: POST /reports/submit_report
   * @param file - File to upload (txt, pdf, image, csv)
   * @returns Report result with IPFS hash, summary, and trust score
   */
  submitReport: async (file: File): Promise<ReportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const url = buildUrl(API_ENDPOINTS.SUBMIT_REPORT);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `Failed to submit report: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  /**
   * Verify plain text report using AI (no file upload)
   * Backend: POST /reports/verify_report_ai
   * @param content - Text content to analyze
   * @returns Summary, trust score, and credibility
   */
  verifyReport: async (content: string): Promise<any> => {
    return apiRequest(API_ENDPOINTS.VERIFY_REPORT_AI, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

export const proposalAPI = {
  /**
   * Check user's proposal creation limits
   * Backend: GET /proposals/check-limit/{user_address}
   * @param userAddress - Wallet address to check
   * @returns Limit info including if proposal is free and daily count
   */
  checkLimit: async (userAddress: string): Promise<ProposalLimitCheck> => {
    return apiRequest<ProposalLimitCheck>(API_ENDPOINTS.CHECK_PROPOSAL_LIMIT(userAddress), {
      method: 'GET',
    });
  },

  /**
   * Create a new governance proposal on blockchain
   * Backend: POST /proposals/create
   * @param data - Proposal details including user address and fee
   * @returns Transaction hash, proposal ID, and fee info
   */
  create: async (data: {
    title: string;
    description: string;
    amount_eth: number;
    recipient: string;
    user_address: string;
    fee_paid: number;
  }): Promise<ProposalResult> => {
    return apiRequest<ProposalResult>(API_ENDPOINTS.CREATE_PROPOSAL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cast a vote on an existing proposal
   * Backend: POST /proposals/vote
   * @param data - Proposal ID and vote (support: true/false)
   * @returns Transaction hash and confirmation message
   */
  vote: async (data: { proposal_id: number; support: boolean }): Promise<VoteResult> => {
    return apiRequest<VoteResult>(API_ENDPOINTS.VOTE_PROPOSAL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Execute a passed proposal (triggers fund transfer)
   * Backend: POST /proposals/execute/{proposal_id}
   * @param proposalId - ID of the proposal to execute
   * @returns Transaction hash, message, and blockchain events
   */
  execute: async (proposalId: number): Promise<ExecuteResult> => {
    return apiRequest<ExecuteResult>(API_ENDPOINTS.EXECUTE_PROPOSAL(proposalId), {
      method: 'POST',
    });
  },

  /**
   * Get all proposals from the blockchain
   * Backend: GET /proposals/list
   * @returns Array of all proposals with their details
   */
  list: async (): Promise<ProposalListResponse> => {
    return apiRequest<ProposalListResponse>(API_ENDPOINTS.LIST_PROPOSALS, {
      method: 'GET',
    });
  },

  /**
   * Get detailed information about a specific proposal
   * Backend: GET /proposals/{proposal_id}
   * @param proposalId - ID of the proposal to retrieve
   * @returns Proposal details including votes, description, and status
   */
  getDetail: async (proposalId: number): Promise<ProposalDetail> => {
    return apiRequest<ProposalDetail>(API_ENDPOINTS.GET_PROPOSAL(proposalId), {
      method: 'GET',
    });
  },
};

export const fundsAPI = {
  /**
   * Get current treasury balance
   * Backend: GET /funds/treasury_balance
   * @returns Balance in both Wei and ETH/CELO
   */
  getTreasuryBalance: async (): Promise<TreasuryInfo> => {
    return apiRequest<TreasuryInfo>(API_ENDPOINTS.TREASURY_BALANCE, {
      method: 'GET',
    });
  },

  /**
   * Get detailed treasury information
   * Backend: GET /funds/treasury_info
   * @returns Treasury address, owner, and balance details
   */
  getTreasuryInfo: async (): Promise<any> => {
    return apiRequest(API_ENDPOINTS.TREASURY_INFO, {
      method: 'GET',
    });
  },

  /**
   * Get voting status of a specific proposal
   * Backend: GET /funds/proposal_status/{proposal_id}
   * @param proposalId - ID of the proposal to check
   * @returns Vote counts, execution status, and voting period
   */
  getProposalStatus: async (proposalId: number): Promise<ProposalStatus> => {
    return apiRequest<ProposalStatus>(API_ENDPOINTS.PROPOSAL_STATUS(proposalId), {
      method: 'GET',
    });
  },
};
