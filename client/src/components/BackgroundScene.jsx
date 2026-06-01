import React from 'react';

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <svg
        className="absolute bottom-0 left-1/4 w-64 h-64 opacity-[0.03]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M20 180 L50 140 L80 150 L110 100 L140 110 L170 60 L190 40" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="50" cy="140" r="3" fill="#3b82f6" opacity="0.5">
          <animateMotion dur="12s" repeatCount="indefinite" path="M20 180 L50 140 L80 150 L110 100 L140 110 L170 60 L190 40" />
        </circle>
      </svg>

      <svg
        className="absolute bottom-16 right-1/3 w-56 h-56 opacity-[0.025]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M30 190 Q60 120 100 130 Q140 140 170 80 Q180 60 190 30" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="30" cy="190" r="2.5" fill="#3b82f6" opacity="0.4">
          <animateMotion dur="15s" repeatCount="indefinite" path="M30 190 Q60 120 100 130 Q140 140 170 80 Q180 60 190 30" />
        </circle>
      </svg>

      <svg
        className="absolute top-1/3 right-10 w-40 h-40 opacity-[0.02]"
        viewBox="0 0 100 200"
        fill="none"
      >
        <line x1="50" y1="200" x2="50" y2="20" stroke="#3b82f6" strokeWidth="1.5" />
        <polyline points="50,10 45,25 50,20 55,35" stroke="#3b82f6" strokeWidth="1" fill="none" />
        <text x="45" y="200" fill="#3b82f6" fontSize="6" opacity="0.3" fontFamily="monospace">8848</text>
      </svg>

      <svg
        className="absolute left-10 top-[40%] w-32 h-32 opacity-[0.015]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="30" r="8" stroke="#3b82f6" strokeWidth="1" fill="none" />
        <line x1="50" y1="38" x2="50" y2="65" stroke="#3b82f6" strokeWidth="1" />
        <line x1="50" y1="45" x2="35" y2="55" stroke="#3b82f6" strokeWidth="1" />
        <line x1="50" y1="45" x2="65" y2="55" stroke="#3b82f6" strokeWidth="1" />
        <line x1="50" y1="65" x2="40" y2="85" stroke="#3b82f6" strokeWidth="1" />
        <line x1="50" y1="65" x2="60" y2="85" stroke="#3b82f6" strokeWidth="1" />
      </svg>
    </div>
  );
}
