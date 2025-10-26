import React from 'react';

/**
 * CosmicBackground: full-screen gradient/glow backdrop inspired by Cosmos interchain visuals.
 * Renders fixed, pointer-events-none layers so content remains interactive.
 */
const CosmicBackground: React.FC = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#0d0628' }}>
      {/* Cosmos-inspired radial gradients */}
      <div
        className="absolute right-[-15%] top-[-5%] h-[70vh] w-[70vw] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(68, 0, 255, 0.4) 0%, rgba(99,102,241,0.25) 30%, rgba(2,6,23,0.0) 70%)',
          filter: 'saturate(140%)',
        }}
      />
      <div
        className="absolute left-[-10%] top-[15%] h-[60vh] w-[50vw] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 0, 150, 0.25) 0%, rgba(168,85,247,0.2) 35%, rgba(2,6,23,0.0) 70%)',
        }}
      />
      <div
        className="absolute left-[25%] bottom-[-15%] h-[50vh] w-[60vw] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.18) 40%, rgba(2,6,23,0.0) 70%)',
        }}
      />
      
      {/* Orbital rings - subtle, global decoration */}
      <svg
        className="absolute inset-0 w-full h-full opacity-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.25 }} />
            <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.1 }} />
          </linearGradient>
          <linearGradient id="orbitGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.08 }} />
          </linearGradient>
        </defs>
        {/* Large orbital ring */}
        <ellipse
          cx="960"
          cy="540"
          rx="700"
          ry="400"
          fill="none"
          stroke="url(#orbitGrad1)"
          strokeWidth="1.2"
          transform="rotate(-15 960 540)"
        />
        {/* Medium orbital ring */}
        <ellipse
          cx="960"
          cy="540"
          rx="500"
          ry="280"
          fill="none"
          stroke="url(#orbitGrad2)"
          strokeWidth="0.9"
          transform="rotate(25 960 540)"
        />
        {/* Small orbital ring */}
        <ellipse
          cx="960"
          cy="540"
          rx="320"
          ry="180"
          fill="none"
          stroke="url(#orbitGrad1)"
          strokeWidth="0.7"
          transform="rotate(-35 960 540)"
        />
      </svg>
      
      {/* Subtle gradient wash with purple tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(13,6,40,0.3) 0%, rgba(15,23,42,0.7) 50%, rgba(0,0,0,0.9) 100%)',
        }}
      />
    </div>
  );
};

export default CosmicBackground;
