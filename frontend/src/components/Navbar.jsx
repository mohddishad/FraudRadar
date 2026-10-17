import React from 'react';
import { ShieldAlert, RefreshCw, PlusCircle, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Navbar = ({
  isConnected,
  onRefresh,
  isLoading,
  onOpenNewModal,
  onSeedDemo,
  isSeeding,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  FraudRadar
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Ops v1.2
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Transparent Rule-Based Transaction Monitoring & Analyst Console
              </p>
            </div>
          </div>

          {/* Mobile Connection Pill */}
          <div className="sm:hidden">
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-950/60 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Center / Right Control Panel */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">DB:</span>
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                MongoDB Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Database Unreachable
              </span>
            )}
          </div>

          {/* Seed Demo Button */}
          <button
            type="button"
            onClick={onSeedDemo}
            disabled={isSeeding || isLoading}
            title="Seed 18 realistic sample transactions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh database records and metrics"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Transaction Button */}
          <button
            type="button"
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
