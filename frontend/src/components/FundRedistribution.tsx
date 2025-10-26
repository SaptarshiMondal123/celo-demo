import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Users, TrendingUp, AlertCircle, CheckCircle, ExternalLink, RefreshCw, Coins, Wallet, History, ArrowRight, ArrowLeft, Play, Clock } from 'lucide-react';
import { fundsAPI, proposalAPI, APIError } from '../config/api';

interface RecipientData {
  address: string;
  proposalId: number;
  amount: number;
  proposalTitle: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  canExecute?: boolean;
  yesVotes?: number;
  noVotes?: number;
}

interface TreasuryInfo {
  treasury: string;
  owner: string;
  balance_wei: number;
  balance_eth: number;
}

const FundRedistribution = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [treasuryInfo, setTreasuryInfo] = useState<TreasuryInfo | null>(null);
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [pendingProposals, setPendingProposals] = useState<RecipientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [executingProposal, setExecutingProposal] = useState<number | null>(null);
  const [redistributionStats, setRedistributionStats] = useState({
    totalRecipients: 0,
    totalAmount: 0,
    pendingCount: 0,
    completedCount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    // Remove auto-connect - only fetch data, wallet connects via explicit user action
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch treasury data
      const [balanceData, infoData] = await Promise.all([
        fundsAPI.getTreasuryBalance().catch(() => ({ balance_eth: 0, balance_wei: 0 })),
        fundsAPI.getTreasuryInfo().catch(() => null)
      ]);

      setTreasuryBalance(balanceData.balance_eth || 0);
      setTreasuryInfo(infoData);

      // Fetch all proposals
      const proposalsData = await proposalAPI.list();
      if (proposalsData && proposalsData.proposals) {
        const executed = proposalsData.proposals.filter(p => p.executed);
        const pending = proposalsData.proposals.filter(p => !p.executed);

        // Create recipient data from executed proposals
        const recipientList: RecipientData[] = executed.map(p => ({
          address: p.target,
          proposalId: p.proposal_id,
          amount: p.value,
          proposalTitle: p.description || `Proposal #${p.proposal_id}`,
          status: 'completed' as const,
          txHash: undefined,
          yesVotes: p.yesVotes,
          noVotes: p.noVotes
        }));

        // Create pending proposals list (approved but not executed)
        const currentBlock = await getCurrentBlock();
        const pendingList: RecipientData[] = pending.map(p => ({
          address: p.target,
          proposalId: p.proposal_id,
          amount: p.value,
          proposalTitle: p.description || `Proposal #${p.proposal_id}`,
          status: 'pending' as const,
          canExecute: currentBlock > p.blockEnd && p.yesVotes > p.noVotes,
          yesVotes: p.yesVotes,
          noVotes: p.noVotes
        })).filter(p => p.yesVotes! > p.noVotes!); // Only show approved proposals

        setRecipients(recipientList);
        setPendingProposals(pendingList);

        // Calculate stats
        setRedistributionStats({
          totalRecipients: new Set(recipientList.map(r => r.address)).size,
          totalAmount: recipientList.reduce((sum, r) => sum + r.amount, 0),
          pendingCount: pendingList.length,
          completedCount: recipientList.length,
          pendingAmount: pendingList.reduce((sum, r) => sum + r.amount, 0)
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBlock = async (): Promise<number> => {
    try {
      if (!window.ethereum) return 0;
      const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
      return parseInt(blockNumber, 16);
    } catch {
      return 0;
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setExecutingProposal(proposalId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await proposalAPI.execute(proposalId);
      setSuccessMessage(`✅ Proposal #${proposalId} executed successfully! Funds redistributed. TX: ${response.tx_hash?.substring(0, 10)}...`);
      
      // Refresh data after execution
      setTimeout(() => {
        fetchAllData();
      }, 2000);
    } catch (err) {
      console.error('Error executing proposal:', err);
      if (err instanceof APIError) {
        setError(`Failed to execute proposal: ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to execute proposal');
      }
    } finally {
      setExecutingProposal(null);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getCeloscanUrl = (txHash: string) => {
    return `https://alfajores.celoscan.io/tx/${txHash}`;
  };

  if (isLoading) {
    return (
      <section id="fund-redistribution" className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading redistribution data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fund-redistribution" className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            <span className="gradient-text">Fund</span> Redistribution
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Execute approved proposals and redistribute funds to beneficiaries
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            {!walletAddress && (
              <button
                onClick={connectWallet}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {walletAddress && (
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Wallet className="w-5 h-5" />
                <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Treasury Balance */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-blue-400" />
              </div>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Treasury Balance</h3>
            <p className="text-3xl font-bold text-white mb-1">{treasuryBalance.toFixed(4)}</p>
            <p className="text-blue-400 text-sm">CELO Available</p>
          </div>

          {/* Pending Transfers */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Pending Transfers</h3>
            <p className="text-3xl font-bold text-white mb-1">{redistributionStats.pendingCount}</p>
            <p className="text-yellow-400 text-sm">{redistributionStats.pendingAmount.toFixed(4)} CELO</p>
          </div>

          {/* Total Distributed */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Send className="w-6 h-6 text-green-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Total Distributed</h3>
            <p className="text-3xl font-bold text-white mb-1">{redistributionStats.totalAmount.toFixed(4)}</p>
            <p className="text-green-400 text-sm">CELO Sent</p>
          </div>

          {/* Total Recipients */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Unique Recipients</h3>
            <p className="text-3xl font-bold text-white mb-1">{redistributionStats.totalRecipients}</p>
            <p className="text-purple-400 text-sm">Addresses</p>
          </div>

          {/* Completed Transfers */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <History className="w-6 h-6 text-indigo-400" />
              </div>
              <CheckCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Completed</h3>
            <p className="text-3xl font-bold text-white mb-1">{redistributionStats.completedCount}</p>
            <p className="text-indigo-400 text-sm">Transactions</p>
          </div>
        </div>

        {/* Pending Proposals Section */}
        {pendingProposals.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Pending Fund Redistribution</h3>
                  <p className="text-gray-400 text-sm">Approved proposals ready for execution</p>
                </div>
              </div>
              <div className="text-yellow-400 text-sm">
                {pendingProposals.length} {pendingProposals.length === 1 ? 'proposal' : 'proposals'} pending
              </div>
            </div>

            <div className="space-y-4">
              {pendingProposals.map((proposal) => (
                <div
                  key={proposal.proposalId}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left side - Proposal info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-500/20 p-2 rounded-lg">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{proposal.proposalTitle}</h4>
                          <p className="text-gray-500 text-sm">Proposal #{proposal.proposalId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Recipient:</span>
                          <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                            {formatAddress(proposal.address)}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm">✓ {proposal.yesVotes} Yes</span>
                          <span className="text-red-400 text-sm">✗ {proposal.noVotes} No</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Amount */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-6 py-3">
                      <p className="text-gray-400 text-xs mb-1">Amount to Distribute</p>
                      <p className="text-2xl font-bold text-yellow-400">{proposal.amount.toFixed(4)} CELO</p>
                    </div>

                    {/* Right side - Execute button */}
                    <div>
                      {proposal.canExecute ? (
                        <button
                          onClick={() => handleExecuteProposal(proposal.proposalId)}
                          disabled={executingProposal === proposal.proposalId}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {executingProposal === proposal.proposalId ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>Execute & Distribute</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-gray-500 text-sm text-center">
                          <Clock className="w-5 h-5 mx-auto mb-1" />
                          <span>Voting in progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treasury Info */}
        {treasuryInfo && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Treasury Contract Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Treasury Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-blue-400 font-mono bg-blue-500/10 px-3 py-2 rounded-lg text-sm break-all">
                    {treasuryInfo.treasury}
                  </code>
                  <a
                    href={`https://alfajores.celoscan.io/address/${treasuryInfo.treasury}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Owner (DAO Contract)</p>
                <div className="flex items-center gap-2">
                  <code className="text-purple-400 font-mono bg-purple-500/10 px-3 py-2 rounded-lg text-sm break-all">
                    {treasuryInfo.owner}
                  </code>
                  <a
                    href={`https://alfajores.celoscan.io/address/${treasuryInfo.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution History */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <History className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Distribution History</h3>
            </div>
            <div className="text-gray-400 text-sm">
              {recipients.length} {recipients.length === 1 ? 'transfer' : 'transfers'}
            </div>
          </div>

          {recipients.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No fund distributions yet</p>
              <p className="text-gray-500 text-sm">Executed proposals will appear here with their fund distribution details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left side - Proposal info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{recipient.proposalTitle}</h4>
                          <p className="text-gray-500 text-sm">Proposal #{recipient.proposalId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-sm">Recipient:</span>
                        <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                          {formatAddress(recipient.address)}
                        </code>
                        <a
                          href={`https://alfajores.celoscan.io/address/${recipient.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Middle - Amount */}
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-5 h-5 text-green-400 hidden lg:block" />
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-3">
                        <p className="text-gray-400 text-xs mb-1">Amount Sent</p>
                        <p className="text-2xl font-bold text-green-400">{recipient.amount.toFixed(4)} CELO</p>
                      </div>
                    </div>

                    {/* Right side - Status */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">Completed</span>
                      </div>
                      
                      {recipient.txHash && (
                        <a
                          href={getCeloscanUrl(recipient.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          <span>View Transaction</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-2">How Fund Redistribution Works</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Proposals that pass voting (Yes {'>'} No) appear in the "Pending Fund Redistribution" section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Click "Execute & Distribute" to trigger the on-chain execution and fund transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Funds are automatically sent from the Treasury to the proposal beneficiary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>All transactions are recorded on the Celo blockchain and can be verified on Celoscan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Completed redistributions appear in the "Distribution History" section below</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundRedistribution;
