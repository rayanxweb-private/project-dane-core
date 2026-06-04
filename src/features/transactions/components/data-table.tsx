'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import { LucideChevronLeft, LucideChevronRight, LucideDownload } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/export';

interface EnterpriseDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
}

export function EnterpriseDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPageChange
}: EnterpriseDataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      const nextState = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(nextState);
      onPageChange(nextState.pageIndex);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-xl">
        <input 
          placeholder="Global system parameters tracking search..."
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 w-80 focus:outline-none focus:border-blue-500"
        />
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => exportToExcel(data)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
          >
            <LucideDownload className="h-3.5 w-3.5" />
            <span>Excel Ledger Report</span>
          </button>
          <button 
            onClick={() => exportToPDF(data)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
          >
            <LucideDownload className="h-3.5 w-3.5" />
            <span>PDF Operational Audit</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-slate-800 bg-slate-950/40">
                {hg.headers.map((h) => (
                  <th key={h.id} className="p-4 text-xs font-bold text-slate-400 tracking-wider uppercase">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-850/40 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 text-xs font-medium text-slate-300 max-w-[240px] truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-slate-500">
          Page {pagination.pageIndex + 1} of {pageCount || 1} pages
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 text-slate-300"
          >
            <LucideChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 text-slate-300"
          >
            <LucideChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
        }
