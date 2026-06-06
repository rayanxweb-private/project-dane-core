import React from 'react';

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500">Total Settlement</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">IDR 0</h3>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500">Active Merchants</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">0</h3>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500">Success Rate</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">100%</h3>
      </div>
    </div>
  );
}
