// src/components/error/error-boundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // BSP 1019 — Log errors for monitoring
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.error != null) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error);
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}
