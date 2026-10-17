import React from 'react';
import { Search, Filter, RotateCcw, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

export const TransactionTable = ({
  transactions = [],
  pagination = {},
  search = '',
  onSearchChange,
  riskFilter = '',
  onRiskFilterChange,
  statusFilter = '',
  onStatusFilterChange,
  onResetFilters,
  onPageChange,
  onSelectTransaction,
  onQuickAction,
  isLoading = false,
}) => {
  const isFiltered = search !== '' || riskFilter !== '' || statusFilter !== '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Controls Bar: Search & Filters */}
      <div className="p-3.5 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, cardholder, merchant, account..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => onRiskFilterChange(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Risk Tiers</option>
              <option value="HIGH">High Risk (70-100)</option>
              <option value="MEDIUM">Medium Risk (35-69)</option>
              <option value="LOW">Low Risk (0-34)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
              <option value="DISMISSED">Dismissed (Clean)</option>
            </select>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Clear all filters"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Count summary */}
        <div className="text-[11px] text-slate-400 font-mono text-right shrink-0">
          Showing <span className="text-white font-semibold">{transactions.length}</span> of{' '}
          <span className="text-white font-semibold">{pagination.total || 0}</span> records
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <th className="py-2.5 px-3">Reference</th>
              <th className="py-2.5 px-3">Date / Time</th>
              <th className="py-2.5 px-3">Cardholder & Account</th>
              <th className="py-2.5 px-3">Merchant / Sector</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Risk Assessment</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Analyst Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-3"><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-28 bg-slate-800 rounded"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-14 bg-slate-800 rounded ml-auto"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-16 bg-slate-800 rounded mx-auto"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-800 rounded mx-auto"></div></td>
                  <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-800 rounded ml-auto"></div></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-slate-500" />
                    <p className="text-sm font-medium text-slate-300">
                      No matching transactions found
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {isFiltered
                        ? 'Try modifying your search keywords or resetting risk/status filters.'
                        : 'No transactions exist in database. Click "Seed Demo Data" above to populate realistic records.'}
                    </p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                      >
                        Clear active filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const formattedTime = new Date(txn.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={txn._id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Reference */}
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                      <button
                        type="button"
                        onClick={() => onSelectTransaction(txn)}
                        className="hover:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {txn.transactionRef}
                      </button>
                    </td>

                    {/* Date / Time */}
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {formattedTime}
                    </td>

                    {/* Cardholder & Account */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{txn.cardholderName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{txn.accountNumber}</div>
                    </td>

                    {/* Merchant & Sector */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-200">{txn.merchant}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{txn.category}</span>
                        <span className="text-slate-600">•</span>
                        <span>{txn.location}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                      ${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Risk Assessment */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <RiskBadge level={txn.riskLevel} score={txn.riskScore} />
                        {txn.riskReasons && txn.riskReasons.length > 0 && (
                          <span
                            className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5"
                            title={txn.riskReasons.join(' | ')}
                          >
                            {txn.riskReasons[0].replace(/\(\+\d+\)/, '')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={txn.status} />
                    </td>

                    {/* Analyst Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onSelectTransaction(txn)}
                          title="Open Transaction Intelligence Modal"
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Action: Confirm Fraud */}
                        {txn.status !== 'CONFIRMED_FRAUD' && (
                          <button
                            type="button"
                            onClick={() => onQuickAction(txn._id, 'CONFIRMED_FRAUD')}
                            title="Confirm Fraud & Block"
                            className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-500/30 transition cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Action: Dismiss */}
                        {txn.status !== 'DISMISSED' && (
                          <button
                            type="button"
                            onClick={() => onQuickAction(txn._id, 'DISMISSED')}
                            title="Dismiss Alert as Legitimate"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Page <span className="text-white font-medium">{pagination.page}</span> of{' '}
            <span className="text-white font-medium">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
