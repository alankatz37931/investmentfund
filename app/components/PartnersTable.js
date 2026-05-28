const fmt = (n) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

export default function PartnersTable({ partners }) {
  if (!partners.length) {
    return <p className="text-sm text-slate-500">No hay socios registrados en este fondo.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="whitespace-nowrap px-4 py-3">Socio</th>
            <th className="whitespace-nowrap px-4 py-3">Capital aportado</th>
            <th className="whitespace-nowrap px-4 py-3">% del fondo</th>
            <th className="whitespace-nowrap px-4 py-3">Ganancia</th>
            <th className="whitespace-nowrap px-4 py-3">Valor actual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {partners.map((p) => {
            const positive = p.netPnl >= 0;
            return (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{p.name}</td>
                <td className="whitespace-nowrap px-4 py-3">{fmt(p.capitalContributed)}</td>
                <td className="whitespace-nowrap px-4 py-3">{p.shareOfFundPct.toFixed(2)}%</td>
                <td
                  className={`whitespace-nowrap px-4 py-3 font-semibold ${
                    positive ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {fmt(p.netPnl)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{fmt(p.currentValue)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
