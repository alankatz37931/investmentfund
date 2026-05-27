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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Valor del fondo</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {fmt(totals.totalMarketValue)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Capital socios: {fmt(totals.totalLpCapital)}
        </p>
      </div>

      <div className={`rounded-2xl ${pnlBg} p-6 shadow-sm ring-1 ${pnlRing}`}>
        <p className="text-sm font-medium text-slate-600">Ganancia bruta</p>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${pnlColor}`}>
          {fmt(totals.grossPnl)}
        </p>
        <p className={`mt-1 text-xs font-semibold ${pnlColor}`}>
          {fmtPct(totals.grossPnlPct)} sobre capital aportado
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-slate-300">
          Tu comisión ({fund.performanceFeePct}%)
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {fmt(totals.performanceFee)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {totals.performanceFee > 0
            ? 'Sobre la ganancia positiva'
            : 'Sin ganancias → sin comisión'}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Para socios</p>
        <p
          className={`mt-2 text-3xl font-bold tracking-tight ${
            totals.netPnlForLps >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {fmt(totals.netPnlForLps)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Ganancia bruta − tu comisión</p>
      </div>
    </div>
  );
}
