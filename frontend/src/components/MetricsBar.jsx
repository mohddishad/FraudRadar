import React from 'react';
import { DollarSign, Activity, AlertCircle, ShieldAlert, CheckCircle, Percent } from 'lucide-react';

export const MetricsBar = ({ summary = {}, isLoading = false }) => {
  const {
    totalVolume = 0,
    totalTransactions = 0,
    pendingCount = 0,
    highRiskCount = 0,
    confirmedFraudCount = 0,
    fraudRate = 0,
  } = summary;

  const cards = [
    {
      label: 'Total Volume',
      value: `$${Number(totalVolume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${totalTransactions} total transactions`,
      icon: DollarSign,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-slate-900/90',
      borderColor: 'border-slate-800',
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      sub: 'Awaiting analyst action',
      icon: Activity,
      iconColor: pendingCount > 0 ? 'text-amber-400' : 'text-slate-400',
      bgColor: pendingCount > 0 ? 'bg-amber-950/20' : 'bg-slate-900/90',
      borderColor: pendingCount > 0 ? 'border-amber-500/30' : 'border-slate-800',
      highlightBadge: pendingCount > 0 ? 'Action Required' : null,
      highlightBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: 'High-Risk Flagged',
      value: highRiskCount,
      sub: 'Score >= 70 / 100',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      bgColor: highRiskCount > 0 ? 'bg-rose-950/20' : 'bg-slate-900/90',
      borderColor: highRiskCount > 0 ? 'border-rose-500/30' : 'border-slate-800',
    },
    {
      label: 'Confirmed Fraud',
      value: confirmedFraudCount,
      sub: 'Actioned & blocked',
      icon: ShieldAlert,
      iconColor: 'text-rose-300',
      bgColor: 'bg-slate-900/90',
      borderColor: 'border-slate-800',
    },
    {
      label: 'Fraud Rate',
      value: `${Number(fraudRate).toFixed(1)}%`,
      sub: 'Confirmed / Total ratio',
      icon: Percent,
      iconColor: 'text-amber-400',
      bgColor: 'bg-slate-900/90',
      borderColor: 'border-slate-800',
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-3.5 flex flex-col justify-between transition-shadow relative overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              {isLoading ? (
                <div className="h-7 w-20 bg-slate-800 animate-pulse rounded my-0.5"></div>
              ) : (
                <div className="text-xl lg:text-2xl font-bold tracking-tight text-white font-mono">
                  {card.value}
                </div>
              )}

              {card.highlightBadge && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${card.highlightBadgeColor} hidden sm:inline-block`}
                >
                  {card.highlightBadge}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              {card.sub}
            </p>
          </div>
        );
      })}
    </section>
  );
};

export default MetricsBar;
