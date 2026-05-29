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
    cash_balance: Number(fund.cash_balance) || 0,
  };
  const serializedPartners = partners.map((p) => ({
    ...p,
    capital_contributed: Number(p.capital_contributed),
    is_manager: !!p.is_manager,
  }));
  const serializedPositions = positions.map((p) => ({
    ...p,
    quantity: Number(p.quantity),
    avg_buy_price: Number(p.avg_buy_price),
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{fund.name}</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Configuración, socios y posiciones
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
          Configuración del fondo
        </h2>
        <FundSettingsEditor initialFund={serializedFund} />
      </section>

      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Socios</h2>
        <p className="mb-4 text-xs text-slate-500 sm:text-sm">
          Personas cuyo capital se trackea. Vos como manager no aparecés acá. El %
          del fondo se calcula automáticamente del capital aportado.
        </p>
        <PartnerEditor initialPartners={serializedPartners} fundId={id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Posiciones</h2>
        <p className="mb-4 text-xs text-slate-500 sm:text-sm">
          Tickers en mayúscula (AAPL, MSFT, etc.). El precio promedio es el costo
          base por acción.
        </p>
        <PositionEditor initialPositions={serializedPositions} fundId={id} />
      </section>
    </main>
  );
}
