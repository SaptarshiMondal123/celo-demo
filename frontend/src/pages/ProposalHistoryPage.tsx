import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProposalHistory from '../components/ProposalHistory';

const ProposalHistoryPage = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Proposal History Component */}
      <ProposalHistory />
    </div>
  );
};

export default ProposalHistoryPage;
