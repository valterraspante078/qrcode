'use client';

import { useEffect } from 'react';

export default function BlogTracking() {
  useEffect(() => {
    const handleCTAClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cta = target.closest('[data-cta]');
      if (cta) {
        const ctaType = cta.getAttribute('data-cta');
        window.va?.('event', { name: 'blog_cta_click', data: { type: ctaType } });
      }
    };

    document.addEventListener('click', handleCTAClick);
    return () => document.removeEventListener('click', handleCTAClick);
  }, []);

  return null;
}
