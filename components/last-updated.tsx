import React from 'react';

const LastUpdated: React.FC = () => {
  const lastUpdated: string = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return (
    <div className="text-xs text-gray-400 mt-1">
      Last Updated: {lastUpdated}
    </div>
  );
};

export default LastUpdated;