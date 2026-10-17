import React from 'react';

export const RiskBadge = ({ level, score, showScore = true }) => {
  switch (level) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          HIGH {showScore && score !== undefined ? `(${score})` : ''}
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          MED {showScore && score !== undefined ? `(${score})` : ''}
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          LOW {showScore && score !== undefined ? `(${score})` : ''}
        </span>
      );
  }
};

export default RiskBadge;
