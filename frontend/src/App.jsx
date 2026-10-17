import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricsBar from './components/MetricsBar';
import ChartsSection from './components/ChartsSection';
import TransactionTable from './components/TransactionTable';
import TransactionDetailModal from './components/TransactionDetailModal';
import NewTransactionModal from './components/NewTransactionModal';
import api from './services/api';
import { AlertCircle, CheckCircle, Info, Database } from 'lucide-react';

export function App() {
  // State for metrics & data
  const [metrics, setMetrics] = useState({
    summary: {
      totalTransactions: 0,
      totalVolume: 0,
      pendingCount: 0,
      highRiskCount: 0,
      confirmedFraudCount: 0,
      fraudRate: 0,
    },
    riskDistribution: [],
    categoryBreakdown: [],
  });

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters state
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState(null);

  // Helper to show temporary notification toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch metrics from backend
  const loadMetrics = useCallback(async () => {
    try {
      const res = await api.getMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err.message);
    }
  }, []);

  // Fetch transactions based on current filters and pagination
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search,
        riskLevel: riskFilter,
        status: statusFilter,
        page: currentPage,
        limit: 10,
      };

      const res = await api.getTransactions(params);
      if (res.success) {
        setTransactions(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, riskFilter, statusFilter, currentPage]);

  // Initial load
  useEffect(() => {
    loadTransactions();
    loadMetrics();
  }, [loadTransactions, loadMetrics]);

  // Handle Quick Status Action (e.g., from table row)
  const handleQuickAction = async (txnId, newStatus) => {
    try {
      setIsUpdating(true);
      const res = await api.updateTransactionStatus(txnId, {
        status: newStatus,
        analystNotes: `Quick disposition updated to ${newStatus}`,
        reviewedBy: 'Analyst (Quick Action)',
      });

      if (res.success) {
        showToast(`Transaction updated to ${newStatus} in database`, 'success');
        // Refresh both list and metrics to guarantee consistency
        await Promise.all([loadTransactions(), loadMetrics()]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update transaction status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Full Status Update from Detail Modal
  const handleUpdateStatus = async (txnId, updateData) => {
    try {
      setIsUpdating(true);
      const res = await api.updateTransactionStatus(txnId, updateData);

      if (res.success && res.data) {
        showToast(`Status updated to ${res.data.status} and saved to MongoDB`, 'success');
        setSelectedTransaction(res.data);
        // Refresh list and metrics
        await Promise.all([loadTransactions(), loadMetrics()]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update review status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Creating / Scoring a New Transaction
  const handleCreateTransaction = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.createTransaction(formData);
      if (res.success && res.data) {
        setIsNewModalOpen(false);
        showToast(
          `Processed ${res.data.transactionRef}: Score ${res.data.riskScore}/100 (${res.data.riskLevel} Risk)`,
          'success'
        );
        // Refresh table and metrics
        await Promise.all([loadTransactions(), loadMetrics()]);
      }
    } catch (err) {
      throw err; // Handled by form modal for inline display
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Seeding 15-20 Demo Transactions
  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedDemoData();
      if (res.success) {
        showToast(res.message || 'Demo transactions seeded into database', 'success');
        await Promise.all([loadTransactions(), loadMetrics()]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to seed demo transactions', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Filter Resets
  const handleResetFilters = () => {
    setSearch('');
    setRiskFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#0c121e] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-2xl border text-xs font-medium backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        isConnected={isConnected}
        onRefresh={() => {
          loadTransactions();
          loadMetrics();
          showToast('Data refreshed from MongoDB', 'info');
        }}
        isLoading={isLoading}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-5 space-y-5 flex-1">
        {/* Offline / Backend Error Banner if server is down */}
        {!isConnected && (
          <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-100">
                Cannot connect to FraudRadar Backend API (http://localhost:5000)
              </p>
              <p className="text-rose-300">
                Please make sure the backend server is running via{' '}
                <code className="bg-rose-900/60 px-1.5 py-0.5 rounded font-mono">npm run dev</code> in the{' '}
                <code className="font-mono">backend</code> directory and that your MongoDB service is active.
              </p>
            </div>
          </div>
        )}

        {/* 1. Dashboard Metrics Calculated from Database */}
        <MetricsBar summary={metrics.summary} isLoading={isLoading} />

        {/* 2. Analytical Charts: Top Sectors & Risk Distribution */}
        <ChartsSection
          categoryBreakdown={metrics.categoryBreakdown}
          riskDistribution={metrics.riskDistribution}
          isLoading={isLoading}
        />

        {/* 3. Transaction Management Console */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Monitored Transactions</span>
            </h2>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Rule-based telemetry evaluation • Click any transaction reference for full diagnostic details
            </span>
          </div>

          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            riskFilter={riskFilter}
            onRiskFilterChange={(val) => {
              setRiskFilter(val);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            onResetFilters={handleResetFilters}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            onQuickAction={handleQuickAction}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}

      {/* Simulate New Transaction Modal */}
      {isNewModalOpen && (
        <NewTransactionModal
          onClose={() => setIsNewModalOpen(false)}
          onSubmit={handleCreateTransaction}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FraudRadar Financial Intelligence Console • MERN Production Architecture</span>
          <span className="font-mono text-[11px] text-slate-400">
            Node.js • Express • MongoDB • React • Vite • Tailwind
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
