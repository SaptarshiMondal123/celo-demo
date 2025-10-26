import { useState, useEffect } from 'react';
import { Coins, TrendingUp, DollarSign, Shield, RefreshCw, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { fundsAPI, proposalAPI, APIError, type ProposalDetail } from '../config/api';
import StatCard from './StatCard';

interface TreasuryInfoExtended {
  treasury: string;
  owner: string;
  balance_wei: number;
  balance_eth: number;
}

const Funding = () => {
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [treasuryInfo, setTreasuryInfo] = useState<TreasuryInfoExtended | null>(null);
  const [executedProposals, setExecutedProposals] = useState<ProposalDetail[]>([]);
  const [totalFundingDistributed, setTotalFundingDistributed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching funding data from blockchain...');
      const startTime = Date.now();
      
      // Fetch treasury balance and info in parallel
      const [balanceData, infoData] = await Promise.all([
        fundsAPI.getTreasuryBalance().catch(err => {
          console.warn('Treasury balance fetch failed:', err);
          return { balance_eth: 0, balance_wei: 0 };
        }),
        fundsAPI.getTreasuryInfo().catch(err => {
          console.warn('Treasury info fetch failed:', err);
          return null;
        })
      ]);
      
      setTreasuryBalance(balanceData.balance_eth || 0);
      setTreasuryInfo(infoData);

      // Fetch all proposals separately to avoid blocking
      try {
        const proposalsData = await proposalAPI.list();
        if (proposalsData && proposalsData.proposals) {
          const executed = proposalsData.proposals.filter(p => p.executed);
          setExecutedProposals(executed);
          
          // Calculate total distributed
          const total = executed.reduce((sum, p) => sum + p.value, 0);
          setTotalFundingDistributed(total);
        } else {
          setExecutedProposals([]);
          setTotalFundingDistributed(0);
        }
      } catch (proposalErr) {
        console.warn('Could not fetch proposals, continuing with treasury data:', proposalErr);
        setExecutedProposals([]);
        setTotalFundingDistributed(0);
      }
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Funding data loaded in ${elapsed}s`);

    } catch (err) {
      console.error('Error fetching funding data:', err);
      
      if (err instanceof APIError) {
        if (err.statusCode === 408) {
          setError('⏱️ Loading is taking longer than expected. The blockchain node might be slow. Please wait or refresh.');
        } else {
          setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
        }
      } else if (err instanceof Error && err.name === 'AbortError') {
        setError('⏱️ Request timed out. The blockchain node might be experiencing high load. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch funding data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <section id="funding" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading funding data from blockchain...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take up to 30-60 seconds</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="funding" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
            <span className="gradient-text">Treasury</span> & Funding
          </h2>
          <p className="text-gray-400 text-lg">Transparent fund management powered by blockchain</p>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Treasury Balance */}
          <StatCard
            label="Treasury Balance"
            value={`${treasuryBalance.toFixed(4)} CELO`}
            icon={<Coins className="w-8 h-8" />}
            variant="default"
          />

          {/* Total Distributed */}
          <StatCard
            label="Total Distributed"
            value={`${totalFundingDistributed.toFixed(4)} CELO`}
            icon={<DollarSign className="w-8 h-8" />}
            variant="success"
          />

          {/* Executed Proposals */}
          <StatCard
            label="Executed Proposals"
            value={executedProposals.length}
            icon={<Shield className="w-8 h-8" />}
            variant="accent"
          />

          {/* Available Funds */}
          <StatCard
            label="Available Funds"
            value={`${treasuryBalance.toFixed(4)} CELO`}
            icon={<TrendingUp className="w-8 h-8" />}
            variant="warning"
          />
        </div>

        {/* Treasury Info Card */}
        {treasuryInfo && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Treasury Contract Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Treasury Address</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm">{formatAddress(treasuryInfo.treasury)}</p>
                  <a
                    href={`https://alfajores.celoscan.io/address/${treasuryInfo.treasury}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">{treasuryInfo.treasury}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Owner (DAO Contract)</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm">{formatAddress(treasuryInfo.owner)}</p>
                  <a
                    href={`https://alfajores.celoscan.io/address/${treasuryInfo.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">{treasuryInfo.owner}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Balance (Wei)</p>
                <p className="text-white font-mono">{treasuryInfo.balance_wei.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Balance (CELO)</p>
                <p className="text-white font-mono">{treasuryInfo.balance_eth.toFixed(6)} CELO</p>
              </div>
            </div>
          </div>
        )}

        {/* Executed Proposals History */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Funding Distribution History</h3>
            </div>
            <span className="text-gray-400 text-sm">{executedProposals.length} transactions</span>
          </div>

          {executedProposals.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-400 mb-2">No Distributions Yet</h4>
              <p className="text-gray-500">Executed proposals will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executedProposals.map((proposal) => (
                <div
                  key={proposal.proposal_id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Proposal #{proposal.proposal_id}</h4>
                        <p className="text-gray-400 text-sm">Executed Successfully</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{proposal.value} CELO</p>
                      <p className="text-xs text-gray-500">Distributed</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{proposal.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded p-2">
                      <p className="text-gray-400 text-xs mb-1">Recipient</p>
                      <p className="text-white font-mono text-xs truncate">{proposal.target}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2">
                      <p className="text-gray-400 text-xs mb-1">Votes</p>
                      <p className="text-white text-xs">
                        <span className="text-green-400">✓ {proposal.yesVotes}</span>
                        {' / '}
                        <span className="text-red-400">✗ {proposal.noVotes}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-2">Blockchain-Secured Treasury</h4>
              <p className="text-gray-300 text-sm">
                All funds are managed on-chain with complete transparency. Every transaction is verified by the community through
                governance proposals and recorded immutably on the Celo Alfajores blockchain. The treasury smart contract ensures
                that funds can only be released through successfully passed proposals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Funding;
