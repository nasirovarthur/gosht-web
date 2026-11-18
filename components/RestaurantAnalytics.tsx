'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { flushPendingRestaurantActions, recordRestaurantAnalyticsPath, trackRestaurantLink } from '@/lib/analytics/restaurant-actions';

export default function RestaurantAnalytics() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(() => {
    recordRestaurantAnalyticsPath(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => trackRestaurantLink(event, lang);
    window.addEventListener('gosht:analytics-ready', flushPendingRestaurantActions);
    flushPendingRestaurantActions();
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
    return () => {
      window.removeEventListener('gosht:analytics-ready', flushPendingRestaurantActions);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
    };
  }, [lang]);

  return null;
}
