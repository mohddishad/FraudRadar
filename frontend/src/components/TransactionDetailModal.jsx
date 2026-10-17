import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Clock,
  CreditCard,
  Building2,
  MapPin,
  Laptop,
  Network,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

export const TransactionDetailModal = ({
  transaction,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}) => {
  if (!transaction) return null;

  const [notes, setNotes] = useState(transaction.analystNotes || '');
  const [analystName, setAnalystName] = useState('Analyst');

  const handleAction = async (newStatus) => {
    await onUpdateStatus(transaction._id, {
      status: newStatus,
      analystNotes: notes,
      reviewedBy: analystName,
    });
  };

  const formattedDate = new Date(transaction.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-rose-400 bg-rose-500';
    if (score >= 35) return 'text-amber-400 bg-amber-500';
    return 'text-emerald-400 bg-emerald-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      {/* Modal Dialog Card */}
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="font-mono text-base font-bold text-white tracking-wider">
              {transaction.transactionRef}
            </div>
            <StatusBadge status={transaction.status} />
            <RiskBadge level={transaction.riskLevel} score={transaction.riskScore} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Total Amount
              </span>
              <span className="text-xl font-bold font-mono text-white">
                ${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {transaction.currency || 'USD'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Cardholder
              </span>
              <span className="text-sm font-semibold text-slate-100 block truncate">
                {transaction.cardholderName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {transaction.accountNumber}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Merchant
              </span>
              <span className="text-sm font-semibold text-slate-100 block truncate">
                {transaction.merchant}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {transaction.category}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Origination Time
              </span>
              <span className="text-xs text-slate-300 block">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Risk Scoring & Transparent Rule Breakdown */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Heuristic Risk Assessment
                </h3>
                <p className="text-[11px] text-slate-400">
                  Transparent rule-based scoring engine (0 safe - 100 fraudulent)
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-white">
                  {transaction.riskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono"> / 100</span>
              </div>
            </div>

            {/* Score progress track */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full transition-all duration-500 ${
                  transaction.riskScore >= 70
                    ? 'bg-rose-500'
                    : transaction.riskScore >= 35
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, transaction.riskScore))}%` }}
              ></div>
            </div>

            {/* Rule Explanations List */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Triggered Heuristic Rules & Diagnostics:
              </span>
              {transaction.riskReasons && transaction.riskReasons.length > 0 ? (
                <ul className="space-y-1.5">
                  {transaction.riskReasons.map((reason, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded bg-slate-950/50 border border-slate-800/80 text-xs text-slate-200"
                    >
                      <span className="mt-0.5 text-indigo-400 font-bold">•</span>
                      <span className="flex-1">{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Standard baseline retail parameters verified. No elevated risk rules triggered.
                </p>
              )}
            </div>
          </div>

          {/* Device & Hardware Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-slate-400" /> Client Hardware / Device
              </span>
              <div className="text-xs text-slate-200 font-mono">{transaction.device || 'Standard Web Client'}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Location: {transaction.location}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-slate-400" /> Network & Origin
              </span>
              <div className="text-xs text-slate-200 font-mono">
                IP: {transaction.ipAddress || '192.168.1.1'}
              </div>
              <div className="text-[11px] mt-1">
                {transaction.isVpnOrProxy ? (
                  <span className="text-rose-400 font-medium">⚠️ VPN / Proxy / Anonymizer Detected</span>
                ) : (
                  <span className="text-emerald-400 font-medium">✓ Direct ISP Connection</span>
                )}
              </div>
            </div>
          </div>

          {/* Existing Review Record if already actioned */}
          {transaction.reviewedAt && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300">
                  Reviewed by <span className="text-white font-semibold">{transaction.reviewedBy || 'Analyst'}</span> on{' '}
                  <span className="text-slate-400">{new Date(transaction.reviewedAt).toLocaleString()}</span>
                </p>
                {transaction.analystNotes && (
                  <p className="text-slate-400 mt-1 italic font-sans">
                    "{transaction.analystNotes}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Analyst Disposition & Notes Form */}
          <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Analyst Disposition & Audit Log
              </h3>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Case Notes & Findings:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document your verification findings (e.g., 'Contacted cardholder; verified identity via SMS' or 'Card reported stolen by issuer')..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Analyst Signoff:</span>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 w-32 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-end">
                {transaction.status !== 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleAction('PENDING')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                  >
                    Reset to Pending
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleAction('DISMISSED')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dismiss as Legitimate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('CONFIRMED_FRAUD')}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-500/50 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Confirm Fraud & Block</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
