import Link from 'next/link';
import PartnerEditor from '../components/PartnerEditor';
import PositionEditor from '../components/PositionEditor';
import { getPartners, getPositions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let partners = [];
  let positions = [];
  let error = null;

  try {
    [partners, positions] = await Promise.all([getPartners(), getPositions()]);
  } catch (err) {
    error = err.message;
  }

  const serializedPartners = partners.map((p) => ({
    ...p,
    capital_contributed: Number(p.capital_contributed),
    participation_pct: Number(p.participation_pct),
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
          <h1 className="text-3xl font-bold tracking-tight">Administrar fondo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Editar socios, posiciones y cantidades
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Volver al dashboard
        </Link>
      </header>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Socios</h2>
        <p className="mb-4 text-sm text-slate-500">
          La suma de % de participación debería dar 100%. Si no, el cálculo de
          distribución de ganancias seguirá funcionando pero algunos socios no
          recibirán su porción completa.
        </p>
        <PartnerEditor initialPartners={serializedPartners} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Posiciones</h2>
        <p className="mb-4 text-sm text-slate-500">
          Tickers en mayúscula (AAPL, MSFT, etc.). El precio promedio es el costo
          base por acción — Finnhub trae el precio actual automáticamente.
        </p>
        <PositionEditor initialPositions={serializedPositions} />
      </section>
    </main>
  );
}
