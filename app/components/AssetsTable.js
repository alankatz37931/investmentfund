const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function AssetsTable({ positions }) {
  if (!positions.length) {
    return (
      <p className="text-sm text-slate-500">No hay posiciones abiertas todavía.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="whitespace-nowrap px-4 py-3">Ticker</th>
            <th className="whitespace-nowrap px-4 py-3">Cantidad</th>
            <th className="whitespace-nowrap px-4 py-3">Precio Avg</th>
            <th className="whitespace-nowrap px-4 py-3">Precio Actual</th>
            <th className="whitespace-nowrap px-4 py-3">Día %</th>
            <th className="whitespace-nowrap px-4 py-3">Valor Mercado</th>
            <th className="whitespace-nowrap px-4 py-3">Ganancia</th>
            <th className="whitespace-nowrap px-4 py-3">Ganancia %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {positions.map((p) => {
            const positive = p.pnl >= 0;
            const dayPositive = p.dayChangePct >= 0;
            return (
              <tr key={p.ticker} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{p.ticker}</td>
                <td className="whitespace-nowrap px-4 py-3">{p.quantity}</td>
                <td className="whitespace-nowrap px-4 py-3">{fmt(p.avgBuyPrice)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{fmt(p.currentPrice)}</td>
                <td
                  className={`whitespace-nowrap px-4 py-3 ${
                    dayPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {fmtPct(p.dayChangePct)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{fmt(p.marketValue)}</td>
                <td
                  className={`whitespace-nowrap px-4 py-3 font-semibold ${
                    positive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {fmt(p.pnl)}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 ${
                    positive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {fmtPct(p.pnlPct)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
