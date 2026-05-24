'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    va?: (action: string, options: { name: string; data: { type: string | null } }) => void;
  }
}

export default function BlogTracking() {
  useEffect(() => {
    const handleCTAClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cta = target.closest('[data-cta]');
      if (cta) {
        const ctaType = cta.getAttribute('data-cta');
        if (window.va) {
          window.va('event', { name: 'blog_cta_click', data: { type: ctaType } });
        }
        console.log('CTA Clicked:', ctaType);
      }
    };

    document.addEventListener('click', handleCTAClick);
    return () => document.removeEventListener('click', handleCTAClick);
  }, []);

  return null;
}
