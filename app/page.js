import MetricsCard from './components/MetricsCard';
import AssetsTable from './components/AssetsTable';
import PartnersTable from './components/PartnersTable';
import QuarterlyReport from './components/QuarterlyReport';
import LogoutButton from './components/LogoutButton';
import Link from 'next/link';
import { getPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let data;
  try {
    data = await getPortfolio();
  } catch (err) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-red-600">Error al cargar el portafolio</h1>
        <pre className="mt-4 overflow-auto rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          {err.message}
        </pre>
        <p className="mt-4 text-sm text-slate-500">
          Verifica que <code>POSTGRES_*</code> y <code>FINNHUB_API_KEY</code> estén
          configuradas, y que las tablas (<code>partners</code>, <code>positions</code>) existan
          en la base de datos.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Fund</h1>
          <p className="mt-1 text-sm text-slate-500">
            Última actualización: {new Date(data.generatedAt).toLocaleString('es-ES')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            En vivo
          </span>
          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Administrar
          </Link>
          <LogoutButton />
        </div>
      </header>

      <MetricsCard totals={data.totals} />

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Activos en cartera</h2>
        <AssetsTable positions={data.positions} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Distribución entre socios</h2>
        <PartnersTable partners={data.partners} />
      </section>

      <section className="mt-10">
        <QuarterlyReport data={data} />
      </section>

      <footer className="mt-12 text-center text-xs text-slate-400">
        Investment Fund MVP · Datos de mercado por Finnhub · Hosted on Vercel
      </footer>
    </main>
  );
}
