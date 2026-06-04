'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LucideAlertOctagon, LucideRefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorDetail: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorDetail: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorDetail: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production environment context, hook outbound metrics trackers like Sentry or LogRocket here
    console.error('Fatal Core UI Interception exception routed:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="inline-block p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full">
              <LucideAlertOctagon className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Core Dashboard Thread Exception</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unhandled runtime operation boundary crash occurred inside the active view container block matrix.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-left overflow-x-auto max-h-32">
              <p className="font-mono text-[10px] text-rose-400 whitespace-pre-wrap leading-normal">
                {this.state.errorDetail || 'Fatal Unknown Assembly Execution Interruption Block Token'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-2.5 rounded-lg transition-all"
            >
              <LucideRefreshCw className="h-3.5 w-3.5" />
              <span>Hot-Reload Application Terminal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
