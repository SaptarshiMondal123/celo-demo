import { useState, useEffect } from 'react';
import { Vote, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { proposalAPI, APIError, type ProposalDetail } from '../config/api';

const Proposals = () => {
  const [proposals, setProposals] = useState<ProposalDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching proposals from blockchain...');
      const startTime = Date.now();
      
      const data = await proposalAPI.list();
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Proposals loaded in ${elapsed}s`);
      
      // Handle empty response gracefully
      if (data && data.proposals) {
        // Reverse to show newest first
        setProposals(data.proposals.reverse());
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      // Set empty array on error to avoid breaking UI
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
      
      // Refresh proposals after voting
      setTimeout(() => {
        fetchProposals();
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
    if (proposal.executed) {
      return { status: 'Executed', color: 'text-green-400', icon: CheckCircle };
    }
    
    // You can add current block comparison here if needed
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
      <section id="proposals" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading proposals from blockchain...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take up to 30-60 seconds</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="proposals" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Governance Proposals</h2>
          <p className="text-gray-400 text-lg">Vote on active proposals to shape the future of EchoDAO</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {voteSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{voteSuccess}</p>
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-700">
            <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Proposals Yet</h3>
            <p className="text-gray-500">Create the first proposal to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proposals.map((proposal) => {
              const status = getProposalStatus(proposal);
              const StatusIcon = status.icon;
              const totalVotes = proposal.yesVotes + proposal.noVotes;
              const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;

              return (
                <div
                  key={proposal.proposal_id}
                  className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500/10 p-3 rounded-lg">
                        <Vote className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Proposal #{proposal.proposal_id}</h3>
                        <div className={`flex items-center space-x-2 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{status.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">{proposal.value} CELO</p>
                      <p className="text-xs text-gray-500">Requested Amount</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-300 line-clamp-3">{proposal.description}</p>
                  </div>

                  {/* Recipient */}
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-xs mb-1">Recipient Address</p>
                    <p className="text-gray-300 font-mono text-sm truncate">{proposal.target}</p>
                  </div>

                  {/* Voting Stats */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-400">Yes: {proposal.yesVotes}</span>
                      <span className="text-red-400">No: {proposal.noVotes}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${yesPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Voting Period */}
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Start Block</p>
                      <p className="text-white font-semibold">{proposal.blockStart}</p>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">End Block</p>
                      <p className="text-white font-semibold">{proposal.blockEnd}</p>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  {!proposal.executed && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleVote(proposal.proposal_id, true)}
                        disabled={isVoting}
                        className="px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg font-semibold hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Vote Yes</span>
                      </button>
                      <button
                        onClick={() => handleVote(proposal.proposal_id, false)}
                        disabled={isVoting}
                        className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-semibold hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Vote No</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Proposals;
