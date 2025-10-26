import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const HeroSection = () => {
  const navigate = useNavigate();

  // Cosmos-inspired background gradient
  const heroBackgroundStyle = {
    background: `radial-gradient(circle at 70% 30%, rgba(68, 0, 255, 0.3), transparent 40%),
                 radial-gradient(circle at 20% 80%, rgba(255, 0, 150, 0.15), transparent 50%),
                 radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent 60%),
                 linear-gradient(180deg, rgba(13, 6, 40, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)`,
    backgroundColor: '#0d0628',
  };

  return (
    <section className="relative min-h-screen overflow-hidden" style={heroBackgroundStyle}>
      {/* Enhanced Orbital Elements with SVG Glow Effects */}
      <div className="absolute inset-0">
        {/* Cosmos-style SVG Orbital System */}
        <svg className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-40" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Glow filters for atom core */}
            <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
              <feFlood floodColor="#4400FF" floodOpacity="0.9" result="floodColor" />
              <feComposite in="floodColor" in2="blur" operator="in" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pinkGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
              <feFlood floodColor="#FF0096" floodOpacity="0.7" result="floodColor" />
              <feComposite in="floodColor" in2="blur" operator="in" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feFlood floodColor="#00D4FF" floodOpacity="0.6" result="floodColor" />
              <feComposite in="floodColor" in2="blur" operator="in" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Atom Core */}
          <circle cx="200" cy="200" r="80" fill="#2000B0" style={{ filter: "url(#blueGlow)" }} />
          <circle cx="200" cy="200" r="50" fill="white" opacity="0.8" />
          <circle cx="200" cy="200" r="20" fill="white" />

          {/* Orbital Paths */}
          <ellipse cx="200" cy="200" rx="140" ry="70" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="none" transform="rotate(30 200 200)" />
          <ellipse cx="200" cy="200" rx="120" ry="80" stroke="rgba(56,189,248,0.3)" strokeWidth="1.2" fill="none" transform="rotate(120 200 200)" />
          <ellipse cx="200" cy="200" rx="160" ry="60" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" transform="rotate(220 200 200)" />

          {/* Floating Orbital Discs */}
          <rect x="150" y="300" width="80" height="20" rx="10" fill="#FF8C00" opacity="0.8" transform="rotate(-15 190 310) translate(20, -50)" />
          <rect x="250" y="100" width="100" height="25" rx="12.5" fill="#FF0096" opacity="0.8" transform="rotate(5 300 112.5) translate(30, 80)" style={{ filter: "url(#pinkGlow)" }} />
          <rect x="80" y="180" width="60" height="18" rx="9" fill="#00D4FF" opacity="0.7" transform="rotate(25 110 189)" style={{ filter: "url(#cyanGlow)" }} />
        </svg>
        
        {/* Additional ambient glowing orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-indigo-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col justify-center items-center text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="display-hero font-display font-bold mb-6">
            <span className="gradient-text">
              EchoDAO
            </span>
          </h1>
          <div className="text-2xl md:text-4xl font-semibold text-white mb-4 font-display tracking-tight">
            Decentralized Governance for Everyone
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering communities with transparent and secure decision-making.
          </p>
          <p className="text-lg text-blue-400 mt-3 font-medium">
            Built on Blockchain — Powered by CELO
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            variant="primary"
            size="lg"
            onClick={() => navigate('/active-proposals')}
          >
            View Proposals
          </Button>
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>

        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-blue-400" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;