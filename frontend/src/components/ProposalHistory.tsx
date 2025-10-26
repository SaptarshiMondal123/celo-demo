import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';
import { proposalAPI, APIError, type ProposalDetail } from '../config/api';

const ProposalHistory = () => {
  const [proposals, setProposals] = useState<ProposalDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDistributed, setTotalDistributed] = useState<number>(0);

  useEffect(() => {
    fetchProposalHistory();
  }, []);

  const fetchProposalHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching proposal history from blockchain...');
      const startTime = Date.now();
      
      const data = await proposalAPI.list();
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Proposal history loaded in ${elapsed}s`);
      
      if (data && data.proposals) {
        // Filter only executed proposals (history)
        const executedProposals = data.proposals.filter(p => p.executed);
        setProposals(executedProposals.reverse());
        
        // Calculate total distributed
        const total = executedProposals.reduce((sum, p) => sum + p.value, 0);
        setTotalDistributed(total);
      } else {
        setProposals([]);
        setTotalDistributed(0);
      }
    } catch (err) {
      console.error('Error fetching proposal history:', err);
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
        setError(err instanceof Error ? err.message : 'Failed to fetch proposal history. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="proposal-history" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading proposal history from blockchain...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take up to 30-60 seconds</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="proposal-history" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
            <span className="gradient-text">Proposal</span> History
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-6">
            View all executed proposals and their distribution details
          </p>
          <button
            onClick={fetchProposalHistory}
            className="px-6 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30 transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Total Executed</p>
                <p className="text-white text-3xl font-bold">{proposals.length}</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Total Distributed</p>
                <p className="text-white text-3xl font-bold">{totalDistributed.toFixed(4)} CELO</p>
              </div>
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Average Amount</p>
                <p className="text-white text-3xl font-bold">
                  {proposals.length > 0 ? (totalDistributed / proposals.length).toFixed(4) : 0} CELO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Proposals History List */}
        {proposals.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No executed proposals yet</p>
            <p className="text-gray-500 mt-2">Proposal history will appear here after execution</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {proposals.map((proposal) => {
              const totalVotes = proposal.yesVotes + proposal.noVotes;
              const yesPercentage = totalVotes > 0 ? ((proposal.yesVotes / totalVotes) * 100).toFixed(1) : 0;

              return (
                <div
                  key={proposal.proposal_id}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-bold text-lg">
                          Proposal #{proposal.proposal_id}
                        </h3>
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs rounded-full font-semibold">
                          EXECUTED
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{proposal.description}</p>
                      
                      {/* Recipient */}
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-400">Recipient:</span>
                        <span className="text-gray-300 font-mono">
                          {proposal.target.substring(0, 10)}...{proposal.target.substring(proposal.target.length - 8)}
                        </span>
                        <a
                          href={`https://celoscan.io/address/${proposal.target}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right ml-6">
                      <p className="text-green-400 font-bold text-2xl">{proposal.value} CELO</p>
                      <p className="text-gray-500 text-xs">Distributed</p>
                    </div>
                  </div>

                  {/* Voting Results */}
                  <div className="border-t border-gray-800 pt-4">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Yes Votes</p>
                        <p className="text-green-400 font-bold">{proposal.yesVotes} ({yesPercentage}%)</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">No Votes</p>
                        <p className="text-red-400 font-bold">{proposal.noVotes}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Total Votes</p>
                        <p className="text-white font-bold">{totalVotes}</p>
                      </div>
                    </div>

                    {/* Vote Progress Bar */}
                    <div className="flex h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${yesPercentage}%` }}
                      ></div>
                      <div
                        className="bg-red-500"
                        style={{ width: `${100 - Number(yesPercentage)}%` }}
                      ></div>
                    </div>

                    {/* Block Range */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Voting Period: Block {proposal.blockStart} → {proposal.blockEnd}</p>
                    </div>
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

export default ProposalHistory;
