const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function MetricsCard({ totals }) {
  const positive = totals.totalPnl >= 0;
  const pnlColor = positive ? 'text-emerald-600' : 'text-red-600';
  const pnlBg = positive ? 'bg-emerald-50' : 'bg-red-50';
  const pnlRing = positive ? 'ring-emerald-200' : 'ring-red-200';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Valor total del fondo</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {fmt(totals.totalMarketValue)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Capital inicial: {fmt(totals.totalCapital)}
        </p>
      </div>

      <div className={`rounded-2xl ${pnlBg} p-6 shadow-sm ring-1 ${pnlRing}`}>
        <p className="text-sm font-medium text-slate-600">P&amp;L Absoluto</p>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${pnlColor}`}>
          {fmt(totals.totalPnl)}
        </p>
        <p className={`mt-1 text-xs font-semibold ${pnlColor}`}>
          {fmtPct(totals.totalPnlPct)}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Costo base</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{fmt(totals.totalCost)}</p>
        <p className="mt-1 text-xs text-slate-400">
          Suma de compras a precio promedio
        </p>
      </div>
    </div>
  );
}
