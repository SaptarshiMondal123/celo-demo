import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Vote, Coins, TrendingUp, Wallet, Info } from 'lucide-react';
import { 
  reportAPI, 
  proposalAPI, 
  fundsAPI, 
  APIError,
  type ReportResult,
  type ProposalResult,
  type VoteResult,
  type TreasuryInfo,
  type ProposalStatus,
  type ProposalLimitCheck
} from '../config/api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type ActiveTab = 'report' | 'proposal' | 'vote' | 'treasury';

const EchoDaoInterface = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('report');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [proposalResult, setProposalResult] = useState<ProposalResult | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [treasuryInfo, setTreasuryInfo] = useState<TreasuryInfo | null>(null);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [proposalLimit, setProposalLimit] = useState<ProposalLimitCheck | null>(null);
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalRecipient, setProposalRecipient] = useState('');
  const [voteProposalId, setVoteProposalId] = useState('');
  const [voteSupport, setVoteSupport] = useState<boolean>(true);
  const [statusProposalId, setStatusProposalId] = useState('');

  // Remove auto-connect on mount - wallet should only connect via explicit user action
  // Removed useEffect that called checkWalletConnection()

  // Check proposal limit when wallet changes or proposal tab is active
  useEffect(() => {
    if (walletAddress && activeTab === 'proposal') {
      checkProposalLimit();
    }
  }, [walletAddress, activeTab]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to create proposals.');
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        return true;
      }
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      return false;
    }
    return false;
  };

  const checkProposalLimit = async () => {
    if (!walletAddress) return;

    try {
      const limit = await proposalAPI.checkLimit(walletAddress);
      setProposalLimit(limit);
    } catch (err) {
      console.error('Error checking proposal limit:', err);
    }
  };

  // Report submission handlers
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReportResult(null);

    try {
      const data: ReportResult = await reportAPI.submitReport(file);
      setReportResult(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to submit report');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearReport = () => {
    setReportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-fill proposal from report
  const createProposalFromReport = async () => {
    if (reportResult) {
      // Set title as filename without extension
      const titleFromFilename = reportResult.filename.replace(/\.[^/.]+$/, '');
      setProposalTitle(titleFromFilename);
      
      // Set description as AI summary only
      setProposalDescription(reportResult.summary);
      
      // Set recipient
      setProposalRecipient('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      
      // Only set amount if user has already made proposals (not first time)
      if (walletAddress) {
        const limit = await proposalAPI.checkLimit(walletAddress);
        if (!limit.is_free) {
          // Not first-time user, require them to set amount manually
          setProposalAmount('');
        } else {
          // First-time user, leave amount empty (will default to 0 CELO)
          setProposalAmount('');
        }
      } else {
        // No wallet connected yet, leave empty
        setProposalAmount('');
      }
      
      // Switch to proposal tab
      setActiveTab('proposal');
    }
  };

    // Proposal creation handler
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProposalResult(null);

    try {
      // Check if wallet is connected
      if (!walletAddress) {
        const connected = await connectWallet();
        if (!connected) {
          setIsLoading(false);
          return;
        }
      }

      // Check proposal limit
      const limit = await proposalAPI.checkLimit(walletAddress);
      
      if (!limit.can_create) {
        setError(limit.message);
        setIsLoading(false);
        return;
      }

      // Determine fee
      const feeToPay = limit.is_free ? 0 : limit.minimum_fee;
      
      // For first-time users (free), allow 0 CELO if amount is empty
      // For returning users, require a valid amount
      const finalAmount = limit.is_free && !proposalAmount ? 0 : parseFloat(proposalAmount);

      // Store the submitted amount for display in success message
      setSubmittedAmount(finalAmount);

      const data: ProposalResult = await proposalAPI.create({
        title: proposalTitle,
        description: proposalDescription,
        amount_eth: finalAmount,
        recipient: proposalRecipient,
        user_address: walletAddress,
        fee_paid: feeToPay,
      });
      
      setProposalResult(data);
      
      // Refresh limit check
      await checkProposalLimit();
      
      // Clear form
      setProposalTitle('');
      setProposalDescription('');
      setProposalAmount('');
      setProposalRecipient('');
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create proposal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Vote handler
  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setVoteResult(null);

    try {
      const data: VoteResult = await proposalAPI.vote({
        proposal_id: parseInt(voteProposalId),
        support: voteSupport,
      });
      
      setVoteResult(data);
      setVoteProposalId('');
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to submit vote');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Treasury info handler
  const fetchTreasuryInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: TreasuryInfo = await fundsAPI.getTreasuryBalance();
      setTreasuryInfo(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch treasury info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Proposal status handler
  const fetchProposalStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProposalStatus(null);

    try {
      const data: ProposalStatus = await fundsAPI.getProposalStatus(parseInt(statusProposalId));
      setProposalStatus(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch proposal status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'report' as ActiveTab, label: 'Submit Report', icon: FileText },
    { id: 'proposal' as ActiveTab, label: 'Create Proposal', icon: Upload },
    { id: 'vote' as ActiveTab, label: 'Vote', icon: Vote },
    { id: 'treasury' as ActiveTab, label: 'Treasury', icon: Coins },
  ];

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
            <span className="gradient-text">EchoDAO</span> Platform
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Submit reports, create proposals, vote on governance, and manage treasury
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                  setReportResult(null);
                  setProposalResult(null);
                  setVoteResult(null);
                  setProposalStatus(null);
                  setSubmittedAmount(null);
                }}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Report Upload Tab */}
          {activeTab === 'report' && (
            <div>
              {!reportResult ? (
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                    transition-all duration-300 transform hover:scale-[1.02]
                    ${isDragOver 
                      ? 'border-purple-400 bg-purple-400/5 shadow-lg shadow-purple-400/20' 
                      : 'border-gray-600 hover:border-purple-400 hover:bg-purple-400/5'
                    }
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center space-y-6">
                    <div className={`
                      p-6 rounded-full transition-all duration-300
                      ${isDragOver ? 'bg-purple-400/20 scale-110' : 'bg-gray-800'}
                    `}>
                      <Upload className={`w-12 h-12 ${isDragOver ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Upload Report for AI Analysis
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Drag and drop your report (txt, pdf, image), or click to browse
                      </p>
                      <div className="inline-flex px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all">
                        {isLoading ? 'Uploading...' : 'Choose File'}
                      </div>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.png,.jpg,.jpeg,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white">Report Analysis Complete</h3>
                    </div>
                    <button
                      onClick={clearReport}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Filename</p>
                      <p className="text-white font-medium">{reportResult.filename}</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">IPFS Hash</p>
                      <p className="text-purple-400 font-mono text-sm break-all">{reportResult.ipfs_hash}</p>
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${reportResult.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                      >
                        View on IPFS →
                      </a>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">File Hash (SHA-256)</p>
                      <p className="text-gray-300 font-mono text-sm break-all">{reportResult.file_hash}</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">AI Summary</p>
                      <p className="text-white">{reportResult.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm mb-1">Trust Score</p>
                        <p className="text-2xl font-bold text-purple-400">{reportResult.trust_score}/100</p>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm mb-1">Credibility</p>
                        <p className={`text-2xl font-bold ${
                          reportResult.credibility === 'High' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {reportResult.credibility}
                        </p>
                      </div>
                    </div>

                    {/* Create Proposal from Report Button */}
                    <button
                      onClick={createProposalFromReport}
                      className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Create Proposal from this Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Proposal Tab */}
          {activeTab === 'proposal' && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Create Governance Proposal</h3>
              
              {/* Wallet & Limit Info */}
              {walletAddress ? (
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-400 font-semibold mb-2">Wallet Connected</p>
                      <p className="text-gray-300 text-sm font-mono mb-3">{walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 8)}</p>
                      {proposalLimit && (
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-gray-800/50 rounded p-2">
                            <p className="text-gray-400 text-xs">Today</p>
                            <p className="text-white font-bold">{proposalLimit.proposals_today}/3</p>
                          </div>
                          <div className="bg-gray-800/50 rounded p-2">
                            <p className="text-gray-400 text-xs">Total</p>
                            <p className="text-white font-bold">{proposalLimit.total_proposals}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded p-2">
                            <p className="text-gray-400 text-xs">Fee</p>
                            <p className={`font-bold ${proposalLimit.is_free ? 'text-green-400' : 'text-yellow-400'}`}>
                              {proposalLimit.is_free ? 'FREE!' : `${proposalLimit.minimum_fee} CELO`}
                            </p>
                          </div>
                        </div>
                      )}
                      {proposalLimit && !proposalLimit.can_create && (
                        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded p-3">
                          <p className="text-red-400 text-sm">❌ {proposalLimit.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">Wallet Required</p>
                      <p className="text-gray-300 text-sm mb-3">Connect your wallet to create proposals. Your first proposal is FREE!</p>
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-semibold"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fee Structure Notice */}
              {walletAddress && proposalLimit && (
                <div className={`mb-6 ${proposalLimit.is_free ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <Coins className={`w-5 h-5 ${proposalLimit.is_free ? 'text-green-400' : 'text-blue-400'} flex-shrink-0 mt-0.5`} />
                    <div>
                      {proposalLimit.is_free ? (
                        <>
                          <p className="text-green-400 font-semibold mb-1">🎉 FREE Proposal Creation</p>
                          <p className="text-gray-300 text-sm">
                            Your first proposal has <strong>NO creation fee (0 CELO)</strong>. 
                            You only specify how much funding the DAO should distribute if your proposal passes.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-blue-400 font-semibold mb-1">💰 Proposal Creation Fee</p>
                          <p className="text-gray-300 text-sm">
                            Creating this proposal costs <strong className="text-yellow-400">{proposalLimit.minimum_fee} CELO</strong> (automatic). 
                            This is separate from the funding amount you're requesting from the DAO.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    placeholder="Short summary title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400 h-32"
                    placeholder="Detailed description of the proposal"
                    required
                  />
                </div>

                {/* Only show Amount field for non-first-time users */}
                {proposalLimit && !proposalLimit.is_free && (
                  <div>
                    <label className="block text-gray-300 mb-2">Amount (CELO)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.01"
                      value={proposalAmount}
                      onChange={(e) => setProposalAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      placeholder="Minimum 0.01 CELO"
                      required
                    />
                  </div>
                )}
                
                {/* Info message for first-time users */}
                {proposalLimit && proposalLimit.is_free && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">
                      ✨ <strong>First proposal is FREE!</strong> No creation fee will be charged. 
                      {!proposalAmount && " The funding amount will be set to 0 CELO (you can change this if needed)."}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={proposalRecipient}
                    onChange={(e) => setProposalRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    placeholder="0x..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || (proposalLimit !== null && !proposalLimit.can_create)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? 'Creating Proposal...' 
                    : proposalLimit?.is_free 
                      ? '🎉 Create FREE Proposal' 
                      : `Create Proposal (${proposalLimit?.minimum_fee || 0.01} CELO)`
                  }
                </button>
              </form>

              {proposalResult && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                  <div className="flex items-start space-x-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-green-400 font-medium mb-1">✓ {proposalResult.message}</p>
                      
                      {/* Proposal Funding Amount */}
                      <div className="bg-blue-500/20 border border-blue-500/40 rounded p-2 mt-2">
                        <p className="text-blue-300 text-sm font-semibold">
                          💵 Proposal Funding Amount: <span className="text-blue-400">{submittedAmount !== null ? submittedAmount : 0} CELO</span>
                        </p>
                        <p className="text-blue-200 text-xs mt-1">
                          This is the amount that will be distributed if the proposal passes and is executed.
                        </p>
                      </div>
                      
                      {/* Creation Fee */}
                      {proposalResult.is_free && (
                        <div className="bg-green-500/20 border border-green-500/40 rounded p-2 mt-2">
                          <p className="text-green-300 text-sm font-semibold">
                            🎉 Creation Fee: <span className="text-green-400">0 CELO (FREE!)</span>
                          </p>
                          <p className="text-green-200 text-xs mt-1">
                            Your first proposal had no creation fee. Subsequent proposals cost 0.01 CELO.
                          </p>
                        </div>
                      )}
                      {!proposalResult.is_free && proposalResult.fee_charged !== undefined && (
                        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded p-2 mt-2">
                          <p className="text-yellow-300 text-sm font-semibold">
                            💰 Creation Fee: <span className="text-yellow-400">{proposalResult.fee_charged} CELO</span>
                          </p>
                          <p className="text-yellow-200 text-xs mt-1">
                            This fee was automatically deducted for creating the proposal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">TX Hash: <span className="font-mono text-xs">{proposalResult.tx_hash}</span></p>
                  {proposalResult.proposal_id !== null && (
                    <p className="text-gray-300 text-sm">Proposal ID: <span className="font-bold">{proposalResult.proposal_id}</span></p>
                  )}
                </div>
              )}
              
              {/* Pricing Info Banner */}
              <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <span>Proposal Pricing</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">•</span>
                    <p className="text-gray-300"><span className="font-semibold text-green-400">First proposal:</span> Completely FREE! No CELO required.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <p className="text-gray-300"><span className="font-semibold text-yellow-400">Subsequent proposals:</span> 0.01 CELO minimum fee.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <p className="text-gray-300"><span className="font-semibold text-blue-400">Daily limit:</span> Maximum 3 proposals per day.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vote Tab */}
          {activeTab === 'vote' && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h3>
              
              <form onSubmit={handleVote} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Proposal ID</label>
                  <input
                    type="number"
                    value={voteProposalId}
                    onChange={(e) => setVoteProposalId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    placeholder="Enter proposal ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Your Vote</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setVoteSupport(true)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        voteSupport
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      ✓ Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoteSupport(false)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        !voteSupport
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      ✗ Oppose
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Submitting Vote...' : 'Submit Vote'}
                </button>
              </form>

              {voteResult && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                  <p className="text-green-400 font-medium mb-2">✓ {voteResult.message}</p>
                  <p className="text-gray-300 text-sm">TX Hash: <span className="font-mono text-xs">{voteResult.tx_hash}</span></p>
                </div>
              )}
            </div>
          )}

          {/* Treasury Tab */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Treasury Balance</h3>
                  <button
                    onClick={fetchTreasuryInfo}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {treasuryInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <Coins className="w-8 h-8 text-purple-400" />
                        <p className="text-gray-400">Balance (CELO)</p>
                      </div>
                      <p className="text-4xl font-bold text-white">{treasuryInfo.balance_eth.toFixed(4)}</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-500/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                        <p className="text-gray-400">Balance (Wei)</p>
                      </div>
                      <p className="text-2xl font-bold text-white font-mono">{treasuryInfo.balance_wei}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">Check Proposal Status</h3>
                
                <form onSubmit={fetchProposalStatus} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Proposal ID</label>
                    <input
                      type="number"
                      value={statusProposalId}
                      onChange={(e) => setStatusProposalId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      placeholder="Enter proposal ID"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Fetching...' : 'Get Status'}
                  </button>
                </form>

                {proposalStatus && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Yes Votes</p>
                      <p className="text-2xl font-bold text-green-400">{proposalStatus.yes_votes}</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">No Votes</p>
                      <p className="text-2xl font-bold text-red-400">{proposalStatus.no_votes}</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p className={`text-xl font-bold ${proposalStatus.executed ? 'text-blue-400' : 'text-yellow-400'}`}>
                        {proposalStatus.executed ? 'Executed' : 'Pending'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Voting Period</p>
                      <p className="text-white text-sm">
                        Block {proposalStatus.block_start} - {proposalStatus.block_end}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EchoDaoInterface;