import React from 'react';

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <svg
        className="absolute bottom-8 left-[15%] w-72 h-72 opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M100 190 L100 140 Q100 130 95 125 L70 105 Q65 100 65 95 L65 80" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="110" r="10" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <line x1="100" y1="140" x2="80" y2="170" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="140" x2="120" y2="170" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <line x1="95" y1="125" x2="75" y2="145" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="95" y1="125" x2="115" y2="145" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <g opacity="0.4">
          <circle cx="100" cy="110" r="3" fill="#3b82f6">
            <animate attributeName="cy" values="110;108;112;110" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      <svg
        className="absolute bottom-8 right-[18%] w-80 h-80 opacity-[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M170 190 L170 150 Q170 140 165 135 L140 110 Q135 105 135 95 L135 70" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="170" cy="58" r="10" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <line x1="170" y1="150" x2="150" y2="180" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <line x1="170" y1="150" x2="190" y2="175" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <line x1="165" y1="135" x2="140" y2="155" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="165" y1="135" x2="185" y2="150" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="135" y1="70" x2="120" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="135" y1="70" x2="135" y2="55" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <g opacity="0.3">
          <circle cx="170" cy="58" r="3" fill="#3b82f6" />
        </g>
      </svg>

      <svg
        className="absolute top-[20%] left-[5%] w-32 h-40 opacity-[0.04]"
        viewBox="0 0 100 150"
        fill="none"
      >
        <polyline points="50,30 55,45 50,60 55,75 50,90" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="50" y1="90" x2="45" y2="110" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="90" x2="55" y2="110" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <text x="48" y="140" fill="#3b82f6" fontSize="7" opacity="0.4" fontFamily="monospace" textAnchor="middle">EVEREST</text>
        <line x1="10" y1="130" x2="90" y2="130" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" />
      </svg>

      <svg
        className="absolute top-[60%] right-[8%] w-24 h-24 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="35" r="9" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
        <line x1="50" y1="44" x2="50" y2="68" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="35" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="65" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="68" x2="40" y2="85" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="68" x2="60" y2="85" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
