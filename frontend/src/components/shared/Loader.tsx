import React from 'react';

interface LoaderProps {
  size?: string; // e.g., 'w-6 h-6', 'w-10 h-10'
  color?: string; // e.g., 'teal', 'blue', 'indigo'
}

const Loader: React.FC<LoaderProps> = ({ size = 'w-8 h-8', color = 'teal' }) => {
  const sizeMap: { [key: string]: number } = {
    'w-6 h-6': 24,
    'w-8 h-8': 32,
    'w-10 h-10': 40,
    'w-12 h-12': 48,
    'w-16 h-16': 64,
  };
  
  const pixelSize = sizeMap[size] || 32;
  
  return (
    <div className="inline-block" style={{ width: pixelSize, height: pixelSize }}>
      <style>
        {`
          @keyframes spinner-rotate {
            100% { transform: rotate(360deg); }
          }
          .loader-spinner {
            animation: spinner-rotate 1s linear infinite;
          }
        `}
      </style>
      <svg className="loader-spinner" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blueGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="1"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.85" transform="rotate(45 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.7" transform="rotate(90 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.55" transform="rotate(135 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.4" transform="rotate(180 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.25" transform="rotate(225 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.15" transform="rotate(270 25 25)"/>
        <rect x="23" y="2" width="4" height="10" rx="2" fill="url(#blueGreenGradient)" opacity="0.1" transform="rotate(315 25 25)"/>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;