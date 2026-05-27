import Link from 'next/link';
import { notFound } from 'next/navigation';
import FundSettingsEditor from '../../components/FundSettingsEditor';
import PartnerEditor from '../../components/PartnerEditor';
import PositionEditor from '../../components/PositionEditor';
import { getFund, getPartners, getPositions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminFundPage({ params }) {
  const { fundId } = await params;
  const id = Number(fundId);

  const fund = await getFund(id);
  if (!fund) notFound();

  const [partners, positions] = await Promise.all([
    getPartners(id),
    getPositions(id),
  ]);

  const serializedFund = {
    ...fund,
    management_fee_pct: Number(fund.management_fee_pct),
    performance_fee_pct: Number(fund.performance_fee_pct),
  };
  const serializedPartners = partners.map((p) => ({
    ...p,
    capital_contributed: Number(p.capital_contributed),
  }));
  const serializedPositions = positions.map((p) => ({
    ...p,
    quantity: Number(p.quantity),
    avg_buy_price: Number(p.avg_buy_price),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{fund.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Configuración, LPs y posiciones</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/?fund=${id}`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Ver dashboard
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ← Todos los fondos
          </Link>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Configuración del fondo</h2>
        <FundSettingsEditor initialFund={serializedFund} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">LPs (Limited Partners)</h2>
        <p className="mb-4 text-sm text-slate-500">
          Estos son los socios cuyo capital se trackea. El manager (vos) no es
          LP — no aparece acá. El % del fondo se deriva del capital aportado.
        </p>
        <PartnerEditor initialPartners={serializedPartners} fundId={id} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Posiciones</h2>
        <p className="mb-4 text-sm text-slate-500">
          Tickers en mayúscula (AAPL, MSFT, etc.). El precio promedio es el costo
          base por acción.
        </p>
        <PositionEditor initialPositions={serializedPositions} fundId={id} />
      </section>
    </main>
  );
}
