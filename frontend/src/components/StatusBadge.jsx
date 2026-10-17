import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'CONFIRMED_FRAUD':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide bg-rose-950/80 text-rose-300 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Confirmed Fraud
        </span>
      );
    case 'DISMISSED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Dismissed (Clean)
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium tracking-wide bg-amber-950/70 text-amber-300 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Pending Review
        </span>
      );
  }
};

export default StatusBadge;
