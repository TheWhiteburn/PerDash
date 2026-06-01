import React from 'react';

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <svg
        viewBox="0 0 1440 900"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        fill="#3b82f6"
      >
        <defs>
          <path id="raceTrack" d="M 720 750 A 600 250 0 0 1 720 250 A 600 250 0 0 1 720 750" />
        </defs>

        {/* Visible track curves — left and right arcs forming a broken oval */}
        <path d="M 720 750 A 600 250 0 0 1 720 250" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.12" />
        <path d="M 720 250 A 600 250 0 0 1 720 750" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.12" />

        {/* Runner — follows traceTrack path (20s lap), limbs pump via animateTransform */}
        <g opacity="0.2">
          <animateMotion dur="20s" repeatCount="indefinite" rotate="auto">
            <mpath href="#raceTrack" />
          </animateMotion>

          <g transform="translate(-50, -56) scale(0.55)">
            {/* Torso */}
            <rect x="42" y="34" width="16" height="24" rx="3" />
            {/* Head */}
            <rect x="43" y="20" width="14" height="14" rx="4" />

            {/* Right arm (forward) */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-35 50 36; -15 50 36; -35 50 36" dur="0.85s" repeatCount="indefinite" />
              <rect x="58" y="34" width="24" height="6" rx="3" />
              <rect x="78" y="26" width="16" height="6" rx="3" transform="rotate(20 78 26)" />
            </g>

            {/* Left arm (back) */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="25 42 36; 45 42 36; 25 42 36" dur="0.85s" repeatCount="indefinite" />
              <rect x="18" y="34" width="24" height="6" rx="3" />
              <rect x="6" y="42" width="16" height="6" rx="3" transform="rotate(-20 6 42)" />
            </g>

            {/* Right leg (forward stride) */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="30 50 56; 10 50 56; 30 50 56" dur="0.85s" repeatCount="indefinite" />
              <rect x="48" y="56" width="8" height="22" rx="3" transform="rotate(35 48 56)" />
              <rect x="60" y="74" width="8" height="18" rx="3" transform="rotate(-25 60 74)" />
              <rect x="64" y="88" width="14" height="6" rx="3" transform="rotate(10 64 88)" />
            </g>

            {/* Left leg (back stride) */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-40 42 56; -20 42 56; -40 42 56" dur="0.85s" repeatCount="indefinite" />
              <rect x="42" y="56" width="8" height="22" rx="3" transform="rotate(-45 42 56)" />
              <rect x="22" y="72" width="8" height="18" rx="3" transform="rotate(25 22 72)" />
              <rect x="18" y="86" width="14" height="6" rx="3" transform="rotate(-10 18 86)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
