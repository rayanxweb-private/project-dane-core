'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockAnalyticsData = [
  { name: '00:00', Revenue: 40000000 },
  { name: '04:00', Revenue: 120000000 },
  { name: '08:00', Revenue: 540000000 },
  { name: '12:00', Revenue: 980000000 },
  { name: '16:00', Revenue: 870000000 },
  { name: '20:00', Revenue: 1240000000 },
];

export function MetricsCharts({ className }: { className?: string }) {
  return (
    <div className={`p-6 rounded-xl border border-slate-800 bg-slate-900 ${className}`}>
      <div className="flex flex-col space-y-1.5 pb-6">
        <h3 className="font-semibold text-base text-slate-200">Revenue Velocity Flow</h3>
        <p className="text-xs text-slate-500">Continuous 24-Hour continuous liquidity volume trajectory mapping.</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockAnalyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
              itemStyle={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
