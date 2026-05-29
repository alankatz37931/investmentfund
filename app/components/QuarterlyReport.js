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

function joinNames(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

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

  const hasManager = data.fund.hasManagerPartner;
  const visiblePartners = data.partners.filter((p) => !p.isManager);
  const hasMultipleVisible = visiblePartners.length > 1;
  const hasPerformanceFee = data.fund.performanceFeePct > 0;
  const hasManagementFee = data.fund.managementFeePct > 0;

  // Totales que se muestran en el reporte:
  //  - Si NO hay gerente partner → totales del fondo entero
  //  - Si hay gerente partner    → totales solo de los socios visibles (no gerente)
  const reportCapital = hasManager
    ? visiblePartners.reduce((acc, p) => acc + p.capitalContributed, 0)
    : data.totals.totalLpCapital;

  const reportCurrentValue = hasManager
    ? visiblePartners.reduce((acc, p) => acc + p.currentValue, 0)
    : data.totals.totalFundValue;

  // "Ganancia bruta" mostrada = ganancia sobre el capital visible.
  // Sin gerente: igual al grossPnl del fondo.
  // Con gerente: la ganancia bruta atribuible a los socios = sum de (pro-rata - fee paid + fee paid)
  //              = ganancia pre-fee de la porción LP del fondo.
  const lpProRataGross = hasManager
    ? data.totals.grossPnl * (reportCapital / (data.totals.totalLpCapital || 1))
    : data.totals.grossPnl;
  const reportGrossPnlPct =
    reportCapital > 0 ? (lpProRataGross / reportCapital) * 100 : 0;

  // Ganancia neta para socios = sumatoria de netPnl de socios visibles
  const reportNetPnlForVisible = visiblePartners.reduce(
    (acc, p) => acc + p.netPnl,
    0
  );

  const grossPositive = lpProRataGross >= 0;

  const partnersLabel = joinNames(visiblePartners.map((p) => p.name));

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">Reporte trimestral</h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            {data.fund.name} — {quarter}
          </p>
          {partnersLabel && (
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Para <strong>{partnersLabel}</strong>
            </p>
          )}
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
            {!hasManager && (
              <Row
                label="Valor del fondo"
                value={fmt(data.totals.totalFundValue)}
              />
            )}
            <Row label="Capital inicial" value={fmt(reportCapital)} />
            <Row
              label="Ganancia bruta"
              value={
                <span>
                  <span
                    className={`mr-2 text-xs font-normal ${
                      grossPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {fmtPct(reportGrossPnlPct)}
                  </span>
                  <span
                    className={
                      grossPositive ? 'text-emerald-700' : 'text-red-700'
                    }
                  >
                    {fmt(lpProRataGross)}
                  </span>
                </span>
              }
            />
            {hasPerformanceFee && (
              <Row
                label="Ganancia para socios"
                value={fmt(reportNetPnlForVisible)}
              />
            )}
            {hasManagementFee && !hasManager && (
              <Row
                label={`Comisión anual (${data.fund.managementFeePct}%)`}
                value={fmt(data.totals.annualManagementFee)}
              />
            )}
            {!hasMultipleVisible && visiblePartners[0] && (
              <Row
                label="Disponible para retirar"
                value={
                  <span className="text-emerald-700">
                    {fmt(visiblePartners[0].currentValue)}
                  </span>
                }
              />
            )}
          </dl>

          {hasMultipleVisible && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Distribución entre socios
              </h3>
              {visiblePartners.map((p) => {
                const positive = p.netPnl >= 0;
                return (
                  <div key={p.id}>
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {p.shareOfFundPct.toFixed(2)}% del fondo
                      </span>
                    </p>
                    <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-slate-50/60 ring-1 ring-slate-200">
                      <Row
                        label="Capital inicial"
                        value={fmt(p.capitalContributed)}
                      />
                      <Row
                        label="Ganancia"
                        value={
                          <span
                            className={
                              positive ? 'text-emerald-700' : 'text-red-700'
                            }
                          >
                            {fmt(p.netPnl)}
                          </span>
                        }
                      />
                      <Row
                        label="Disponible para retirar"
                        value={
                          <span className="text-emerald-700">
                            {fmt(p.currentValue)}
                          </span>
                        }
                      />
                    </dl>
                  </div>
                );
              })}
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
