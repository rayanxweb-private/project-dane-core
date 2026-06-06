import React from 'react';

export default function MetricsCharts() {
  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-slate-100 my-4">
      <p className="text-sm font-medium text-slate-500 mb-2">Transaction Volume Metrics</p>
      <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
        <span className="text-xs text-slate-400">Chart Visualization Engine Sandbox Mode</span>
      </div>
    </div>
  );
}
