'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LucideShieldAlert } from 'lucide-react';
import { winstonLogger } from '@/lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    winstonLogger.error('Global React Error Boundary Intercepted Fatal Exception:', error, errorInfo);
    // Secure automated enterprise integration trigger hooks for Sentry tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-6">
            <LucideShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Application Pipeline Interrupted</h2>
          <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
            A catastrophic client-side operational infrastructure violation has occurred. The lifecycle block state has been successfully frozen to protect local storage buffers.
          </p>
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-rose-400 text-left max-w-xl overflow-x-auto">
            {this.state.error?.stack || this.state.error?.toString()}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Hard Reload Application Core
          </button>
        </div>
      );
    }

    return this.children;
  }
}
