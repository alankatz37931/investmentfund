'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n) =>
  Number(n).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

export default function PartnerEditor({ initialPartners, fundId }) {
  const [partners, setPartners] = useState(initialPartners);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newForm, setNewForm] = useState({ name: '', capital_contributed: '' });
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const totalCapital = partners.reduce(
    (acc, p) => acc + Number(p.capital_contributed),
    0
  );

  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({ name: p.name, capital_contributed: p.capital_contributed });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    setBusy(true);
    const res = await fetch(`/api/partners/${id}`, {
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
    setPartners(
      partners.map((p) =>
        p.id === id
          ? { ...updated, capital_contributed: Number(updated.capital_contributed) }
          : p
      )
    );
    cancelEdit();
    router.refresh();
  }

  async function deleteRow(id) {
    if (!confirm('¿Eliminar este socio? No se puede deshacer.')) return;
    setBusy(true);
    const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      alert('Error al eliminar');
      return;
    }
    setPartners(partners.filter((p) => p.id !== id));
    router.refresh();
  }

  async function createNew(e) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/partners', {
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
    setPartners([
      ...partners,
      { ...created, capital_contributed: Number(created.capital_contributed) },
    ]);
    setNewForm({ name: '', capital_contributed: '' });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Capital aportado</th>
              <th className="px-4 py-3">% del fondo (calc.)</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {partners.map((p) => {
              const sharePct =
                totalCapital > 0
                  ? (Number(p.capital_contributed) / totalCapital) * 100
                  : 0;
              return editingId === p.id ? (
                <tr key={p.id} className="bg-amber-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.capital_contributed}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          capital_contributed: e.target.value,
                        })
                      }
                      className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-400">auto</td>
                  <td className="space-x-2 px-4 py-3 text-right">
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
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">{fmt(p.capital_contributed)}</td>
                  <td className="px-4 py-3 text-slate-600">{sharePct.toFixed(2)}%</td>
                  <td className="space-x-2 px-4 py-3 text-right">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 text-xs">
            <tr>
              <td className="px-4 py-2 font-semibold text-slate-500">Total</td>
              <td className="px-4 py-2 font-semibold text-slate-700">
                {fmt(totalCapital)}
              </td>
              <td className="px-4 py-2 text-slate-400">100.00%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form
        onSubmit={createNew}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Agregar socio
        </h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <input
            type="text"
            required
            placeholder="Nombre"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            required
            step="0.01"
            placeholder="Capital aportado"
            value={newForm.capital_contributed}
            onChange={(e) =>
              setNewForm({ ...newForm, capital_contributed: e.target.value })
            }
            className="w-40 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          El % del fondo se calcula automáticamente como capital aportado /
          capital total. No es editable manualmente.
        </p>
      </form>
    </div>
  );
}
