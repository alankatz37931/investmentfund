const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function MetricsCard({ totals, fund }) {
  const positive = totals.grossPnl >= 0;
  const pnlColor = positive ? 'text-emerald-600' : 'text-red-600';
  const pnlBg = positive ? 'bg-emerald-50' : 'bg-red-50';
  const pnlRing = positive ? 'ring-emerald-200' : 'ring-red-200';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <p className="text-sm font-medium text-slate-500">Valor del fondo</p>
        <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {fmt(totals.totalFundValue)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Posiciones {fmt(totals.positionsMarketValue)} · Cash {fmt(totals.cashBalance)}
        </p>
        <p className="text-xs text-slate-400">
          Capital socios: {fmt(totals.totalLpCapital)}
        </p>
      </div>

      <div className={`rounded-2xl ${pnlBg} p-5 shadow-sm ring-1 ${pnlRing} sm:p-6`}>
        <p className="text-sm font-medium text-slate-500">Ganancia bruta</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${pnlColor}`}>
          {fmt(totals.grossPnl)}
        </p>
        <p className={`mt-1 text-xs font-semibold ${pnlColor}`}>
          {fmtPct(totals.grossPnlPct)}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <p className="text-sm font-medium text-slate-500">
          Tu comisión ({fund.performanceFeePct}%)
        </p>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${
            totals.performanceFee > 0 ? 'text-emerald-600' : 'text-slate-900'
          }`}
        >
          {fmt(totals.performanceFee)}
        </p>
        <p
          className={`mt-1 text-xs font-semibold ${
            totals.performanceFee > 0 ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {totals.totalLpCapital > 0
            ? fmtPct((totals.performanceFee / totals.totalLpCapital) * 100)
            : '—'}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <p className="text-sm font-medium text-slate-500">Para socios</p>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${
            totals.netPnlForLps >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {fmt(totals.netPnlForLps)}
        </p>
        <p
          className={`mt-1 text-xs font-semibold ${
            totals.netPnlForLps >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {totals.totalLpCapital > 0
            ? fmtPct((totals.netPnlForLps / totals.totalLpCapital) * 100)
            : '—'}
        </p>
      </div>
    </div>
  );
}
