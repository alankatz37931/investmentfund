'use client';

import { useState } from 'react';

const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function QuarterlyReport({ data }) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const quarter = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Reporte trimestral</h2>
          <p className="text-sm text-slate-500">
            Estructura del informe para socios — {quarter}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {open ? 'Ocultar reporte' : 'Ver reporte'}
        </button>
      </div>

      {open && (
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              1. Resumen ejecutivo
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                Valor total del fondo:{' '}
                <strong>{fmt(data.totals.totalMarketValue)}</strong>
              </li>
              <li>
                Capital inicial agregado:{' '}
                <strong>{fmt(data.totals.totalCapital)}</strong>
              </li>
              <li>
                P&amp;L del período:{' '}
                <strong>
                  {fmt(data.totals.totalPnl)} ({fmtPct(data.totals.totalPnlPct)})
                </strong>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              2. Posiciones abiertas ({data.positions.length})
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {data.positions.map((p) => (
                <li key={p.ticker}>
                  <strong>{p.ticker}</strong> — {p.quantity} unid. ·{' '}
                  {fmt(p.marketValue)} ({fmtPct(p.pnlPct)})
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              3. Distribución a socios
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {data.partners.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong> ({p.participationPct.toFixed(2)}%) →
                  Ganancia: <strong>{fmt(p.pnl)}</strong> · Valor actual:{' '}
                  {fmt(p.currentValue)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              4. Notas del gestor
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Espacio para comentarios cualitativos: tesis del trimestre, ajustes
              de exposición, cambios estratégicos y outlook del próximo período.
            </p>
          </section>

          <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">
            Reporte generado el {new Date(data.generatedAt).toLocaleString('es-ES')} ·
            Investment Fund
          </p>
        </div>
      )}
    </div>
  );
}
