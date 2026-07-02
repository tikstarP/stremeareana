import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 max-w-md w-full text-center">
            <div className="text-4xl mb-4">💥</div>
            <h2 className="font-display text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-red-400 mb-2 font-mono">{this.state.error?.message}</p>
            <p className="text-xs text-neutral-500 mb-4 font-mono text-left whitespace-pre-wrap max-h-32 overflow-y-auto">{this.state.error?.stack}</p>
            <button onClick={() => window.location.reload()}
              className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
