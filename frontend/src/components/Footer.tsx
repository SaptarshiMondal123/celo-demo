import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/assets/EchoDao_Logo.png"
                alt="EchoDAO logo"
                className="h-9 w-9 rounded-md object-contain"
              />
              <span className="text-2xl font-bold text-white">EchoDAO</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Empowering communities with decentralized governance, transparency, and secure decision-making.
            </p>
            <div className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Built on Blockchain — Powered by CELO
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#proposals" className="text-gray-300 hover:text-blue-400 transition-colors">Proposals</a></li>
              <li><a href="#funding" className="text-gray-300 hover:text-blue-400 transition-colors">Funding</a></li>
              <li><a href="#documentation" className="text-gray-300 hover:text-blue-400 transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Connect</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:contact@echodao.org" className="text-gray-300 hover:text-blue-400 transition-colors">
                  contact@echodao.org
                </a>
              </div>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="p-2 bg-gray-800 hover:bg-blue-500 rounded-lg transition-all duration-300 transform hover:scale-110">
                  <Github className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-blue-500 rounded-lg transition-all duration-300 transform hover:scale-110">
                  <Linkedin className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-blue-500 rounded-lg transition-all duration-300 transform hover:scale-110">
                  <ExternalLink className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 EchoDAO. All rights reserved. Built for decentralized governance.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Governance Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;