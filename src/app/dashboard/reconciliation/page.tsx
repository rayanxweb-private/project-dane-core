'use client';

import React, { useState, useEffect } from 'react';
import { LucideCheckCircle, LucideAlertTriangle, LucideShieldAlert, LucideTrendingUp, LucideLayers, LucideDownload } from 'lucide-react';

interface ReconcileSummary {
  totalVolume: number;
  netRevenue: number;
  totalFeesCollected: number;
  discrepanciesCount: number;
  unsettledLogs: number;
}

export default function FinancialReconciliationModulePage() {
  const [metrics, setMetrics] = useState<ReconcileSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating internal microservice aggregation response payload fetch
    const fetchReconcileMetrics = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setMetrics({
        totalVolume: 4892500000,
        netRevenue: 4858252500,
        totalFeesCollected: 34247500, // 0.7% MDR mapping metrics accumulated
        discrepanciesCount: 0, // Clean non-repudiation verification check status state
        unsettledLogs: 14
      });
      setLoading(false);
    };
    fetchReconcileMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-4 bg-slate-950 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-800 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-800 rounded w-48"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-800 rounded col-span-2"></div>
                <div className="h-2 bg-slate-800 rounded col-span-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-950 text-slate-50 min-h-screen">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <LucideLayers className="h-6 w-6 text-indigo-500" />
            <span>Clearing Reconciliation & Audit Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Cross-check internal core transactional records ledger items against outbound settlement logs automatically.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
          <LucideDownload className="h-4 w-4 text-emerald-400" />
          <span>Export BI Compliance Report</span>
        </button>
      </div>

      {/* Numerical Analysis Stat Component Matrix Block */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Processing Volume (GPW)</p>
          <p className="text-2xl font-black text-slate-100">IDR {metrics?.totalVolume.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <LucideTrendingUp className="h-3 w-3" />
            <span>+14.2% dynamic growth spike vs previous period</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accumulated MDR Fees Managed Pool</p>
          <p className="text-2xl font-black text-indigo-400">IDR {metrics?.totalFeesCollected.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Evaluated on baseline ecosystem flat-rate index bounds.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Un-settled Queue Length</p>
          <p className="text-2xl font-black text-amber-500">{metrics?.unsettledLogs} <span className="text-xs font-normal text-slate-400">entries pending</span></p>
          <p className="text-[10px] text-slate-500">Scheduled for structural daemon resolution run cycle.</p>
        </div>
      </div>

      {/* Non-Repudiation Check Signposts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Realtime Compliance Status Verification Guard</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
            <LucideCheckCircle className="h-3 w-3" /> Fully Matched
          </span>
        </div>

        {metrics?.discrepanciesCount === 0 ? (
          <div className="flex items-start gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <LucideCheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Zero Ledger Discrepancies Discovered</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                The cryptographic double-entry system verified that all incoming settlement parameters align perfectly with the core DANA network authorization nodes. No structural leaks or transaction sequence breaks detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <LucideShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-300">Data Mismatch Detected In Ledger Pipeline Check</p>
              <p className="text-[11px] text-rose-400 mt-0.5">
                Immediate administrator mediation framework required. Some operational nodes report unexpected hash mutations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
            }
