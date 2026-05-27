import { headers } from 'next/headers';
import MetricsCard from './components/MetricsCard';
import AssetsTable from './components/AssetsTable';
import PartnersTable from './components/PartnersTable';
import QuarterlyReport from './components/QuarterlyReport';

export const dynamic = 'force-dynamic';

async function fetchPortfolio() {
  const h = await headers();
  const host = h.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${host}/api/portfolio`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error al cargar el portafolio (${res.status}): ${txt}`);
  }
  return res.json();
}

export default async function HomePage() {
  let data;
  try {
    data = await fetchPortfolio();
  } catch (err) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-sm text-slate-600">{err.message}</p>
        <p className="mt-4 text-sm text-slate-500">
          Revisa que las variables de entorno (POSTGRES_*, FINNHUB_API_KEY) estén
          configuradas y que el esquema de DB exista.
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
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          En vivo
        </span>
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
