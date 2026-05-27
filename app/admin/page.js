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
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tus fondos. Cada uno tiene sus propios LPs, posiciones y fees.
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

      <section>
        <h2 className="mb-4 text-xl font-semibold">Fondos</h2>
        <FundsList initialFunds={serializedFunds} />
      </section>
    </main>
  );
}
