import React from 'react';

const styles = `
@keyframes runnerBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes runnerArmFwd {
  0%, 100% { transform: rotate(-40deg); }
  50% { transform: rotate(-20deg); }
}

@keyframes runnerArmBack {
  0%, 100% { transform: rotate(30deg); }
  50% { transform: rotate(50deg); }
}

@keyframes runnerLegFwd {
  0%, 100% { transform: rotate(35deg); }
  50% { transform: rotate(15deg); }
}

@keyframes runnerLegBack {
  0%, 100% { transform: rotate(-45deg); }
  50% { transform: rotate(-25deg); }
}

@keyframes climberArm {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-50deg); }
}

@keyframes climberArmReach {
  0%, 100% { transform: rotate(15deg); }
  50% { transform: rotate(5deg); }
}

@keyframes climberBody {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes standBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
`;

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <style>{styles}</style>

      {/* === RUNNER === */}
      <div
        className="absolute bottom-16 left-[12%] opacity-[0.22]"
        style={{ animation: 'runnerBounce 0.6s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 100 100" className="w-56 h-56" fill="#3b82f6">
          <g>
            {/* Torso */}
            <rect x="42" y="34" width="16" height="24" rx="3" />
            {/* Head */}
            <rect x="43" y="20" width="14" height="14" rx="4" />
            {/* Right arm (forward, pumping) */}
            <g style={{ transformOrigin: '50px 36px', animation: 'runnerArmFwd 0.6s ease-in-out infinite' }}>
              <rect x="58" y="34" width="24" height="6" rx="3" />
              <rect x="78" y="20" width="16" height="6" rx="3" transform="rotate(20 78 20)" />
            </g>
            {/* Left arm (back, pumping) */}
            <g style={{ transformOrigin: '42px 36px', animation: 'runnerArmBack 0.6s ease-in-out infinite' }}>
              <rect x="18" y="34" width="24" height="6" rx="3" />
              <rect x="6" y="42" width="16" height="6" rx="3" transform="rotate(-20 6 42)" />
            </g>
            {/* Right leg (forward stride) */}
            <g style={{ transformOrigin: '50px 56px', animation: 'runnerLegFwd 0.6s ease-in-out infinite' }}>
              <rect x="48" y="56" width="8" height="22" rx="3" transform="rotate(35 48 56)" />
              <rect x="60" y="74" width="8" height="18" rx="3" transform="rotate(-25 60 74)" />
              <rect x="64" y="88" width="14" height="6" rx="3" transform="rotate(10 64 88)" />
            </g>
            {/* Left leg (back stride) */}
            <g style={{ transformOrigin: '42px 56px', animation: 'runnerLegBack 0.6s ease-in-out infinite' }}>
              <rect x="42" y="56" width="8" height="22" rx="3" transform="rotate(-45 42 56)" />
              <rect x="22" y="72" width="8" height="18" rx="3" transform="rotate(25 22 72)" />
              <rect x="18" y="86" width="14" height="6" rx="3" transform="rotate(-10 18 86)" />
            </g>
          </g>
        </svg>
      </div>

      {/* === CLIMBER + ROCK WALL === */}
      <div className="absolute bottom-16 right-[10%] opacity-[0.2]">
        <svg viewBox="0 0 120 120" className="w-64 h-64" fill="#3b82f6">
          {/* Rock wall */}
          <polyline points="80,110 75,80 78,55 72,30 75,0" stroke="#3b82f6" strokeWidth="3" fill="none" opacity="0.15" />
          <polyline points="85,110 90,85 82,60 88,35 85,0" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.08" />
          {/* Hand-hold dots */}
          <circle cx="75" cy="80" r="3" fill="#3b82f6" opacity="0.3"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" repeatCount="indefinite" /></circle>
          <circle cx="78" cy="55" r="3" fill="#3b82f6" opacity="0.3"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="2.5s" repeatCount="indefinite" /></circle>
          <circle cx="72" cy="30" r="3" fill="#3b82f6" opacity="0.3"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="3s" repeatCount="indefinite" /></circle>
          {/* Climber group - translates upward along the wall */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,30; 0,-40; 0,30" dur="8s" repeatCount="indefinite" keyTimes="0;0.9;1" />
            {/* Torso */}
            <rect x="42" y="26" width="16" height="22" rx="3" />
            {/* Head */}
            <rect x="43" y="14" width="14" height="12" rx="4" />
            {/* Right arm (reaching UP) */}
            <g style={{ transformOrigin: '50px 28px', animation: 'climberArmReach 2s ease-in-out infinite' }}>
              <rect x="48" y="4" width="24" height="6" rx="3" transform="rotate(15 48 28)" />
              <rect x="64" y="-8" width="20" height="6" rx="3" transform="rotate(-10 64 -8)" />
            </g>
            {/* Left arm (on side hold) */}
            <g style={{ transformOrigin: '42px 30px', animation: 'climberArm 2s ease-in-out infinite' }}>
              <rect x="20" y="28" width="22" height="6" rx="3" transform="rotate(-40 20 28)" />
              <rect x="10" y="36" width="16" height="6" rx="3" />
            </g>
            {/* Right leg (straight, foot on hold) */}
            <rect x="48" y="46" width="8" height="22" rx="3" transform="rotate(10 48 46)" />
            <rect x="50" y="64" width="12" height="6" rx="3" />
            {/* Left leg (bent, lower hold) */}
            <rect x="40" y="46" width="8" height="16" rx="3" transform="rotate(-30 40 46)" />
            <rect x="28" y="56" width="8" height="16" rx="3" transform="rotate(20 28 56)" />
            <rect x="30" y="68" width="12" height="6" rx="3" />
          </g>
        </svg>
      </div>

      {/* === MOUNTAIN === */}
      <svg
        className="absolute top-[15%] right-[25%] w-52 h-52 opacity-[0.15]"
        viewBox="0 0 120 120"
        fill="none"
      >
        <polygon points="30,80 60,10 90,80" fill="#3b82f6" opacity="0.08" />
        <polygon points="50,85 75,30 100,85" fill="#3b82f6" opacity="0.05" />
        <polygon points="15,90 40,40 65,90" fill="#3b82f6" opacity="0.04" />
        <polyline points="55,70 58,55 63,60 68,42 72,48 75,32" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 3" />
        <text x="45" y="102" fill="#3b82f6" fontSize="8" opacity="0.4" fontFamily="JetBrains Mono, monospace" letterSpacing="4">PEAK</text>
        <circle cx="55" cy="70" r="2" fill="#3b82f6" opacity="0.6">
          <animateMotion dur="10s" repeatCount="indefinite" path="M55,70 L58,55 L63,60 L68,42 L72,48 L75,32" />
        </circle>
      </svg>

      {/* === STANDING FIGURE (scale reference) === */}
      <div
        className="absolute top-[55%] right-[35%] opacity-[0.12]"
        style={{ animation: 'standBob 3s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 50 80" className="w-20 h-28" fill="#3b82f6">
          <rect x="18" y="12" width="14" height="12" rx="4" />
          <rect x="17" y="24" width="16" height="26" rx="3" />
          <rect x="14" y="50" width="8" height="22" rx="3" />
          <rect x="28" y="50" width="8" height="22" rx="3" />
          <rect x="6" y="28" width="12" height="5" rx="2.5" transform="rotate(-15 6 28)" />
          <rect x="32" y="28" width="14" height="5" rx="2.5" transform="rotate(15 32 28)" />
        </svg>
      </div>
    </div>
  );
}
