import Link from 'next/link';
import MetricsCard from './components/MetricsCard';
import AssetsTable from './components/AssetsTable';
import PartnersTable from './components/PartnersTable';
import QuarterlyReport from './components/QuarterlyReport';
import LogoutButton from './components/LogoutButton';
import FundSelector from './components/FundSelector';
import RefreshButton from './components/RefreshButton';
import { getPortfolio } from '@/lib/portfolio';
import { getFunds } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const requestedFundId = sp?.fund;

  let funds = [];
  try {
    funds = await getFunds();
  } catch (err) {
    return errorView(err.message);
  }

  if (!funds.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold sm:text-3xl">No hay fondos creados</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ejecutá la migración SQL en Neon o creá un fondo desde{' '}
          <Link href="/admin" className="text-sky-600 underline">
            /admin
          </Link>
          .
        </p>
      </main>
    );
  }

  const currentFundId =
    requestedFundId && funds.some((f) => String(f.id) === String(requestedFundId))
      ? Number(requestedFundId)
      : funds[0].id;

  let data;
  try {
    data = await getPortfolio(currentFundId);
  } catch (err) {
    return errorView(err.message);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {data.fund.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Última actualización:{' '}
            {new Date(data.generatedAt).toLocaleString('es-ES')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <FundSelector funds={funds} currentFundId={currentFundId} />
          <RefreshButton />
          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Administrar
          </Link>
          <LogoutButton />
        </div>
      </header>

      <MetricsCard totals={data.totals} fund={data.fund} />

      <section className="mt-8 sm:mt-10">
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
          Activos en cartera
        </h2>
        <AssetsTable positions={data.positions} />
      </section>

      <section className="mt-8 sm:mt-10">
        <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
          Distribución entre socios
        </h2>
        <PartnersTable partners={data.partners} />
      </section>

      <section className="mt-8 sm:mt-10">
        <QuarterlyReport data={data} />
      </section>

      <footer className="mt-10 text-center text-xs text-slate-400 sm:mt-12">
        Investment Fund · Datos de mercado por Alpaca · Hosted on Vercel
      </footer>
    </main>
  );
}

function errorView(message) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-red-600 sm:text-3xl">
        Error al cargar el portafolio
      </h1>
      <pre className="mt-4 overflow-auto rounded-lg bg-slate-100 p-4 text-xs text-slate-700 sm:text-sm">
        {message}
      </pre>
      <p className="mt-4 text-sm text-slate-500">
        Verificá que <code>POSTGRES_*</code> y <code>ALPACA_API_KEY_ID</code>/
        <code>ALPACA_API_SECRET_KEY</code> estén configuradas, y que las tablas
        existan en la base (ejecutá la migración SQL si todavía no la corriste).
      </p>
    </main>
  );
}
