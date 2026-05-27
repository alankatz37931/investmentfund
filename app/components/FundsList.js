'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FundsList({ initialFunds }) {
  const [funds, setFunds] = useState(initialFunds);
  const [newForm, setNewForm] = useState({
    name: '',
    management_fee_pct: 0,
    performance_fee_pct: 20,
  });
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function createNew(e) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert('Error al crear: ' + (data.error || res.status));
      return;
    }
    const created = await res.json();
    setFunds([...funds, created]);
    setNewForm({ name: '', management_fee_pct: 0, performance_fee_pct: 20 });
    router.refresh();
  }

  async function deleteFund(id) {
    if (
      !confirm(
        '¿Eliminar este fondo? Esto borra TODOS sus LPs, posiciones y transacciones. Irreversible.'
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/funds/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      alert('Error al eliminar');
      return;
    }
    setFunds(funds.filter((f) => f.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Fondo</th>
              <th className="px-4 py-3">Management fee</th>
              <th className="px-4 py-3">Performance fee</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {funds.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{f.name}</td>
                <td className="px-4 py-3">
                  {Number(f.management_fee_pct).toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  {Number(f.performance_fee_pct).toFixed(2)}%
                </td>
                <td className="space-x-2 px-4 py-3 text-right">
                  <Link
                    href={`/admin/${f.id}`}
                    className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Administrar
                  </Link>
                  <Link
                    href={`/?fund=${f.id}`}
                    className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Ver dashboard
                  </Link>
                  <button
                    disabled={busy}
                    onClick={() => deleteFund(f.id)}
                    className="rounded border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={createNew}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Crear nuevo fondo
        </h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <input
            type="text"
            required
            placeholder="Nombre del fondo"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            className="flex-1 min-w-[200px] rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="block text-xs text-slate-500">Mgmt fee %</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              max="100"
              value={newForm.management_fee_pct}
              onChange={(e) =>
                setNewForm({ ...newForm, management_fee_pct: e.target.value })
              }
              className="w-24 rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Perf fee %</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              max="100"
              value={newForm.performance_fee_pct}
              onChange={(e) =>
                setNewForm({ ...newForm, performance_fee_pct: e.target.value })
              }
              className="w-24 rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Crear fondo
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Convención: 0/20 = sin management fee, 20% sobre ganancias. Editables luego.
        </p>
      </form>
    </div>
  );
}
