'use client';

import { useState } from 'react';

const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

const QUARTER_MONTHS = [
  'enero – marzo',
  'abril – junio',
  'julio – septiembre',
  'octubre – diciembre',
];

export default function QuarterlyReport({ data }) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const qNum = Math.floor(now.getMonth() / 3) + 1;
  const quarter = `Q${qNum} ${now.getFullYear()} (${QUARTER_MONTHS[qNum - 1]})`;

  const hasMultiplePartners = data.partners.length > 1;
  const hasPerformanceFee = data.fund.performanceFeePct > 0;
  const hasManagementFee = data.fund.managementFeePct > 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">Reporte trimestral</h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            {data.fund.name} — {quarter}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
        >
          {open ? 'Ocultar reporte' : 'Ver reporte'}
        </button>
      </div>

      {open && (
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resumen ejecutivo
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                Valor del fondo:{' '}
                <strong>{fmt(data.totals.totalFundValue)}</strong>
              </li>
              <li>
                Capital inicial:{' '}
                <strong>{fmt(data.totals.totalLpCapital)}</strong>
              </li>
              <li>
                Ganancia bruta:{' '}
                <strong>
                  {fmt(data.totals.grossPnl)} ({fmtPct(data.totals.grossPnlPct)})
                </strong>
              </li>
              {hasPerformanceFee && (
                <li>
                  Ganancia para socios:{' '}
                  <strong>{fmt(data.totals.netPnlForLps)}</strong>
                </li>
              )}
              {hasManagementFee && (
                <li>
                  Comisión anual ({data.fund.managementFeePct}%):{' '}
                  <strong>{fmt(data.totals.annualManagementFee)}</strong>
                </li>
              )}
            </ul>
          </section>

          {hasMultiplePartners && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Distribución por socio
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.partners.map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong> ({p.shareOfFundPct.toFixed(2)}%) →
                    Ganancia: <strong>{fmt(p.netPnl)}</strong> · Valor actual:{' '}
                    {fmt(p.currentValue)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">
            Reporte generado el {new Date(data.generatedAt).toLocaleString('es-ES')}
          </p>
        </div>
      )}
    </div>
  );
}
