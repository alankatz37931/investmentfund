import Link from 'next/link';
import FundsList from '../components/FundsList';
import { getFunds } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
  let funds = [];
  let error = null;
  try {
    funds = await getFunds();
  } catch (err) {
    error = err.message;
  }

  const serializedFunds = funds.map((f) => ({
    ...f,
    management_fee_pct: Number(f.management_fee_pct),
    performance_fee_pct: Number(f.performance_fee_pct),
    cash_balance: Number(f.cash_balance) || 0,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Administración
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Tus fondos. Cada uno tiene sus propios socios, posiciones y comisiones.
          </p>
        </div>
        <Link
          href="/"
          className="self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:self-auto"
        >
          ← Volver al dashboard
        </Link>
      </header>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Fondos</h2>
        <FundsList initialFunds={serializedFunds} />
      </section>
    </main>
  );
}
