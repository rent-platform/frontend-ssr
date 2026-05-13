'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (typeof fallback === 'function') return fallback(error);
      if (fallback) return fallback;

      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--color-text-secondary, #64748b)',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
            Что-то пошло не так
          </h2>
          <p style={{ fontSize: '0.875rem' }}>
            Попробуйте обновить страницу
          </p>
        </div>
      );
    }

    return children;
  }
}
