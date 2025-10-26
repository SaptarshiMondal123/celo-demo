import { ArrowLeft, Code, Database, Brain, Shield, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechnologyStackPage = () => {
  const navigate = useNavigate();

  const techCategories = [
    {
      title: 'Blockchain & Smart Contracts',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-blue-500 to-indigo-600',
      technologies: [
        {
          name: 'Celo Blockchain',
          description: 'Carbon-negative, mobile-first blockchain platform for decentralized governance',
          link: 'https://celo.org/'
        },
        {
          name: 'Solidity',
          description: 'Smart contract programming language for secure on-chain logic',
          link: 'https://soliditylang.org/'
        },
        {
          name: 'Hardhat',
          description: 'Ethereum development environment for compiling, deploying, and testing',
          link: 'https://hardhat.org/'
        },
        {
          name: 'Web3.js / Ethers.js',
          description: 'JavaScript libraries for interacting with the blockchain',
          link: 'https://docs.ethers.org/'
        }
      ]
    },
    {
      title: 'Artificial Intelligence',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      technologies: [
        {
          name: 'OpenAI GPT',
          description: 'Advanced language models for proposal summarization and analysis',
          link: 'https://openai.com/'
        },
        {
          name: 'Natural Language Processing',
          description: 'AI-powered content verification and fact-checking',
          link: 'https://platform.openai.com/'
        },
        {
          name: 'Machine Learning',
          description: 'Intelligent proposal categorization and trend analysis',
          link: 'https://openai.com/'
        }
      ]
    },
    {
      title: 'Decentralized Storage',
      icon: <Database className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      technologies: [
        {
          name: 'IPFS',
          description: 'InterPlanetary File System for distributed, permanent content storage',
          link: 'https://ipfs.tech/'
        },
        {
          name: 'Pinata',
          description: 'IPFS pinning service for reliable content availability',
          link: 'https://www.pinata.cloud/'
        },
        {
          name: 'Content Addressing',
          description: 'Cryptographic hashing for tamper-proof content verification',
          link: 'https://docs.ipfs.tech/concepts/content-addressing/'
        }
      ]
    },
    {
      title: 'Frontend & Development',
      icon: <Code className="w-8 h-8" />,
      color: 'from-cyan-500 to-blue-600',
      technologies: [
        {
          name: 'React',
          description: 'Modern JavaScript library for building user interfaces',
          link: 'https://react.dev/'
        },
        {
          name: 'TypeScript',
          description: 'Typed superset of JavaScript for robust code',
          link: 'https://www.typescriptlang.org/'
        },
        {
          name: 'Vite',
          description: 'Next-generation frontend tooling for fast development',
          link: 'https://vitejs.dev/'
        },
        {
          name: 'TailwindCSS',
          description: 'Utility-first CSS framework for rapid UI development',
          link: 'https://tailwindcss.com/'
        }
      ]
    },
    {
      title: 'Backend & API',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      technologies: [
        {
          name: 'Python Flask',
          description: 'Lightweight web framework for API development',
          link: 'https://flask.palletsprojects.com/'
        },
        {
          name: 'RESTful API',
          description: 'Standard API architecture for client-server communication',
          link: 'https://restfulapi.net/'
        },
        {
          name: 'JSON Storage',
          description: 'Efficient data serialization and storage',
          link: 'https://www.json.org/'
        }
      ]
    },
    {
      title: 'Web3 Integration',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-600',
      technologies: [
        {
          name: 'MetaMask',
          description: 'Browser wallet for blockchain authentication and transactions',
          link: 'https://metamask.io/'
        },
        {
          name: 'WalletConnect',
          description: 'Open protocol for connecting wallets to dApps',
          link: 'https://walletconnect.com/'
        },
        {
          name: 'Celo SDK',
          description: 'Software development kit for Celo blockchain integration',
          link: 'https://docs.celo.org/'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white mb-8 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Technology Stack
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            EchoDAO is built with cutting-edge technologies to deliver a secure, transparent, and user-friendly decentralized governance platform.
          </p>
        </div>
      </div>

      {/* Technology Categories */}
      <div className="container mx-auto px-6 py-16">
        <div className="space-y-16">
          {techCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center space-x-4">
                <div className={`bg-gradient-to-r ${category.color} p-4 rounded-xl text-white`}>
                  {category.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {category.title}
                </h2>
              </div>

              {/* Technology Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.technologies.map((tech, techIndex) => (
                  <a
                    key={techIndex}
                    href={tech.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-[1.02]"
                  >
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {tech.name}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {tech.description}
                    </p>
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                      Learn more
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Overview */}
        <div className="mt-20 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            Platform Architecture
          </h2>
          <p className="text-gray-300 text-lg text-center max-w-4xl mx-auto mb-8">
            EchoDAO combines blockchain transparency, AI-powered intelligence, and decentralized storage to create a trustless, efficient governance system.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">User Interaction</h3>
              <p className="text-gray-400">Community members submit proposals and vote using MetaMask wallet</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Processing</h3>
              <p className="text-gray-400">Proposals are analyzed, summarized, and verified using AI models</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Blockchain Recording</h3>
              <p className="text-gray-400">All votes and decisions are immutably recorded on Celo blockchain</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/create-proposal')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            Start Creating Proposals
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologyStackPage;
