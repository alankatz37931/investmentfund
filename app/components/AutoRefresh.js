'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshPortfolio } from '../actions/refresh';

/**
 * Refresca el portfolio en background cada `intervalMs` ms (default 60s).
 * Salta el tick si la pestaña no está visible — ahorra llamadas a Alpaca
 * cuando la app está en background del teléfono.
 */
export default function AutoRefresh({ intervalMs = 60000 }) {
  const router = useRouter();

  useEffect(() => {
    async function tick() {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }
      try {
        await refreshPortfolio();
        router.refresh();
      } catch (err) {
        console.error('[AutoRefresh] tick failed:', err);
      }
    }

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
