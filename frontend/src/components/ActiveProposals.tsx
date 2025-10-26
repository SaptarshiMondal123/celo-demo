import { useState, useEffect } from 'react';
import { Vote, TrendingUp, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { proposalAPI, APIError, type ProposalDetail } from '../config/api';

const ActiveProposals = () => {
  const [proposals, setProposals] = useState<ProposalDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveProposals();
  }, []);

  const fetchActiveProposals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching active proposals from blockchain...');
      const startTime = Date.now();
      
      const data = await proposalAPI.list();
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Proposals loaded in ${elapsed}s`);
      
      if (data && data.proposals) {
        // Filter only non-executed proposals (active)
        const activeProposals = data.proposals.filter(p => !p.executed);
        setProposals(activeProposals.reverse());
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Error fetching active proposals:', err);
      setProposals([]);
      
      if (err instanceof APIError) {
        if (err.statusCode === 408) {
          setError('⏱️ Loading is taking longer than expected. The blockchain node might be slow. Please wait or refresh.');
        } else {
          setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
        }
      } else if (err instanceof Error && err.name === 'AbortError') {
        setError('⏱️ Request timed out. The blockchain node might be experiencing high load. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch proposals. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    setIsVoting(true);
    setError(null);
    setVoteSuccess(null);

    try {
      const result = await proposalAPI.vote({ proposal_id: proposalId, support });
      setVoteSuccess(`Vote submitted! TX: ${result.tx_hash.substring(0, 10)}...`);
      
      setTimeout(() => {
        fetchActiveProposals();
        setVoteSuccess(null);
      }, 3000);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`${err.message}${err.statusCode ? ` (${err.statusCode})` : ''}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to submit vote');
      }
    } finally {
      setIsVoting(false);
    }
  };

  const getProposalStatus = (proposal: ProposalDetail): { status: string; color: string; icon: any } => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    if (totalVotes === 0) {
      return { status: 'No Votes Yet', color: 'text-gray-400', icon: Clock };
    }
    
    if (proposal.yesVotes > proposal.noVotes) {
      return { status: 'Passing', color: 'text-green-400', icon: TrendingUp };
    } else if (proposal.yesVotes < proposal.noVotes) {
      return { status: 'Failing', color: 'text-red-400', icon: XCircle };
    } else {
      return { status: 'Tied', color: 'text-yellow-400', icon: AlertCircle };
    }
  };

  if (isLoading) {
    return (
      <section id="active-proposals" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading active proposals from blockchain...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take up to 30-60 seconds</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="active-proposals" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
            <span className="gradient-text">Active</span> Proposals
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-6">
            Vote on active governance proposals to shape the future of the DAO
          </p>
          <button
            onClick={fetchActiveProposals}
            className="px-6 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {voteSuccess && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <p className="text-green-400">{voteSuccess}</p>
          </div>
        )}

        {/* Proposals Grid */}
        {proposals.length === 0 ? (
          <div className="text-center py-20">
            <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No active proposals at the moment</p>
            <p className="text-gray-500 mt-2">Create the first proposal to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {proposals.map((proposal) => {
              const status = getProposalStatus(proposal);
              const StatusIcon = status.icon;
              const totalVotes = proposal.yesVotes + proposal.noVotes;
              const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
              const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;

              return (
                <div
                  key={proposal.proposal_id}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Proposal #{proposal.proposal_id}
                      </h3>
                      <div className={`flex items-center space-x-2 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{status.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold text-xl">{proposal.value} CELO</p>
                      <p className="text-gray-500 text-xs">Funding Amount</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm line-clamp-3">{proposal.description}</p>
                  </div>

                  {/* Target */}
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Recipient</p>
                    <p className="text-gray-300 text-sm font-mono break-all">
                      {proposal.target.substring(0, 10)}...{proposal.target.substring(proposal.target.length - 8)}
                    </p>
                  </div>

                  {/* Vote Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-400">Yes: {proposal.yesVotes}</span>
                      <span className="text-red-400">No: {proposal.noVotes}</span>
                    </div>
                    <div className="flex h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${yesPercentage}%` }}
                      ></div>
                      <div
                        className="bg-red-500"
                        style={{ width: `${noPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleVote(proposal.proposal_id, true)}
                      disabled={isVoting}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                      Vote Yes
                    </button>
                    <button
                      onClick={() => handleVote(proposal.proposal_id, false)}
                      disabled={isVoting}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                      Vote No
                    </button>
                  </div>

                  {/* Block Range */}
                  <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                    <p>Voting: Block {proposal.blockStart} → {proposal.blockEnd}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveProposals;
