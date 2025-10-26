import { Shield, Users, Zap, Lock, Vote, Wallet, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import Button from './Button';

const AboutEchoDAO = () => {
  const features = [
    {
      icon: <Vote className="w-8 h-8" />,
      title: "Democratic Governance",
      description: "Every token holder has a voice. Propose, vote, and shape the future of the DAO together.",
      color: "blue"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Blockchain Security",
      description: "Built on Celo blockchain with immutable smart contracts ensuring transparency and security.",
      color: "indigo"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Execution",
      description: "Proposals are automatically executed once voting thresholds are met - no intermediaries needed.",
      color: "purple"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure Treasury",
      description: "Multi-signature treasury management with transparent fund allocation and audit trails.",
      color: "green"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect Your Wallet",
      description: "Link your MetaMask wallet to the Celo Alfajores testnet. New users get their first proposal creation free!",
      icon: <Wallet className="w-6 h-6" />
    },
    {
      step: "2",
      title: "Create Proposals",
      description: "Submit your ideas with detailed descriptions. Our AI verifies content authenticity and generates summaries.",
      icon: <Vote className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Community Voting",
      description: "Members vote Yes or No on active proposals. Transparent voting results displayed in real-time.",
      icon: <Users className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Automatic Execution",
      description: "Approved proposals are executed automatically with funds distributed to designated addresses.",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  const benefits = [
    "First proposal creation is completely FREE (0 CELO fee)",
    "Up to 3 proposals per day per user",
    "0.01 CELO is the minimum fee for subsequent proposals",
    "AI-powered content verification using BART-CNN model",
    "Automatic summary generation for easy review",
    "IPFS storage for decentralized data persistence",
    "Real-time proposal status tracking",
    "Complete voting history and analytics",
    "Celoscan integration for transaction verification",
    "Mobile-responsive design for voting on-the-go"
  ];

  const technicalStack = [
    {
      category: "Blockchain",
      technologies: ["Celo Alfajores Testnet", "Smart Contracts (Solidity)", "Web3.py", "MetaMask Integration"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      category: "AI & Verification",
      technologies: ["BART-CNN Model", "Content Authenticity Check", "Automatic Summarization", "Truth Verification"],
      color: "from-purple-500 to-pink-600"
    },
    {
      category: "Storage",
      technologies: ["IPFS (Pinata)", "Decentralized Storage", "Content Hash Verification", "Persistent Data"],
      color: "from-green-500 to-teal-600"
    },
    {
      category: "Frontend",
      technologies: ["React + TypeScript", "Vite", "TailwindCSS", "Lucide Icons"],
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <section id="about" className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            <span className="gradient-text">About</span> EchoDAO
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            EchoDAO is a revolutionary decentralized autonomous organization that empowers communities 
            to make collective decisions through transparent, secure, and democratic governance.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            Our Mission
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            To democratize decision-making by providing a transparent, secure, and accessible platform 
            where every voice matters. We believe in the power of collective intelligence and the 
            transformative potential of blockchain technology to create fair and inclusive governance systems.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Built on the Celo blockchain, EchoDAO combines cutting-edge AI verification, decentralized 
            storage, and smart contract automation to ensure that governance is not just transparent, 
            but also efficient, secure, and accessible to everyone.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Core Features
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={`text-${feature.color}-400 mb-4`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-xl p-6 h-full hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <div className="text-blue-400 mb-3">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Key Benefits
            </span>
          </h3>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Technical Stack
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalStack.map((stack, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <h4 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${stack.color} bg-clip-text text-transparent`}>
                  {stack.category}
                </h4>
                <ul className="space-y-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={techIndex} className="text-gray-400 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stack.color}`}></div>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Why Choose EchoDAO?
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-gray-300">Transparent Governance</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-indigo-400 mb-2">24/7</div>
                <div className="text-gray-300">Automated Execution</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-400 mb-2">0 Fee</div>
                <div className="text-gray-300">First Proposal Free</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join EchoDAO today and be part of the decentralized governance revolution. 
            Create your first proposal for free and experience true democratic decision-making.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Create Proposal
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('active-proposals')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Active Proposals
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutEchoDAO;
