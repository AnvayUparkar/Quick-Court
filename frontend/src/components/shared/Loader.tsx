import React from 'react';

interface LoaderProps {
  size?: string; // e.g., 'w-6 h-6', 'w-10 h-10'
  color?: string; // e.g., 'border-blue-500', 'border-indigo-600'
}

const Loader: React.FC<LoaderProps> = ({ size = 'w-8 h-8', color = 'border-blue-500' }) => {
  return (
    <div className={`inline-block ${size} border-4 border-t-4 ${color} border-opacity-25 rounded-full animate-spin`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
