'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n) =>
  Number(n).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

export default function PositionEditor({ initialPositions, fundId }) {
  const [positions, setPositions] = useState(initialPositions);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newForm, setNewForm] = useState({
    ticker: '',
    quantity: '',
    avg_buy_price: '',
  });
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({
      ticker: p.ticker,
      quantity: p.quantity,
      avg_buy_price: p.avg_buy_price,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    setBusy(true);
    const res = await fetch(`/api/positions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert('Error al guardar: ' + (data.error || res.status));
      return;
    }
    const updated = await res.json();
    setPositions(
      positions.map((p) =>
        p.id === id
          ? {
              ...updated,
              quantity: Number(updated.quantity),
              avg_buy_price: Number(updated.avg_buy_price),
            }
          : p
      )
    );
    cancelEdit();
    router.refresh();
  }

  async function deleteRow(id) {
    if (!confirm('¿Eliminar esta posición? Esta acción no se puede deshacer.'))
      return;
    setBusy(true);
    const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      alert('Error al eliminar');
      return;
    }
    setPositions(positions.filter((p) => p.id !== id));
    router.refresh();
  }

  async function createNew(e) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, fund_id: fundId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert('Error al crear: ' + (data.error || res.status));
      return;
    }
    const created = await res.json();
    setPositions([
      ...positions,
      {
        ...created,
        quantity: Number(created.quantity),
        avg_buy_price: Number(created.avg_buy_price),
      },
    ]);
    setNewForm({ ticker: '', quantity: '', avg_buy_price: '' });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">Ticker</th>
              <th className="whitespace-nowrap px-4 py-3">Cantidad</th>
              <th className="whitespace-nowrap px-4 py-3">Precio promedio</th>
              <th className="whitespace-nowrap px-4 py-3">Costo base</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {positions.map((p) =>
              editingId === p.id ? (
                <tr key={p.id} className="bg-amber-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="text"
                      value={editForm.ticker}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          ticker: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm font-semibold uppercase"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      step="0.0001"
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: e.target.value })
                      }
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      step="0.0001"
                      value={editForm.avg_buy_price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          avg_buy_price: e.target.value,
                        })
                      }
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {fmt(
                      Number(editForm.quantity || 0) *
                        Number(editForm.avg_buy_price || 0)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1.5">
                      <button
                        disabled={busy}
                        onClick={() => saveEdit(p.id)}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">{p.ticker}</td>
                  <td className="whitespace-nowrap px-4 py-3">{Number(p.quantity)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{fmt(p.avg_buy_price)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {fmt(Number(p.quantity) * Number(p.avg_buy_price))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1.5">
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteRow(p.id)}
                        className="rounded border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={createNew}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Agregar posición
        </h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <input
            type="text"
            required
            placeholder="Ticker (ej. AAPL)"
            value={newForm.ticker}
            onChange={(e) =>
              setNewForm({ ...newForm, ticker: e.target.value.toUpperCase() })
            }
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold uppercase sm:w-32"
          />
          <input
            type="number"
            required
            step="0.0001"
            placeholder="Cantidad"
            value={newForm.quantity}
            onChange={(e) =>
              setNewForm({ ...newForm, quantity: e.target.value })
            }
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-32"
          />
          <input
            type="number"
            required
            step="0.0001"
            placeholder="Precio promedio"
            value={newForm.avg_buy_price}
            onChange={(e) =>
              setNewForm({ ...newForm, avg_buy_price: e.target.value })
            }
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-40"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 sm:w-auto"
          >
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
}
