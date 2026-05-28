'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { refreshPortfolio } from '../actions/refresh';

export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await refreshPortfolio();
      router.refresh();
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
    >
      <span className={pending ? 'inline-block animate-spin' : 'inline-block'}>↻</span>
      {pending ? 'Actualizando…' : 'Actualizar'}
    </button>
  );
}
