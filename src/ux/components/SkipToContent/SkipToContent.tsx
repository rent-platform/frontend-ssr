'use client';

import { useCallback } from 'react';

const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: 9999,
};

export function SkipToContent() {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    Object.assign(e.currentTarget.style, {
      position: 'fixed',
      left: '16px',
      top: '16px',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
      padding: '12px 24px',
      background: '#22c55e',
      color: '#fff',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      textDecoration: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    });
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    Object.assign(e.currentTarget.style, {
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });
  }, []);

  return (
    <a
      href="#main-content"
      style={hiddenStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Перейти к содержимому
    </a>
  );
}
