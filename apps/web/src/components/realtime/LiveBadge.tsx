import React from 'react';

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ label = 'LIVE', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      {label}
    </span>
  );
};
