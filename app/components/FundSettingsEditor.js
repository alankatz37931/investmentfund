'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FundSettingsEditor({ initialFund }) {
  const [form, setForm] = useState({
    name: initialFund.name,
    management_fee_pct: Number(initialFund.management_fee_pct),
    performance_fee_pct: Number(initialFund.performance_fee_pct),
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const res = await fetch(`/api/funds/${initialFund.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert('Error al guardar: ' + (data.error || res.status));
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form
      onSubmit={save}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nombre del fondo
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Management fee anual (%)
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            max="100"
            value={form.management_fee_pct}
            onChange={(e) =>
              setForm({ ...form, management_fee_pct: e.target.value })
            }
            className="mt-1 w-32 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">% del AUM por año</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Performance fee (%)
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            max="100"
            value={form.performance_fee_pct}
            onChange={(e) =>
              setForm({ ...form, performance_fee_pct: e.target.value })
            }
            className="mt-1 w-32 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">% de ganancias positivas</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
        {saved && (
          <span className="mt-7 text-sm font-semibold text-emerald-600">✓ Guardado</span>
        )}
      </div>
    </form>
  );
}
