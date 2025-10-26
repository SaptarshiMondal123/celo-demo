import { FileText, Brain, Lock, Coins, Vote, TrendingUp, Cpu, Shield } from 'lucide-react';

const features = [
	{
		icon: FileText,
		title: 'AI-Powered Report Analysis',
		description: 'Upload reports and get AI-generated summaries with trust scores using BART-CNN and ML models.',
		color: 'blue',
		tech: 'Transformers • Pinata IPFS'
	},
	{
		icon: Lock,
		title: 'IPFS Decentralized Storage',
		description: 'Secure, immutable storage on IPFS with SHA-256 hashing for tamper-proof report verification.',
		color: 'green',
		tech: 'Pinata • SHA-256'
	},
	{
		icon: Vote,
		title: 'On-Chain Governance',
		description: 'Create proposals and vote on-chain using Celo blockchain with EIP-155 compliant transactions.',
		color: 'purple',
		tech: 'Celo Alfajores • Web3.py'
	},
	{
		icon: Coins,
		title: 'Smart Contract Treasury',
		description: 'Automated treasury management with secure fund allocation and real-time balance tracking.',
		color: 'amber',
		tech: 'Solidity • OpenZeppelin'
	},
	{
		icon: Brain,
		title: 'Trust Score ML Model',
		description: 'Advanced machine learning algorithms analyze report credibility and assign trust ratings.',
		color: 'pink',
		tech: 'PyTorch • HuggingFace'
	},
	{
		icon: TrendingUp,
		title: 'Real-Time Proposal Tracking',
		description: 'Monitor proposal status, vote counts, and execution state directly from the blockchain.',
		color: 'cyan',
		tech: 'FastAPI • Web3 Events'
	},
	{
		icon: Cpu,
		title: 'FastAPI Backend',
		description: 'High-performance async API with automatic validation, documentation, and CORS support.',
		color: 'indigo',
		tech: 'FastAPI • Pydantic'
	},
	{
		icon: Shield,
		title: 'Blockchain Security',
		description: 'EIP-155 replay protection, gas estimation, and secure key management for all transactions.',
		color: 'red',
		tech: 'Web3.py • Private Keys'
	}
];

const Features = () => {
	return (
		<section id="features" className="py-20 bg-gray-900">
			<div className="container mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
						Powered by{' '}
						<span className="gradient-text">
							CELO
						</span>
					</h2>
					<p className="text-gray-300 text-xl max-w-3xl mx-auto">
						EchoDAO combines AI, blockchain, and decentralized storage to create a transparent governance platform.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						const colorClasses = {
							blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 group-hover:border-blue-400/40 group-hover:bg-blue-400/20 group-hover:shadow-blue-400/20',
							green: 'text-green-400 bg-green-400/10 border-green-400/20 group-hover:border-green-400/40 group-hover:bg-green-400/20 group-hover:shadow-green-400/20',
							amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20 group-hover:border-amber-400/40 group-hover:bg-amber-400/20 group-hover:shadow-amber-400/20',
							purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 group-hover:border-purple-400/40 group-hover:bg-purple-400/20 group-hover:shadow-purple-400/20',
							pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20 group-hover:border-pink-400/40 group-hover:bg-pink-400/20 group-hover:shadow-pink-400/20',
							cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/20 group-hover:shadow-cyan-400/20',
							indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 group-hover:border-indigo-400/40 group-hover:bg-indigo-400/20 group-hover:shadow-indigo-400/20',
							red: 'text-red-400 bg-red-400/10 border-red-400/20 group-hover:border-red-400/40 group-hover:bg-red-400/20 group-hover:shadow-red-400/20'
						};

						return (
							<div
								key={index}
								className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
							>
								<div
									className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 transition-all duration-300 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
								>
									<Icon className="w-8 h-8" />
								</div>

								<h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
									{feature.title}
								</h3>

								<p className="text-gray-300 text-sm leading-relaxed mb-4">
									{feature.description}
								</p>

								<div className="pt-4 border-t border-gray-700/50">
									<p className="text-xs font-mono text-gray-500 group-hover:text-gray-400 transition-colors">
										{feature.tech}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Features;