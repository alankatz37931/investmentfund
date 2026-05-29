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

function Row({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={`text-sm font-semibold text-slate-900 ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}

export default function QuarterlyReport({ data }) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const qNum = Math.floor(now.getMonth() / 3) + 1;
  const quarter = `Q${qNum} ${now.getFullYear()} (${QUARTER_MONTHS[qNum - 1]})`;

  const hasMultiplePartners = data.partners.length > 1;
  const hasPerformanceFee = data.fund.performanceFeePct > 0;
  const hasManagementFee = data.fund.managementFeePct > 0;
  const grossPositive = data.totals.grossPnl >= 0;

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
        <div className="mt-6 space-y-5">
          <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-slate-50/60 ring-1 ring-slate-200">
            <Row
              label="Valor del fondo"
              value={fmt(data.totals.totalFundValue)}
            />
            <Row
              label="Capital inicial"
              value={fmt(data.totals.totalLpCapital)}
            />
            <Row
              label="Ganancia bruta"
              value={
                <span>
                  <span
                    className={`mr-2 text-xs font-normal ${
                      grossPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {fmtPct(data.totals.grossPnlPct)}
                  </span>
                  <span
                    className={grossPositive ? 'text-emerald-700' : 'text-red-700'}
                  >
                    {fmt(data.totals.grossPnl)}
                  </span>
                </span>
              }
            />
            {hasPerformanceFee && (
              <Row
                label="Ganancia para socios"
                value={fmt(data.totals.netPnlForLps)}
              />
            )}
            {hasManagementFee && (
              <Row
                label={`Comisión anual (${data.fund.managementFeePct}%)`}
                value={fmt(data.totals.annualManagementFee)}
              />
            )}
            {!hasMultiplePartners && data.partners[0] && (
              <Row
                label="Disponible para retirar"
                value={
                  <span className="text-emerald-700">
                    {fmt(data.partners[0].currentValue)}
                  </span>
                }
              />
            )}
          </dl>

          {hasMultiplePartners && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Disponible para retirar
              </h3>
              <dl className="divide-y divide-emerald-100 overflow-hidden rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                {data.partners.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-baseline justify-between gap-4 px-4 py-3"
                  >
                    <dt className="text-sm">
                      <span className="font-semibold text-emerald-900">{p.name}</span>
                      <span className="ml-2 text-xs text-emerald-700/70">
                        {p.shareOfFundPct.toFixed(2)}%
                      </span>
                    </dt>
                    <dd className="text-base font-bold text-emerald-700">
                      {fmt(p.currentValue)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <p className="text-right text-xs text-slate-400">
            Generado el {new Date(data.generatedAt).toLocaleString('es-ES')}
          </p>
        </div>
      )}
    </div>
  );
}
