import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const showcaseItems = [
  {
    title: 'Blockchain-Powered Transparency',
    description: 'Every vote, proposal, and decision is recorded immutably on the Celo blockchain, ensuring complete transparency and auditability.',
    image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'https://celo.org/'
  },
  {
    title: 'AI-Driven Proposal Analysis',
    description: 'Advanced AI automatically summarizes proposals and verifies claims, helping community members make informed decisions quickly.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'https://openai.com/'
  },
  {
    title: 'Decentralized IPFS Storage',
    description: 'All proposal content and media are stored on IPFS, ensuring permanent, censorship-resistant access to community data.',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'https://ipfs.tech/'
  }
];

const Showcase = () => {
  const navigate = useNavigate();

  return (
    <section id="showcase" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            <span className="gradient-text">Technology</span> Showcase
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            See how EchoDAO revolutionizes community governance through blockchain, AI, and decentralized technology
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-400/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-400/10"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/technology-stack')}
          >
            Explore Our Technology Stack
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Showcase;