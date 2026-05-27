'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function FundSelector({ funds, currentFundId }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (funds.length < 2) return null;

  function onChange(e) {
    const newFund = e.target.value;
    const sp = new URLSearchParams(params);
    sp.set('fund', newFund);
    startTransition(() => {
      router.push(`/?${sp.toString()}`);
      router.refresh();
    });
  }

  return (
    <select
      value={currentFundId}
      onChange={onChange}
      disabled={pending}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {funds.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}
