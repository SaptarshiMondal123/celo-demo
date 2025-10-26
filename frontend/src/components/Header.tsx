import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Header = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [isFundingOpen, setIsFundingOpen] = useState(false);

  // Force disconnect on mount to require fresh authorization
  useEffect(() => {
    // Clear wallet state on every page load
    setWalletAddress('');
    
    // Optional: You can also revoke permissions programmatically (not all wallets support this)
    // This ensures MetaMask shows the authorization popup every time
    if (window.ethereum && window.ethereum.request) {
      // Note: Most wallets don't support revoking permissions programmatically
      // The user would need to disconnect manually from MetaMask
      console.log('Wallet disconnected - ready for fresh connection');
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
      }

      setIsConnecting(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Optional: Switch to Celo Alfajores network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaef3' }], // Celo Alfajores testnet
          });
        } catch (switchError: any) {
          // Chain doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaef3',
                chainName: 'Celo Alfajores Testnet',
                nativeCurrency: {
                  name: 'CELO',
                  symbol: 'CELO',
                  decimals: 18
                },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io/']
              }]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src="/assets/EchoDao_Logo.png"
            alt="EchoDAO logo"
            className="h-9 w-9 rounded-md object-contain"
          />
          <span className="text-xl font-bold text-white">EchoDAO</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
          
          {/* Proposals Dropdown */}
          <div className="relative group">
            <button
              onMouseEnter={() => setIsProposalsOpen(true)}
              onMouseLeave={() => setIsProposalsOpen(false)}
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <span>Proposals</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            <div
              onMouseEnter={() => setIsProposalsOpen(true)}
              onMouseLeave={() => setIsProposalsOpen(false)}
              className={`absolute left-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden transition-all duration-200 ${
                isProposalsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <Link
                to="/create-proposal"
                onClick={() => setIsProposalsOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors border-b border-gray-800"
              >
                <div className="font-semibold">Create Proposal</div>
                <div className="text-xs text-gray-500">Submit a new governance proposal</div>
              </Link>
              
              <Link
                to="/active-proposals"
                onClick={() => setIsProposalsOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors border-b border-gray-800"
              >
                <div className="font-semibold">Active Proposals</div>
                <div className="text-xs text-gray-500">View and vote on proposals</div>
              </Link>
              
              <Link
                to="/proposal-history"
                onClick={() => setIsProposalsOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-colors"
              >
                <div className="font-semibold">Proposal History</div>
                <div className="text-xs text-gray-500">View past executed proposals</div>
              </Link>
            </div>
          </div>
          
          {/* Funding Dropdown */}
          <div className="relative group">
            <button
              onMouseEnter={() => setIsFundingOpen(true)}
              onMouseLeave={() => setIsFundingOpen(false)}
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <span>Funding</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            <div
              onMouseEnter={() => setIsFundingOpen(true)}
              onMouseLeave={() => setIsFundingOpen(false)}
              className={`absolute left-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden transition-all duration-200 ${
                isFundingOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <a
                href="#funding"
                onClick={() => setIsFundingOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors border-b border-gray-800"
              >
                <div className="font-semibold">Treasury Overview</div>
                <div className="text-xs text-gray-500">View treasury balance and stats</div>
              </a>
              
              <Link
                to="/fund-redistribution"
                onClick={() => setIsFundingOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-colors"
              >
                <div className="font-semibold">Fund Redistribution</div>
                <div className="text-xs text-gray-500">Track fund distribution to users</div>
              </Link>
            </div>
          </div>
          
          {walletAddress ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono text-sm">{formatAddress(walletAddress)}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold hover:bg-red-500/20 transition-all duration-300"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-5 h-5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;