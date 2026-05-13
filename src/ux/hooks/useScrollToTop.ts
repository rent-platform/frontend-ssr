'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks scroll position and provides a scroll-to-top handler.
 * Shows the button when scrollY exceeds the given threshold (default 600px).
 */
export function useScrollToTop(threshold = 600) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { visible, scrollToTop };
}
