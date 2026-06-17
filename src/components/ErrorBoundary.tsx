'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.name || 'Component'} caught an error:`, error, errorInfo);
  }

  public handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return (this.props.fallback as (error: Error, reset: () => void) => ReactNode)(
            this.state.error,
            this.handleReset
          );
        }
        return this.props.fallback;
      }

      // Default beautiful fallback UI matching the dashboard style
      return (
        <div className="p-6 rounded-2xl border border-rose-500/20 bg-neutral-900/40 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {this.props.name ? `"${this.props.name}" Yüklenemedi` : 'Modül Yüklenemedi'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Bu bölüm yüklenirken beklenmeyen bir hata oluştu.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" />
              </svg>
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
