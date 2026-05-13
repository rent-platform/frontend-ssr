'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DevUiError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[dev-ui error]', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        gap: '1rem',
        fontFamily: 'var(--font-body, Inter, sans-serif)',
        color: 'var(--color-text, #0f172a)',
      }}
    >
      <AlertTriangle size={40} style={{ color: 'var(--color-secondary, #f43f5e)' }} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
        Что-то пошло не так
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
        Произошла ошибка при отображении страницы
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--color-primary, #22c55e)',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        <RefreshCw size={16} />
        Попробовать снова
      </button>
    </div>
  );
}
