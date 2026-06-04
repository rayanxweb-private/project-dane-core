'use client';

import React from 'react';
import { KpiCards } from '@/components/kpi-cards';
import { MetricsCharts } from '@/components/metrics-charts';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { LucideShieldCheck, LucideActivity } from 'lucide-react';

export default function DashboardOverviewPage() {
  // Attach streaming connection pool straight to UI matrix frame
  const { metrics, liveLogs, isStreaming } = useRealtimeUpdates();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-950 text-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          DANA Enterprise Control Platform
        </h2>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm text-slate-400">
          <LucideActivity className={`h-4 w-4 text-emerald-400 ${isStreaming ? 'animate-pulse' : ''}`} />
          <span>Realtime Stream Network Operational</span>
        </div>
      </div>

      {/* KPI Section */}
      <KpiCards metrics={metrics} />

      {/* Analytics Recharts Visualization Frame Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <MetricsCharts className="col-span-4" />
        
        {/* Real-time Streaming Feed Block Container */}
        <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-semibold text-sm tracking-wide uppercase text-slate-400">Live Wire Ledger Streams</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
            {liveLogs.map((log: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/60 rounded-lg text-xs">
                <div>
                  <p className="font-mono text-slate-300 font-medium">{log.orderId}</p>
                  <p className="text-slate-500 mt-0.5">{new Date(log.updatedAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">IDR {log.amount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                    log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    log.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
